// File: src/services/paymentService.ts
//
// Pembayaran QRIS di backend lama hanyalah stub. Perilaku stub yang sama dipertahankan
// di sisi client (belum ada integrasi payment gateway).

import { ApiError } from './supabase';

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

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

const QRIS_PREFIX = '00020101021226680014ID.CO.QRIS.WWW01189360091600000000000300303UMI51470015ID1020025303350540';

export const paymentService = {
  /**
   * Create QRIS payment (stub: QR berlaku 10 menit, status selalu pending)
   */
  async createQRISPayment(data: CreateQRISPaymentRequest): Promise<QRISPaymentResponse> {
    if (!data.invoice_id || !(Number(data.amount) >= 1)) {
      throw new ApiError('Validasi gagal', 422);
    }
    return {
      qris_string: QRIS_PREFIX + (1000 + Math.floor(Math.random() * 9000)),
      invoice_id: data.invoice_id,
      amount: Number(data.amount),
      status: 'pending',
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      payment_url: undefined,
    };
  },

  /**
   * Check payment status (stub: selalu pending)
   */
  async checkPaymentStatus(invoiceId: string): Promise<CheckPaymentStatusResponse> {
    return {
      invoice_id: invoiceId,
      status: 'pending',
      paid_at: undefined,
      payment_method: 'qris',
    };
  },

  /**
   * Get payment history (stub: contoh data)
   */
  async getPaymentHistory(): Promise<PaymentHistoryItem[]> {
    const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
    return [
      { id: 'inv-001', amount: 500000, status: 'paid', created_at: daysAgo(10) },
      { id: 'inv-002', amount: 450000, status: 'pending', created_at: daysAgo(2) },
    ];
  },
};
