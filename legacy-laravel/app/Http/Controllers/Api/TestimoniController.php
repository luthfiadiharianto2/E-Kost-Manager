<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Testimoni;
use Illuminate\Http\Request;

class TestimoniController extends Controller
{
    // 🔹 Ambil semua testimoni
    public function index()
    {
        return response()->json(
            Testimoni::orderBy('created_at', 'desc')->get(),
            200
        );
    }

    // 🔹 Simpan testimoni baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'email' => 'required|email',
            'pesan' => 'required|string',
        ]);

        $testimoni = Testimoni::create($validated);

        return response()->json($testimoni, 201);
    }
}
