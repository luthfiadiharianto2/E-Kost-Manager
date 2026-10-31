# Troubleshooting Tests

## Masalah: PHP Extensions Tidak Ter-load

Jika Anda melihat error seperti:
```
PHP Warning: Unable to load dynamic library 'pdo_sqlite'
PHP Fatal error: Unable to start standard module
```

### Solusi:

1. **Pastikan ekstensi PHP sudah diaktifkan di php.ini:**
   - Buka file `php.ini` di folder XAMPP (biasanya `C:\xampp\php\php.ini`)
   - Pastikan baris berikut tidak di-comment (tidak ada `;` di depannya):
     ```ini
     extension=pdo_sqlite
     extension=pdo_mysql
     extension=mbstring
     extension=curl
     extension=fileinfo
     extension=openssl
     ```

2. **Restart Apache/XAMPP** setelah mengubah php.ini

3. **Verifikasi dengan:**
   ```bash
   php -m
   ```
   Pastikan ekstensi yang diperlukan muncul dalam daftar.

## Menjalankan Tests

### Opsi 1: Menggunakan Artisan (Recommended)
```bash
cd "E-Kost-Manager-Revisi/Back End"
php artisan test
```

### Opsi 2: Menggunakan PHPUnit langsung
```bash
cd "E-Kost-Manager-Revisi/Back End"
vendor/bin/phpunit
```

### Opsi 3: Menggunakan Batch Script
Double-click file `run-tests.bat` di folder `tests/`

## Menjalankan Tests Spesifik

### Semua Unit Tests (Controller & Middleware):
```bash
php artisan test --testsuite=Unit
```

### Semua Feature Tests:
```bash
php artisan test --testsuite=Feature
```

### Test Spesifik:
```bash
php artisan test --filter test_penyewa_can_register
php artisan test --filter test_pemilik_can_create_kost
```

### Test File Spesifik:
```bash
php artisan test tests/Feature/PenyewaFeatureTest.php
php artisan test tests/Unit/Controllers/AuthControllerTest.php
```

## Masalah Database

Tests menggunakan SQLite in-memory database. Pastikan:
- Ekstensi `pdo_sqlite` sudah aktif
- File `phpunit.xml` sudah dikonfigurasi dengan benar

## Masalah Factory

Jika ada error tentang factory tidak ditemukan:
```bash
php artisan make:factory ModelNameFactory
```

Atau pastikan semua factory sudah dibuat di `database/factories/`

## Verifikasi Setup

1. **Cek PHP version:**
   ```bash
   php -v
   ```
   Harus PHP 8.1 atau lebih tinggi

2. **Cek Composer dependencies:**
   ```bash
   composer install
   ```

3. **Cek environment:**
   Pastikan file `.env.testing` ada atau environment testing sudah dikonfigurasi di `phpunit.xml`

