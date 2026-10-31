<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CekRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!in_array($request->user()->role ?? 'guest', $roles)) {
            abort(403, 'Akses ditolak');
        }

        return $next($request);
    }
}
