<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Kost;
use App\Models\Kamar;
use App\Models\Testimoni;
use App\Models\Invitation;
use App\Services\OtpService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PenyewaFeatureTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test registrasi penyewa berhasil
     */
    public function test_penyewa_can_register()
    {
        $email = 'penyewa@test.com';
        $otp = OtpService::generateOtpForEmail($email);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Penyewa Test',
            'email' => $email,
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'tenant',
            'whatsapp' => '081234567890',
            'otp' => $otp,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Registrasi berhasil',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => $email,
            'role' => 'tenant',
        ]);
    }

    /**
     * Test penyewa dapat login
     */
    public function test_penyewa_can_login()
    {
        $penyewa = User::factory()->create([
            'email' => 'penyewa@test.com',
            'password' => Hash::make('password123'),
            'role' => 'tenant',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'penyewa@test.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login berhasil',
            ])
            ->assertJsonStructure([
                'success',
                'user',
                'access_token',
            ]);
    }

    /**
     * Test penyewa dapat melihat profil sendiri
     */
    public function test_penyewa_can_view_profile()
    {
        $penyewa = User::factory()->create(['role' => 'tenant']);
        $token = $penyewa->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/profile');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Profile berhasil diambil',
            ])
            ->assertJsonPath('data.id', $penyewa->id)
            ->assertJsonPath('data.role', 'tenant');
    }

    /**
     * Test penyewa dapat mengupdate profil
     */
    public function test_penyewa_can_update_profile()
    {
        $penyewa = User::factory()->create([
            'role' => 'tenant',
            'name' => 'Old Name',
        ]);
        $token = $penyewa->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/auth/profile', [
                'name' => 'New Name',
                'whatsapp' => '081234567890',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Profile berhasil diperbarui',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $penyewa->id,
            'name' => 'New Name',
            'whatsapp' => '081234567890',
        ]);
    }

    /**
     * Test penyewa dapat melihat kamar yang ditempatinya
     */
    public function test_penyewa_can_view_their_room()
    {
        $owner = User::factory()->create(['role' => 'admin']);
        $penyewa = User::factory()->create(['role' => 'tenant']);
        $kost = Kost::factory()->create(['user_id' => $owner->id]);
        $kamar = Kamar::factory()->create([
            'kost_id' => $kost->id,
            'tenant_id' => $penyewa->id,
            'status' => 'terisi',
        ]);

        $token = $penyewa->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/tenant/my-room');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'kost',
                    'room',
                    'owner',
                ],
            ])
            ->assertJsonPath('data.room.id', $kamar->id);
    }

    /**
     * Test penyewa melihat null jika belum ada kamar
     */
    public function test_penyewa_sees_null_when_no_room_assigned()
    {
        $penyewa = User::factory()->create(['role' => 'tenant']);
        $token = $penyewa->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/tenant/my-room');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => null,
            ]);
    }

    /**
     * Test penyewa tidak dapat mengakses endpoint owner
     */
    public function test_penyewa_cannot_access_owner_endpoints()
    {
        $penyewa = User::factory()->create(['role' => 'tenant']);
        $token = $penyewa->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/owner/rooms');

        $response->assertStatus(403);
    }

    /**
     * Test penyewa dapat membuat testimoni
     */
    public function test_penyewa_can_create_testimoni()
    {
        $response = $this->postJson('/api/testimoni', [
            'nama' => 'Penyewa Test',
            'email' => 'penyewa@test.com',
            'pesan' => 'Kost ini sangat nyaman dan bersih!',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'nama',
                'email',
                'pesan',
                'created_at',
            ]);

        $this->assertDatabaseHas('testimonis', [
            'email' => 'penyewa@test.com',
            'pesan' => 'Kost ini sangat nyaman dan bersih!',
        ]);
    }

    /**
     * Test penyewa dapat melihat semua testimoni
     */
    public function test_penyewa_can_view_all_testimonis()
    {
        Testimoni::factory()->count(3)->create();

        $response = $this->getJson('/api/testimoni');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    /**
     * Test penyewa dapat melihat history pembayaran
     */
    public function test_penyewa_can_view_payment_history()
    {
        $penyewa = User::factory()->create(['role' => 'tenant']);
        $token = $penyewa->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/payments/history');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'amount',
                        'status',
                        'created_at',
                    ],
                ],
            ]);
    }

    /**
     * Test penyewa dapat membuat QRIS payment
     */
    public function test_penyewa_can_create_qris_payment()
    {
        $penyewa = User::factory()->create(['role' => 'tenant']);
        $token = $penyewa->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/payments/qris/create', [
                'invoice_id' => 'INV-001',
                'amount' => 500000,
                'description' => 'Pembayaran sewa bulanan',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'qris_string',
                    'invoice_id',
                    'amount',
                    'status',
                    'expires_at',
                ],
            ]);
    }

    /**
     * Test penyewa dapat menerima undangan dari pemilik
     */
    public function test_penyewa_can_accept_invitation()
    {
        $owner = User::factory()->create(['role' => 'admin']);
        $invitation = Invitation::factory()->create([
            'owner_id' => $owner->id,
            'email' => 'newtenant@test.com',
            'is_used' => false,
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->postJson('/api/invitations/accept', [
            'token' => $invitation->token,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Akun berhasil dibuat. Silakan login.',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'newtenant@test.com',
            'role' => 'tenant',
        ]);

        $this->assertDatabaseHas('invitations', [
            'id' => $invitation->id,
            'is_used' => true,
        ]);
    }

    /**
     * Test penyewa dapat logout
     */
    public function test_penyewa_can_logout()
    {
        $penyewa = User::factory()->create(['role' => 'tenant']);
        $token = $penyewa->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logout berhasil',
            ]);
    }
}

