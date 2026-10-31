# Script untuk mengecek dan memperbaiki konfigurasi PHP

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PHP Configuration Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check PHP
Write-Host "1. Checking PHP installation..." -ForegroundColor Yellow
try {
    $phpVersion = php -v 2>&1 | Select-Object -First 1
    if ($phpVersion -match "PHP") {
        Write-Host "   ✓ PHP found: $phpVersion" -ForegroundColor Green
    } else {
        Write-Host "   ✗ PHP not found or not working" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ✗ PHP not found in PATH" -ForegroundColor Red
    Write-Host "   Please add PHP to your PATH or use full path to php.exe" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check PHP extensions
Write-Host "2. Checking required PHP extensions..." -ForegroundColor Yellow
$requiredExtensions = @("pdo_sqlite", "pdo_mysql", "mbstring", "curl", "fileinfo", "openssl")
$missingExtensions = @()

try {
    $loadedExtensions = php -m 2>&1 | Where-Object { $_ -notmatch "Warning|Error|Fatal" }
    
    foreach ($ext in $requiredExtensions) {
        if ($loadedExtensions -match $ext) {
            Write-Host "   ✓ $ext" -ForegroundColor Green
        } else {
            Write-Host "   ✗ $ext (MISSING)" -ForegroundColor Red
            $missingExtensions += $ext
        }
    }
} catch {
    Write-Host "   ✗ Cannot check extensions (PHP error)" -ForegroundColor Red
}

Write-Host ""

# Check php.ini location
Write-Host "3. Checking php.ini location..." -ForegroundColor Yellow
try {
    $iniPath = php --ini 2>&1 | Select-String "Loaded Configuration File" | ForEach-Object { ($_ -split ":")[1].Trim() }
    if ($iniPath -and (Test-Path $iniPath)) {
        Write-Host "   ✓ php.ini found: $iniPath" -ForegroundColor Green
        
        # Check if extensions are enabled
        Write-Host ""
        Write-Host "4. Checking php.ini configuration..." -ForegroundColor Yellow
        $iniContent = Get-Content $iniPath -Raw
        
        foreach ($ext in $missingExtensions) {
            $extLine = "extension=$ext"
            if ($iniContent -match "extension=$ext" -or $iniContent -match ";extension=$ext") {
                $commented = $iniContent -match ";extension=$ext"
                if ($commented) {
                    Write-Host "   ⚠ $ext is commented out (needs to be uncommented)" -ForegroundColor Yellow
                } else {
                    Write-Host "   ✓ $ext is enabled in php.ini" -ForegroundColor Green
                }
            } else {
                Write-Host "   ✗ $ext not found in php.ini" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "   ✗ Cannot find php.ini" -ForegroundColor Red
        Write-Host "   Try: php --ini" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ Cannot check php.ini" -ForegroundColor Red
}

Write-Host ""

# Check Composer
Write-Host "5. Checking Composer..." -ForegroundColor Yellow
try {
    $composerVersion = composer --version 2>&1 | Select-Object -First 1
    if ($composerVersion -match "Composer") {
        Write-Host "   ✓ $composerVersion" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Composer not found" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Composer not found" -ForegroundColor Red
}

Write-Host ""

# Check Laravel
Write-Host "6. Checking Laravel installation..." -ForegroundColor Yellow
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectPath = Join-Path $scriptPath ".."
$artisanPath = Join-Path $projectPath "artisan"

if (Test-Path $artisanPath) {
    Write-Host "   ✓ Laravel project found" -ForegroundColor Green
} else {
    Write-Host "   ✗ Laravel project not found" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($missingExtensions.Count -eq 0) {
    Write-Host "✓ All required extensions are loaded" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run tests with:" -ForegroundColor Yellow
    Write-Host "  php artisan test" -ForegroundColor White
} else {
    Write-Host "✗ Missing extensions: $($missingExtensions -join ', ')" -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix:" -ForegroundColor Yellow
    Write-Host "1. Open php.ini: $iniPath" -ForegroundColor White
    Write-Host "2. Find and uncomment (remove ;) these lines:" -ForegroundColor White
    foreach ($ext in $missingExtensions) {
        Write-Host "   extension=$ext" -ForegroundColor White
    }
    Write-Host "3. Restart XAMPP/Apache" -ForegroundColor White
    Write-Host "4. Run this script again to verify" -ForegroundColor White
    Write-Host ""
    Write-Host "For detailed instructions, see: FIX_PHP_CONFIG.md" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to exit"

