# Script untuk cek status MySQL Service
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CEK STATUS MYSQL SERVICE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cek MySQL service
Write-Host "Mencari MySQL service..." -ForegroundColor Yellow
$mysqlServices = Get-Service | Where-Object { $_.Name -like "*MySQL*" -or $_.DisplayName -like "*MySQL*" }

if ($mysqlServices) {
    Write-Host ""
    Write-Host "MySQL Service ditemukan:" -ForegroundColor Green
    Write-Host ""
    foreach ($service in $mysqlServices) {
        $statusColor = if ($service.Status -eq "Running") { "Green" } else { "Red" }
        Write-Host "  Nama Service: $($service.Name)" -ForegroundColor White
        Write-Host "  Display Name: $($service.DisplayName)" -ForegroundColor White
        Write-Host "  Status: $($service.Status)" -ForegroundColor $statusColor
        Write-Host ""
    }
    
    # Cek port 3306
    Write-Host "Mengecek port 3306..." -ForegroundColor Yellow
    $port3306 = netstat -ano | findstr :3306
    
    if ($port3306) {
        Write-Host ""
        Write-Host "  ✓ Port 3306 sedang digunakan:" -ForegroundColor Green
        Write-Host $port3306 -ForegroundColor Gray
        Write-Host ""
        Write-Host "  MySQL server kemungkinan sudah berjalan!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "  ⚠ Port 3306 tidak digunakan" -ForegroundColor Yellow
        Write-Host "  MySQL server kemungkinan belum berjalan" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "  ⚠ MySQL service tidak ditemukan!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Kemungkinan:" -ForegroundColor Yellow
    Write-Host "  1. MySQL belum terinstall" -ForegroundColor White
    Write-Host "  2. MySQL menggunakan XAMPP (cek XAMPP Control Panel)" -ForegroundColor White
    Write-Host "  3. Service MySQL menggunakan nama yang berbeda" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cek XAMPP MySQL (jika ada)
Write-Host "Mengecek XAMPP..." -ForegroundColor Yellow
$xamppPath = "C:\xampp\mysql\bin\mysqld.exe"
if (Test-Path $xamppPath) {
    Write-Host "  ✓ XAMPP MySQL ditemukan di: C:\xampp" -ForegroundColor Green
    Write-Host "  → Buka XAMPP Control Panel untuk start MySQL" -ForegroundColor Cyan
} else {
    $xamppPath = "D:\XAMPP\mysql\bin\mysqld.exe"
    if (Test-Path $xamppPath) {
        Write-Host "  ✓ XAMPP MySQL ditemukan di: D:\XAMPP" -ForegroundColor Green
        Write-Host "  → Buka XAMPP Control Panel untuk start MySQL" -ForegroundColor Cyan
    } else {
        Write-Host "  ⚠ XAMPP MySQL tidak ditemukan di lokasi standar" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Instruksi
Write-Host "LANGKAH SELANJUTNYA:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start MySQL service:" -ForegroundColor White
Write-Host "   - Buka XAMPP Control Panel dan klik Start di MySQL" -ForegroundColor Gray
Write-Host "   - Atau jalankan: net start MySQL" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test koneksi setelah MySQL berjalan:" -ForegroundColor White
Write-Host "   php test-mysql-connection.php" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Untuk informasi lengkap, lihat:" -ForegroundColor White
Write-Host "   - START_MYSQL.md (cara start MySQL)" -ForegroundColor Gray
Write-Host "   - SETUP_MYSQL.md (setup MySQL Workbench)" -ForegroundColor Gray
Write-Host ""


