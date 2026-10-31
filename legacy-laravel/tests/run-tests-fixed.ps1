# PowerShell script untuk menjalankan tests dengan error handling yang lebih baik

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Running E-Kost Manager Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectPath = Join-Path $scriptPath ".."
Set-Location $projectPath

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Check if PHP is available
Write-Host "Checking PHP installation..." -ForegroundColor Yellow
try {
    $phpVersion = php -v 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PHP found:" -ForegroundColor Green
        Write-Host $phpVersion[0] -ForegroundColor Green
    } else {
        Write-Host "ERROR: PHP is not installed or not in PATH" -ForegroundColor Red
        Write-Host "Please install PHP or add it to your PATH" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} catch {
    Write-Host "ERROR: PHP is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check if vendor directory exists
if (-not (Test-Path "vendor")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    composer install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "Running tests..." -ForegroundColor Yellow
Write-Host ""

# Try to run tests
try {
    # Suppress PHP warnings about extensions
    $env:PHP_INI_SCAN_DIR = ""
    
    php artisan test 2>&1 | Tee-Object -Variable testOutput
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "All tests passed!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "Some tests failed. Check output above." -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        
        # Check if it's a PHP extension issue
        $outputString = $testOutput -join "`n"
        if ($outputString -match "Unable to load dynamic library") {
            Write-Host ""
            Write-Host "WARNING: PHP extensions are not loading properly." -ForegroundColor Yellow
            Write-Host "This might be a configuration issue with XAMPP/PHP." -ForegroundColor Yellow
            Write-Host "Please check TROUBLESHOOTING.md for solutions." -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: Failed to run tests" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"

