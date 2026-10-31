# ⚡ Quick Start: Hubungkan Backend dengan MySQL Workbench

## 🎯 Ringkasan

Backend Laravel Anda sudah dikonfigurasi untuk MySQL. Yang perlu dilakukan:

1. ✅ **Start MySQL Server** (XAMPP atau MySQL Service)
2. ✅ **Buka MySQL Workbench** dan buat koneksi
3. ✅ **Buat database** `ekostmanager`
4. ✅ **Test koneksi**

## 🚀 Langkah Cepat (5 Menit)

### 1. Start MySQL

**Menggunakan XAMPP:**
- Buka **XAMPP Control Panel**
- Klik **Start** di MySQL
- Tunggu sampai status jadi **Running**

### 2. Test Koneksi Backend

Jalankan di terminal:
```powershell
cd "E-Kost-Manager-Revisi\Back End"
php test-mysql-connection.php
```

Jika MySQL belum berjalan, akan muncul error. Setelah MySQL berjalan, test lagi!

### 3. Setup MySQL Workbench

1. Buka **MySQL Workbench**
2. Klik **"+"** untuk koneksi baru
3. Isi:
   - **Connection Name**: E-Kost Manager
   - **Hostname**: 127.0.0.1
   - **Port**: 3306
   - **Username**: root
   - **Password**: ekostmanagerpw (atau password MySQL Anda)
4. Klik **Test Connection**
5. Jika berhasil, klik **OK**

### 4. Buat Database

Di MySQL Workbench:
- Klik kanan → **Create Schema**
- Nama: `ekostmanager`
- Collation: `utf8mb4_unicode_ci`
- Klik **Apply**

### 5. Test Lagi

```powershell
php test-mysql-connection.php
```

Jika berhasil, akan muncul:
```
✓ Koneksi ke MySQL Server berhasil!
✓ Database 'ekostmanager' ditemukan!
```

## 📚 File Bantuan

- **`CARA_HUBUNGKAN_MYSQL.md`** - Panduan lengkap step-by-step
- **`SETUP_MYSQL.md`** - Setup detail MySQL Workbench
- **`START_MYSQL.md`** - Cara start MySQL server
- **`test-mysql-connection.php`** - Script test koneksi
- **`cek-mysql-status.bat`** - Cek status MySQL

## ⚠️ Troubleshooting

**MySQL tidak bisa start?**
→ Lihat `START_MYSQL.md`

**Koneksi gagal?**
→ Pastikan MySQL berjalan dan password benar

**Database tidak ditemukan?**
→ Buat database `ekostmanager` di MySQL Workbench

## ✅ Setelah Berhasil

Jalankan migrations:
```powershell
php artisan migrate
```

Test aplikasi:
```powershell
php artisan serve
```

---

**Butuh bantuan lebih?** Baca file `CARA_HUBUNGKAN_MYSQL.md` untuk panduan lengkap! 📖


