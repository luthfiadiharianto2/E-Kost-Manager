<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Kost;
use App\Models\Kamar;
use App\Models\OwnerProfile;
use App\Models\Invitation;
use App\Services\OtpService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PemilikFeatureTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test registrasi pemilik berhasil dengan owner profile
     */
    public function test_pemilik_can_register()
    {
        $email = 'pemilik@test.com';
        $otp = OtpService::generateOtpForEmail($email);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Pemilik Test',
            'email' => $email,
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin',
            'whatsapp' => '081234567890',
            'otp' => $otp,
            'namaKost' => 'Kost Test',
            'alamat' => 'Jl. Test No. 123',
            'kodePos' => '12345',
            'provinsi' => 'Jawa Barat',
            'kota' => 'Bandung',
            'kecamatan' => 'Coblong',
            'kelurahan' => 'Dago',
            'pilihanPembayaran' => 'Transfer Bank',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Registrasi berhasil',
            ]);

        $user = User::where('email', $email)->first();
        $this->assertNotNull($user);
        $this->assertEquals('admin', $user->role);
        $this->assertNotNull($user->ownerProfile);
        $this->assertDatabaseHas('kosts', [
            'user_id' => $user->id,
            'nama_kost' => 'Kost Test',
        ]);
    }

    /**
     * Test pemilik dapat login
     */
    public function test_pemilik_can_login()
    {
        $pemilik = User::factory()->create([
            'email' => 'pemilik@test.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'pemilik@test.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login berhasil',
            ])
            ->assertJsonPath('user.role', 'admin');
    }

    /**
     * Test pemilik dapat melihat profil sendiri
     */
    public function test_pemilik_can_view_profile()
    {
        $pemilik = User::factory()->create(['role' => 'admin']);
        OwnerProfile::factory()->create(['user_id' => $pemilik->id]);
        $token = $pemilik->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/profile');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Profile berhasil diambil',
            ])
            ->assertJsonPath('data.id', $pemilik->id)
            ->assertJsonPath('data.role', 'admin')
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'name',
                    'email',
                    'role',
                    'owner_profile',
                ],
            ]);
    }

    /**
     * Test pemilik dapat membuat kost baru
     */
    public function test_pemilik_can_create_kost()
    {
        $pemilik = User::factory()->create(['role' => 'admin']);
        $token = $pemilik->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/kost', [
                'user_id' => $pemilik->id,
                'nama_kost' => 'Kost Baru',
                'alamat_kost' => 'Jl. Baru No. 456',
                'jumlah_kamar' => 20,
                'harga' => 750000,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Data kost berhasil disimpan',
            ]);

        $this->assertDatabaseHas('kosts', [
            'user_id' => $pemilik->id,
            'nama_kost' => 'Kost Baru',
        ]);
    }

    /**
     * Test pemilik dapat melihat semua kamar miliknya
     */
    public function test_pemilik_can_view_their_rooms()
    {
        $pemilik = User::factory()->create(['role' => 'admin']);
        $kost = Kost::factory()->create(['user_id' => $pemilik->id]);
        Kamar::factory()->count(3)->create(['kost_id' => $kost->id]);
        $token = $pemilik->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/owner/rooms');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonCount('data', 3);
    }

    /**
     * Test pemilik dapat membuat kamar baru
     */
    public function test_pemilik_can_create_room()
    {
        $pemilik = User::factory()->create(['role' => 'admin']);
        $kost = Kost::factory()->create(['user_id' => $pemilik->id]);
        $token = $pemilik->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/owner/rooms', [
                'nomor_kamar' => 'A101',
                'tipe_kamar' => 'Standard',
                'harga_sewa' => 500000,
                'kost_id' => $kost->id,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Kamar berhasil dibuat',
            ]);

        $this->assertDatabaseHas('kamars', [
            'nomor_kamar' => 'A101',
            'kost_id' => $kost->id,
            'status' => 'tersedia',
        ]);
    }

    /**
     * Test pemilik dapat mengupdate kamar
     */
    public function test_pemilik_can_update_room()
    {
        $pemilik = User::factory()->create(['role' => 'admin']);
        $kost = Kost::factory()->create(['user_id' => $pemilik->id]);
        $kamar = Kamar::factory()->create([
            'kost_id' => $kost->id,
            'harga_sewa' => 500000,
        ]);
        $token = $pemilik->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/owner/rooms/{$kamar->id}", [
                'harga_sewa' => 600000,
                'status' => 'terisi',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Kamar berhasil diperbarui',
            ]);

        $this->assertDatabaseHas('kamars', [
            'id' => $kamar->id,
            'harga_sewa' => 600000,
            'status' => 'terisi',
        ]);
    }

    /**
     * Test pemilik dapat menghapus kamar
     */
    public function test_pemilik_can_delete_room()
    {
        $pemilik = User::factory()->create(['role' => 'admin']);
        $kost = Kost::factory()->create(['user_id' => $pemilik->id]);
        $kamar = Kamar::factory()->create(['kost_id' => $kost->id]);
        $token = $pemilik->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/owner/rooms/{$kamar->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Kamar berhasil dihapus',
            ]);

        $this->assertDatabaseMissing('kamars', [
            'id' => $kamar->id,
        ]);
    }

    /**
     * Test pemilik dapat assign tenant ke kamar
     */
    public function test_pemilik_can_assign_tenant_to_room()
    {
        $pemilik = User::factory()->create(['role' => 'admin']);
        $tenant = User::factory()->create(['role' => 'tenant']);
        $kost = Kost::factory()->create(['user_id' => $pemilik->id]);
        $kamar = Kamar::factory()->create([
            'kost_id' => $kost->id,
            'status' => 'tersedia',
        ]);
        $token = $pemilik->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/owner/rooms/{$kamar->id}/assign-tenant", [
                'tenant_id' => $tenant->id,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Kamar berhasil diperbarui',
            ]);

        $this->assertDatabaseHas('kamars', [
            'id' => $kamar->id,
            'tenant_id' => $tenant->id,
            'status' => 'terisi',
        ]);
    }

    /**
     * Test pemilik dapat membuat undangan untuk penyewa
     */
    public function test_pemilik_can_create_invitation()
    {
        $pemilik = User::factory()->create(['role' => 'admin']);
        OwnerProfile::factory()->create(['user_id' => $pemilik->id]);
        $token = $pemilik->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/invitations', [
                'email' => 'newtenant@test.com',
                'name' => 'New Tenant',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'invitation',
                    'accept_url',
                ],
            ]);

        $this->assertDatabaseHas('invitations', [
            'owner_id' => $pemilik->id,
            'email' => 'newtenant@test.com',
            'is_used' => false,
        ]);
    }

    /**
     * Test pemilik dapat melihat daftar undangan
     */
    public function test_pemilik_can_view_invitations()
    {
        $pemilik = User::factory()->create(['role' => 'admin']);
        Invitation::factory()->count(3)->create(['owner_id' => $pemilik->id]);
        $token = $pemilik->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/invitations');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data',
                ],
            ]);
    }

    /**
     * Test pemilik dapat melihat daftar tenant
     */
    public function test_pemilik_can_view_tenants()
    {
        $pemilik = User::factory()->create(['role' => 'admin']);
        $tenant = User::factory()->create(['role' => 'tenant']);
        $kost = Kost::factory()->create(['user_id' => $pemilik->id]);
        $kamar = Kamar::factory()->create([
            'kost_id' => $kost->id,
            'tenant_id' => $tenant->id,
        ]);
        Invitation::factory()->create([
            'owner_id' => $pemilik->id,
            'email' => $tenant->email,
            'is_used' => true,
        ]);
        $token = $pemilik->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/owner/tenants');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'email',
                        'room',
                        'status',
                    ],
                ],
            ]);
    }

    /**
     * Test pemilik dapat menghapus undangan
     */
    public function test_pemilik_can_delete_invitation()
    {
        $pemilik = User::factory()->create(['role' => 'admin']);
        $invitation = Invitation::factory()->create(['owner_id' => $pemilik->id]);
        $token = $pemilik->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/invitations/{$invitation->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Undangan berhasil dihapus',
            ]);

        $this->assertDatabaseMissing('invitations', [
            'id' => $invitation->id,
        ]);
    }

    /**
     * Test pemilik tidak dapat menghapus kamar milik orang lain
     */
    public function test_pemilik_cannot_delete_other_owner_room()
    {
        $pemilik1 = User::factory()->create(['role' => 'admin']);
        $pemilik2 = User::factory()->create(['role' => 'admin']);
        $kost2 = Kost::factory()->create(['user_id' => $pemilik2->id]);
        $kamar = Kamar::factory()->create(['kost_id' => $kost2->id]);
        $token = $pemilik1->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/owner/rooms/{$kamar->id}");

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Kamar tidak ditemukan',
            ]);
    }

    /**
     * Test pemilik dapat mengupdate profil
     */
    public function test_pemilik_can_update_profile()
    {
        $pemilik = User::factory()->create([
            'role' => 'admin',
            'name' => 'Old Name',
        ]);
        $token = $pemilik->createToken('test-token')->plainTextToken;

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
            'id' => $pemilik->id,
            'name' => 'New Name',
        ]);
    }

    /**
     * Test pemilik dapat logout
     */
    public function test_pemilik_can_logout()
    {
        $pemilik = User::factory()->create(['role' => 'admin']);
        $token = $pemilik->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logout berhasil',
            ]);
    }
}

