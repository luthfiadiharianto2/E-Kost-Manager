import { supabase, ApiError, unwrap } from './supabase';

// Bentuk yang dipakai komponen TestimonialsRealtime
export interface Testimonial {
  id: string;
  name: string;
  property?: string;
  text: string;
  createdAt?: string | number;
}

export const testimoniService = {
  // Kolom email sengaja tidak dibaca (tidak diberi hak SELECT untuk publik)
  async list(limit = 20): Promise<Testimonial[]> {
    const rows = unwrap(
      await supabase
        .from('testimonis')
        .select('id, nama, pesan, created_at')
        .order('created_at', { ascending: false })
        .limit(limit),
      'Gagal memuat testimoni'
    );
    return (rows || []).map((r) => ({
      id: String(r.id),
      name: r.nama,
      text: r.pesan,
      createdAt: r.created_at,
    }));
  },

  async create(payload: { nama: string; email: string; pesan: string }): Promise<void> {
    const nama = payload.nama.trim();
    const email = payload.email.trim();
    const pesan = payload.pesan.trim();
    if (!nama || !email || !pesan) throw new ApiError('Nama, email, dan pesan wajib diisi', 422);
    if (nama.length > 100 || email.length > 200 || pesan.length > 1000) {
      throw new ApiError('Nama maks 100, email maks 200, pesan maks 1000 karakter', 422);
    }
    // Tanpa .select(): publik tidak punya hak baca kolom email
    unwrap(await supabase.from('testimonis').insert({ nama, email, pesan }), 'Gagal mengirim testimoni');
  },
};
