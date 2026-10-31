// E-Kost Manager - Quick Start Script
// Node.js Version

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function showMenu() {
    console.clear();
    console.log('========================================');
    console.log('   E-Kost Manager - Quick Start');
    console.log('========================================');
    console.log('');
    console.log('Pilih cara menjalankan aplikasi:');
    console.log('');
    console.log('1. Standalone Mode (Tidak perlu install apapun)');
    console.log('2. Development Mode (Perlu Node.js)');
    console.log('3. Buka Dokumentasi');
    console.log('4. Keluar');
    console.log('');
}

function startStandalone() {
    console.log('');
    console.log('Membuka aplikasi dalam mode standalone...');
    
    const standalonePath = path.join(__dirname, 'standalone.html');
    
    if (fs.existsSync(standalonePath)) {
        const platform = process.platform;
        let command;
        
        switch (platform) {
            case 'win32':
                command = 'start';
                break;
            case 'darwin':
                command = 'open';
                break;
            default:
                command = 'xdg-open';
        }
        
        exec(`${command} "${standalonePath}"`, (error) => {
            if (error) {
                console.log('Gagal membuka browser. Silakan buka file standalone.html manual');
            } else {
                console.log('Aplikasi dibuka di browser!');
                console.log('Jika browser tidak terbuka, buka file standalone.html manual');
            }
        });
    } else {
        console.log('File standalone.html tidak ditemukan!');
    }
    
    console.log('');
    console.log('Tekan Enter untuk melanjutkan...');
    process.stdin.read();
}

function startDevelopment() {
    console.log('');
    console.log('Checking Node.js installation...');
    
    exec('node --version', (error, stdout, stderr) => {
        if (error) {
            console.log('Node.js tidak terinstall!');
            console.log('Silakan install Node.js dari https://nodejs.org/');
            console.log('Atau gunakan opsi 1 (Standalone Mode)');
            console.log('');
            console.log('Tekan Enter untuk melanjutkan...');
            process.stdin.read();
            return;
        }
        
        console.log(`Node.js terinstall! Version: ${stdout.trim()}`);
        console.log('');
        console.log('Installing dependencies...');
        
        exec('npm install', (error, stdout, stderr) => {
            if (error) {
                console.log('Gagal install dependencies!');
                console.log('Silakan gunakan opsi 1 (Standalone Mode)');
                console.log('');
                console.log('Tekan Enter untuk melanjutkan...');
                process.stdin.read();
                return;
            }
            
            console.log('Dependencies berhasil diinstall!');
            console.log('');
            console.log('Starting development server...');
            console.log('');
            console.log('Aplikasi akan berjalan di: http://localhost:3000');
            console.log('');
            console.log('Tekan Ctrl+C untuk menghentikan server');
            console.log('');
            
            const devProcess = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
            
            devProcess.on('error', (error) => {
                console.log('Gagal menjalankan development server:', error.message);
                console.log('Tekan Enter untuk melanjutkan...');
                process.stdin.read();
            });
        });
    });
}

function openDocs() {
    console.log('');
    console.log('Membuka dokumentasi...');
    
    const docs = ['README.md', 'QUICK_START.md', 'START_HERE.md'];
    const platform = process.platform;
    let command;
    
    switch (platform) {
        case 'win32':
            command = 'start';
            break;
        case 'darwin':
            command = 'open';
            break;
        default:
            command = 'xdg-open';
    }
    
    docs.forEach(doc => {
        const docPath = path.join(__dirname, doc);
        if (fs.existsSync(docPath)) {
            exec(`${command} "${docPath}"`, (error) => {
                if (error) {
                    console.log(`Gagal membuka ${doc}`);
                }
            });
        }
    });
    
    console.log('Dokumentasi dibuka!');
    console.log('');
    console.log('Tekan Enter untuk melanjutkan...');
    process.stdin.read();
}

function main() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    function askChoice() {
        showMenu();
        rl.question('Masukkan pilihan (1-4): ', (choice) => {
            switch (choice) {
                case '1':
                    startStandalone();
                    break;
                case '2':
                    startDevelopment();
                    break;
                case '3':
                    openDocs();
                    break;
                case '4':
                    console.log('');
                    console.log('Terima kasih!');
                    console.log('');
                    rl.close();
                    return;
                default:
                    console.log('Pilihan tidak valid!');
                    console.log('Tekan Enter untuk melanjutkan...');
                    process.stdin.read();
                    askChoice();
            }
        });
    }
    
    askChoice();
}

main();