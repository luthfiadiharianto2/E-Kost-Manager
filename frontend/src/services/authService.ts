import { supabase, ApiError, AVATAR_BUCKET, avatarUrl, toApiError, unwrap } from './supabase';
import { User, SignupFormData, LoginResponse, VerifyOtpResponse, OtpRequestResponse } from '../types';

type ProfileRow = {
  id: string;
  name: string;
  username: string | null;
  email: string;
  role: 'admin' | 'tenant';
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  avatar: string | null;
  created_at: string;
  updated_at: string;
  owner_profiles: {
    id: number;
    nama_kost: string | null;
    alamat: string | null;
    kode_pos: string | null;
    provinsi: string | null;
    kota: string | null;
    kecamatan: string | null;
    kelurahan: string | null;
    pilihan_pembayaran: string | null;
  } | null;
  kosts: {
    id: number;
    user_id: string;
    nama_kost: string;
    alamat_kost: string;
    jumlah_kamar: number;
    harga: number | string;
    created_at: string;
    updated_at: string;
  }[] | null;
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];

const optional = (v: string | null | undefined) => (v === null || v === undefined ? undefined : v);

// Rakit objek User dengan bentuk yang sama seperti respons /auth/profile Laravel
const toUser = (row: ProfileRow): User => ({
  id: row.id,
  name: row.name,
  username: optional(row.username),
  email: row.email,
  role: row.role,
  phone: optional(row.phone),
  whatsapp: optional(row.whatsapp),
  address: optional(row.address),
  avatar: avatarUrl(row.avatar),
  created_at: row.created_at,
  updated_at: row.updated_at,
  ownerProfile: row.owner_profiles
    ? {
        id: row.owner_profiles.id,
        nama_kost: optional(row.owner_profiles.nama_kost),
        alamat: optional(row.owner_profiles.alamat),
        kode_pos: optional(row.owner_profiles.kode_pos),
        provinsi: optional(row.owner_profiles.provinsi),
        kota: optional(row.owner_profiles.kota),
        kecamatan: optional(row.owner_profiles.kecamatan),
        kelurahan: optional(row.owner_profiles.kelurahan),
        pilihan_pembayaran: optional(row.owner_profiles.pilihan_pembayaran),
      }
    : null,
  kosts: (row.kosts || []).map((k) => ({ ...k, harga: Number(k.harga) })),
});

const fetchProfileRow = async (userId: string): Promise<ProfileRow> => {
  const row = unwrap(
    await supabase
      .from('profiles')
      .select('*, owner_profiles(*), kosts(*)')
      .eq('id', userId)
      .single(),
    'Gagal mengambil profil'
  );
  return row as unknown as ProfileRow;
};

const currentUserId = async (): Promise<string> => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new ApiError('Sesi berakhir, silakan login kembali', 401);
  return data.user.id;
};

export const authService = {

  async login(email: string, password: string): Promise<LoginResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) throw toApiError(error, 'Email atau password salah!');

    const user = toUser(await fetchProfileRow(data.user.id));
    return { token: data.session.access_token, user };
  },

  // Alur pemilik: requestOTP -> (OTP dari email) -> signup.
  // OTP diverifikasi di sini (kecuali sudah lewat verifyOTP), lalu profil pemilik dibuat dan password di-set.
  async signup(data: SignupFormData) {
    const email = data.email.trim();
    const otp = (data.otp || '').trim();

    if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
      throw new ApiError('Validasi gagal', 422, { password_confirmation: ['Konfirmasi password tidak cocok'] });
    }
    if (!data.password || data.password.length < 6) {
      throw new ApiError('Validasi gagal', 422, { password: ['Password minimal 6 karakter'] });
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const alreadyVerified = sessionData.session?.user.email?.toLowerCase() === email.toLowerCase();
    if (!alreadyVerified) {
      if (!otp) throw new ApiError('OTP wajib diisi', 422);
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (error) throw new ApiError('OTP tidak valid atau sudah kadaluarsa', 422);
    }

    // register_owner dijalankan sebelum set password: akun yang sudah terdaftar ditolak lebih dulu
    const profile = unwrap(
      await supabase.rpc('register_owner', {
        p_name: data.namaPemilik || data.name || '',
        p_whatsapp: data.whatsapp ?? null,
        p_nama_kost: data.namaKost ?? '',
        p_alamat: data.alamat ?? null,
        p_kode_pos: data.kodePos ?? null,
        p_provinsi: data.provinsi ?? null,
        p_kota: data.kota ?? null,
        p_kecamatan: data.kecamatan ?? null,
        p_kelurahan: data.kelurahan ?? null,
        p_pilihan_pembayaran: data.pilihanPembayaran ?? null,
      }),
      'Pendaftaran gagal'
    );

    const { error: pwError } = await supabase.auth.updateUser({ password: data.password });
    if (pwError) throw toApiError(pwError, 'Gagal menyimpan password');

    // Sama seperti backend lama: setelah daftar, user diminta login manual
    await supabase.auth.signOut();

    return { success: true, message: 'Registrasi berhasil', user: profile };
  },

  async requestOTP(email: string): Promise<OtpRequestResponse> {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    if (error) throw toApiError(error, 'Gagal mengirim kode OTP');
    return { success: true, message: 'Kode OTP telah dikirim ke email Anda', email };
  },

  async verifyOTP(email: string, otp: string): Promise<VerifyOtpResponse> {
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: otp.trim(), type: 'email' });
    if (error) throw new ApiError('OTP tidak valid atau sudah kadaluarsa', 422);
    return { success: true, message: 'OTP berhasil diverifikasi' };
  },

  async getProfile(): Promise<User> {
    return toUser(await fetchProfileRow(await currentUserId()));
  },

  async updateProfile(data: FormData | Record<string, any>): Promise<User> {
    const userId = await currentUserId();

    if (data instanceof FormData) {
      const file = data.get('avatar');
      if (file instanceof File) {
        if (!AVATAR_TYPES.includes(file.type)) {
          throw new ApiError('Format foto harus jpeg, png, jpg, atau gif', 422);
        }
        if (file.size > MAX_AVATAR_BYTES) {
          throw new ApiError('Ukuran foto maksimal 2 MB', 422);
        }

        const old = await fetchProfileRow(userId);
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const path = `${userId}/${Date.now()}.${ext}`;

        unwrap(
          await supabase.storage.from(AVATAR_BUCKET).upload(path, file, { contentType: file.type, upsert: false }),
          'Gagal mengupload foto'
        );
        unwrap(await supabase.from('profiles').update({ avatar: path }).eq('id', userId), 'Gagal menyimpan foto');

        if (old.avatar && old.avatar.startsWith(`${userId}/`)) {
          await supabase.storage.from(AVATAR_BUCKET).remove([old.avatar]);
        }
      }
      return toUser(await fetchProfileRow(userId));
    }

    const fields: Record<string, string | null> = {};
    for (const key of ['name', 'username', 'whatsapp', 'address'] as const) {
      if (key in data) fields[key] = data[key] === '' && key !== 'name' ? null : data[key];
    }

    if (Object.keys(fields).length > 0) {
      const { error } = await supabase.from('profiles').update(fields).eq('id', userId);
      if (error) {
        if (error.code === '23505') throw new ApiError('Username sudah digunakan', 422, { username: ['Username sudah digunakan'] });
        throw toApiError(error, 'Gagal memperbarui profil');
      }
    }

    // Password & email dikelola Supabase Auth (email baru perlu konfirmasi lewat email)
    const authUpdate: { password?: string; email?: string } = {};
    if (data.password) authUpdate.password = data.password;
    const { data: authData } = await supabase.auth.getUser();
    if (data.email && authData.user && data.email !== authData.user.email) authUpdate.email = data.email;
    if (authUpdate.password || authUpdate.email) {
      const { error } = await supabase.auth.updateUser(authUpdate);
      if (error) throw toApiError(error, 'Gagal memperbarui akun');
    }

    return toUser(await fetchProfileRow(userId));
  },

  async logout() {
    await supabase.auth.signOut();
  },
};
