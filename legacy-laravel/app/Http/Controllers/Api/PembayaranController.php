<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PembayaranController extends Controller
{
    // Menampilkan semua pembayaran
    public function index()
    {
        return response()->json([
            'message' => 'Daftar pembayaran berhasil diakses',
            'status' => 'success'
        ]);
    }

    // Menyimpan pembayaran baru
    public function store(Request $request)
    {
        return response()->json([
            'message' => 'Pembayaran baru berhasil ditambahkan',
            'status' => 'success'
        ]);
    }

    // Menampilkan detail pembayaran tertentu
    public function show($id)
    {
        return response()->json([
            'message' => "Detail pembayaran ID $id berhasil diakses",
            'status' => 'success'
        ]);
    }

    // Mengupdate data pembayaran
    public function update(Request $request, $id)
    {
        return response()->json([
            'message' => "Pembayaran ID $id berhasil diperbarui",
            'status' => 'success'
        ]);
    }

    // Menghapus pembayaran
    public function destroy($id)
    {
        return response()->json([
            'message' => "Pembayaran ID $id berhasil dihapus",
            'status' => 'success'
        ]);
    }

    // ===== QRIS STUBS to satisfy FE contracts =====
    public function createQris(Request $request)
    {
        $validated = $request->validate([
            'invoice_id' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'description' => 'nullable|string',
        ]);

        $expiresAt = now()->addMinutes(10)->toIso8601String();

        return response()->json([
            'message' => 'QRIS created (stub)',
            'data' => [
                'qris_string' => '00020101021226680014ID.CO.QRIS.WWW01189360091600000000000300303UMI51470015ID1020025303350540' . rand(1000,9999),
                'invoice_id' => $validated['invoice_id'],
                'amount' => (float) $validated['amount'],
                'status' => 'pending',
                'expires_at' => $expiresAt,
                'payment_url' => null,
            ],
        ]);
    }

    public function checkQrisStatus(string $invoiceId)
    {
        // Stub: always pending
        return response()->json([
            'message' => 'QRIS status fetched (stub)',
            'data' => [
                'invoice_id' => $invoiceId,
                'status' => 'pending',
                'paid_at' => null,
                'payment_method' => 'qris',
            ],
        ]);
    }

    public function history()
    {
        // Stub: return sample list
        $now = now();
        return response()->json([
            'message' => 'Payment history (stub)',
            'data' => [
                [
                    'id' => 'inv-001',
                    'amount' => 500000,
                    'status' => 'paid',
                    'created_at' => $now->copy()->subDays(10)->toIso8601String(),
                ],
                [
                    'id' => 'inv-002',
                    'amount' => 450000,
                    'status' => 'pending',
                    'created_at' => $now->copy()->subDays(2)->toIso8601String(),
                ],
            ],
        ]);
    }
}

