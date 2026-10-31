# Script untuk memperbaiki path extension_dir di php.ini

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PHP.ini Path Fixer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Deteksi lokasi PHP
$phpPath = (Get-Command php).Source
$phpDir = Split-Path $phpPath
$phpIniPath = Join-Path $phpDir "php.ini"

Write-Host "PHP Location: $phpPath" -ForegroundColor Yellow
Write-Host "PHP Directory: $phpDir" -ForegroundColor Yellow
Write-Host "php.ini Location: $phpIniPath" -ForegroundColor Yellow
Write-Host ""

# Cek apakah php.ini ada
if (-not (Test-Path $phpIniPath)) {
    Write-Host "ERROR: php.ini not found at: $phpIniPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Trying to find php.ini..." -ForegroundColor Yellow
    
    # Coba cari php.ini-development atau php.ini-production
    $phpIniDev = Join-Path $phpDir "php.ini-development"
    $phpIniProd = Join-Path $phpDir "php.ini-production"
    
    if (Test-Path $phpIniDev) {
        Write-Host "Found php.ini-development, copying to php.ini..." -ForegroundColor Yellow
        Copy-Item $phpIniDev $phpIniPath
        Write-Host "✓ Created php.ini from php.ini-development" -ForegroundColor Green
    } elseif (Test-Path $phpIniProd) {
        Write-Host "Found php.ini-production, copying to php.ini..." -ForegroundColor Yellow
        Copy-Item $phpIniProd $phpIniPath
        Write-Host "✓ Created php.ini from php.ini-production" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Cannot find php.ini template files" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "Reading php.ini..." -ForegroundColor Yellow

# Backup php.ini
$backupPath = "$phpIniPath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $phpIniPath $backupPath
Write-Host "✓ Backup created: $backupPath" -ForegroundColor Green

# Baca isi php.ini
$iniContent = Get-Content $phpIniPath -Raw

# Perbaiki extension_dir
$newExtensionDir = $phpDir + "\ext"

# Cek apakah extension_dir sudah ada
if ($iniContent -match "extension_dir\s*=") {
    Write-Host "Found extension_dir configuration" -ForegroundColor Yellow
    
    # Uncomment dan perbaiki path
    $iniContent = $iniContent -replace ";?\s*extension_dir\s*=\s*[^\r\n]+", "extension_dir = `"$newExtensionDir`""
    Write-Host "✓ Updated extension_dir to: $newExtensionDir" -ForegroundColor Green
} else {
    # Tambahkan extension_dir jika tidak ada
    Write-Host "Adding extension_dir configuration..." -ForegroundColor Yellow
    $iniContent = "; Extension directory`r`nextension_dir = `"$newExtensionDir`"`r`n`r`n" + $iniContent
    Write-Host "✓ Added extension_dir: $newExtensionDir" -ForegroundColor Green
}

# Aktifkan ekstensi yang diperlukan
$requiredExtensions = @(
    "extension=pdo_sqlite",
    "extension=pdo_mysql", 
    "extension=mbstring",
    "extension=curl",
    "extension=fileinfo",
    "extension=openssl",
    "extension=mysqli"
)

Write-Host ""
Write-Host "Enabling required extensions..." -ForegroundColor Yellow

foreach ($ext in $requiredExtensions) {
    $extName = $ext -replace "extension=", ""
    
    # Cek apakah sudah ada (commented atau tidak)
    if ($iniContent -match ";?\s*$ext") {
        # Jika commented, uncomment
        if ($iniContent -match ";+\s*$ext") {
            $iniContent = $iniContent -replace ";+\s*$ext", $ext
            Write-Host "✓ Enabled: $extName" -ForegroundColor Green
        } else {
            Write-Host "  Already enabled: $extName" -ForegroundColor Gray
        }
    } else {
        # Tambahkan jika tidak ada
        $iniContent = $iniContent + "`r`n$ext"
        Write-Host "✓ Added: $extName" -ForegroundColor Green
    }
}

# Simpan php.ini
Write-Host ""
Write-Host "Saving php.ini..." -ForegroundColor Yellow
Set-Content -Path $phpIniPath -Value $iniContent -NoNewline
Write-Host "✓ php.ini saved successfully" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please restart XAMPP or your web server" -ForegroundColor Yellow
Write-Host "Then run: php artisan test" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"

