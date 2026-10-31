// POST /functions/v1/validate-invitation  (publik)
// Body: { token } -> { success, message, data: { invitation, owner_name, kost_name } }
import { z } from 'npm:zod@3';
import {
  adminClient, allowRequest, clientIp, corsHeaders, fail, findActiveInvitation, json, INVALID_INVITATION,
} from '../_shared/http.ts';

const Body = z.object({ token: z.string().trim().regex(/^[A-Za-z0-9]{32,128}$/) });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return fail('Method not allowed', 405);

  const admin = adminClient();
  if (!(await allowRequest(admin, `validate:${clientIp(req)}`, 30, 60))) {
    return fail('Terlalu banyak percobaan. Coba lagi sebentar lagi.', 429);
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail(INVALID_INVITATION, 400);
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return fail(INVALID_INVITATION, 404);

  const invitation = await findActiveInvitation(admin, parsed.data.token);
  if (!invitation) return fail(INVALID_INVITATION, 404);

  const { data: owner } = await admin
    .from('profiles')
    .select('name, owner_profiles(nama_kost)')
    .eq('id', invitation.owner_id)
    .single();
  const ownerProfile = owner && (Array.isArray(owner.owner_profiles) ? owner.owner_profiles[0] : owner.owner_profiles);

  return json({
    success: true,
    message: 'Undangan valid',
    data: {
      invitation: {
        id: invitation.id,
        email: invitation.email,
        name: invitation.name ?? undefined,
        owner_id: invitation.owner_id,
      },
      owner_name: owner?.name ?? 'Pemilik Kost',
      kost_name: ownerProfile?.nama_kost || 'Kost',
    },
  });
});
