<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\InvitationMail;
use App\Models\Invitation;
use App\Models\User;
use App\Models\Kamar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class InvitationController extends Controller
{
    /**
     * Buat undangan baru
     */
    public function create(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|unique:users,email',
                'name' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = $request->user();

            // Cek apakah sudah ada undangan aktif untuk email ini dari owner yang sama
            $existingInvitation = Invitation::where('owner_id', $user->id)
                ->where('email', $request->email)
                ->where('is_used', false)
                ->where('expires_at', '>', now())
                ->first();

            if ($existingInvitation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Undangan untuk email ini masih aktif',
                ], 422);
            }

            // Buat undangan baru
            $invitation = Invitation::create([
                'owner_id' => $user->id,
                'email' => $request->email,
                'name' => $request->name,
                'token' => Invitation::generateToken(),
                'expires_at' => now()->addDays(7), // Berlaku 7 hari
            ]);

            // Load owner profile untuk mendapatkan nama kost
            $user->load('ownerProfile');
            $kostName = $user->ownerProfile->nama_kost ?? 'Kost';
            $ownerName = $user->name;

            // Kirim email undangan
            Mail::to($invitation->email)->send(
                new InvitationMail($invitation, $ownerName, $kostName)
            );

            Log::info('📧 Invitation email sent', [
                'invitation_id' => $invitation->id,
                'email' => $invitation->email,
                'owner_id' => $user->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Undangan berhasil dikirim ke ' . $invitation->email,
                'data' => [
                    'invitation' => $invitation,
                    'accept_url' => config('app.frontend_url') . '/accept-invite?token=' . $invitation->token,
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error('❌ Failed to create invitation:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat undangan: ' . $e->getMessage(),
            ], 500);
        }
    }

     // Validasi token undangan
    public function validateInvitation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Token wajib diisi',
                'errors' => $validator->errors(),
            ], 422);
        }

        $invitation = Invitation::where('token', $request->token)->first();

        if (!$invitation) {
            Log::warning('Invitation not found', ['token' => $request->token]);
            return response()->json([
                'success' => false,
                'message' => 'Undangan tidak ditemukan',
            ], 404);
        }

        if (!$invitation->isValid()) {
            Log::warning('Invalid invitation', [
                'token' => $request->token,
                'is_used' => $invitation->is_used,
                'expires_at' => $invitation->expires_at,
            ]);

            return response()->json([
                'success' => false,
                'message' => $invitation->is_used
                    ? 'Undangan sudah digunakan'
                    : 'Undangan sudah kedaluwarsa',
            ], 422);
        }

        // Load owner info
        $invitation->load('owner.ownerProfile');

        return response()->json([
            'success' => true,
            'message' => 'Undangan valid',
            'data' => [
                'invitation' => $invitation,
                'owner_name' => $invitation->owner->name,
                'kost_name' => $invitation->owner->ownerProfile->nama_kost ?? 'Kost',
            ],
        ]);
    }

    
    //Terima undangan dan buat akun tenant
    public function accept(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'token' => 'required|string',
                'password' => 'required|string|min:6|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $invitation = Invitation::where('token', $request->token)->first();

            if (!$invitation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Undangan tidak ditemukan',
                ], 404);
            }

            if (!$invitation->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => $invitation->is_used
                        ? 'Undangan sudah digunakan'
                        : 'Undangan sudah kedaluwarsa',
                ], 422);
            }

            // Cek apakah email sudah terdaftar
            if (User::where('email', $invitation->email)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email sudah terdaftar',
                ], 422);
            }

            DB::beginTransaction();

            // Buat akun tenant
            $tenant = User::create([
                'name' => $invitation->name ?? 'Penyewa',
                'email' => $invitation->email,
                'password' => Hash::make($request->password),
                'role' => 'tenant',
            ]);

            // Tandai undangan sebagai digunakan
            $invitation->markAsUsed();

            DB::commit();

            Log::info('✅ Tenant account created via invitation', [
                'tenant_id' => $tenant->id,
                'invitation_id' => $invitation->id,
                'owner_id' => $invitation->owner_id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Akun berhasil dibuat. Silakan login.',
                'data' => [
                    'user' => $tenant,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('❌ Failed to accept invitation:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menerima undangan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * List undangan yang dibuat owner
     */
    public function list(Request $request)
    {
        $user = $request->user();

        $invitations = Invitation::where('owner_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $invitations,
        ]);
    }

    /**
     * List tenant users associated with the authenticated owner
     * based on accepted invitations (is_used = true).
     */
    public function tenants(Request $request)
    {
        $owner = $request->user();

        // Ambil semua email yang sudah menerima undangan dari owner ini
        $emails = Invitation::where('owner_id', $owner->id)
            ->where('is_used', true)
            ->pluck('email')
            ->unique()
            ->values();

        if ($emails->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        // Ambil user dengan role tenant yang email-nya ada di daftar tersebut
        $tenants = User::where('role', 'tenant')
            ->whereIn('email', $emails)
            ->get([
                'id',
                'name',
                'email',
                'phone',
                'whatsapp',
                'created_at',
                'updated_at',
            ]);

        // Ambil semua kost milik owner ini
        $ownerKostIds = $owner->kosts()->pluck('id');

        // Ambil kamar yang dimiliki owner ini dan sedang ditempati tenant
        $rooms = Kamar::whereIn('kost_id', $ownerKostIds)
            ->whereIn('tenant_id', $tenants->pluck('id'))
            ->get();

        $roomsByTenant = $rooms->groupBy('tenant_id')->map(function ($items) {
            $roomNumbers = $items->pluck('nomor_kamar')->implode(', ');
            // Jika ada kamar berstatus terisi, anggap tenant aktif
            $isActive = $items->contains(function ($room) {
                return $room->status === 'terisi';
            });

            return [
                'room' => $roomNumbers,
                'status' => $isActive ? 'Aktif' : 'Tidak Aktif',
            ];
        });

        $data = $tenants->map(function ($tenant) use ($roomsByTenant) {
            $roomInfo = $roomsByTenant->get($tenant->id, null);

            return [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'email' => $tenant->email,
                'phone' => $tenant->phone,
                'whatsapp' => $tenant->whatsapp,
                'room' => $roomInfo['room'] ?? null,
                'status' => $roomInfo['status'] ?? 'Aktif',
                'created_at' => $tenant->created_at,
                'updated_at' => $tenant->updated_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Hapus/batalkan undangan
     */
    public function delete(Request $request, $id)
    {
        $user = $request->user();

        $invitation = Invitation::where('id', $id)
            ->where('owner_id', $user->id)
            ->first();

        if (!$invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Undangan tidak ditemukan',
            ], 404);
        }

        $invitation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Undangan berhasil dihapus',
        ]);
    }
}
