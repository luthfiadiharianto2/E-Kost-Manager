# Panduan Setup MySQL Workbench untuk E-Kost Manager

## 📋 Informasi Konfigurasi Database

Berdasarkan file `.env`, konfigurasi database Anda adalah:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ekostmanager
DB_USERNAME=root
DB_PASSWORD=ekostmanagerpw
```

## 🔧 Langkah-langkah Setup

### 1. Pastikan MySQL Server Berjalan

#### Jika menggunakan XAMPP:
1. Buka **XAMPP Control Panel**
2. Pastikan **MySQL** berstatus **Running** (hijau)
3. Jika belum running, klik **Start**

#### Jika menggunakan MySQL Standalone:
1. Buka **Services** (Win + R → `services.msc`)
2. Cari **MySQL** service
3. Pastikan statusnya **Running**

### 2. Buka MySQL Workbench

1. Buka aplikasi **MySQL Workbench**
2. Jika belum ada, download dari: https://dev.mysql.com/downloads/workbench/

### 3. Buat Koneksi Baru

1. Klik **"+"** di sebelah **MySQL Connections** atau klik **Database → Manage Connections**
2. Isi form dengan informasi berikut:

   ```
   Connection Name: E-Kost Manager
   Hostname: 127.0.0.1
   Port: 3306
   Username: root
   Password: ekostmanagerpw
   ```

3. Klik **"Test Connection"** untuk memastikan koneksi berhasil
4. Jika berhasil, klik **OK** untuk menyimpan

### 4. Koneksi ke Server

1. Double-click koneksi **"E-Kost Manager"** yang baru dibuat
2. Jika diminta password, masukkan password: `ekostmanagerpw`
3. Setelah terkoneksi, Anda akan melihat antarmuka MySQL Workbench

### 5. Buat Database (Jika Belum Ada)

1. Di panel kiri, Anda akan melihat daftar database
2. Klik kanan pada area kosong atau klik ikon **Create Schema** (gambar database dengan +)
3. Atau jalankan query berikut di SQL Editor:

   ```sql
   CREATE DATABASE `ekostmanager` 
   CHARACTER SET utf8mb4 
   COLLATE utf8mb4_unicode_ci;
   ```

4. Setelah database dibuat, double-click database `ekostmanager` untuk mengaktifkannya

### 6. Import Database (Opsional)

Jika Anda ingin mengimport struktur database dari file `ekostmanager.sql`:

1. Klik kanan pada database `ekostmanager`
2. Pilih **Table Data Import Wizard**
3. Atau gunakan menu **Server → Data Import**
4. Pilih file `ekostmanager.sql` yang ada di folder backend
5. Klik **Start Import**

**Atau menggunakan SQL Editor:**

1. Buka menu **File → Open SQL Script**
2. Pilih file `ekostmanager.sql`
3. Klik **Execute** (icon petir) atau tekan `Ctrl + Shift + Enter`

### 7. Test Koneksi dari Laravel

Jalankan script test yang telah dibuat:

```powershell
cd "E-Kost-Manager-Revisi\Back End"
php test-mysql-connection.php
```

**Atau test dengan Laravel Artisan:**

```powershell
php artisan db:show
```

**Atau test dengan tinker:**

```powershell
php artisan tinker
```

Kemudian di dalam tinker:

```php
DB::connection()->getPdo();
DB::select('SELECT VERSION()');
```

## ✅ Verifikasi Koneksi Berhasil

Jika semua berjalan dengan baik, Anda akan melihat:

1. ✓ Koneksi MySQL berhasil di test script
2. ✓ Database `ekostmanager` ditemukan
3. ✓ Tabel-tabel sudah ada (jika sudah import)
4. ✓ MySQL Workbench dapat terkoneksi dan melihat database

## 🔍 Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"

**Solusi:**
1. Pastikan password di `.env` sesuai dengan password MySQL root
2. Jika lupa password, reset password MySQL root
3. Atau buat user baru di MySQL:

   ```sql
   CREATE USER 'ekostuser'@'localhost' IDENTIFIED BY 'password_anda';
   GRANT ALL PRIVILEGES ON ekostmanager.* TO 'ekostuser'@'localhost';
   FLUSH PRIVILEGES;
   ```

   Kemudian update `.env`:
   ```
   DB_USERNAME=ekostuser
   DB_PASSWORD=password_anda
   ```

### Error: "Can't connect to MySQL server"

**Solusi:**
1. Pastikan MySQL service sedang berjalan
2. Cek firewall apakah memblokir port 3306
3. Cek apakah host `127.0.0.1` benar (coba dengan `localhost`)

### Database Tidak Ditemukan

**Solusi:**
1. Buat database sesuai langkah 5 di atas
2. Atau import file `ekostmanager.sql`

### Port 3306 Sudah Digunakan

**Solusi:**
1. Cek aplikasi lain yang menggunakan port 3306
2. Atau ubah port MySQL di konfigurasi MySQL (misalnya ke 3307)
3. Update `.env` dengan port yang baru

## 📝 Catatan Penting

- Pastikan password di `.env` sesuai dengan password MySQL Anda
- Database harus menggunakan charset `utf8mb4` dan collation `utf8mb4_unicode_ci`
- Setelah mengubah `.env`, clear cache Laravel:

  ```powershell
  php artisan config:clear
  php artisan cache:clear
  ```

## 🚀 Langkah Selanjutnya

Setelah koneksi berhasil:

1. **Jalankan migrations** (jika belum):

   ```powershell
   php artisan migrate
   ```

2. **Jalankan seeders** (jika ada):

   ```powershell
   php artisan db:seed
   ```

3. **Test aplikasi**:

   ```powershell
   php artisan serve
   ```

4. **Akses aplikasi** di browser: `http://localhost:8000`

---

**Selamat! Database Anda sekarang sudah terhubung dengan MySQL Workbench! 🎉**


