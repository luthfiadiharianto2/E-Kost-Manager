// Utilitas bersama Edge Function E-Kost Manager
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function fail(message: string, status = 400, errors?: Record<string, string[]>): Response {
  return json({ success: false, message, ...(errors ? { errors } : {}) }, status);
}

/** Client service role (bypass RLS). Hanya dipakai di server. */
export function adminClient(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for') || '';
  return fwd.split(',')[0].trim() || req.headers.get('cf-connecting-ip') || 'unknown';
}

/** true bila masih di bawah batas; false bila harus ditolak (429). */
export async function allowRequest(
  admin: SupabaseClient,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await admin.rpc('hit_rate_limit', {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error('rate limit error', error.message);
    return true; // jangan kunci pengguna bila tabel rate limit bermasalah
  }
  return data === true;
}

export function zodErrors(issues: { path: (string | number)[]; message: string }[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? 'form');
    (out[key] ||= []).push(issue.message);
  }
  return out;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export const INVALID_INVITATION = 'Undangan tidak valid atau sudah kedaluwarsa';

export type InvitationRow = {
  id: number;
  owner_id: string;
  email: string;
  name: string | null;
  token: string;
  expires_at: string;
  is_used: boolean;
};

/** Undangan aktif (belum dipakai & belum kedaluwarsa) berdasarkan token, atau null. */
export async function findActiveInvitation(admin: SupabaseClient, token: string): Promise<InvitationRow | null> {
  const { data } = await admin
    .from('invitations')
    .select('id, owner_id, email, name, token, expires_at, is_used')
    .eq('token', token)
    .maybeSingle();
  if (!data || data.is_used || new Date(data.expires_at) <= new Date()) return null;
  return data as InvitationRow;
}
