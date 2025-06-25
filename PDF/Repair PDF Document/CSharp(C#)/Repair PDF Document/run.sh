#!/bin/bash

# Run script for Repair PDF Document C# project

echo "Building and running Repair PDF Document C# project..."

# Build the project
dotnet build

if [ $? -eq 0 ]; then
    echo "Build successful! Running the application..."
    dotnet run
else
    echo "Build failed!"
    exit 1
fi 