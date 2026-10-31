import { supabase, functionError, unwrap } from './supabase';

export interface InvitationData {
  email: string;
  name?: string;
}

export interface InvitationResponse {
  success: boolean;
  message: string;
  data: {
    invitation: {
      id: number;
      email: string;
      name?: string;
      token: string;
    };
    accept_url: string;
  };
}

export interface ValidateTokenResponse {
  success: boolean;
  message: string;
  data: {
    invitation: {
      id: number;
      email: string;
      name?: string;
      owner_id: string;
    };
    owner_name: string;
    kost_name: string;
  };
}

export interface AcceptInvitationData {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface AcceptInvitationResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}

// Bentuk sama dengan respons /owner/tenants lama
export interface OwnerTenant {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  room?: string | null;
  status?: string | null;
}

const invoke = async <T>(name: string, body: object, fallback: string): Promise<T> => {
  const { data, error } = await supabase.functions.invoke(name, { body: body as Record<string, unknown> });
  if (error) throw await functionError(error, fallback);
  return data as T;
};

export const invitationService = {
  // Edge Function (butuh JWT pemilik): simpan undangan + kirim email
  async createInvitation(data: InvitationData): Promise<InvitationResponse> {
    return invoke<InvitationResponse>('invite-tenant', data, 'Gagal mengirim undangan. Silakan coba lagi.');
  },

  // Edge Function publik
  async validateToken(token: string): Promise<ValidateTokenResponse> {
    return invoke<ValidateTokenResponse>('validate-invitation', { token }, 'Undangan tidak valid atau sudah kedaluwarsa');
  },

  // Edge Function publik: buat akun penyewa lalu tandai undangan terpakai
  async acceptInvitation(data: AcceptInvitationData): Promise<AcceptInvitationResponse> {
    return invoke<AcceptInvitationResponse>('accept-invitation', data, 'Gagal membuat akun. Silakan coba lagi.');
  },

  async getInvitations() {
    const data = unwrap(
      await supabase
        .from('invitations')
        .select('id, owner_id, email, name, expires_at, is_used, accepted_at, created_at')
        .order('created_at', { ascending: false }),
      'Gagal memuat undangan'
    );
    return { success: true, data };
  },

  async deleteInvitation(id: number) {
    unwrap(await supabase.from('invitations').delete().eq('id', id), 'Gagal menghapus undangan');
    return { success: true, message: 'Undangan berhasil dihapus' };
  },

  async getOwnerTenants(): Promise<OwnerTenant[]> {
    const data = unwrap(await supabase.rpc('owner_tenants'), 'Gagal memuat data penyewa');
    return (data as OwnerTenant[]) || [];
  },
};
