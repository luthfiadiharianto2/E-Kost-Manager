<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Models\User;
use App\Models\OwnerProfile;
use App\Models\Kost;
use App\Services\OtpService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test registrasi user dengan role tenant berhasil
     */
    public function test_register_tenant_success()
    {
        // Generate OTP untuk email
        $email = 'tenant@test.com';
        $otp = OtpService::generateOtpForEmail($email);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test Tenant',
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
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'role',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => $email,
            'role' => 'tenant',
        ]);
    }

    /**
     * Test registrasi user dengan role admin berhasil
     */
    public function test_register_admin_success()
    {
        $email = 'admin@test.com';
        $otp = OtpService::generateOtpForEmail($email);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test Admin',
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
     * Test registrasi gagal jika OTP tidak valid
     */
    public function test_register_fails_with_invalid_otp()
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'tenant',
            'otp' => '000000',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'OTP tidak valid atau sudah kadaluarsa',
            ]);
    }

    /**
     * Test registrasi gagal jika OTP tidak diisi
     */
    public function test_register_fails_without_otp()
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'tenant',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'OTP wajib diisi',
            ]);
    }

    /**
     * Test registrasi gagal jika validasi gagal
     */
    public function test_register_fails_validation()
    {
        $email = 'test@test.com';
        $otp = OtpService::generateOtpForEmail($email);

        $response = $this->postJson('/api/auth/register', [
            'name' => '',
            'email' => 'invalid-email',
            'password' => '123',
            'password_confirmation' => '456',
            'role' => 'invalid-role',
            'otp' => $otp,
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validasi gagal',
            ]);
    }

    /**
     * Test login berhasil dengan kredensial valid
     */
    public function test_login_success()
    {
        $user = User::factory()->create([
            'email' => 'test@test.com',
            'password' => Hash::make('password123'),
            'role' => 'tenant',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@test.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login berhasil',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'user',
                'access_token',
                'token_type',
            ]);
    }

    /**
     * Test login gagal dengan kredensial tidak valid
     */
    public function test_login_fails_with_invalid_credentials()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'wrong@test.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Email atau password salah!',
            ]);
    }

    /**
     * Test get profile berhasil
     */
    public function test_profile_success()
    {
        $user = User::factory()->create([
            'role' => 'tenant',
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/profile');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Profile berhasil diambil',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'name',
                    'email',
                    'role',
                ],
            ]);
    }

    /**
     * Test update profile berhasil
     */
    public function test_update_profile_success()
    {
        $user = User::factory()->create([
            'name' => 'Old Name',
            'email' => 'old@test.com',
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

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
            'id' => $user->id,
            'name' => 'New Name',
            'whatsapp' => '081234567890',
        ]);
    }

    /**
     * Test logout berhasil
     */
    public function test_logout_success()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logout berhasil',
            ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }
}

