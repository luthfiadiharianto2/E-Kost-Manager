<?php

/**
 * Script untuk test koneksi MySQL
 * Jalankan dengan: php test-mysql-connection.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "========================================\n";
echo "  TEST KONEKSI MYSQL - E-KOST MANAGER\n";
echo "========================================\n\n";

// Baca konfigurasi dari .env
$config = [
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '3306'),
    'database' => env('DB_DATABASE', 'ekostmanager'),
    'username' => env('DB_USERNAME', 'root'),
    'password' => env('DB_PASSWORD', ''),
];

echo "Konfigurasi Database:\n";
echo "  Host: {$config['host']}\n";
echo "  Port: {$config['port']}\n";
echo "  Database: {$config['database']}\n";
echo "  Username: {$config['username']}\n";
echo "  Password: " . (empty($config['password']) ? '(kosong)' : str_repeat('*', strlen($config['password']))) . "\n\n";

// Test 1: Koneksi langsung dengan PDO
echo "Test 1: Koneksi langsung dengan PDO...\n";
try {
    $dsn = "mysql:host={$config['host']};port={$config['port']};charset=utf8mb4";
    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    
    echo "  ✓ Koneksi ke MySQL Server berhasil!\n";
    
    // Check if database exists
    $stmt = $pdo->query("SHOW DATABASES LIKE '{$config['database']}'");
    $dbExists = $stmt->rowCount() > 0;
    
    if ($dbExists) {
        echo "  ✓ Database '{$config['database']}' ditemukan!\n";
        
        // Connect to database
        $pdo->exec("USE `{$config['database']}`");
        
        // Count tables
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "  ✓ Jumlah tabel dalam database: " . count($tables) . "\n";
        
        if (count($tables) > 0) {
            echo "  Tabel yang ditemukan:\n";
            foreach (array_slice($tables, 0, 10) as $table) {
                echo "    - {$table}\n";
            }
            if (count($tables) > 10) {
                echo "    ... dan " . (count($tables) - 10) . " tabel lainnya\n";
            }
        }
    } else {
        echo "  ⚠ Database '{$config['database']}' belum ada!\n";
        echo "  → Silakan buat database di MySQL Workbench atau jalankan:\n";
        echo "    CREATE DATABASE `{$config['database']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n";
    }
    
} catch (PDOException $e) {
    echo "  ✗ Error: " . $e->getMessage() . "\n";
    echo "\n  Kemungkinan penyebab:\n";
    echo "  - MySQL server belum berjalan\n";
    echo "  - Username/password salah\n";
    echo "  - Host/port tidak benar\n";
    exit(1);
}

echo "\n";

// Test 2: Koneksi menggunakan Laravel DB Facade
echo "Test 2: Koneksi menggunakan Laravel DB Facade...\n";
try {
    DB::connection()->getPdo();
    echo "  ✓ Koneksi Laravel berhasil!\n";
    
    // Test query
    $result = DB::select("SELECT VERSION() as version");
    if (!empty($result)) {
        echo "  ✓ MySQL Version: " . $result[0]->version . "\n";
    }
    
    // Get database name
    $dbName = DB::connection()->getDatabaseName();
    echo "  ✓ Database yang digunakan: {$dbName}\n";
    
} catch (Exception $e) {
    echo "  ✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n";
echo "========================================\n";
echo "  ✓ SEMUA TEST BERHASIL!\n";
echo "========================================\n";
echo "\n";
echo "Langkah selanjutnya:\n";
echo "1. Buka MySQL Workbench\n";
echo "2. Buat koneksi baru dengan:\n";
echo "   - Connection Name: E-Kost Manager\n";
echo "   - Hostname: {$config['host']}\n";
echo "   - Port: {$config['port']}\n";
echo "   - Username: {$config['username']}\n";
echo "   - Password: [password Anda]\n";
echo "3. Test koneksi dan klik OK\n";
echo "4. Setelah terkoneksi, buat database jika belum ada:\n";
echo "   CREATE DATABASE `{$config['database']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n";
echo "5. Import file ekostmanager.sql jika diperlukan\n";
echo "\n";

