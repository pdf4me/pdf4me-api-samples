@echo off
setlocal enabledelayedexpansion

REM PDF4ME API Samples Runner Script for Windows
REM This script helps you run all the sample projects

echo 🚀 PDF4ME API Samples Runner
echo ==============================

REM Check if API key is set
if "%PDF4ME_API_KEY%"=="" (
    echo ❌ Error: PDF4ME_API_KEY environment variable is not set
    echo.
    echo Please set your API key:
    echo set PDF4ME_API_KEY=your_api_key_here
    echo.
    echo Get your free API key from: https://dev.pdf4me.com/dashboard/#/api-keys/
    pause
    exit /b 1
)

echo ✅ API Key is configured
echo.

REM Check prerequisites
echo 🔍 Checking prerequisites...

REM Check for .NET
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo ❌ .NET SDK not found. Please install .NET 8.0 SDK
    pause
    exit /b 1
)

REM Check for Java
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java not found. Please install Java 11 or higher
    pause
    exit /b 1
)

REM Check for Java compiler
javac -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java compiler not found. Please install Java Development Kit (JDK)
    pause
    exit /b 1
)

echo ✅ All prerequisites are met
echo.

REM Get the script directory
set "SCRIPT_DIR=%~dp0"

REM Run C# samples
echo 🔧 Running C# Samples
echo =====================

REM Add Form Fields to PDF
echo 📁 Running C# sample: Add Form Fields to PDF
set "PROJECT_PATH=%SCRIPT_DIR%Forms\Add Form Fields To PDF\CSharp(C#)\Add Form Fields To PDF"
if not exist "%PROJECT_PATH%" (
    echo    ❌ Project directory not found
    goto :continue
)

if not exist "%PROJECT_PATH%\sample.pdf" (
    echo    ❌ sample.pdf not found in project directory
    goto :continue
)

cd /d "%PROJECT_PATH%"
echo    🔨 Building project...
dotnet build --no-restore --verbosity quiet
echo    ▶️  Running project...
dotnet run --no-build
echo    ✅ Completed: Add Form Fields to PDF
echo.

:continue

REM Fill a PDF Form
echo 📁 Running C# sample: Fill a PDF Form
set "PROJECT_PATH=%SCRIPT_DIR%Forms\Fill a PDF Form\CSharp(C#)\Fill a PDF Form"
if not exist "%PROJECT_PATH%" (
    echo    ❌ Project directory not found
    goto :continue2
)

if not exist "%PROJECT_PATH%\sample.pdf" (
    echo    ❌ sample.pdf not found in project directory
    goto :continue2
)

cd /d "%PROJECT_PATH%"
echo    🔨 Building project...
dotnet build --no-restore --verbosity quiet
echo    ▶️  Running project...
dotnet run --no-build
echo    ✅ Completed: Fill a PDF Form
echo.

:continue2

REM Run Java samples
echo ☕ Running Java Samples
echo ======================

REM Add Form Fields to PDF (Java)
echo 📁 Running Java sample: Add Form Fields to PDF
set "PROJECT_PATH=%SCRIPT_DIR%Forms\Add Form Fields To PDF\Java\Add_Form_Fields_To_PDF"
if not exist "%PROJECT_PATH%" (
    echo    ❌ Project directory not found
    goto :continue3
)

if not exist "%PROJECT_PATH%\sample.pdf" (
    echo    ❌ sample.pdf not found in project directory
    goto :continue3
)

cd /d "%PROJECT_PATH%"
echo    🔨 Compiling project...
javac -d . src\Main.java
echo    ▶️  Running project...
java Main
echo    ✅ Completed: Add Form Fields to PDF
echo.

:continue3

REM Fill a PDF Form (Java)
echo 📁 Running Java sample: Fill a PDF Form
set "PROJECT_PATH=%SCRIPT_DIR%Forms\Fill a PDF Form\Java\Fill_A_PDF_Form"
if not exist "%PROJECT_PATH%" (
    echo    ❌ Project directory not found
    goto :continue4
)

if not exist "%PROJECT_PATH%\sample.pdf" (
    echo    ❌ sample.pdf not found in project directory
    goto :continue4
)

cd /d "%PROJECT_PATH%"
echo    🔨 Compiling project...
javac -d . src\Main.java
echo    ▶️  Running project...
java Main
echo    ✅ Completed: Fill a PDF Form
echo.

:continue4

echo 🎉 All samples completed successfully!
echo.
echo 📁 Check the output files in each project directory:
echo    - sample.withformfield.pdf (Add Form Fields output)
echo    - sample.filled.pdf (Fill Form output)
echo.
pause 