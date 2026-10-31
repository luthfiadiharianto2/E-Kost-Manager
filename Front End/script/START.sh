#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_menu() {
    clear
    echo -e "${BLUE}========================================"
    echo -e "   E-Kost Manager - Quick Start"
    echo -e "========================================${NC}"
    echo
    echo "Pilih cara menjalankan aplikasi:"
    echo
    echo "1. Standalone Mode (Tidak perlu install apapun)"
    echo "2. Development Mode (Perlu Node.js)"
    echo "3. Buka Dokumentasi"
    echo "4. Keluar"
    echo
}

standalone_mode() {
    echo
    echo -e "${GREEN}Membuka aplikasi dalam mode standalone...${NC}"
    
    # Try to open in default browser
    if command -v xdg-open &> /dev/null; then
        xdg-open standalone.html
    elif command -v open &> /dev/null; then
        open standalone.html
    elif command -v start &> /dev/null; then
        start standalone.html
    else
        echo -e "${YELLOW}Silakan buka file standalone.html manual di browser${NC}"
    fi
    
    echo
    echo -e "${GREEN}Aplikasi dibuka di browser!${NC}"
    echo "Jika browser tidak terbuka, buka file standalone.html manual"
    echo
    read -p "Tekan Enter untuk melanjutkan..."
}

development_mode() {
    echo
    echo -e "${GREEN}Checking Node.js installation...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.js tidak terinstall!${NC}"
        echo "Silakan install Node.js dari https://nodejs.org/"
        echo "Atau gunakan opsi 1 (Standalone Mode)"
        echo
        read -p "Tekan Enter untuk melanjutkan..."
        return
    fi
    
    echo -e "${GREEN}Node.js terinstall!${NC}"
    echo
    echo "Installing dependencies..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Gagal install dependencies!${NC}"
        echo "Silakan gunakan opsi 1 (Standalone Mode)"
        echo
        read -p "Tekan Enter untuk melanjutkan..."
        return
    fi
    
    echo
    echo "Starting development server..."
    echo
    echo -e "${GREEN}Aplikasi akan berjalan di: http://localhost:3000${NC}"
    echo
    echo "Tekan Ctrl+C untuk menghentikan server"
    echo
    
    npm run dev
}

open_docs() {
    echo
    echo -e "${GREEN}Membuka dokumentasi...${NC}"
    
    # Try to open documentation files
    if command -v xdg-open &> /dev/null; then
        xdg-open README.md
        xdg-open QUICK_START.md
        xdg-open START_HERE.md
    elif command -v open &> /dev/null; then
        open README.md
        open QUICK_START.md
        open START_HERE.md
    else
        echo "Silakan buka file dokumentasi manual:"
        echo "- README.md"
        echo "- QUICK_START.md"
        echo "- START_HERE.md"
    fi
    
    echo
    echo -e "${GREEN}Dokumentasi dibuka!${NC}"
    echo
    read -p "Tekan Enter untuk melanjutkan..."
}

# Main loop
while true; do
    show_menu
    read -p "Masukkan pilihan (1-4): " choice
    
    case $choice in
        1)
            standalone_mode
            ;;
        2)
            development_mode
            ;;
        3)
            open_docs
            ;;
        4)
            echo
            echo -e "${GREEN}Terima kasih!${NC}"
            echo
            exit 0
            ;;
        *)
            echo -e "${RED}Pilihan tidak valid!${NC}"
            read -p "Tekan Enter untuk melanjutkan..."
            ;;
    esac
done