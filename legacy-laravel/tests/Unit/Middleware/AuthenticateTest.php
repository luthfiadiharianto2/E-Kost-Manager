<?php

namespace Tests\Unit\Middleware;

use Tests\TestCase;
use App\Http\Middleware\Authenticate;
use Illuminate\Http\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthenticateTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test middleware mengembalikan null untuk JSON request
     */
    public function test_middleware_returns_null_for_json_request()
    {
        $request = Request::create('/test', 'GET');
        $request->headers->set('Accept', 'application/json');

        $middleware = new Authenticate();

        $redirectTo = $middleware->redirectTo($request);

        $this->assertNull($redirectTo);
    }

    /**
     * Test middleware mengembalikan login route untuk non-JSON request
     */
    public function test_middleware_returns_login_route_for_non_json_request()
    {
        $request = Request::create('/test', 'GET');
        $request->headers->set('Accept', 'text/html');

        $middleware = new Authenticate();

        $redirectTo = $middleware->redirectTo($request);

        $this->assertNotNull($redirectTo);
        $this->assertStringContainsString('login', $redirectTo);
    }
}

