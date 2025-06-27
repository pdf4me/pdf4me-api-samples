#!/bin/bash

# PDF4ME API Samples Runner Script
# This script helps you run all the sample projects

set -e  # Exit on any error

echo "🚀 PDF4ME API Samples Runner"
echo "=============================="

# Check if API key is set
if [ -z "$PDF4ME_API_KEY" ]; then
    echo "❌ Error: PDF4ME_API_KEY environment variable is not set"
    echo ""
    echo "Please set your API key:"
    echo "export PDF4ME_API_KEY=your_api_key_here"
    echo ""
    echo "Get your free API key from: https://dev.pdf4me.com/dashboard/#/api-keys/"
    exit 1
fi

echo "✅ API Key is configured"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists dotnet; then
    echo "❌ .NET SDK not found. Please install .NET 8.0 SDK"
    exit 1
fi

if ! command_exists java; then
    echo "❌ Java not found. Please install Java 11 or higher"
    exit 1
fi

if ! command_exists javac; then
    echo "❌ Java compiler not found. Please install Java Development Kit (JDK)"
    exit 1
fi

echo "✅ All prerequisites are met"
echo ""

# Function to run C# sample
run_csharp_sample() {
    local project_path="$1"
    local project_name="$2"
    
    echo "📁 Running C# sample: $project_name"
    echo "   Path: $project_path"
    
    if [ ! -d "$project_path" ]; then
        echo "   ❌ Project directory not found"
        return 1
    fi
    
    cd "$project_path"
    
    if [ ! -f "sample.pdf" ]; then
        echo "   ❌ sample.pdf not found in project directory"
        return 1
    fi
    
    echo "   🔨 Building project..."
    dotnet build --no-restore --verbosity quiet
    
    echo "   ▶️  Running project..."
    dotnet run --no-build
    
    echo "   ✅ Completed: $project_name"
    echo ""
}

# Function to run Java sample
run_java_sample() {
    local project_path="$1"
    local project_name="$2"
    
    echo "📁 Running Java sample: $project_name"
    echo "   Path: $project_path"
    
    if [ ! -d "$project_path" ]; then
        echo "   ❌ Project directory not found"
        return 1
    fi
    
    cd "$project_path"
    
    if [ ! -f "sample.pdf" ]; then
        echo "   ❌ sample.pdf not found in project directory"
        return 1
    fi
    
    echo "   🔨 Compiling project..."
    javac -d . src/Main.java
    
    echo "   ▶️  Running project..."
    java Main
    
    echo "   ✅ Completed: $project_name"
    echo ""
}

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run C# samples
echo "🔧 Running C# Samples"
echo "====================="

run_csharp_sample "$SCRIPT_DIR/Forms/Add Form Fields To PDF/CSharp(C#)/Add Form Fields To PDF" "Add Form Fields to PDF"
run_csharp_sample "$SCRIPT_DIR/Forms/Fill a PDF Form/CSharp(C#)/Fill a PDF Form" "Fill a PDF Form"

# Run Java samples
echo "☕ Running Java Samples"
echo "======================"

run_java_sample "$SCRIPT_DIR/Forms/Add Form Fields To PDF/Java/Add_Form_Fields_To_PDF" "Add Form Fields to PDF"
run_java_sample "$SCRIPT_DIR/Forms/Fill a PDF Form/Java/Fill_A_PDF_Form" "Fill a PDF Form"

echo "🎉 All samples completed successfully!"
echo ""
echo "📁 Check the output files in each project directory:"
echo "   - sample.withformfield.pdf (Add Form Fields output)"
echo "   - sample.filled.pdf (Fill Form output)" 