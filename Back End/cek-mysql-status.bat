@echo off
echo ========================================
echo   CEK STATUS MYSQL SERVICE
echo ========================================
echo.

echo Mengecek MySQL service...
sc query | findstr /i "mysql"

echo.
echo ========================================
echo Mengecek port 3306...
echo ========================================
netstat -ano | findstr :3306

if %ERRORLEVEL% EQU 0 (
    echo.
    echo MySQL server kemungkinan sudah berjalan pada port 3306!
) else (
    echo.
    echo Port 3306 tidak digunakan. MySQL server belum berjalan.
)

echo.
echo ========================================
echo LANGKAH SELANJUTNYA:
echo ========================================
echo.
echo 1. Start MySQL:
echo    - Buka XAMPP Control Panel
echo    - Klik Start di MySQL
echo    - Atau jalankan: net start MySQL
echo.
echo 2. Test koneksi setelah MySQL berjalan:
echo    php test-mysql-connection.php
echo.
echo 3. Lihat file START_MYSQL.md untuk informasi lengkap
echo.
pause


