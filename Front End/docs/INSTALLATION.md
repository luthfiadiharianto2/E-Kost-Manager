# Instruksi Instalasi E-Kost Manager

## 📋 Prerequisites

Sebelum memulai, pastikan Anda telah menginstall:

1. **Node.js** (versi 16 atau lebih baru)
   - Download dari: https://nodejs.org/
   - Atau install via package manager:
     - Windows: `winget install OpenJS.NodeJS`
     - macOS: `brew install node`
     - Linux: `sudo apt install nodejs npm`

2. **Git** (opsional, untuk version control)
   - Download dari: https://git-scm.com/

## 🚀 Langkah-langkah Instalasi

### 1. Install Node.js dan npm

Jika Node.js belum terinstall, ikuti langkah berikut:

**Windows:**
1. Download Node.js dari https://nodejs.org/
2. Jalankan installer dan ikuti petunjuk
3. Restart command prompt/PowerShell
4. Verifikasi instalasi:
   ```cmd
   node --version
   npm --version
   ```

**macOS:**
```bash
# Menggunakan Homebrew
brew install node

# Atau download dari website
# https://nodejs.org/
```

**Linux (Ubuntu/Debian):**
```bash
# Update package list
sudo apt update

# Install Node.js dan npm
sudo apt install nodejs npm

# Verifikasi instalasi
node --version
npm --version
```

### 2. Install Dependencies

Buka terminal/command prompt di folder proyek dan jalankan:

```bash
# Masuk ke folder proyek
cd e-kost-manager

# Install semua dependencies
npm install
```

### 3. Setup Environment Variables

```bash
# Copy file environment example
cp .env.example .env

# Edit file .env (opsional, default sudah sesuai)
# VITE_API_URL=http://localhost:8000/api
```

### 4. Jalankan Development Server

```bash
# Start development server
npm run dev
```

Aplikasi akan berjalan di: http://localhost:3000

## 🛠️ Scripts yang Tersedia

```bash
# Development
npm run dev          # Jalankan development server
npm run build        # Build untuk production
npm run preview      # Preview build production
npm run lint         # Jalankan ESLint

# Troubleshooting
npm run dev -- --host  # Jalankan dengan host access
```

## 🔧 Troubleshooting

### Error: 'npm' is not recognized
- Pastikan Node.js sudah terinstall dengan benar
- Restart terminal/command prompt
- Cek PATH environment variable

### Error: Port 3000 already in use
```bash
# Kill process yang menggunakan port 3000
npx kill-port 3000

# Atau jalankan di port lain
npm run dev -- --port 3001
```

### Error: Module not found
```bash
# Hapus node_modules dan install ulang
rm -rf node_modules package-lock.json
npm install
```

### Error: Permission denied (Linux/macOS)
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

## 📱 Testing Aplikasi

### 1. Login sebagai Admin
- Email: `admin@example.com`
- Password: `password`
- Role: Pemilik

### 2. Login sebagai Tenant
- Email: `tenant@example.com`
- Password: `password`
- Role: Penyewa

### 3. Signup Penyewa Baru
- Isi form pendaftaran
- Gunakan kode akses: `KOST2024`

## 🔌 Backend Integration

Untuk mengintegrasikan dengan Laravel backend:

1. **Setup Laravel Backend**
   ```bash
   # Di folder backend Laravel
   composer install
   php artisan migrate
   php artisan serve --port=8000
   ```

2. **Update Environment**
   ```bash
   # Edit .env
   VITE_API_URL=http://localhost:8000/api
   ```

3. **Test API Connection**
   - Buka browser developer tools
   - Cek Network tab saat login
   - Pastikan API calls berhasil

## 📦 Build untuk Production

```bash
# Build aplikasi
npm run build

# File build akan tersedia di folder dist/
# Upload folder dist/ ke hosting static
```

## 🚀 Deployment Options

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Build
npm run build

# Upload folder dist/ ke Netlify
```

### GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add script di package.json
"deploy": "gh-pages -d dist"

# Deploy
npm run build
npm run deploy
```

## 📞 Support

Jika mengalami masalah:

1. Cek error message di terminal
2. Cek browser console (F12)
3. Pastikan Node.js versi terbaru
4. Coba install ulang dependencies
5. Buat issue di repository

## ✅ Checklist Instalasi

- [ ] Node.js terinstall (v16+)
- [ ] npm terinstall
- [ ] Dependencies terinstall (`npm install`)
- [ ] Environment file dibuat (`.env`)
- [ ] Development server berjalan (`npm run dev`)
- [ ] Aplikasi bisa diakses di browser
- [ ] Login/signup berfungsi
- [ ] Dashboard admin/tenant tampil

## 🎉 Selamat!

Aplikasi E-Kost Manager sudah siap digunakan! 

Fitur yang tersedia:
- ✅ Login dengan pilihan role (Admin/Tenant)
- ✅ Signup untuk penyewa dengan kode akses
- ✅ Dashboard admin untuk mengelola kost
- ✅ Dashboard penyewa untuk pembayaran dan pengaduan
- ✅ Responsive design
- ✅ Animasi AOS
- ✅ TypeScript support
- ✅ Siap integrasi dengan Laravel backend