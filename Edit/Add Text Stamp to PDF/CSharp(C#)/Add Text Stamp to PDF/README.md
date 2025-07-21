# PDF Text Stamp - C#

Add text stamps/watermarks to PDF documents using the PDF4me API in C#. This application allows you to add customizable text watermarks to PDF documents for authorization and piracy prevention.

## Features

- Add text stamps/watermarks to PDF documents
- Customizable text content, font, size, color, and positioning
- Support for rotation and opacity settings
- Background/foreground placement options
- Handles both synchronous and asynchronous API responses
- Automatic polling for async operations
- Comprehensive error handling and logging

## Prerequisites

- **.NET 8.0 SDK**
- **Visual Studio 2022+** (recommended) or `dotnet` CLI
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **A PDF file** for testing

## Project Structure

```
Add Text Stamp to PDF/CSharp(C#)/Add Text Stamp to PDF/
├── Program.cs                      # Main application entry point
├── sample.pdf                      # Input PDF file
├── sample.with_text_stamp.pdf      # Output PDF with text stamp (generated)
├── Add_Text_Stamp_to_PDF.csproj    # .NET project file
├── Add_Text_Stamp_to_PDF.sln       # Visual Studio solution file
└── README.md                       # This file
```

## Quick Start

1. **Open the project:**
   - Visual Studio: Open `Add_Text_Stamp_to_PDF.sln`
   - CLI: Navigate to the project directory
2. **Restore dependencies:**
   - Visual Studio: Restore happens automatically
   - CLI: `dotnet restore`
3. **Build the project:**
   - Visual Studio: Build Solution
   - CLI: `dotnet build`
4. **Configure your API key:**
   - Open `Program.cs` and set your PDF4me API key
5. **Place your PDF file** in the directory (default: `sample.pdf`)
6. **Run the application:**
   - Visual Studio: Press F5 or use "Start Debugging"
   - CLI:
     ```bash
     dotnet run
     ```

## Configuration

Edit the constants or variables in `Program.cs` to set your API key and text stamp options.

## Output

The PDF with text stamp will be saved as `sample.with_text_stamp.pdf` in the same directory.

## Error Handling

- File validation for input PDF
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses

## Troubleshooting

- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure `sample.pdf` exists
- **API request failed**: Check internet connection and API status

## License

MIT License - see project root for details 