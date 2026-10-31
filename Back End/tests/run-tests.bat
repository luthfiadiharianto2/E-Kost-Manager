@echo off
echo ========================================
echo Running E-Kost Manager Tests
echo ========================================
echo.

cd /d "%~dp0\.."

echo Checking PHP installation...
php -v
if %errorlevel% neq 0 (
    echo ERROR: PHP is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Running all tests...
php artisan test

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo All tests passed!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Some tests failed. Check output above.
    echo ========================================
)

pause

