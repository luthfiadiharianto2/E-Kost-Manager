import { api } from './api';

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
      owner_id: number;
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
      id: number;
      name: string;
      email: string;
      role: string;
    };
  };
}

export const invitationService = {
  async createInvitation(data: InvitationData): Promise<InvitationResponse> {
    const response = await api.post<InvitationResponse>('/invitations', data);
    return response.data;
  },

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    const response = await api.post<ValidateTokenResponse>('/invitations/validate', { token });
    return response.data;
  },

  async acceptInvitation(data: AcceptInvitationData): Promise<AcceptInvitationResponse> {
    const response = await api.post<AcceptInvitationResponse>('/invitations/accept', data);
    return response.data;
  },

  async getInvitations() {
    const response = await api.get('/invitations');
    return response.data;
  },

  async deleteInvitation(id: number) {
    const response = await api.delete(`/invitations/${id}`);
    return response.data;
  },
};