# PDF4ME API Samples

This repository contains sample code demonstrating how to use the PDF4ME API for PDF manipulation tasks. The samples are available in both C# (.NET) and Java.

## 📋 Prerequisites

Before running these samples, you need:

1. **PDF4ME API Key**: Get your free API key from [PDF4ME Developer Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
2. **.NET 8.0 SDK** (for C# samples)
3. **Java 11 or higher** (for Java samples)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/pdf4me-api-samples.git
cd pdf4me-api-samples
```

### 2. Configure API Key

**📖 For detailed configuration instructions, see [CONFIGURATION.md](CONFIGURATION.md)**

#### Option A: Environment Variable (Recommended)
Set your API key as an environment variable:

**Windows:**
```cmd
set PDF4ME_API_KEY=your_api_key_here
```

**macOS/Linux:**
```bash
export PDF4ME_API_KEY=your_api_key_here
```

#### Option B: Direct Code Modification
Edit the API key in the respective files:
- C#: Update `API_KEY` constant in `Program.cs` files
- Java: Update `API_KEY` constant in `Main.java` files

### 3. Run the Samples

#### 🎯 Quick Run (All Samples)
Use the provided scripts to run all samples at once:

**macOS/Linux:**
```bash
./run-samples.sh
```

**Windows:**
```cmd
run-samples.bat
```

#### Individual Samples

**C# Samples:**

**Add Form Fields to PDF:**
```bash
cd "Forms/Add Form Fields To PDF/CSharp(C#)/Add Form Fields To PDF"
dotnet run
```

**Fill a PDF Form:**
```bash
cd "Forms/Fill a PDF Form/CSharp(C#)/Fill a PDF Form"
dotnet run
```

**Java Samples:**

**Add Form Fields to PDF:**
```bash
cd "Forms/Add Form Fields To PDF/Java/Add_Form_Fields_To_PDF"
javac -d . src/Main.java
java Main
```

**Fill a PDF Form:**
```bash
cd "Forms/Fill a PDF Form/Java/Fill_A_PDF_Form"
javac -d . src/Main.java
java Main
```

## 📁 Project Structure

```
pdf4me-api-samples/
├── Forms/
│   ├── Add Form Fields To PDF/
│   │   ├── CSharp(C#)/
│   │   │   └── Add Form Fields To PDF/
│   │   │       ├── Program.cs
│   │   │       ├── sample.pdf
│   │   │       └── sample.withformfield.pdf (output)
│   │   └── Java/
│   │       └── Add_Form_Fields_To_PDF/
│   │           ├── src/Main.java
│   │           └── sample.pdf
│   └── Fill a PDF Form/
│       ├── CSharp(C#)/
│       │   └── Fill a PDF Form/
│       │       ├── Program.cs
│       │       ├── sample.pdf
│       │       └── sample.filled.pdf (output)
│       └── Java/
│           └── Fill_A_PDF_Form/
│               ├── src/Main.java
│               └── sample.pdf
├── run-samples.sh          # macOS/Linux runner script
├── run-samples.bat         # Windows runner script
├── CONFIGURATION.md        # Detailed configuration guide
└── README.md
```

## 🔧 Features

### Add Form Fields to PDF
- Adds text input fields to existing PDF documents
- Configurable field position, size, and properties
- Supports both synchronous and asynchronous processing

### Fill a PDF Form
- Fills existing PDF forms with data
- Supports JSON data input
- Handles both immediate and asynchronous responses

## 🛠️ Troubleshooting

### Common Issues

1. **API Key Error**: Make sure you've set a valid API key
2. **File Not Found**: Ensure `sample.pdf` exists in the project directory
3. **Network Issues**: Check your internet connection and firewall settings
4. **Java Version**: Ensure you're using Java 11 or higher

### Error Messages

- `"PDF file not found"`: The sample.pdf file is missing from the project directory
- `"API key not configured"`: Set your PDF4ME API key
- `"Network timeout"`: Check your internet connection

**📖 For detailed troubleshooting, see [CONFIGURATION.md](CONFIGURATION.md)**

## 📝 API Documentation

For detailed API documentation, visit:
- [PDF4ME API Documentation](https://dev.pdf4me.com/docs/)
- [API Reference](https://dev.pdf4me.com/docs/api-reference/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the [CONFIGURATION.md](CONFIGURATION.md) guide
3. Review the PDF4ME API documentation
4. Create an issue in this repository
5. Contact PDF4ME support at support@pdf4me.com