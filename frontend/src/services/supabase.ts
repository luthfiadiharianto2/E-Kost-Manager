import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // Tetap jalan agar halaman publik bisa dirender; request ke Supabase akan gagal dengan pesan jelas.
  console.error('VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY belum di-set. Lihat frontend/.env.example');
}

export const supabase = createClient(
  SUPABASE_URL || 'http://localhost:54321',
  SUPABASE_PUBLISHABLE_KEY || 'missing-publishable-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const AVATAR_BUCKET = 'avatars';

/**
 * Error dengan bentuk yang sama seperti error axios dari backend Laravel lama
 * (`error.response.data.message` / `.errors`), sehingga komponen yang sudah ada
 * tetap bisa menampilkan pesan tanpa diubah.
 */
export class ApiError extends Error {
  response: { status: number; data: { message: string; errors?: Record<string, string[]> } };

  constructor(message: string, status = 400, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.response = { status, data: { message, ...(errors ? { errors } : {}) } };
  }
}

type SupabaseLikeError = { message?: string; code?: string; status?: number } | null | undefined;

const KNOWN_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Email atau password salah',
  'Email not confirmed': 'Email belum dikonfirmasi',
  'Token has expired or is invalid': 'OTP tidak valid atau sudah kadaluarsa',
  'User already registered': 'Email sudah terdaftar',
  // Gagal kirim email dari Supabase Auth (biasanya pengaturan SMTP salah)
  'Error sending magic link email': 'Gagal mengirim kode OTP ke email. Coba lagi beberapa saat lagi.',
  'Error sending confirmation email': 'Gagal mengirim kode OTP ke email. Coba lagi beberapa saat lagi.',
  'Error sending recovery email': 'Gagal mengirim email pemulihan. Coba lagi beberapa saat lagi.',
  'Email rate limit exceeded': 'Terlalu banyak permintaan kode OTP. Coba lagi beberapa menit lagi.',
  'email rate limit exceeded': 'Terlalu banyak permintaan kode OTP. Coba lagi beberapa menit lagi.',
};

/** Ubah error Supabase (auth/PostgREST/storage/functions) menjadi ApiError. */
export function toApiError(error: SupabaseLikeError | unknown, fallback = 'Terjadi kesalahan, silakan coba lagi'): ApiError {
  if (error instanceof ApiError) return error;
  const e = (error ?? {}) as { message?: string; code?: string; status?: number };
  let message = e.message || fallback;
  message = KNOWN_MESSAGES[message] ?? message;

  if (e.code === '23505' && message.includes('duplicate key')) {
    message = message.includes('nomor_kamar') ? 'Nomor kamar sudah digunakan di kost ini' : 'Data sudah ada';
  }
  if (e.code === '42501' && message.startsWith('permission denied')) {
    message = 'Anda tidak memiliki akses untuk aksi ini';
  }
  const status = typeof e.status === 'number' ? e.status : e.code === 'PGRST301' ? 401 : 400;
  return new ApiError(message, status);
}

/** Lempar ApiError bila hasil query Supabase berisi error, kembalikan data bila tidak. */
export function unwrap<T>(result: { data: T; error: SupabaseLikeError }, fallback?: string): T {
  if (result.error) throw toApiError(result.error, fallback);
  return result.data;
}

/** URL publik penuh untuk path avatar yang tersimpan di profiles.avatar. */
export function avatarUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Ambil pesan error dari respons Edge Function (body JSON `{ message }`). */
export async function functionError(error: unknown, fallback: string): Promise<ApiError> {
  const ctx = (error as { context?: Response })?.context;
  if (ctx && typeof ctx.json === 'function') {
    try {
      const body = await ctx.clone().json();
      if (body?.message) return new ApiError(body.message, ctx.status, body.errors);
    } catch {
      /* body bukan JSON */
    }
  }
  return toApiError(error, fallback);
}
