@echo off
title E-Kost Manager
color 0A

:start
cls
echo.
echo  ========================================
echo     E-Kost Manager - Quick Start
echo  ========================================
echo.
echo  Pilih cara menjalankan aplikasi:
echo.
echo  1. Standalone Mode (Tidak perlu install apapun)
echo  2. Development Mode (Perlu Node.js)
echo  3. Buka Dokumentasi
echo  4. Keluar
echo.

set /p choice="Masukkan pilihan (1-4): "

if "%choice%"=="1" goto standalone
if "%choice%"=="2" goto development
if "%choice%"=="3" goto docs
if "%choice%"=="4" goto exit

echo Pilihan tidak valid!
pause
goto start

:standalone
echo.
echo Membuka aplikasi dalam mode standalone...
start standalone.html
echo.
echo Aplikasi dibuka di browser!
echo Jika browser tidak terbuka, buka file standalone.html manual
echo.
pause
goto start

:development
echo.
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js tidak terinstall!
    echo Silakan install Node.js dari https://nodejs.org/
    echo Atau gunakan opsi 1 (Standalone Mode)
    echo.
    pause
    goto start
)

echo Node.js terinstall!
echo.
echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo Gagal install dependencies!
    echo Silakan gunakan opsi 1 (Standalone Mode)
    echo.
    pause
    goto start
)

echo.
echo Starting development server...
echo.
echo Aplikasi akan berjalan di: http://localhost:3000
echo.
echo Tekan Ctrl+C untuk menghentikan server
echo.

call npm run dev
goto start

:docs
echo.
echo Membuka dokumentasi...
start README.md
start QUICK_START.md
start START_HERE.md
echo.
echo Dokumentasi dibuka!
echo.
pause
goto start

:exit
echo.
echo Terima kasih!
echo.
pause
exit