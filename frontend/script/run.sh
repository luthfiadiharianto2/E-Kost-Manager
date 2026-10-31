#!/bin/bash

echo "========================================"
echo "   E-Kost Manager - Quick Start"
echo "========================================"
echo

echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    echo
    echo "Alternative: Open standalone.html in your browser"
    echo
    exit 1
fi

echo "Node.js is installed!"
echo

echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Failed to install dependencies!"
    echo
    echo "Alternative: Open standalone.html in your browser"
    echo
    exit 1
fi

echo
echo "Starting development server..."
echo
echo "Application will open at: http://localhost:3000"
echo
echo "Press Ctrl+C to stop the server"
echo

npm run dev