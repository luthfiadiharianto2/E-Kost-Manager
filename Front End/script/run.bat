@echo off
echo ========================================
echo    E-Kost Manager - Quick Start
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    echo Alternative: Open standalone.html in your browser
    echo.
    pause
    exit /b 1
)

echo Node.js is installed!
echo.

echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo Failed to install dependencies!
    echo.
    echo Alternative: Open standalone.html in your browser
    echo.
    pause
    exit /b 1
)

echo.
echo Starting development server...
echo.
echo Application will open at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause