#!/bin/bash

# Build script for Get PDF Metadata Java project

echo "Building Get PDF Metadata Java project..."

# Create output directory if it doesn't exist
mkdir -p out

# Compile the Java source
javac -d out src/Main.java

if [ $? -eq 0 ]; then
    echo "Build successful!"
    echo "To run the program:"
    echo "  cd out"
    echo "  java Main"
    echo ""
    echo "Make sure to:"
    echo "  1. Update the API_KEY in Main.java"
    echo "  2. Place your PDF file as 'sample.pdf' in the project directory"
else
    echo "Build failed!"
    exit 1
fi 