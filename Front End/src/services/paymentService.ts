// File: src/services/paymentService.ts

import { api } from './api';

export interface CreateQRISPaymentRequest {
  invoice_id: string;
  amount: number;
  description?: string;
}

export interface QRISPaymentResponse {
  qris_string: string;
  invoice_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'expired';
  expires_at: string;
  payment_url?: string;
}

export interface CheckPaymentStatusResponse {
  invoice_id: string;
  status: 'pending' | 'paid' | 'expired' | 'failed';
  paid_at?: string;
  payment_method?: string;
}

// Asumsi Anda memiliki tipe untuk riwayat pembayaran,
// jika tidak, 'any[]' sudah cukup untuk memperbaiki error
export interface PaymentHistoryItem {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  // ... (properti lain)
}


export const paymentService = {
  /**
   * Create QRIS payment - Generate QRIS code dari backend
   */
  async createQRISPayment(data: CreateQRISPaymentRequest): Promise<QRISPaymentResponse> {
    // TAMBAHKAN TIPE BALASAN DI SINI
    const response = await api.post<{ data: QRISPaymentResponse }>('/payments/qris/create', data);
    return response.data.data;
  },

  /**
   * Check payment status - Cek status pembayaran
   */
  async checkPaymentStatus(invoiceId: string): Promise<CheckPaymentStatusResponse> {
    // TAMBAHKAN TIPE BALASAN DI SINI
    const response = await api.get<{ data: CheckPaymentStatusResponse }>(`/payments/qris/status/${invoiceId}`);
    return response.data.data;
  },

  /**
   * Get payment history - Riwayat pembayaran
   */
  // Tambahkan Tipe Promise (misal: Promise<PaymentHistoryItem[]>)
  async getPaymentHistory(): Promise<PaymentHistoryItem[]> {
    // TAMBAHKAN TIPE BALASAN DI SINI
    const response = await api.get<{ data: PaymentHistoryItem[] }>('/payments/history');
    return response.data.data;
  },
};