# 🚀 Quick Start Guide - E-Kost Manager

## 📋 Opsi 1: Jalankan Tanpa Install Node.js (Paling Mudah)

### Langkah 1: Buka File Standalone
1. Buka file `standalone.html` di browser
2. Aplikasi akan langsung berjalan tanpa perlu install apapun!

### Langkah 2: Test Aplikasi
- **Login sebagai Admin**: Email: `admin@example.com`, Password: `password`
- **Login sebagai Tenant**: Email: `tenant@example.com`, Password: `password`
- **Signup Penyewa**: Isi form dengan kode akses `KOST2024`

---

## 📋 Opsi 2: Jalankan dengan Node.js (Development Mode)

### Prerequisites
- Node.js (versi 16+) - Download dari https://nodejs.org/

### Langkah 1: Install Dependencies
```bash
# Buka terminal di folder e-kost-manager
npm install
```

### Langkah 2: Jalankan Development Server
```bash
npm run dev
```

### Langkah 3: Buka Browser
```
http://localhost:3000
```

---

## 🎯 Fitur yang Tersedia

### ✅ Login & Authentication
- Login dengan pilihan role (Admin/Tenant)
- Signup untuk penyewa dengan kode akses
- Protected routes berdasarkan role

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
- Responsive design (mobile & desktop)
- Animasi AOS yang smooth
- Modern UI dengan Tailwind CSS
- Loading states dan error handling

---

## 🔧 Troubleshooting

### Error: 'npm' is not recognized
- Install Node.js dari https://nodejs.org/
- Restart terminal/command prompt

### Error: Port 3000 already in use
```bash
# Kill process di port 3000
npx kill-port 3000

# Atau jalankan di port lain
npm run dev -- --port 3001
```

### Error: Module not found
```bash
# Hapus dan install ulang dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📱 Demo Credentials

### Admin Login
- **Email**: `admin@example.com`
- **Password**: `password`
- **Role**: Pemilik

### Tenant Login
- **Email**: `tenant@example.com`
- **Password**: `password`
- **Role**: Penyewa

### Signup Penyewa
- **Kode Akses**: `KOST2024`
- Isi form lengkap untuk mendaftar

---

## 🎨 Customization

### Mengubah Warna Theme
Edit file `tailwind.config.js`:
```javascript
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6', // Ubah warna primary
    600: '#2563eb',
    // ... dst
  }
}
```

### Mengubah API URL
Edit file `.env`:
```env
VITE_API_URL=http://your-backend-url.com/api
```

---

## 🚀 Deployment

### Build untuk Production
```bash
npm run build
```

### Deploy ke Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy ke Netlify
1. Build: `npm run build`
2. Upload folder `dist/` ke Netlify

---

## 📞 Support

Jika ada masalah:
1. Cek error di browser console (F12)
2. Pastikan Node.js versi terbaru
3. Coba install ulang dependencies
4. Gunakan file `standalone.html` sebagai alternatif

---

## ✅ Checklist

- [ ] File `standalone.html` bisa dibuka di browser
- [ ] Login admin berhasil
- [ ] Login tenant berhasil
- [ ] Signup penyewa berhasil
- [ ] Dashboard admin tampil
- [ ] Dashboard tenant tampil
- [ ] Responsive di mobile
- [ ] Animasi berjalan smooth

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
1. Integrasikan dengan Laravel backend
2. Tambah fitur CRUD untuk kost
3. Implementasi sistem pembayaran
4. Tambah notifikasi real-time
5. Deploy ke production