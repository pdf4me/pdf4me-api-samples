# PDF Signer - C#

Digitally sign PDF documents with an image using the PDF4me API in C#.

## Features
- Add a signature image to a PDF at a specified position
- Configurable alignment, margins, opacity, and page selection
- Handles both synchronous and asynchronous API responses
- Automatic polling for async operations
- Comprehensive error handling and logging

## Prerequisites
- .NET 8.0 SDK
- Visual Studio 2022+ (recommended) or `dotnet` CLI
- PDF4me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- `sample.pdf` (input PDF) and `sample.png` (signature image) in the project directory

## Project Structure
```
Sign PDF/CSharp(C#)/Sign PDF/
├── Program.cs                  # Main application entry point
├── sample.pdf                  # Input PDF file
├── sample.png                  # Signature image file
├── sample.signed.pdf           # Output signed PDF (generated)
├── Sign_PDF.csproj             # .NET project file
├── Sign_PDF.sln                # Visual Studio solution file
└── README.md                   # This file
```

## Quick Start
1. **Open the project:**
   - Visual Studio: Open `Sign_PDF.sln`
   - CLI: Navigate to the project directory
2. **Restore dependencies:**
   - Visual Studio: Restore happens automatically
   - CLI: `dotnet restore`
3. **Build the project:**
   - Visual Studio: Build Solution
   - CLI: `dotnet build`
4. **Configure your API key:**
   - Open `Program.cs` and set your PDF4me API key
5. **Place your PDF and signature image** in the directory
6. **Run the application:**
   - Visual Studio: Press F5 or use "Start Debugging"
   - CLI:
     ```bash
     dotnet run
     ```

## Configuration
Edit the constants or variables in `Program.cs` to set your API key and signature options.

## Output
The signed PDF will be saved as `sample.signed.pdf` in the same directory.

## Error Handling
- File validation for input PDF and signature image
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses

## Troubleshooting
- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure `sample.pdf` and `sample.png` exist
- **API request failed**: Check internet connection and API status

## License
MIT License - see project root for details 