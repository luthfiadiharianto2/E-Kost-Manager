#!/usr/bin/env python3
# E-Kost Manager - Quick Start Script
# Python Version

import os
import sys
import subprocess
import webbrowser
import platform

def clear_screen():
    """Clear the screen based on the operating system"""
    os.system('cls' if os.name == 'nt' else 'clear')

def show_menu():
    """Display the main menu"""
    clear_screen()
    print("========================================")
    print("   E-Kost Manager - Quick Start")
    print("========================================")
    print()
    print("Pilih cara menjalankan aplikasi:")
    print()
    print("1. Standalone Mode (Tidak perlu install apapun)")
    print("2. Development Mode (Perlu Node.js)")
    print("3. Buka Dokumentasi")
    print("4. Keluar")
    print()

def start_standalone():
    """Start the application in standalone mode"""
    print()
    print("Membuka aplikasi dalam mode standalone...")
    
    standalone_path = os.path.join(os.getcwd(), 'standalone.html')
    
    if os.path.exists(standalone_path):
        try:
            webbrowser.open(standalone_path)
            print()
            print("Aplikasi dibuka di browser!")
            print("Jika browser tidak terbuka, buka file standalone.html manual")
        except Exception as e:
            print(f"Gagal membuka browser: {e}")
            print("Silakan buka file standalone.html manual")
    else:
        print("File standalone.html tidak ditemukan!")
    
    print()
    input("Tekan Enter untuk melanjutkan...")

def start_development():
    """Start the application in development mode"""
    print()
    print("Checking Node.js installation...")
    
    try:
        result = subprocess.run(['node', '--version'], 
                              capture_output=True, text=True, check=True)
        print(f"Node.js terinstall! Version: {result.stdout.strip()}")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Node.js tidak terinstall!")
        print("Silakan install Node.js dari https://nodejs.org/")
        print("Atau gunakan opsi 1 (Standalone Mode)")
        print()
        input("Tekan Enter untuk melanjutkan...")
        return
    
    print()
    print("Installing dependencies...")
    
    try:
        subprocess.run(['npm', 'install'], check=True)
        print("Dependencies berhasil diinstall!")
    except subprocess.CalledProcessError:
        print("Gagal install dependencies!")
        print("Silakan gunakan opsi 1 (Standalone Mode)")
        print()
        input("Tekan Enter untuk melanjutkan...")
        return
    
    print()
    print("Starting development server...")
    print()
    print("Aplikasi akan berjalan di: http://localhost:3000")
    print()
    print("Tekan Ctrl+C untuk menghentikan server")
    print()
    
    try:
        subprocess.run(['npm', 'run', 'dev'])
    except KeyboardInterrupt:
        print("\nServer dihentikan.")
    except subprocess.CalledProcessError as e:
        print(f"Gagal menjalankan development server: {e}")
        input("Tekan Enter untuk melanjutkan...")

def open_docs():
    """Open documentation files"""
    print()
    print("Membuka dokumentasi...")
    
    docs = ['README.md', 'QUICK_START.md', 'START_HERE.md']
    
    for doc in docs:
        doc_path = os.path.join(os.getcwd(), doc)
        if os.path.exists(doc_path):
            try:
                webbrowser.open(doc_path)
            except Exception as e:
                print(f"Gagal membuka {doc}: {e}")
    
    print("Dokumentasi dibuka!")
    print()
    input("Tekan Enter untuk melanjutkan...")

def main():
    """Main function"""
    while True:
        show_menu()
        choice = input("Masukkan pilihan (1-4): ")
        
        if choice == '1':
            start_standalone()
        elif choice == '2':
            start_development()
        elif choice == '3':
            open_docs()
        elif choice == '4':
            print()
            print("Terima kasih!")
            print()
            break
        else:
            print("Pilihan tidak valid!")
            input("Tekan Enter untuk melanjutkan...")

if __name__ == "__main__":
    main()