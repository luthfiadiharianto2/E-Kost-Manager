import { supabase, ApiError, unwrap } from './supabase';

// Tipe untuk kamar milik owner (bentuk sama dengan respons /owner/rooms lama)
export interface OwnerRoom {
  id: number;
  kost_id: number;
  nomor_kamar: string;
  tipe_kamar: string;
  harga_sewa: number;
  status: 'tersedia' | 'terisi';
  tenant_id: string | null;
  tenant_name: string | null;
}

export interface OwnerRoomType {
  id: number;
  user_id: string;
  name: string;
  price: number;
  facilities?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

// Response untuk /tenant/my-room (RPC tenant_my_room)
export interface TenantRoomResponse {
  kost: {
    id: number;
    nama_kost: string;
    alamat_kost: string;
    jumlah_kamar: number;
    harga: number;
  } | null;
  room: {
    id: number;
    nomor_kamar: string;
    tipe_kamar: string;
    harga_sewa: number;
    status: 'tersedia' | 'terisi';
    facilities?: string | null; // dari tipe kamar milik pemilik
  };
  owner: {
    id: string;
    name: string;
    phone: string | null;
    whatsapp: string | null;
  } | null;
}

const ROOM_COLUMNS = 'id, kost_id, nomor_kamar, tipe_kamar, harga_sewa, status, tenant_id';

const toOwnerRoom = (row: Omit<OwnerRoom, 'tenant_name'> & { tenant_name?: string | null }): OwnerRoom => ({
  ...row,
  tenant_name: row.tenant_name ?? null,
});

// Kost pertama milik owner; dibuat otomatis dari owner_profiles bila belum ada (perilaku lama)
const resolveOwnerKostId = async (): Promise<number> => {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw new ApiError('Sesi berakhir, silakan login kembali', 401);

  const kost = unwrap(
    await supabase.from('kosts').select('id').eq('user_id', uid).order('id').limit(1).maybeSingle()
  );
  if (kost) return kost.id;

  const profile = unwrap(
    await supabase.from('owner_profiles').select('nama_kost, alamat').eq('user_id', uid).maybeSingle()
  );
  if (!profile) {
    throw new ApiError('Owner belum memiliki data kost. Silakan lengkapi informasi kost terlebih dahulu.', 422);
  }
  const created = unwrap(
    await supabase
      .from('kosts')
      .insert({ nama_kost: profile.nama_kost || 'Kost', alamat_kost: profile.alamat || '', jumlah_kamar: 0, harga: 0 })
      .select('id')
      .single()
  );
  if (!created) throw new ApiError('Gagal membuat data kost', 500);
  return created.id;
};

export const roomService = {
  async getOwnerRooms(): Promise<OwnerRoom[]> {
    const data = unwrap(await supabase.rpc('owner_rooms'), 'Gagal memuat data kamar');
    return (data as OwnerRoom[]) || [];
  },

  async getOwnerRoomTypes(): Promise<OwnerRoomType[]> {
    const data = unwrap(
      await supabase.from('room_types').select('*').order('id'),
      'Gagal memuat tipe kamar'
    );
    return (data as OwnerRoomType[]) || [];
  },

  async createOwnerRoomType(payload: {
    name: string;
    price: number;
    facilities?: string;
    description?: string;
  }): Promise<OwnerRoomType> {
    const data = unwrap(
      await supabase.from('room_types').insert(payload).select('*').single(),
      'Gagal menambah tipe kamar'
    );
    return data as OwnerRoomType;
  },

  async updateOwnerRoomType(id: number, payload: {
    name?: string;
    price?: number;
    facilities?: string;
    description?: string;
  }): Promise<OwnerRoomType> {
    const data = unwrap(
      await supabase.from('room_types').update(payload).eq('id', id).select('*').single(),
      'Tipe kamar tidak ditemukan'
    );
    return data as OwnerRoomType;
  },

  async deleteOwnerRoomType(id: number): Promise<void> {
    unwrap(await supabase.from('room_types').delete().eq('id', id), 'Gagal menghapus tipe kamar');
  },

  async createOwnerRoom(payload: {
    nomor_kamar: string;
    tipe_kamar: string;
    harga_sewa: number;
    status?: 'tersedia' | 'terisi';
    kost_id?: number;
  }): Promise<OwnerRoom> {
    const kostId = payload.kost_id ?? (await resolveOwnerKostId());
    const data = unwrap(
      await supabase
        .from('kamars')
        .insert({
          kost_id: kostId,
          nomor_kamar: payload.nomor_kamar,
          tipe_kamar: payload.tipe_kamar,
          harga_sewa: payload.harga_sewa,
          status: payload.status ?? 'tersedia',
        })
        .select(ROOM_COLUMNS)
        .single(),
      'Gagal menambah kamar'
    );
    return toOwnerRoom(data as Omit<OwnerRoom, 'tenant_name'>);
  },

  async updateOwnerRoom(id: number, payload: {
    nomor_kamar?: string;
    tipe_kamar?: string;
    harga_sewa?: number;
    status?: 'tersedia' | 'terisi';
  }): Promise<OwnerRoom> {
    const data = unwrap(
      await supabase.from('kamars').update(payload).eq('id', id).select(ROOM_COLUMNS).single(),
      'Kamar tidak ditemukan'
    );
    const rooms = await roomService.getOwnerRooms();
    return rooms.find((r) => r.id === id) ?? toOwnerRoom(data as Omit<OwnerRoom, 'tenant_name'>);
  },

  async deleteOwnerRoom(id: number): Promise<void> {
    unwrap(await supabase.from('kamars').delete().eq('id', id), 'Gagal menghapus kamar');
  },

  async assignTenantToRoom(roomId: number, tenantId: string | null): Promise<OwnerRoom> {
    const data = unwrap(
      await supabase.rpc('assign_tenant', { p_room_id: roomId, p_tenant_id: tenantId }),
      'Gagal memperbarui penghuni kamar'
    );
    return data as OwnerRoom;
  },

  async getTenantRoom(): Promise<TenantRoomResponse | null> {
    const data = unwrap(await supabase.rpc('tenant_my_room'), 'Gagal memuat data kamar');
    return (data as TenantRoomResponse | null) ?? null;
  },
};
