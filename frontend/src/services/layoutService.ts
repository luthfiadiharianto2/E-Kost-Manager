import { supabase, unwrap } from './supabase';
import type { BuildingType, DoorSide, Footprint, KostLayout, RoomPlacement } from '../lib/layoutPresets';

export interface LayoutRoom {
  id: number;
  nomor_kamar: string;
  tipe_kamar: string;
  harga_sewa: number;
  status: 'tersedia' | 'terisi';
  floor: number;
  grid_x: number | null;
  grid_y: number | null;
  span_x: number;
  span_y: number;
  door_side: DoorSide | null;
  /** hanya terisi bila pemanggil adalah pemilik kost */
  tenant_name: string | null;
  tenant_id: string | null;
  /** true untuk kamar milik penyewa yang sedang login */
  is_mine: boolean;
}

export interface SavedKostLayout extends KostLayout {
  id: number;
  kost_id: number;
  updated_at: string;
}

export interface KostLayoutData {
  kost: { id: number; nama_kost: string } | null;
  is_owner: boolean;
  layout: SavedKostLayout | null;
  rooms: LayoutRoom[];
}

const normalize = (data: KostLayoutData): KostLayoutData => ({
  ...data,
  layout: data.layout
    ? {
        ...data.layout,
        building_type: data.layout.building_type as BuildingType,
        footprint: (data.layout.footprint || {}) as Footprint,
      }
    : null,
  rooms: (data.rooms || []).map((r) => ({ ...r, harga_sewa: Number(r.harga_sewa) || 0 })),
});

export const layoutService = {
  async getLayout(kostId: number): Promise<KostLayoutData> {
    const data = unwrap(await supabase.rpc('get_kost_layout', { p_kost_id: kostId }), 'Gagal memuat denah');
    return normalize(data as KostLayoutData);
  },

  /** Simpan bentuk bangunan + posisi semua kamar dalam satu transaksi (RPC). */
  async saveLayout(kostId: number, layout: KostLayout, placements: RoomPlacement[]): Promise<KostLayoutData> {
    const data = unwrap(
      await supabase.rpc('save_kost_layout', {
        p_kost_id: kostId,
        p_layout: {
          building_type: layout.building_type,
          floors: layout.floors,
          grid_cols: layout.grid_cols,
          grid_rows: layout.grid_rows,
          footprint: layout.footprint,
        },
        p_rooms: placements,
      }),
      'Gagal menyimpan denah'
    );
    return normalize(data as KostLayoutData);
  },

  /** Kost tempat penyewa tinggal (null bila belum ditempatkan di kamar mana pun). */
  async getTenantKostId(): Promise<number | null> {
    const data = unwrap(await supabase.rpc('tenant_my_room'), 'Gagal memuat data kamar');
    return (data as { kost: { id: number } | null } | null)?.kost?.id ?? null;
  },

  /** Dengarkan perubahan kamar (assign penyewa, status) untuk satu kost. */
  subscribeRooms(kostId: number, onChange: () => void): () => void {
    const channel = supabase
      .channel(`kamars-kost-${kostId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kamars', filter: `kost_id=eq.${kostId}` }, () =>
        onChange()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  },
};
