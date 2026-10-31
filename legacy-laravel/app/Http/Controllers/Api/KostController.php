<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Kost;

class KostController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'nama_kost' => 'required|string|max:255',
            'alamat_kost' => 'required|string|max:255',
            'jumlah_kamar' => 'required|integer|min:1',
            'harga' => 'required|numeric|min:0',
        ]);

        $kost = Kost::create([
            'user_id' => $request->user_id,
            'nama_kost' => $request->nama_kost,
            'alamat_kost' => $request->alamat_kost,
            'jumlah_kamar' => $request->jumlah_kamar,
            'harga' => $request->harga,
        ]);

        return response()->json([
            'message' => 'Data kost berhasil disimpan',
            'kost' => $kost,
        ], 201);
    }
}
