<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Penghuni; // <-- Import Model Penghuni
use Illuminate\Http\Request;

class PenghuniController extends Controller
{
    /**
     * Menampilkan semua data penghuni. (READ)
     */
    public function index()
    {
        // Mengambil semua data dari model Penghuni
        return Penghuni::all();
    }

    /**
     * Menyimpan data penghuni baru. (CREATE)
     */
    public function store(Request $request)
    {
        // Validasi data yang masuk
        $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'nomor_telepon' => 'required|string',
            'email' => 'required|email|unique:penghunis',
        ]);

        // Membuat data baru
        $penghuni = Penghuni::create($request->all());

        // Mengembalikan data yang baru dibuat dengan status 201 (Created)
        return response()->json($penghuni, 201);
    }

    /**
     * Menampilkan satu data penghuni spesifik. (READ by ID)
     */
    public function show(Penghuni $penghuni)
    {
        // Laravel secara otomatis akan mencari penghuni berdasarkan ID
        return $penghuni;
    }

    /**
     * Memperbarui data penghuni. (UPDATE)
     */
    public function update(Request $request, Penghuni $penghuni)
    {
        // Validasi data yang masuk
        $request->validate([
            'nama_lengkap' => 'string|max:255',
            'nomor_telepon' => 'string',
            'email' => 'email|unique:penghunis,email,' . $penghuni->id,
        ]);

        // Memperbarui data
        $penghuni->update($request->all());
        
        // Mengembalikan data yang sudah diperbarui
        return response()->json($penghuni);
    }

    /**
     * Menghapus data penghuni. (DELETE)
     */
    public function destroy(Penghuni $penghuni)
    {
        // Menghapus data
        $penghuni->delete();
        
        // Mengembalikan pesan sukses
        return response()->json(['message' => 'Data penghuni berhasil dihapus']);
    }
}