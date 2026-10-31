# Whitebox Testing Documentation

## Struktur Testing

Folder testing ini menggunakan **Whitebox Testing** yang mencakup:

### 1. Controller Tests (`tests/Unit/Controllers/`)
- **AuthControllerTest.php** - Test untuk autentikasi (register, login, profile, logout)
- **PenghuniControllerTest.php** - Test untuk CRUD penghuni
- **KostControllerTest.php** - Test untuk manajemen kost
- **KamarControllerTest.php** - Test untuk manajemen kamar (CRUD dan fitur owner/tenant)
- **DashboardControllerTest.php** - Test untuk dashboard

### 2. Middleware Tests (`tests/Unit/Middleware/`)
- **CekRoleTest.php** - Test untuk middleware pengecekan role
- **AuthenticateTest.php** - Test untuk middleware autentikasi

### 3. Feature Tests (`tests/Feature/`)
- **PenyewaFeatureTest.php** - Test fitur-fitur untuk penyewa (tenant)
- **PemilikFeatureTest.php** - Test fitur-fitur untuk pemilik (owner/admin)

## Fitur yang Diuji

### Penyewa (Tenant) Features:
- ✅ Registrasi penyewa
- ✅ Login penyewa
- ✅ Melihat dan update profil
- ✅ Melihat kamar yang ditempati
- ✅ Membuat testimoni
- ✅ Melihat history pembayaran
- ✅ Membuat QRIS payment
- ✅ Menerima undangan dari pemilik
- ✅ Logout

### Pemilik (Owner) Features:
- ✅ Registrasi pemilik dengan owner profile
- ✅ Login pemilik
- ✅ Melihat dan update profil
- ✅ Membuat kost baru
- ✅ Melihat semua kamar miliknya
- ✅ Membuat, update, dan hapus kamar
- ✅ Assign tenant ke kamar
- ✅ Membuat dan mengelola undangan
- ✅ Melihat daftar tenant
- ✅ Logout

## ⚠️ PENTING: Setup Sebelum Menjalankan Tests

### Langkah 1: Cek Konfigurasi PHP
Jalankan script diagnostik terlebih dahulu:
```powershell
# Di PowerShell
cd "E-Kost-Manager-Revisi\Back End"
.\tests\check-php-config.ps1
```

Script ini akan:
- Mengecek instalasi PHP
- Mengecek ekstensi yang diperlukan
- Memberikan instruksi perbaikan jika ada masalah

### Langkah 2: Perbaiki Konfigurasi PHP (Jika Diperlukan)
Jika ada ekstensi yang missing, ikuti instruksi di:
- **FIX_PHP_CONFIG.md** - Panduan lengkap memperbaiki konfigurasi PHP

### Langkah 3: Install Dependencies
```bash
composer install
```

## Menjalankan Tests

### Opsi 1: Menggunakan PowerShell Script (Recommended)
```powershell
# Double-click atau jalankan di PowerShell
.\tests\run-tests-fixed.ps1
```

### Opsi 2: Menggunakan Artisan
```bash
cd "E-Kost-Manager-Revisi\Back End"
php artisan test
```

### Opsi 3: Menggunakan Batch File
```bash
# Double-click file
tests\run-tests.bat
```

### Menjalankan tests berdasarkan kategori:
```bash
# Unit tests (Controller & Middleware)
php artisan test --testsuite=Unit

# Feature tests
php artisan test --testsuite=Feature

# Test spesifik
php artisan test tests/Feature/PenyewaFeatureTest.php
php artisan test tests/Feature/PemilikFeatureTest.php
```

### Menjalankan test spesifik:
```bash
php artisan test --filter test_penyewa_can_register
php artisan test --filter test_pemilik_can_create_kost
```

## Troubleshooting

Jika mengalami masalah, lihat:
- **TROUBLESHOOTING.md** - Solusi masalah umum
- **FIX_PHP_CONFIG.md** - Panduan memperbaiki konfigurasi PHP

## Catatan Penting

1. **Factories**: Semua factory yang diperlukan sudah dibuat di `database/factories/`
2. **Database**: Tests menggunakan SQLite in-memory database untuk kecepatan
3. **Routes**: Beberapa controller test menggunakan direct method call karena route belum tersedia di `api.php`
4. **OTP Service**: Test registrasi memerlukan OTP yang valid dari `OtpService`

## Coverage

Tests ini mencakup:
- ✅ Semua controller methods
- ✅ Middleware logic
- ✅ Validasi input
- ✅ Error handling
- ✅ Authorization & Authentication
- ✅ Database operations (CRUD)
- ✅ Business logic untuk penyewa dan pemilik

## File-file Bantuan

- `check-php-config.ps1` - Script untuk mengecek konfigurasi PHP
- `run-tests-fixed.ps1` - Script PowerShell untuk menjalankan tests dengan error handling
- `run-tests.bat` - Batch file untuk menjalankan tests
- `FIX_PHP_CONFIG.md` - Panduan memperbaiki konfigurasi PHP
- `TROUBLESHOOTING.md` - Solusi masalah umum

