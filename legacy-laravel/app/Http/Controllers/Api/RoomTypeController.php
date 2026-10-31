<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RoomType;
use App\Models\Kamar;
use Illuminate\Http\Request;

class RoomTypeController extends Controller
{
    public function indexForOwner(Request $request)
    {
        $owner = $request->user();

        $types = RoomType::where('user_id', $owner->id)
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $types,
        ]);
    }

    public function storeForOwner(Request $request)
    {
        $owner = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|integer|min:0',
            'facilities' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $type = RoomType::create([
            'user_id' => $owner->id,
            'name' => $validated['name'],
            'price' => $validated['price'],
            'facilities' => $validated['facilities'] ?? null,
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tipe kamar berhasil dibuat',
            'data' => $type,
        ], 201);
    }

    public function updateForOwner(Request $request, $id)
    {
        $owner = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|integer|min:0',
            'facilities' => 'sometimes|nullable|string',
            'description' => 'sometimes|nullable|string',
        ]);

        $type = RoomType::where('id', $id)
            ->where('user_id', $owner->id)
            ->first();

        if (!$type) {
            return response()->json([
                'success' => false,
                'message' => 'Tipe kamar tidak ditemukan',
            ], 404);
        }

        $type->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tipe kamar berhasil diperbarui',
            'data' => $type,
        ]);
    }

    public function destroyForOwner(Request $request, $id)
    {
        $owner = $request->user();

        $type = RoomType::where('id', $id)
            ->where('user_id', $owner->id)
            ->first();

        if (!$type) {
            return response()->json([
                'success' => false,
                'message' => 'Tipe kamar tidak ditemukan',
            ], 404);
        }

        // Opsional: cegah hapus jika ada kamar yang menggunakan nama tipe ini
        $isUsed = Kamar::where('tipe_kamar', $type->name)->exists();

        if ($isUsed) {
            return response()->json([
                'success' => false,
                'message' => 'Tipe kamar sedang digunakan oleh salah satu kamar.',
            ], 422);
        }

        $type->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tipe kamar berhasil dihapus',
        ]);
    }
}
