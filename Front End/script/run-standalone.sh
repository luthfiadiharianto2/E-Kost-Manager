#!/bin/bash

echo "========================================"
echo "   E-Kost Manager - Standalone Mode"
echo "========================================"
echo

echo "Opening standalone version in browser..."
echo

# Try to open in default browser
if command -v xdg-open &> /dev/null; then
    xdg-open standalone.html
elif command -v open &> /dev/null; then
    open standalone.html
elif command -v start &> /dev/null; then
    start standalone.html
else
    echo "Please open standalone.html manually in your browser"
fi

echo "Application opened in browser!"
echo
echo "If the browser doesn't open automatically,"
echo "please open standalone.html manually"
echo