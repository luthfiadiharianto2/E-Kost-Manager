# 🔌 API Integration Guide - E-Kost Manager

## 📋 Backend Requirements

Aplikasi frontend E-Kost Manager memerlukan Laravel backend dengan endpoint berikut:

### 🔐 Authentication Endpoints

#### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password",
  "role": "admin" // atau "tenant"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "phone": "081234567890",
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

#### 2. Signup (Penyewa)
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "081234567890",
  "access_code": "KOST2024"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Pendaftaran berhasil",
  "data": {
    "user": {
      "id": 2,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "tenant",
      "phone": "081234567890",
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

#### 3. Get Profile
```http
GET /api/auth/profile
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "phone": "081234567890",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

#### 4. Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

---

### 🏠 Kost Management Endpoints (Admin)

#### 1. Get All Kosts
```http
GET /api/kosts
Authorization: Bearer {token}
```

#### 2. Create Kost
```http
POST /api/kosts
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Kost ABC",
  "address": "Jl. Merdeka No. 123, Jakarta",
  "description": "Kost nyaman dengan fasilitas lengkap",
  "price": 1500000,
  "capacity": 20,
  "facilities": ["AC", "WiFi", "Kamar Mandi Dalam"],
  "images": ["image1.jpg", "image2.jpg"]
}
```

#### 3. Update Kost
```http
PUT /api/kosts/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Kost ABC Updated",
  "address": "Jl. Merdeka No. 123, Jakarta",
  "description": "Kost nyaman dengan fasilitas lengkap",
  "price": 1600000,
  "capacity": 20,
  "facilities": ["AC", "WiFi", "Kamar Mandi Dalam", "Dapur Bersama"],
  "images": ["image1.jpg", "image2.jpg"]
}
```

#### 4. Delete Kost
```http
DELETE /api/kosts/{id}
Authorization: Bearer {token}
```

---

### 👥 Tenant Management Endpoints (Admin)

#### 1. Get All Tenants
```http
GET /api/tenants
Authorization: Bearer {token}
```

#### 2. Get Tenant Details
```http
GET /api/tenants/{id}
Authorization: Bearer {token}
```

---

### 💳 Payment Endpoints

#### 1. Get All Payments (Admin)
```http
GET /api/payments
Authorization: Bearer {token}
```

#### 2. Get My Payments (Tenant)
```http
GET /api/my-payments
Authorization: Bearer {token}
```

#### 3. Create Payment (Tenant)
```http
POST /api/payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "room_id": 1,
  "amount": 1500000,
  "payment_method": "transfer_bank"
}
```

#### 4. Update Payment Status (Admin)
```http
PUT /api/payments/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "paid",
  "paid_at": "2024-01-15T10:30:00.000000Z"
}
```

---

### 🚨 Complaint Endpoints

#### 1. Get All Complaints (Admin)
```http
GET /api/complaints
Authorization: Bearer {token}
```

#### 2. Get My Complaints (Tenant)
```http
GET /api/my-complaints
Authorization: Bearer {token}
```

#### 3. Create Complaint (Tenant)
```http
POST /api/complaints
Authorization: Bearer {token}
Content-Type: application/json

{
  "kost_id": 1,
  "title": "AC Tidak Dingin",
  "description": "AC di kamar tidak dingin sejak kemarin",
  "priority": "high"
}
```

#### 4. Update Complaint Status (Admin)
```http
PUT /api/complaints/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in_progress",
  "response": "Teknisi akan datang dalam 2 jam"
}
```

---

### 🏠 My Kost Endpoint (Tenant)

#### Get My Kost Info
```http
GET /api/my-kost
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "kost": {
      "id": 1,
      "name": "Kost ABC",
      "address": "Jl. Merdeka No. 123, Jakarta",
      "description": "Kost nyaman dengan fasilitas lengkap",
      "facilities": ["AC", "WiFi", "Kamar Mandi Dalam"],
      "images": ["image1.jpg", "image2.jpg"]
    },
    "room": {
      "id": 1,
      "room_number": "A-101",
      "price": 1500000
    },
    "owner": {
      "name": "Budi Santoso",
      "phone": "081234567890"
    }
  }
}
```

---

## 🔧 Frontend Configuration

### 1. Update API URL
Edit file `.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

### 2. Update API Service
File `src/services/api.ts` sudah dikonfigurasi untuk:
- Menambahkan token ke header Authorization
- Handle 401 errors (auto logout)
- Base URL dari environment variable

### 3. Error Handling
Aplikasi sudah menangani error responses:
- Network errors
- 401 Unauthorized (auto logout)
- 422 Validation errors
- 500 Server errors

---

## 🧪 Testing API Integration

### 1. Test dengan Postman
```bash
# Test login
POST http://localhost:8000/api/auth/login
{
  "email": "admin@example.com",
  "password": "password",
  "role": "admin"
}
```

### 2. Test dengan Frontend
1. Buka aplikasi di browser
2. Buka Developer Tools (F12)
3. Cek Network tab saat login
4. Pastikan API calls berhasil

### 3. Mock Data
Untuk testing tanpa backend, aplikasi menggunakan mock data yang bisa dilihat di:
- `src/pages/AdminDashboard.tsx`
- `src/pages/TenantDashboard.tsx`

---

## 📝 Laravel Backend Setup

### 1. Install Laravel
```bash
composer create-project laravel/laravel e-kost-backend
cd e-kost-backend
```

### 2. Install Dependencies
```bash
composer require laravel/sanctum
composer require spatie/laravel-permission
```

### 3. Setup Database
```bash
php artisan migrate
php artisan db:seed
```

### 4. Configure CORS
```php
// config/cors.php
'allowed_origins' => ['http://localhost:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

### 5. Create API Routes
```php
// routes/api.php
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('signup', [AuthController::class, 'signup']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('profile', [AuthController::class, 'profile']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});
```

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Build
npm run build

# Deploy
vercel --prod
```

### Backend (Laravel Forge/Server)
```bash
# Setup server
# Configure nginx/apache
# Setup SSL
# Deploy code
```

### Environment Variables
**Frontend (.env):**
```env
VITE_API_URL=https://your-api-domain.com/api
```

**Backend (.env):**
```env
APP_URL=https://your-api-domain.com
DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_DATABASE=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
```

---

## ✅ Checklist Integration

- [ ] Backend API endpoints tersedia
- [ ] CORS dikonfigurasi dengan benar
- [ ] Authentication token working
- [ ] Frontend bisa login/logout
- [ ] Data loading dari API
- [ ] Error handling working
- [ ] Responsive design
- [ ] Production deployment

---

## 📞 Support

Jika ada masalah dengan API integration:
1. Cek browser console untuk error
2. Test API dengan Postman
3. Pastikan CORS dikonfigurasi
4. Cek Laravel logs
5. Pastikan database connection

**Happy Coding! 🚀**