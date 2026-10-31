# E-Kost Manager

Aplikasi manajemen kost untuk **pemilik** (admin) dan **penyewa** (tenant).
Frontend React + Vite (di-host statis di Vercel), backend **Supabase** (Postgres + RLS, Auth, Storage, Edge Functions, Realtime).
Backend Laravel lama diarsipkan di `legacy-laravel/` dan tidak lagi dipakai.

## Struktur folder

```
.
├── frontend/                 React 18 + Vite 4 + TypeScript + Tailwind (aplikasi yang di-deploy)
│   ├── src/services/         akses data (supabase.ts = client; *Service.ts = API untuk komponen)
│   ├── src/components/denah/ fitur Denah Kost 2.5D/3D (three.js, dimuat lazy)
│   ├── src/lib/              fungsi murni (layoutPresets.ts + unit test)
│   └── vercel.json           konfigurasi Vercel (SPA rewrite)
├── supabase/
│   ├── migrations/           skema, RLS, RPC, storage, denah (urut, reproducible)
│   ├── functions/            Edge Functions: invite-tenant, validate-invitation, accept-invitation
│   ├── seed.sql              data demo (1 kost 3 lantai, 12 kamar, 3 tipe, 5 penyewa)
│   ├── scripts/              create-demo-users.mjs (akun demo lewat Admin API)
│   ├── tests/rls_check.sql   uji RLS dengan JWT berbeda
│   └── config.toml           konfigurasi Supabase CLI
├── legacy-laravel/           arsip backend Laravel (jangan dihapus sebelum paritas fitur diverifikasi)
└── Desain/                   UML, ERD, wireframe (referensi)
```

## Menjalankan lokal

Prasyarat: Node.js 20.x.

```bash
cd frontend
cp .env.example .env.local   # isi VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY
npm ci
npm run dev                  # http://localhost:3000
```

Perintah lain:

```bash
npm run build   # tsc + vite build -> frontend/dist
npm test        # unit test (vitest) untuk preset & validasi denah
```

## Variabel environment

| Lokasi | Variabel | Keterangan |
|---|---|---|
| Frontend / Vercel (Production, Preview, Development) | `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| | `VITE_SUPABASE_PUBLISHABLE_KEY` | publishable/anon key (aman di browser) |
| Supabase → Edge Functions → Secrets | `APP_URL` | domain produksi Vercel, dipakai di link undangan |
| | `RESEND_API_KEY` | API key Resend untuk email undangan |
| | `MAIL_FROM` | mis. `E-Kost Manager <noreply@domainanda.com>` (domain terverifikasi di Resend) |

**Service role key tidak boleh** dimasukkan ke variabel `VITE_*` atau ke env Vercel. Edge Function otomatis
mendapat `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` dari Supabase.

Tanpa `RESEND_API_KEY`/`MAIL_FROM`, undangan tetap dibuat dan link-nya tampil di modal "Undang Penyewa",
tetapi email tidak terkirim.

## Supabase

Proyek: `e-kost-manager` (ref `ybvdlhwbbajtxcqyycgw`, region ap-southeast-1).

### Migration & seed

```bash
npx supabase login
npx supabase link --project-ref ybvdlhwbbajtxcqyycgw
npx supabase db push                       # terapkan supabase/migrations/*
npx supabase functions deploy invite-tenant
npx supabase functions deploy validate-invitation --no-verify-jwt
npx supabase functions deploy accept-invitation --no-verify-jwt
npx supabase secrets set APP_URL=https://<domain-vercel> RESEND_API_KEY=... MAIL_FROM="..."
```

Data demo (password tidak pernah disimpan di repo):

```bash
SUPABASE_URL=https://ybvdlhwbbajtxcqyycgw.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service role key> \
DEMO_PASSWORD=<password demo> \
node supabase/scripts/create-demo-users.mjs
# lalu jalankan isi supabase/seed.sql di SQL Editor
```

Denah demo tidak ikut di-seed: login sebagai pemilik demo → **Denah Kost** → **Buat denah otomatis**.

### Pengaturan di dashboard Supabase (tidak bisa lewat migration)

1. **Authentication → URL Configuration**: Site URL = domain produksi Vercel; Redirect URLs = domain produksi,
   `https://*-<tim-vercel>.vercel.app/**` (preview), dan `http://localhost:3000`.
2. **Authentication → Emails → SMTP Settings**: aktifkan custom SMTP (SMTP bawaan Supabase sangat dibatasi).
3. **Authentication → Emails → Templates → Magic Link**: ganti isi template agar memuat kode OTP 6 digit,
   mis. `Kode verifikasi E-Kost Manager Anda: {{ .Token }}` (pendaftaran pemilik memakai kode ini).
4. **Authentication → Providers → Email**: panjang OTP 6, aktifkan *Leaked password protection*
   (satu-satunya temuan advisor keamanan yang tersisa).

### Keamanan data (ringkas)

- RLS aktif di semua tabel `public`. Pemilik hanya melihat datanya; penyewa hanya kamarnya sendiri.
- Fungsi `security definer` ada di skema `private` (tidak terekspos REST); `public.*` hanyalah pembungkus
  `security invoker`.
- Trigger menolak perubahan `role`/`email` profil oleh user dan perubahan penghuni kamar di luar `assign_tenant`.
- Email pengirim testimoni tidak bisa dibaca publik (hak SELECT per kolom).
- Uji: jalankan `supabase/tests/rls_check.sql` di SQL Editor.

## Deploy ke Vercel

Pengaturan project:

| Setting | Nilai |
|---|---|
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js Version | 20.x |

Lewat CLI:

```bash
cd frontend
npx vercel login
npx vercel link
npx vercel env add VITE_SUPABASE_URL
npx vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
npx vercel --prod
```

`vercel.json` me-rewrite semua path ke `index.html`, jadi refresh di `/admin/facilities` atau
`/accept-invite?token=...` tidak 404.

## Fitur Denah Kost

- Pemilik: menu **Denah Kost** (`/admin/layout`) — lihat 2.5D (isometrik) / 3D (orbit) / 2D datar,
  pemilih lantai, lantai terpisah, filter Kosong/Terisi, panel detail + atur penghuni, dan tab **Atur Denah**
  (tipe bangunan, jumlah lantai, grid, penempatan kamar, ukuran & arah pintu, ubah jenis sel, salin pola,
  buat denah otomatis).
- Penyewa: menu **Denah** (`/tenant/denah`) — read-only; kamar sendiri disorot "Kamar Anda",
  nama penghuni lain tidak dikirim server.
- Hijau = kosong (`tersedia`), merah = terisi (`terisi`), selalu disertai ikon + teks.
- Warna berubah otomatis (Supabase Realtime) saat penghuni kamar diubah.
- Tanpa WebGL atau dengan `prefers-reduced-motion`, denah tampil sebagai grid 2D.
