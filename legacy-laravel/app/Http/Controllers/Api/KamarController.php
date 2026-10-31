<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kamar;
use App\Models\Kost;
use Illuminate\Http\Request;

class KamarController extends Controller
{
    /**
     * Menampilkan semua data kamar.
     */
    public function index()
    {
        return Kamar::all();
    }

    /**
     * Menyimpan data kamar baru.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nomor_kamar' => 'required|string|unique:kamars',
            'tipe_kamar' => 'required|string',
            'harga_sewa' => 'required|integer',
            'status' => 'required|in:tersedia,terisi',
        ]);

        $kamar = Kamar::create($validatedData);

        return response()->json($kamar, 201);
    }

    /**
     * Menampilkan satu data kamar spesifik.
     */
    public function show(Kamar $kamar)
    {
        return $kamar;
    }

    /**
     * Memperbarui data kamar.
     */
    public function update(Request $request, Kamar $kamar)
    {
        $validatedData = $request->validate([
            'nomor_kamar' => 'string|unique:kamars,nomor_kamar,' . $kamar->id,
            'tipe_kamar' => 'string',
            'harga_sewa' => 'integer',
            'status' => 'in:tersedia,terisi',
        ]);

        $kamar->update($validatedData);

        return response()->json($kamar);
    }

    /**
     * Menghapus data kamar.
     */
    public function destroy(Kamar $kamar)
    {
        $kamar->delete();

        return response()->json(['message' => 'Data kamar berhasil dihapus']);
    }

    /**
     * List kamar milik pemilik yang sedang login (berdasarkan kost yang ia miliki).
     */
    public function ownerRooms(Request $request)
    {
        $owner = $request->user();

        $kostIds = $owner->kosts()->pluck('id');

        if ($kostIds->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        $rooms = Kamar::with('tenant')
            ->whereIn('kost_id', $kostIds)
            ->orderBy('nomor_kamar')
            ->get();

        $data = $rooms->map(function ($room) {
            return [
                'id' => $room->id,
                'kost_id' => $room->kost_id,
                'nomor_kamar' => $room->nomor_kamar,
                'tipe_kamar' => $room->tipe_kamar,
                'harga_sewa' => $room->harga_sewa,
                'status' => $room->status,
                'tenant_id' => $room->tenant_id,
                'tenant_name' => optional($room->tenant)->name,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Buat kamar baru yang otomatis dihubungkan ke kost milik pemilik.
     */
    public function storeForOwner(Request $request)
    {
        $owner = $request->user();

        $validated = $request->validate([
            'nomor_kamar' => 'required|string|unique:kamars,nomor_kamar',
            'tipe_kamar' => 'required|string',
            'harga_sewa' => 'required|integer|min:0',
            'status' => 'sometimes|in:tersedia,terisi',
            'kost_id' => 'sometimes|integer|exists:kosts,id',
        ]);

        // Jika kost_id tidak dikirim dari FE, gunakan kost pertama milik owner
        $kostId = $validated['kost_id'] ?? $owner->kosts()->value('id');

        // Jika owner belum punya kost sama sekali, coba buat otomatis dari ownerProfile
        if (!$kostId) {
            $owner->loadMissing('ownerProfile');

            if ($owner->ownerProfile) {
                $profile = $owner->ownerProfile;

                $newKost = Kost::create([
                    'user_id' => $owner->id,
                    'nama_kost' => $profile->nama_kost ?? ($owner->name . ' Kost'),
                    'alamat_kost' => $profile->alamat ?? ($owner->address ?? ''),
                    'jumlah_kamar' => 0,
                    'harga' => 0,
                ]);

                $kostId = $newKost->id;
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Owner belum memiliki data kost. Silakan lengkapi informasi kost terlebih dahulu.',
                ], 422);
            }
        }

        $room = Kamar::create([
            'kost_id' => $kostId,
            'tenant_id' => null,
            'nomor_kamar' => $validated['nomor_kamar'],
            'tipe_kamar' => $validated['tipe_kamar'],
            'harga_sewa' => $validated['harga_sewa'],
            'status' => $validated['status'] ?? 'tersedia',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil dibuat',
            'data' => $room,
        ], 201);
    }

    /**
     * Hapus kamar milik owner (dengan pengecekan kepemilikan kost).
     */
    public function destroyForOwner(Request $request, $id)
    {
        $owner = $request->user();
        $kostIds = $owner->kosts()->pluck('id');

        $room = Kamar::where('id', $id)
            ->whereIn('kost_id', $kostIds)
            ->first();

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Kamar tidak ditemukan',
            ], 404);
        }

        $room->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil dihapus',
        ]);
    }

    /**
     * Update kamar milik owner (nomor, tipe, harga, status) dengan pengecekan kepemilikan kost.
     */
    public function updateForOwner(Request $request, $id)
    {
        $owner = $request->user();

        $validated = $request->validate([
            'nomor_kamar' => 'sometimes|string|unique:kamars,nomor_kamar,' . $id,
            'tipe_kamar' => 'sometimes|string',
            'harga_sewa' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:tersedia,terisi',
        ]);

        $kostIds = $owner->kosts()->pluck('id');

        $room = Kamar::where('id', $id)
            ->whereIn('kost_id', $kostIds)
            ->first();

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Kamar tidak ditemukan',
            ], 404);
        }

        $room->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil diperbarui',
            'data' => $room->load('tenant'),
        ]);
    }

    /**
     * Assign / lepas tenant pada kamar milik owner.
     */
    public function assignTenant(Request $request, $id)
    {
        $owner = $request->user();

        $validated = $request->validate([
            'tenant_id' => 'nullable|exists:users,id',
        ]);

        $kostIds = $owner->kosts()->pluck('id');

        $room = Kamar::where('id', $id)
            ->whereIn('kost_id', $kostIds)
            ->first();

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Kamar tidak ditemukan',
            ], 404);
        }

        $room->tenant_id = $validated['tenant_id'] ?? null;
        $room->status = $room->tenant_id ? 'terisi' : 'tersedia';
        $room->save();

        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil diperbarui',
            'data' => $room->load('tenant'),
        ]);
    }

    /**
     * Endpoint untuk penyewa: ambil info kamar & kost milik penyewa yang sedang login.
     */
    public function tenantRoom(Request $request)
    {
        $tenant = $request->user();

        if ($tenant->role !== 'tenant') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya penyewa yang dapat mengakses informasi kamar ini',
            ], 403);
        }

        $room = Kamar::with(['kost.user'])
            ->where('tenant_id', $tenant->id)
            ->first();

        if (!$room) {
            return response()->json([
                'success' => true,
                'data' => null,
            ]);
        }

        $kost = $room->kost;
        $owner = $kost ? $kost->user : null;

        return response()->json([
            'success' => true,
            'data' => [
                'kost' => $kost ? [
                    'id' => $kost->id,
                    'nama_kost' => $kost->nama_kost,
                    'alamat_kost' => $kost->alamat_kost,
                    'jumlah_kamar' => $kost->jumlah_kamar,
                    'harga' => $kost->harga,
                ] : null,
                'room' => [
                    'id' => $room->id,
                    'nomor_kamar' => $room->nomor_kamar,
                    'tipe_kamar' => $room->tipe_kamar,
                    'harga_sewa' => $room->harga_sewa,
                    'status' => $room->status,
                ],
                'owner' => $owner ? [
                    'id' => $owner->id,
                    'name' => $owner->name,
                    'phone' => $owner->phone,
                    'whatsapp' => $owner->whatsapp,
                ] : null,
            ],
        ]);
    }
}