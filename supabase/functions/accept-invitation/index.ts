// POST /functions/v1/accept-invitation  (publik)
// Body: { token, password, password_confirmation } -> { success, message, data: { user } }
// Membuat akun penyewa (email sudah terkonfirmasi), lalu client login dengan signInWithPassword.
import { z } from 'npm:zod@3';
import {
  adminClient, allowRequest, clientIp, corsHeaders, fail, findActiveInvitation, json, zodErrors, INVALID_INVITATION,
} from '../_shared/http.ts';

const Body = z
  .object({
    token: z.string().trim().regex(/^[A-Za-z0-9]{32,128}$/, INVALID_INVITATION),
    password: z.string().min(6, 'Password minimal 6 karakter').max(72, 'Password maksimal 72 karakter'),
    password_confirmation: z.string(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: 'Password tidak cocok',
    path: ['password_confirmation'],
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return fail('Method not allowed', 405);

  const admin = adminClient();
  if (!(await allowRequest(admin, `accept:${clientIp(req)}`, 10, 60))) {
    return fail('Terlalu banyak percobaan. Coba lagi sebentar lagi.', 429);
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail('Body harus JSON', 400);
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    const errors = zodErrors(parsed.error.issues);
    const first = Object.values(errors)[0]?.[0] ?? 'Validasi gagal';
    return fail(first, 422, errors);
  }

  const invitation = await findActiveInvitation(admin, parsed.data.token);
  if (!invitation) return fail(INVALID_INVITATION, 404);

  // Klaim undangan secara atomik agar token tidak bisa dipakai dua kali bersamaan
  const { data: claimed } = await admin
    .from('invitations')
    .update({ is_used: true, accepted_at: new Date().toISOString() })
    .eq('id', invitation.id)
    .eq('is_used', false)
    .select('id')
    .maybeSingle();
  if (!claimed) return fail(INVALID_INVITATION, 404);

  const name = invitation.name?.trim() || invitation.email.split('@')[0];
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: invitation.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (createError || !created.user) {
    // Kembalikan undangan agar bisa dicoba lagi
    await admin.from('invitations').update({ is_used: false, accepted_at: null }).eq('id', invitation.id);
    console.error('createUser', createError?.message);
    return fail('Akun untuk undangan ini tidak dapat dibuat. Jika Anda sudah memiliki akun, silakan login.', 422);
  }

  return json(
    {
      success: true,
      message: 'Akun berhasil dibuat',
      data: { user: { id: created.user.id, name, email: invitation.email, role: 'tenant' } },
    },
    201,
  );
});
