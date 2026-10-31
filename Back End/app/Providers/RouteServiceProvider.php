<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        $this->routes(function () {
            // Semua route API ada di routes/api.php
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            // Semua route Web (frontend) ada di routes/web.php
            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }
}
