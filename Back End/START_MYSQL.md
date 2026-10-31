# Cara Menjalankan MySQL Server

## ⚠️ Status Saat Ini

MySQL server **BELUM BERJALAN**. Error yang muncul:
```
No connection could be made because the target machine actively refused it
```

## 🚀 Langkah-langkah Menjalankan MySQL

### Jika Menggunakan XAMPP

1. **Buka XAMPP Control Panel**
   - Cari "XAMPP Control Panel" di Start Menu
   - Atau buka folder XAMPP dan jalankan `xampp-control.exe`

2. **Start MySQL Service**
   - Di XAMPP Control Panel, cari baris "MySQL"
   - Klik tombol **"Start"** di sebelah MySQL
   - Tunggu hingga status berubah menjadi **Running** (background hijau)

3. **Verifikasi MySQL Berjalan**
   - Status MySQL harus menampilkan **Running**
   - Port yang digunakan biasanya **3306**

### Jika Menggunakan MySQL Standalone

#### Metode 1: Melalui Services (Windows)

1. Tekan **Win + R**
2. Ketik `services.msc` dan tekan Enter
3. Cari service **MySQL** atau **MySQL80** atau **MySQL57**
4. Klik kanan → **Start**
5. Pastikan status berubah menjadi **Running**

#### Metode 2: Melalui Command Line

1. Buka **Command Prompt** atau **PowerShell** sebagai Administrator
2. Jalankan:

   ```powershell
   net start MySQL
   ```

   Atau jika nama service berbeda:

   ```powershell
   net start MySQL80
   # atau
   net start MySQL57
   ```

#### Metode 3: Melalui MySQL Command Line Client

1. Buka **MySQL Command Line Client** dari Start Menu
2. Atau jalankan dari terminal:

   ```powershell
   mysql -u root -p
   ```

   Masukkan password MySQL Anda

### Jika Menggunakan MySQL Workbench

1. Buka **MySQL Workbench**
2. Klik menu **Server → Start/Shutdown**
3. Atau buka **Server Administration** → Pilih server → Klik **Start Server**

## ✅ Setelah MySQL Berjalan

### 1. Test Koneksi Lagi

Jalankan script test:

```powershell
cd "E-Kost-Manager-Revisi\Back End"
php test-mysql-connection.php
```

Atau jalankan PowerShell script:

```powershell
.\test-mysql.ps1
```

### 2. Test dengan Laravel Artisan

```powershell
php artisan db:show
```

### 3. Buka MySQL Workbench

1. Buka **MySQL Workbench**
2. Buat koneksi baru dengan:
   - **Hostname**: `127.0.0.1`
   - **Port**: `3306`
   - **Username**: `root`
   - **Password**: `ekostmanagerpw` (sesuai dengan .env)
3. Klik **Test Connection**
4. Jika berhasil, klik **OK** dan double-click koneksi untuk membuka

### 4. Buat Database (Jika Belum Ada)

Setelah terkoneksi di MySQL Workbench, jalankan query:

```sql
CREATE DATABASE `ekostmanager` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

Atau import file `ekostmanager.sql` yang sudah ada.

## 🔍 Troubleshooting

### MySQL Tidak Bisa Start

**Jika menggunakan XAMPP:**

1. Cek apakah port 3306 sudah digunakan:
   ```powershell
   netstat -ano | findstr :3306
   ```
2. Jika port sudah digunakan, matikan aplikasi yang menggunakan port tersebut
3. Atau ubah port MySQL di XAMPP config

**Jika port bermasalah:**

1. Edit file `my.ini` atau `my.cnf` di folder MySQL
2. Cari `port = 3306`
3. Ubah ke port lain, misalnya `3307`
4. Update `.env` dengan port baru:
   ```
   DB_PORT=3307
   ```

### Lupa Password MySQL

**Reset password root:**

1. Stop MySQL service
2. Start MySQL dengan `--skip-grant-tables`
3. Login tanpa password
4. Reset password:

   ```sql
   USE mysql;
   UPDATE user SET authentication_string=PASSWORD('password_baru') WHERE User='root';
   FLUSH PRIVILEGES;
   ```

5. Restart MySQL normal
6. Update `.env` dengan password baru

### MySQL Service Tidak Ada

Jika MySQL service tidak ditemukan:

1. **Install MySQL** terlebih dahulu:
   - Download dari: https://dev.mysql.com/downloads/installer/
   - Atau install melalui XAMPP

2. **Atau gunakan XAMPP** (lebih mudah):
   - Download XAMPP: https://www.apachefriends.org/
   - Install XAMPP
   - Gunakan MySQL yang ada di XAMPP

## 📝 Checklist

- [ ] MySQL server sudah berjalan
- [ ] Koneksi test berhasil
- [ ] Database `ekostmanager` sudah dibuat
- [ ] MySQL Workbench bisa terkoneksi
- [ ] File `.env` sudah benar

## 🎯 Langkah Selanjutnya

Setelah MySQL berjalan dan database terkoneksi:

1. **Import database** (jika perlu):
   - Buka MySQL Workbench
   - Import file `ekostmanager.sql`

2. **Atau jalankan migrations**:
   ```powershell
   php artisan migrate
   ```

3. **Test aplikasi**:
   ```powershell
   php artisan serve
   ```

---

**Setelah MySQL berjalan, jalankan lagi script test untuk memverifikasi koneksi!** 🚀


