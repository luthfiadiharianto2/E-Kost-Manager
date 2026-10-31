<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Models\Penghuni;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PenghuniControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test index - menampilkan semua data penghuni
     * Note: Route belum tersedia di api.php, test ini untuk whitebox testing controller
     */
    public function test_index_returns_all_penghuni()
    {
        // Test langsung ke controller method
        $controller = new \App\Http\Controllers\Api\PenghuniController();
        $penghuni = Penghuni::factory()->count(3)->create();

        $result = $controller->index();

        $this->assertCount(3, $result);
    }

    /**
     * Test store - menyimpan data penghuni baru
     * Note: Route belum tersedia di api.php, test ini untuk whitebox testing controller
     */
    public function test_store_creates_new_penghuni()
    {
        $controller = new \App\Http\Controllers\Api\PenghuniController();
        $request = \Illuminate\Http\Request::create('/api/penghuni', 'POST', [
            'nama_lengkap' => 'John Doe',
            'nomor_telepon' => '081234567890',
            'email' => 'john@test.com',
        ]);

        $response = $controller->store($request);

        $this->assertEquals(201, $response->getStatusCode());
        $this->assertDatabaseHas('penghunis', [
            'nama_lengkap' => 'John Doe',
            'email' => 'john@test.com',
        ]);
    }

    /**
     * Test store gagal jika validasi gagal
     */
    public function test_store_fails_validation()
    {
        $controller = new \App\Http\Controllers\Api\PenghuniController();
        $request = \Illuminate\Http\Request::create('/api/penghuni', 'POST', [
            'nama_lengkap' => '',
            'nomor_telepon' => '',
            'email' => 'invalid-email',
        ]);

        $response = $controller->store($request);

        $this->assertEquals(422, $response->getStatusCode());
    }

    /**
     * Test show - menampilkan satu data penghuni
     */
    public function test_show_returns_single_penghuni()
    {
        $penghuni = Penghuni::factory()->create();
        $controller = new \App\Http\Controllers\Api\PenghuniController();

        $result = $controller->show($penghuni);

        $this->assertEquals($penghuni->id, $result->id);
        $this->assertEquals($penghuni->nama_lengkap, $result->nama_lengkap);
    }

    /**
     * Test update - memperbarui data penghuni
     */
    public function test_update_modifies_penghuni()
    {
        $penghuni = Penghuni::factory()->create([
            'nama_lengkap' => 'Old Name',
            'nomor_telepon' => '081111111111',
        ]);

        $controller = new \App\Http\Controllers\Api\PenghuniController();
        $request = \Illuminate\Http\Request::create("/api/penghuni/{$penghuni->id}", 'PUT', [
            'nama_lengkap' => 'New Name',
            'nomor_telepon' => '082222222222',
        ]);

        $response = $controller->update($request, $penghuni);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertDatabaseHas('penghunis', [
            'id' => $penghuni->id,
            'nama_lengkap' => 'New Name',
            'nomor_telepon' => '082222222222',
        ]);
    }

    /**
     * Test destroy - menghapus data penghuni
     */
    public function test_destroy_deletes_penghuni()
    {
        $penghuni = Penghuni::factory()->create();
        $controller = new \App\Http\Controllers\Api\PenghuniController();

        $response = $controller->destroy($penghuni);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertDatabaseMissing('penghunis', [
            'id' => $penghuni->id,
        ]);
    }
}

