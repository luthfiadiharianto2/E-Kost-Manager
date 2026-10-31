<?php

namespace Tests\Unit\Middleware;

use Tests\TestCase;
use App\Models\User;
use App\Http\Middleware\CekRole;
use Illuminate\Http\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CekRoleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test middleware mengizinkan akses jika user memiliki role yang sesuai
     */
    public function test_middleware_allows_access_with_correct_role()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $token = $user->createToken('test-token')->plainTextToken;

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        $middleware = new CekRole();
        $next = function ($req) {
            return response()->json(['message' => 'Success']);
        };

        $response = $middleware->handle($request, $next, 'admin');

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertJson($response->getContent());
    }

    /**
     * Test middleware menolak akses jika user tidak memiliki role yang sesuai
     */
    public function test_middleware_denies_access_with_wrong_role()
    {
        $user = User::factory()->create(['role' => 'tenant']);
        $token = $user->createToken('test-token')->plainTextToken;

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        $middleware = new CekRole();
        $next = function ($req) {
            return response()->json(['message' => 'Success']);
        };

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $this->expectExceptionMessage('Akses ditolak');

        $middleware->handle($request, $next, 'admin');
    }

    /**
     * Test middleware menolak akses jika user tidak terautentikasi
     */
    public function test_middleware_denies_access_without_user()
    {
        $request = Request::create('/test', 'GET');
        $request->setUserResolver(function () {
            return null;
        });

        $middleware = new CekRole();
        $next = function ($req) {
            return response()->json(['message' => 'Success']);
        };

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $this->expectExceptionMessage('Akses ditolak');

        $middleware->handle($request, $next, 'admin');
    }

    /**
     * Test middleware mengizinkan akses dengan multiple roles
     */
    public function test_middleware_allows_access_with_multiple_roles()
    {
        $user = User::factory()->create(['role' => 'admin']);

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        $middleware = new CekRole();
        $next = function ($req) {
            return response()->json(['message' => 'Success']);
        };

        $response = $middleware->handle($request, $next, 'admin', 'tenant');

        $this->assertEquals(200, $response->getStatusCode());
    }
}

