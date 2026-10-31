<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Models\User;
use App\Models\Kost;
use App\Models\Kamar;
use Illuminate\Foundation\Testing\RefreshDatabase;

class KamarControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test index - menampilkan semua data kamar
     * Note: Route belum tersedia di api.php, test ini untuk whitebox testing controller
     */
    public function test_index_returns_all_kamar()
    {
        $controller = new \App\Http\Controllers\Api\KamarController();
        Kamar::factory()->count(3)->create();

        $result = $controller->index();

        $this->assertCount(3, $result);
    }

    /**
     * Test store - menyimpan data kamar baru
     * Note: Route belum tersedia di api.php, test ini untuk whitebox testing controller
     */
    public function test_store_creates_new_kamar()
    {
        $controller = new \App\Http\Controllers\Api\KamarController();
        $request = \Illuminate\Http\Request::create('/api/kamar', 'POST', [
            'nomor_kamar' => 'A101',
            'tipe_kamar' => 'Standard',
            'harga_sewa' => 500000,
            'status' => 'tersedia',
        ]);

        $response = $controller->store($request);

        $this->assertEquals(201, $response->getStatusCode());
        $this->assertDatabaseHas('kamars', [
            'nomor_kamar' => 'A101',
            'status' => 'tersedia',
        ]);
    }

    /**
     * Test store gagal jika validasi gagal
     */
    public function test_store_fails_validation()
    {
        $controller = new \App\Http\Controllers\Api\KamarController();
        $request = \Illuminate\Http\Request::create('/api/kamar', 'POST', [
            'nomor_kamar' => '',
            'tipe_kamar' => '',
            'harga_sewa' => -1000,
            'status' => 'invalid-status',
        ]);

        $response = $controller->store($request);

        $this->assertEquals(422, $response->getStatusCode());
    }

    /**
     * Test show - menampilkan satu data kamar
     */
    public function test_show_returns_single_kamar()
    {
        $kamar = Kamar::factory()->create();
        $controller = new \App\Http\Controllers\Api\KamarController();

        $result = $controller->show($kamar);

        $this->assertEquals($kamar->id, $result->id);
        $this->assertEquals($kamar->nomor_kamar, $result->nomor_kamar);
    }

    /**
     * Test update - memperbarui data kamar
     */
    public function test_update_modifies_kamar()
    {
        $kamar = Kamar::factory()->create([
            'nomor_kamar' => 'A101',
            'harga_sewa' => 500000,
        ]);

        $controller = new \App\Http\Controllers\Api\KamarController();
        $request = \Illuminate\Http\Request::create("/api/kamar/{$kamar->id}", 'PUT', [
            'nomor_kamar' => 'A102',
            'harga_sewa' => 600000,
        ]);

        $response = $controller->update($request, $kamar);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertDatabaseHas('kamars', [
            'id' => $kamar->id,
            'nomor_kamar' => 'A102',
            'harga_sewa' => 600000,
        ]);
    }

    /**
     * Test destroy - menghapus data kamar
     */
    public function test_destroy_deletes_kamar()
    {
        $kamar = Kamar::factory()->create();
        $controller = new \App\Http\Controllers\Api\KamarController();

        $response = $controller->destroy($kamar);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertDatabaseMissing('kamars', [
            'id' => $kamar->id,
        ]);
    }

    /**
     * Test ownerRooms - menampilkan kamar milik owner
     */
    public function test_owner_rooms_returns_owner_kamar()
    {
        $owner = User::factory()->create(['role' => 'admin']);
        $kost = Kost::factory()->create(['user_id' => $owner->id]);
        $kamar = Kamar::factory()->create(['kost_id' => $kost->id]);

        $token = $owner->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/owner/rooms');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'kost_id',
                        'nomor_kamar',
                        'tipe_kamar',
                        'harga_sewa',
                        'status',
                    ],
                ],
            ]);
    }

    /**
     * Test storeForOwner - membuat kamar untuk owner
     */
    public function test_store_for_owner_creates_kamar()
    {
        $owner = User::factory()->create(['role' => 'admin']);
        $kost = Kost::factory()->create(['user_id' => $owner->id]);
        $token = $owner->createToken('test-token')->plainTextToken;

        $data = [
            'nomor_kamar' => 'B201',
            'tipe_kamar' => 'Deluxe',
            'harga_sewa' => 750000,
            'kost_id' => $kost->id,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/owner/rooms', $data);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Kamar berhasil dibuat',
            ]);

        $this->assertDatabaseHas('kamars', [
            'nomor_kamar' => 'B201',
            'kost_id' => $kost->id,
        ]);
    }

    /**
     * Test updateForOwner - update kamar milik owner
     */
    public function test_update_for_owner_modifies_kamar()
    {
        $owner = User::factory()->create(['role' => 'admin']);
        $kost = Kost::factory()->create(['user_id' => $owner->id]);
        $kamar = Kamar::factory()->create(['kost_id' => $kost->id]);
        $token = $owner->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/owner/rooms/{$kamar->id}", [
                'harga_sewa' => 800000,
                'status' => 'terisi',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Kamar berhasil diperbarui',
            ]);

        $this->assertDatabaseHas('kamars', [
            'id' => $kamar->id,
            'harga_sewa' => 800000,
            'status' => 'terisi',
        ]);
    }

    /**
     * Test destroyForOwner - hapus kamar milik owner
     */
    public function test_destroy_for_owner_deletes_kamar()
    {
        $owner = User::factory()->create(['role' => 'admin']);
        $kost = Kost::factory()->create(['user_id' => $owner->id]);
        $kamar = Kamar::factory()->create(['kost_id' => $kost->id]);
        $token = $owner->createToken('test-token')->plainTextToken;

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
     * Test assignTenant - assign tenant ke kamar
     */
    public function test_assign_tenant_to_kamar()
    {
        $owner = User::factory()->create(['role' => 'admin']);
        $tenant = User::factory()->create(['role' => 'tenant']);
        $kost = Kost::factory()->create(['user_id' => $owner->id]);
        $kamar = Kamar::factory()->create([
            'kost_id' => $kost->id,
            'status' => 'tersedia',
        ]);
        $token = $owner->createToken('test-token')->plainTextToken;

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
     * Test tenantRoom - penyewa melihat kamar mereka
     */
    public function test_tenant_room_returns_tenant_kamar()
    {
        $owner = User::factory()->create(['role' => 'admin']);
        $tenant = User::factory()->create(['role' => 'tenant']);
        $kost = Kost::factory()->create(['user_id' => $owner->id]);
        $kamar = Kamar::factory()->create([
            'kost_id' => $kost->id,
            'tenant_id' => $tenant->id,
        ]);
        $token = $tenant->createToken('test-token')->plainTextToken;

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
            ]);
    }
}

