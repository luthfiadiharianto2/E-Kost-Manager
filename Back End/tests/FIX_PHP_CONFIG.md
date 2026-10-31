# Cara Memperbaiki Konfigurasi PHP untuk Testing

## Masalah
PHP tidak bisa memuat ekstensi yang diperlukan untuk testing, menyebabkan error:
```
PHP Warning: Unable to load dynamic library 'pdo_sqlite'
PHP Fatal error: Unable to start standard module
```

## Solusi 1: Perbaiki php.ini (Recommended)

1. **Cari file php.ini yang digunakan:**
   ```bash
   php --ini
   ```
   Atau buka XAMPP Control Panel → Config → PHP → php.ini

2. **Buka file php.ini** (biasanya di `C:\xampp\php\php.ini`)

3. **Aktifkan ekstensi berikut** (hapus `;` di depannya):
   ```ini
   extension=pdo_sqlite
   extension=pdo_mysql
   extension=mbstring
   extension=curl
   extension=fileinfo
   extension=openssl
   extension=mysqli
   ```

4. **Cek path extension_dir:**
   ```ini
   extension_dir = "C:\xampp\php\ext"
   ```
   Pastikan path ini benar sesuai lokasi XAMPP Anda.

5. **Restart XAMPP** atau restart Apache

6. **Verifikasi:**
   ```bash
   php -m
   ```
   Pastikan ekstensi muncul dalam daftar.

## Solusi 2: Gunakan PHP yang Berbeda

Jika XAMPP PHP bermasalah, install PHP standalone:

1. Download PHP dari https://windows.php.net/download/
2. Extract ke folder (misalnya `C:\php`)
3. Copy `php.ini-development` menjadi `php.ini`
4. Edit `php.ini` dan aktifkan ekstensi seperti di Solusi 1
5. Tambahkan PHP ke PATH Windows

## Solusi 3: Gunakan Laravel Sail (Docker)

Jika menggunakan Docker:

```bash
# Install Sail
composer require laravel/sail --dev

# Setup
php artisan sail:install

# Run tests
./vendor/bin/sail test
```

## Solusi 4: Gunakan WSL (Windows Subsystem for Linux)

Jika tersedia WSL:

```bash
# Di WSL
cd /mnt/d/E-Kost-Manager-terakhir/E-Kost-Manager-Revisi/Back\ End
php artisan test
```

## Verifikasi Setup

Setelah memperbaiki, jalankan:

```bash
# Cek PHP version
php -v

# Cek ekstensi yang ter-load
php -m | findstr pdo_sqlite

# Cek composer
composer --version

# Jalankan tests
php artisan test
```

## File yang Perlu Diperiksa

1. `C:\xampp\php\php.ini` - Konfigurasi PHP utama
2. `phpunit.xml` - Konfigurasi testing (sudah benar)
3. `.env` atau `.env.testing` - Environment variables

## Catatan

- Pastikan XAMPP sudah di-restart setelah mengubah php.ini
- Beberapa ekstensi mungkin memerlukan file DLL tambahan
- Jika masih error, coba install ulang XAMPP atau gunakan PHP standalone

