# 🚀 E-Kost Manager - START HERE!

## 🎯 Pilih Cara Menjalankan Aplikasi

### 🥇 Opsi 1: Standalone (Paling Mudah - Tidak Perlu Install Apapun!)

**Windows:**
1. Double-click `run-standalone.bat`
2. Aplikasi akan terbuka di browser

**Linux/Mac:**
1. Buka terminal di folder ini
2. Jalankan: `chmod +x run-standalone.sh && ./run-standalone.sh`
3. Aplikasi akan terbuka di browser

**Manual:**
- Buka file `standalone.html` di browser

---

### 🥈 Opsi 2: Development Mode (Perlu Node.js)

**Windows:**
1. Double-click `run.bat`
2. Aplikasi akan berjalan di http://localhost:3000

**Linux/Mac:**
1. Buka terminal di folder ini
2. Jalankan: `chmod +x run.sh && ./run.sh`
3. Aplikasi akan berjalan di http://localhost:3000

**Manual:**
```bash
npm install
npm run dev
```

---

## 🎮 Cara Menggunakan Aplikasi

### 1. Login sebagai Admin
- **Email**: `admin@example.com`
- **Password**: `password`
- **Role**: Pilih "Pemilik"

### 2. Login sebagai Penyewa
- **Email**: `tenant@example.com`
- **Password**: `password`
- **Role**: Pilih "Penyewa"

### 3. Daftar Penyewa Baru
- Klik "Daftar sebagai penyewa"
- Isi form lengkap
- **Kode Akses**: `KOST2024`

---

## 📱 Fitur yang Tersedia

### ✅ Dashboard Admin
- Statistik kost dan penyewa
- Manajemen data kost
- Monitoring pembayaran
- Kelola pengaduan

### ✅ Dashboard Penyewa
- Informasi kost yang disewa
- Riwayat pembayaran
- Sistem pengaduan
- Profil penyewa

### ✅ UI/UX Features
- Responsive design
- Animasi smooth
- Modern interface
- Loading states

---

## 🔧 Troubleshooting

### Error: 'npm' is not recognized
- Install Node.js dari https://nodejs.org/
- Atau gunakan opsi standalone

### Error: Port 3000 already in use
```bash
npx kill-port 3000
```

### Browser tidak terbuka
- Buka file `standalone.html` manual
- Atau buka http://localhost:3000

---

## 📚 Dokumentasi Lengkap

- `README.md` - Dokumentasi lengkap
- `QUICK_START.md` - Panduan cepat
- `API_INTEGRATION.md` - Panduan integrasi backend
- `INSTALLATION.md` - Panduan instalasi detail

---

## 🎉 Selamat!

Aplikasi E-Kost Manager sudah siap digunakan!

**Fitur utama:**
- ✅ Authentication dengan role-based access
- ✅ Dashboard admin untuk mengelola kost
- ✅ Dashboard penyewa untuk pembayaran & pengaduan
- ✅ Responsive design
- ✅ Animasi AOS
- ✅ TypeScript support
- ✅ Siap integrasi dengan Laravel backend

**Next Steps:**
1. Test semua fitur
2. Integrasikan dengan Laravel backend
3. Deploy ke production
4. Tambah fitur tambahan

---

## 📞 Support

Jika ada masalah:
1. Cek error di browser console (F12)
2. Pastikan Node.js versi terbaru
3. Gunakan opsi standalone sebagai alternatif
4. Baca dokumentasi lengkap

**Happy Coding! 🚀**