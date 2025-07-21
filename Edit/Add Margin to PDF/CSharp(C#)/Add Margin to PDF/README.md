# Add Margin to PDF - C#

Add custom margins to PDF documents using the PDF4me API in C#. This tool allows you to modify the margins of any PDF document and automatically adjusts the page size to accommodate the new margins.

## Features

- Add customizable margins to PDF documents (top, bottom, left, right)
- Configurable margin sizes in millimeters
- Asynchronous processing with retry logic
- Comprehensive error handling and logging
- Handles both synchronous and asynchronous API responses

## Prerequisites

- **.NET 8.0 SDK**
- **Visual Studio 2022+** (recommended) or `dotnet` CLI
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **A PDF file** for testing

## Project Structure

```
Add Margin to PDF/CSharp(C#)/Add Margin to PDF/
├── Program.cs                      # Main application entry point
├── sample.pdf                      # Input PDF file
├── sample.with_margins.pdf         # Output PDF with margins (generated)
├── Add_Margin_to_PDF.csproj        # .NET project file
├── Add_Margin_to_PDF.sln           # Visual Studio solution file
└── README.md                       # This file
```

## Quick Start

1. **Open the project:**
   - Visual Studio: Open `Add_Margin_to_PDF.sln`
   - CLI: Navigate to the project directory
2. **Restore dependencies:**
   - Visual Studio: Restore happens automatically
   - CLI: `dotnet restore`
3. **Build the project:**
   - Visual Studio: Build Solution
   - CLI: `dotnet build`
4. **Configure your API key and margin values:**
   - Open `Program.cs` and set your PDF4me API key and margin values
5. **Place your PDF file** in the directory (default: `sample.pdf`)
6. **Run the application:**
   - Visual Studio: Press F5 or use "Start Debugging"
   - CLI:
     ```bash
     dotnet run
     ```

## Configuration

Edit the constants or variables in `Program.cs` to set your API key and margin values.

## Output

The processed PDF with margins will be saved as `sample.with_margins.pdf` in the same directory.

## Error Handling

- File validation for input PDF
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses

## Troubleshooting

- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure `sample.pdf` exists
- **API request failed**: Check internet connection and API status
- **Processing timeout**: Large files may take longer to process

## License

MIT License - see project root for details 