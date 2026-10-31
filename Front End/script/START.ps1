# E-Kost Manager - Quick Start Script
# PowerShell Version

function Show-Menu {
    Clear-Host
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host "   E-Kost Manager - Quick Start" -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Pilih cara menjalankan aplikasi:"
    Write-Host ""
    Write-Host "1. Standalone Mode (Tidak perlu install apapun)"
    Write-Host "2. Development Mode (Perlu Node.js)"
    Write-Host "3. Buka Dokumentasi"
    Write-Host "4. Keluar"
    Write-Host ""
}

function Start-Standalone {
    Write-Host ""
    Write-Host "Membuka aplikasi dalam mode standalone..." -ForegroundColor Green
    
    try {
        Start-Process "standalone.html"
        Write-Host ""
        Write-Host "Aplikasi dibuka di browser!" -ForegroundColor Green
        Write-Host "Jika browser tidak terbuka, buka file standalone.html manual"
    }
    catch {
        Write-Host "Gagal membuka browser. Silakan buka file standalone.html manual" -ForegroundColor Red
    }
    
    Write-Host ""
    Read-Host "Tekan Enter untuk melanjutkan"
}

function Start-Development {
    Write-Host ""
    Write-Host "Checking Node.js installation..." -ForegroundColor Green
    
    try {
        $nodeVersion = node --version
        Write-Host "Node.js terinstall! Version: $nodeVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "Node.js tidak terinstall!" -ForegroundColor Red
        Write-Host "Silakan install Node.js dari https://nodejs.org/"
        Write-Host "Atau gunakan opsi 1 (Standalone Mode)"
        Write-Host ""
        Read-Host "Tekan Enter untuk melanjutkan"
        return
    }
    
    Write-Host ""
    Write-Host "Installing dependencies..."
    
    try {
        npm install
        Write-Host "Dependencies berhasil diinstall!" -ForegroundColor Green
    }
    catch {
        Write-Host "Gagal install dependencies!" -ForegroundColor Red
        Write-Host "Silakan gunakan opsi 1 (Standalone Mode)"
        Write-Host ""
        Read-Host "Tekan Enter untuk melanjutkan"
        return
    }
    
    Write-Host ""
    Write-Host "Starting development server..."
    Write-Host ""
    Write-Host "Aplikasi akan berjalan di: http://localhost:3000" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tekan Ctrl+C untuk menghentikan server"
    Write-Host ""
    
    try {
        npm run dev
    }
    catch {
        Write-Host "Gagal menjalankan development server" -ForegroundColor Red
        Read-Host "Tekan Enter untuk melanjutkan"
    }
}

function Open-Docs {
    Write-Host ""
    Write-Host "Membuka dokumentasi..." -ForegroundColor Green
    
    try {
        Start-Process "README.md"
        Start-Process "QUICK_START.md"
        Start-Process "START_HERE.md"
        Write-Host ""
        Write-Host "Dokumentasi dibuka!" -ForegroundColor Green
    }
    catch {
        Write-Host "Gagal membuka dokumentasi. Silakan buka file manual:" -ForegroundColor Red
        Write-Host "- README.md"
        Write-Host "- QUICK_START.md"
        Write-Host "- START_HERE.md"
    }
    
    Write-Host ""
    Read-Host "Tekan Enter untuk melanjutkan"
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Masukkan pilihan (1-4)"
    
    switch ($choice) {
        "1" { Start-Standalone }
        "2" { Start-Development }
        "3" { Open-Docs }
        "4" { 
            Write-Host ""
            Write-Host "Terima kasih!" -ForegroundColor Green
            Write-Host ""
            break
        }
        default {
            Write-Host "Pilihan tidak valid!" -ForegroundColor Red
            Read-Host "Tekan Enter untuk melanjutkan"
        }
    }
} while ($choice -ne "4")