# E-Kost Manager

Aplikasi web untuk mengelola kost dengan fitur lengkap untuk pemilik dan penyewa kost.

## 🚀 Fitur

### Untuk Pemilik Kost (Admin)
- Dashboard admin dengan statistik lengkap
- Manajemen data kost dan kamar
- Kelola data penyewa
- Monitoring pembayaran
- Kelola pengaduan dari penyewa

### Untuk Penyewa
- Dashboard penyewa dengan informasi kost
- Melihat riwayat pembayaran
- Melakukan pembayaran online
- Melaporkan masalah/pengaduan
- Melihat profil dan informasi kost

## 🛠️ Teknologi

- **Frontend**: React.js 18 + TypeScript
- **Styling**: Tailwind CSS
- **Animasi**: AOS (Animate On Scroll)
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📦 Instalasi

### Prerequisites
- Node.js (versi 16 atau lebih baru)
- npm atau yarn

### Langkah-langkah

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd e-kost-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit file `.env` dan sesuaikan konfigurasi:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Jalankan development server**
   ```bash
   npm run dev
   ```

5. **Buka browser**
   ```
   http://localhost:3000
   ```

## 🔧 Scripts

- `npm run dev` - Menjalankan development server
- `npm run build` - Build untuk production
- `npm run preview` - Preview build production
- `npm run lint` - Menjalankan ESLint

## 🏗️ Struktur Proyek

```
src/
├── components/          # Komponen React yang dapat digunakan ulang
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   └── ProtectedRoute.tsx
├── contexts/            # React Context untuk state management
│   └── AuthContext.tsx
├── pages/               # Halaman aplikasi
│   ├── LoginPage.tsx
│   ├── AdminDashboard.tsx
│   ├── TenantDashboard.tsx
│   └── UnauthorizedPage.tsx
├── services/            # API services
│   ├── api.ts
│   └── authService.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
├── App.tsx              # Main App component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## 🔐 Authentication

Aplikasi menggunakan sistem autentikasi dengan dua role:
- **Admin**: Pemilik kost yang dapat mengelola semua data
- **Tenant**: Penyewa yang hanya dapat mengakses data pribadi

### Login
- Admin dan tenant dapat login dengan email dan password
- Pilih role saat login

### Signup
- Hanya penyewa yang dapat mendaftar
- Memerlukan kode akses dari pemilik kost

## 🎨 UI/UX Features

- **Responsive Design**: Optimal di desktop dan mobile
- **Modern UI**: Menggunakan Tailwind CSS dengan design system yang konsisten
- **Animations**: AOS animations untuk pengalaman yang smooth
- **Loading States**: Loading indicators untuk semua operasi async
- **Error Handling**: Error messages yang user-friendly
- **Toast Notifications**: Notifikasi untuk feedback user

## 🔌 Backend Integration

Aplikasi frontend siap terintegrasi dengan Laravel backend. Pastikan backend menyediakan endpoint berikut:

### Authentication Endpoints
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Register penyewa
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout

### Data Endpoints (untuk admin)
- `GET /api/kosts` - Get list kost
- `POST /api/kosts` - Create kost
- `PUT /api/kosts/:id` - Update kost
- `DELETE /api/kosts/:id` - Delete kost
- `GET /api/tenants` - Get list penyewa
- `GET /api/payments` - Get list pembayaran
- `GET /api/complaints` - Get list pengaduan

### Data Endpoints (untuk tenant)
- `GET /api/my-kost` - Get kost yang disewa
- `GET /api/my-payments` - Get riwayat pembayaran
- `POST /api/payments` - Create pembayaran
- `GET /api/my-complaints` - Get pengaduan saya
- `POST /api/complaints` - Create pengaduan

## 🚀 Deployment

### Build untuk Production
```bash
npm run build
```

File build akan tersedia di folder `dist/` yang siap untuk di-deploy ke hosting static seperti:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Environment Variables untuk Production
Pastikan set environment variables berikut:
- `VITE_API_URL` - URL backend API

## 📝 License

MIT License - lihat file LICENSE untuk detail.

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buat issue di repository ini.