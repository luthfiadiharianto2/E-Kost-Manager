import { api } from './api';

// Tipe untuk kamar milik owner yang dikembalikan backend /owner/rooms
export interface OwnerRoom {
  id: number;
  kost_id: number;
  nomor_kamar: string;
  tipe_kamar: string;
  harga_sewa: number;
  status: 'tersedia' | 'terisi';
  tenant_id: number | null;
  tenant_name: string | null;
}

export interface OwnerRoomType {
  id: number;
  user_id: number;
  name: string;
  price: number;
  facilities?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

// Response untuk endpoint /tenant/my-room
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
  };
  owner: {
    id: number;
    name: string;
    phone: string | null;
    whatsapp: string | null;
  } | null;
}

export const roomService = {
  async getOwnerRooms(): Promise<OwnerRoom[]> {
    const response = await api.get<{ success: boolean; data: OwnerRoom[] }>('/owner/rooms');
    return response.data.data || [];
  },

  async getOwnerRoomTypes(): Promise<OwnerRoomType[]> {
    const response = await api.get<{ success: boolean; data: OwnerRoomType[] }>('/owner/room-types');
    return response.data.data || [];
  },

  async createOwnerRoomType(payload: {
    name: string;
    price: number;
    facilities?: string;
    description?: string;
  }): Promise<OwnerRoomType> {
    const response = await api.post<{ success: boolean; data: OwnerRoomType }>('/owner/room-types', payload);
    return response.data.data;
  },

  async updateOwnerRoomType(id: number, payload: {
    name?: string;
    price?: number;
    facilities?: string;
    description?: string;
  }): Promise<OwnerRoomType> {
    const response = await api.put<{ success: boolean; data: OwnerRoomType }>(`/owner/room-types/${id}`, payload);
    return response.data.data;
  },

  async deleteOwnerRoomType(id: number): Promise<void> {
    await api.delete(`/owner/room-types/${id}`);
  },

  async createOwnerRoom(payload: {
    nomor_kamar: string;
    tipe_kamar: string;
    harga_sewa: number;
    status?: 'tersedia' | 'terisi';
    kost_id?: number;
  }): Promise<OwnerRoom> {
    const response = await api.post<{ success: boolean; data: OwnerRoom }>('/owner/rooms', payload);
    return response.data.data;
  },

  async updateOwnerRoom(id: number, payload: {
    nomor_kamar?: string;
    tipe_kamar?: string;
    harga_sewa?: number;
    status?: 'tersedia' | 'terisi';
  }): Promise<OwnerRoom> {
    const response = await api.put<{ success: boolean; data: OwnerRoom }>(`/owner/rooms/${id}`, payload);
    return response.data.data;
  },

  async deleteOwnerRoom(id: number): Promise<void> {
    await api.delete(`/owner/rooms/${id}`);
  },

  async assignTenantToRoom(roomId: number, tenantId: number | null): Promise<OwnerRoom> {
    const response = await api.put<{ success: boolean; data: OwnerRoom }>(
      `/owner/rooms/${roomId}/assign-tenant`,
      { tenant_id: tenantId }
    );
    return response.data.data;
  },

  async getTenantRoom(): Promise<TenantRoomResponse | null> {
    const response = await api.get<{ success: boolean; data: TenantRoomResponse | null }>(
      '/tenant/my-room'
    );
    return response.data.data ?? null;
  },
};
