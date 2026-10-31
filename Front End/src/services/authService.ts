import { api } from './api';
import axios from 'axios';
import { User, LoginFormData, SignupFormData, LoginResponse, VerifyOtpResponse, OtpRequestResponse } from '../types';

export const getCsrfCookie = async () => {
  return await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
    withCredentials: true,
  });
};

export const authService = {

  async login(email: string, password: string): Promise<LoginResponse> {
  // Ambil CSRF cookie
  await getCsrfCookie();

    // 2️⃣ Login tanpa mengirim role; role ditentukan oleh data user di server
    const response = await api.post('/auth/login', { email, password });
    const data = response.data as { user: User; access_token: string; token_type: string };

    // 3️⃣ Simpan token di localStorage
    localStorage.setItem('token', data.access_token);

    return { token: data.access_token, user: data.user } as LoginResponse;
  },

  async signup(data: SignupFormData) {
    const payload = {
      name: data.namaPemilik || data.name || '',
      email: data.email,
      password: data.password,
      password_confirmation: data.confirmPassword || data.password,
      role: data.role || 'admin',
      otp: data.otp,
      namaKost: data.namaKost,
      whatsapp: data.whatsapp,
      alamat: data.alamat,
      kodePos: data.kodePos,
      provinsi: data.provinsi,
      kota: data.kota,
      kecamatan: data.kecamatan,
      kelurahan: data.kelurahan,
      pilihanPembayaran: data.pilihanPembayaran,
    };

    console.log('📤 Sending signup payload:', payload);
    console.log('🔑 OTP value:', payload.otp);
    
    const response = await api.post('/auth/register', payload);
    return response.data;
  },

  async requestOTP(email: string): Promise<OtpRequestResponse> {
    const response = await api.post('/otp/request', { email });
    return response.data as OtpRequestResponse;
  },

  async verifyOTP(email: string, otp: string): Promise<VerifyOtpResponse> {
    const response = await api.post('/otp/verify', { email, otp });
    const data = response.data as { message: string; success?: boolean };
    return { success: data.success ?? true, message: data.message } as VerifyOtpResponse;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<{ data: User }>('/auth/profile');
    return response.data.data as User;
  },

  async updateProfile(data: FormData | Record<string, any>): Promise<User> {
    let response;

    if (data instanceof FormData) {
      // For file uploads, use POST with method override so PHP/Laravel parses files correctly
      if (!data.has('_method')) {
        data.append('_method', 'PUT');
      }
      response = await api.post<{ data: User }>('/auth/profile', data);
    } else {
      // For normal profile updates (JSON body), use PUT as usual
      response = await api.put<{ data: User }>('/auth/profile', data);
    }

    return response.data.data as User;
  },

  async logout() {
    await api.post('/auth/logout');
  },
};