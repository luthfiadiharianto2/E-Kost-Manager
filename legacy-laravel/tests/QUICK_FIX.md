# Quick Fix untuk php.ini

## Masalah yang Ditemukan
- PHP ada di: `D:\XAMPP\php\php.exe`
- php.ini ada di: `D:\XAMPP\php\php.ini`
- extension_dir di-comment dan path salah (mencari di C:\xampp\php\ext)

## Solusi Manual (Cepat)

### Langkah 1: Buka php.ini
Buka file: `D:\XAMPP\php\php.ini` dengan Notepad++ atau text editor lainnya

### Langkah 2: Perbaiki extension_dir
Cari baris:
```ini
;extension_dir = "./"
```

Ubah menjadi:
```ini
extension_dir = "D:\XAMPP\php\ext"
```

### Langkah 3: Aktifkan Ekstensi
Cari dan uncomment (hapus `;` di depan) baris berikut:

```ini
extension=pdo_sqlite
extension=pdo_mysql
extension=mbstring
extension=curl
extension=fileinfo
extension=openssl
extension=mysqli
```

### Langkah 4: Simpan dan Restart
1. Simpan file php.ini
2. Restart XAMPP (Apache)

### Langkah 5: Verifikasi
Jalankan:
```bash
php -m | findstr pdo_sqlite
```

Jika muncul `pdo_sqlite`, berarti sudah berhasil!

### Langkah 6: Jalankan Tests
```bash
cd "E-Kost-Manager-Revisi\Back End"
php artisan test
```

## Alternatif: Gunakan Perintah PowerShell

Jalankan perintah berikut di PowerShell (sebagai Administrator):

```powershell
$phpIni = "D:\XAMPP\php\php.ini"
$content = Get-Content $phpIni -Raw

# Backup
Copy-Item $phpIni "$phpIni.backup"

# Fix extension_dir
$content = $content -replace ";?\s*extension_dir\s*=.*", "extension_dir = `"D:\XAMPP\php\ext`""

# Enable extensions
$extensions = @("pdo_sqlite", "pdo_mysql", "mbstring", "curl", "fileinfo", "openssl", "mysqli")
foreach ($ext in $extensions) {
    $content = $content -replace ";+\s*extension=$ext", "extension=$ext"
}

Set-Content -Path $phpIni -Value $content
Write-Host "php.ini telah diperbaiki! Silakan restart XAMPP."
```

