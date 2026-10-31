<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test index - menampilkan dashboard
     * Note: Route belum tersedia di api.php, test ini untuk whitebox testing controller
     */
    public function test_index_returns_dashboard_message()
    {
        $controller = new \App\Http\Controllers\Api\DashboardController();
        $response = $controller->index();

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Dashboard API berhasil diakses!', $responseData['message']);
        $this->assertEquals('success', $responseData['status']);
    }
}

