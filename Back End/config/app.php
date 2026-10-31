<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Application Name
    |--------------------------------------------------------------------------
    |
    | Nama aplikasi kamu. Digunakan di berbagai tempat seperti notifikasi,
    | email, atau elemen UI yang menampilkan nama aplikasi.
    |
    */

    'name' => env('APP_NAME', 'Laravel'),

    /*
    |--------------------------------------------------------------------------
    | Application Environment
    |--------------------------------------------------------------------------
    |
    | Menentukan environment yang digunakan oleh aplikasi.
    | (production, local, staging, dsb)
    |
    */

    'env' => env('APP_ENV', 'production'),

    /*
    |--------------------------------------------------------------------------
    | Application Debug Mode
    |--------------------------------------------------------------------------
    |
    | Jika diaktifkan (true), Laravel akan menampilkan error detail.
    | Jika tidak, hanya pesan umum akan ditampilkan.
    |
    */

    'debug' => (bool) env('APP_DEBUG', false),

    /*
    |--------------------------------------------------------------------------
    | Application URL
    |--------------------------------------------------------------------------
    |
    | URL root aplikasi kamu, digunakan oleh Artisan command dan link generator.
    |
    */

    'url' => env('APP_URL', 'http://localhost'),

    /*
    |--------------------------------------------------------------------------
    | Application Timezone
    |--------------------------------------------------------------------------
    |
    | Zona waktu default aplikasi. Secara default "UTC".
    |
    */

    'timezone' => 'UTC',

    /*
    |--------------------------------------------------------------------------
    | Application Locale Configuration
    |--------------------------------------------------------------------------
    |
    | Locale default yang digunakan oleh translator.
    |
    */

    'locale' => env('APP_LOCALE', 'en'),

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),

    /*
    |--------------------------------------------------------------------------
    | Encryption Key
    |--------------------------------------------------------------------------
    |
    | Kunci enkripsi untuk fitur security (misal hashing, cookie, dll).
    | Harus 32 karakter panjangnya.
    |
    */

    'cipher' => 'AES-256-CBC',

    'key' => env('APP_KEY'),

    'previous_keys' => [
        ...array_filter(
            explode(',', (string) env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    /*
    |--------------------------------------------------------------------------
    | Maintenance Mode Driver
    |--------------------------------------------------------------------------
    |
    | Menentukan driver untuk maintenance mode (file/cache).
    |
    */

    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Autoloaded Service Providers
    |--------------------------------------------------------------------------
    |
    | Provider ini otomatis dimuat setiap request.
    | Tambahkan provider kustom di bagian bawah jika diperlukan.
    |
    */

    'providers' => [

        Illuminate\Auth\AuthServiceProvider::class,
        Illuminate\Broadcasting\BroadcastServiceProvider::class,
        Illuminate\Bus\BusServiceProvider::class,
        Illuminate\Cache\CacheServiceProvider::class,
        Illuminate\Foundation\Providers\ConsoleSupportServiceProvider::class,
        Illuminate\Cookie\CookieServiceProvider::class,
        Illuminate\Database\DatabaseServiceProvider::class,
        Illuminate\Encryption\EncryptionServiceProvider::class,
        Illuminate\Filesystem\FilesystemServiceProvider::class,
        Illuminate\Foundation\Providers\FoundationServiceProvider::class,
        Illuminate\Hashing\HashServiceProvider::class,
        Illuminate\Mail\MailServiceProvider::class,
        Illuminate\Notifications\NotificationServiceProvider::class,
        Illuminate\Pagination\PaginationServiceProvider::class,
        Illuminate\Pipeline\PipelineServiceProvider::class,
        Illuminate\Queue\QueueServiceProvider::class,
        Illuminate\Redis\RedisServiceProvider::class,
        Illuminate\Auth\Passwords\PasswordResetServiceProvider::class,
        Illuminate\Session\SessionServiceProvider::class,
        Illuminate\View\ViewServiceProvider::class,
        Illuminate\Validation\ValidationServiceProvider::class,
        Illuminate\Translation\TranslationServiceProvider::class, //<--- WAJIB ADA

        /*
    * Application Service Providers...
    */
        App\Providers\AppServiceProvider::class,
        App\Providers\AuthServiceProvider::class,
        App\Providers\RouteServiceProvider::class,
    ],


    /*
    |--------------------------------------------------------------------------
    | Class Aliases
    |--------------------------------------------------------------------------
    |
    | Alias yang akan diregister saat aplikasi dijalankan.
    |
    */

    'aliases' => [
        'App' => Illuminate\Support\Facades\App::class,
        'Arr' => Illuminate\Support\Arr::class,
        'Artisan' => Illuminate\Support\Facades\Artisan::class,
        'Auth' => Illuminate\Support\Facades\Auth::class,
        'Blade' => Illuminate\Support\Facades\Blade::class,
        'Broadcast' => Illuminate\Support\Facades\Broadcast::class,
        'Bus' => Illuminate\Support\Facades\Bus::class,
        'Cache' => Illuminate\Support\Facades\Cache::class,
        'Config' => Illuminate\Support\Facades\Config::class,
        'Cookie' => Illuminate\Support\Facades\Cookie::class,
        'Crypt' => Illuminate\Support\Facades\Crypt::class,
        'Date' => Illuminate\Support\Facades\Date::class,
        'DB' => Illuminate\Support\Facades\DB::class,
        'Eloquent' => Illuminate\Database\Eloquent\Model::class,
        'Event' => Illuminate\Support\Facades\Event::class,
        'File' => Illuminate\Support\Facades\File::class,
        'Gate' => Illuminate\Support\Facades\Gate::class,
        'Hash' => Illuminate\Support\Facades\Hash::class,
        'Http' => Illuminate\Support\Facades\Http::class,
        'Lang' => Illuminate\Support\Facades\Lang::class,
        'Log' => Illuminate\Support\Facades\Log::class,
        'Mail' => Illuminate\Support\Facades\Mail::class,
        'Notification' => Illuminate\Support\Facades\Notification::class,
        'Password' => Illuminate\Support\Facades\Password::class,
        'Queue' => Illuminate\Support\Facades\Queue::class,
        'RateLimiter' => Illuminate\Support\Facades\RateLimiter::class,
        'Redirect' => Illuminate\Support\Facades\Redirect::class,
        'Request' => Illuminate\Support\Facades\Request::class,
        'Response' => Illuminate\Support\Facades\Response::class,
        'Route' => Illuminate\Support\Facades\Route::class,
        'Schema' => Illuminate\Support\Facades\Schema::class,
        'Session' => Illuminate\Support\Facades\Session::class,
        'Storage' => Illuminate\Support\Facades\Storage::class,
        'Str' => Illuminate\Support\Str::class,
        'URL' => Illuminate\Support\Facades\URL::class,
        'Validator' => Illuminate\Support\Facades\Validator::class,
        'View' => Illuminate\Support\Facades\View::class,
    ],

];
