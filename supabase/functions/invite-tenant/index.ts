// POST /functions/v1/invite-tenant  (butuh JWT pemilik)
// Body: { email, name? } -> { success, message, data: { invitation, accept_url } }
import { z } from 'npm:zod@3';
import { adminClient, allowRequest, corsHeaders, escapeHtml, fail, json, zodErrors } from '../_shared/http.ts';

const Body = z.object({
  email: z.string().trim().toLowerCase().email('Format email tidak valid').max(200),
  name: z.string().trim().max(255).optional().nullable(),
});

const randomToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

async function sendInvitationEmail(to: string, tenantName: string | null, ownerName: string, kostName: string, acceptUrl: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('MAIL_FROM');
  if (!apiKey || !from) return { sent: false, configured: false };

  const greeting = tenantName ? `Halo ${escapeHtml(tenantName)},` : 'Halo,';
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;color:#111827">
      <h2 style="color:#0f172a">Undangan Bergabung di ${escapeHtml(kostName)}</h2>
      <p>${greeting}</p>
      <p><strong>${escapeHtml(ownerName)}</strong> mengundang Anda untuk bergabung sebagai penyewa di
         <strong>${escapeHtml(kostName)}</strong> melalui E-Kost Manager.</p>
      <p style="margin:24px 0">
        <a href="${escapeHtml(acceptUrl)}" style="background:#facc15;color:#0f172a;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Terima Undangan</a>
      </p>
      <p style="font-size:13px;color:#6b7280">Link berlaku 7 hari dan hanya bisa digunakan sekali.
        Jika tombol tidak berfungsi, salin link ini: <br>${escapeHtml(acceptUrl)}</p>
    </div>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject: `Undangan bergabung di ${kostName}`, html }),
    });
    if (!res.ok) console.error('Resend error', res.status, await res.text());
    return { sent: res.ok, configured: true };
  } catch (e) {
    console.error('Resend fetch gagal', (e as Error).message);
    return { sent: false, configured: true };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return fail('Method not allowed', 405);

  const admin = adminClient();
  const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const { data: authData, error: authError } = await admin.auth.getUser(jwt);
  if (authError || !authData.user) return fail('Sesi berakhir, silakan login kembali', 401);
  const ownerId = authData.user.id;

  const { data: owner } = await admin
    .from('profiles')
    .select('id, name, role, owner_profiles(nama_kost)')
    .eq('id', ownerId)
    .single();
  if (!owner || owner.role !== 'admin') return fail('Hanya pemilik kost yang dapat mengundang penyewa', 403);

  if (!(await allowRequest(admin, `invite:${ownerId}`, 20, 3600))) {
    return fail('Terlalu banyak undangan dalam satu jam. Coba lagi nanti.', 429);
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail('Body harus JSON', 400);
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return fail('Validasi gagal', 422, zodErrors(parsed.error.issues));
  const { email, name } = parsed.data;

  // Sama seperti backend lama: email yang sudah punya akun tidak bisa diundang
  const { data: existingProfile } = await admin.from('profiles').select('id').eq('email', email).maybeSingle();
  if (existingProfile) {
    return fail('Email sudah terdaftar', 422, { email: ['Email sudah terdaftar'] });
  }

  const columns = 'id, owner_id, email, name, token, expires_at, is_used, created_at';

  // Undangan aktif untuk email yang sama dipakai ulang (link yang sama dikirim lagi),
  // agar pemilik tetap bisa mendapatkan link bila email pertama tidak sampai
  const { data: active } = await admin
    .from('invitations')
    .select(columns)
    .eq('owner_id', ownerId)
    .eq('email', email)
    .eq('is_used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1);
  const reused = active && active.length > 0 ? active[0] : null;

  let invitation = reused;
  if (!invitation) {
    const { data: created, error: insertError } = await admin
      .from('invitations')
      .insert({
        owner_id: ownerId,
        email,
        name: name || null,
        token: randomToken(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select(columns)
      .single();
    if (insertError || !created) {
      console.error('insert invitation', insertError?.message);
      return fail('Gagal membuat undangan', 500);
    }
    invitation = created;
  }

  const appUrl = (Deno.env.get('APP_URL') || 'http://localhost:3000').replace(/\/+$/, '');
  const acceptUrl = `${appUrl}/accept-invite?token=${invitation.token}`;
  const ownerProfile = Array.isArray(owner.owner_profiles) ? owner.owner_profiles[0] : owner.owner_profiles;
  const kostName = ownerProfile?.nama_kost || 'Kost';

  // Undangan tetap berlaku walau email gagal: pemilik masih bisa membagikan link secara manual
  const mail = await sendInvitationEmail(email, name || invitation.name || null, owner.name, kostName, acceptUrl);

  return json(
    {
      success: true,
      message: mail.sent
        ? `Undangan berhasil dikirim ke ${email}`
        : mail.configured
          ? `Undangan dibuat untuk ${email}, tetapi email gagal dikirim. Bagikan link secara manual.`
          : `Undangan dibuat untuk ${email}, tetapi email belum dikirim (RESEND_API_KEY/MAIL_FROM belum diatur). Bagikan link secara manual.`,
      data: { invitation, accept_url: acceptUrl, email_sent: mail.sent, email_configured: mail.configured, reused: !!reused },
    },
    reused ? 200 : 201,
  );
});
