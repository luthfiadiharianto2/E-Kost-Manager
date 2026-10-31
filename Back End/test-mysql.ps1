# Script PowerShell untuk test koneksi MySQL
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST KONEKSI MYSQL - E-KOST MANAGER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test koneksi menggunakan Laravel Artisan
Write-Host "Test 1: Menggunakan Laravel Artisan..." -ForegroundColor Yellow
Write-Host ""

try {
    # Clear config cache first
    Write-Host "Clearing config cache..." -ForegroundColor Gray
    php artisan config:clear 2>&1 | Out-Null
    
    # Test database connection
    Write-Host "Testing database connection..." -ForegroundColor Gray
    $result = php artisan db:show 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host $result -ForegroundColor Green
        Write-Host ""
        Write-Host "✓ Koneksi database berhasil!" -ForegroundColor Green
    } else {
        Write-Host $result -ForegroundColor Red
        Write-Host ""
        Write-Host "✗ Koneksi database gagal!" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test menggunakan PHP script
Write-Host "Test 2: Menggunakan PHP test script..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "test-mysql-connection.php") {
    php test-mysql-connection.php
} else {
    Write-Host "File test-mysql-connection.php tidak ditemukan!" -ForegroundColor Red
}

Write-Host ""
Write-Host "Untuk informasi lengkap, lihat file SETUP_MYSQL.md" -ForegroundColor Cyan


