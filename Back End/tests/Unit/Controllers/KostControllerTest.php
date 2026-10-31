<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Models\User;
use App\Models\Kost;
use Illuminate\Foundation\Testing\RefreshDatabase;

class KostControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test store - menyimpan data kost baru
     */
    public function test_store_creates_new_kost()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $token = $user->createToken('test-token')->plainTextToken;

        $data = [
            'user_id' => $user->id,
            'nama_kost' => 'Kost Test',
            'alamat_kost' => 'Jl. Test No. 123',
            'jumlah_kamar' => 10,
            'harga' => 500000,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/kost', $data);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Data kost berhasil disimpan',
            ])
            ->assertJsonStructure([
                'message',
                'kost' => [
                    'id',
                    'user_id',
                    'nama_kost',
                    'alamat_kost',
                    'jumlah_kamar',
                    'harga',
                ],
            ]);

        $this->assertDatabaseHas('kosts', $data);
    }

    /**
     * Test store gagal jika validasi gagal
     */
    public function test_store_fails_validation()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/kost', [
                'user_id' => $user->id,
                'nama_kost' => '',
                'alamat_kost' => '',
                'jumlah_kamar' => -1,
                'harga' => -1000,
            ]);

        $response->assertStatus(422);
    }

    /**
     * Test store memerlukan autentikasi
     */
    public function test_store_requires_authentication()
    {
        $response = $this->postJson('/api/kost', [
            'user_id' => 1,
            'nama_kost' => 'Kost Test',
            'alamat_kost' => 'Jl. Test',
            'jumlah_kamar' => 10,
            'harga' => 500000,
        ]);

        $response->assertStatus(401);
    }
}

