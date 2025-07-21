# Add HTML Header Footer to PDF - C#

Add custom HTML headers and footers to PDF documents using the PDF4me API in C#. This tool allows you to add styled HTML content as headers, footers, or both, with support for dynamic content and page selection.

## Features

- Add HTML content as headers, footers, or both to PDF documents
- Support for dynamic content (page numbers, dates)
- Configurable page selection and margins
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
Add HTML Header Footer to PDF/CSharp(C#)/Add HTML Header Footer to PDF/
├── Program.cs                              # Main application entry point
├── sample.pdf                              # Input PDF file
├── sample.with_html_header_footer.pdf      # Output PDF with HTML header/footer (generated)
├── Add_HTML_Header_Footer_to_PDF.csproj    # .NET project file
├── Add_HTML_Header_Footer_to_PDF.sln       # Visual Studio solution file
└── README.md                               # This file
```

## Quick Start

1. **Open the project:**
   - Visual Studio: Open `Add_HTML_Header_Footer_to_PDF.sln`
   - CLI: Navigate to the project directory
2. **Restore dependencies:**
   - Visual Studio: Restore happens automatically
   - CLI: `dotnet restore`
3. **Build the project:**
   - Visual Studio: Build Solution
   - CLI: `dotnet build`
4. **Configure your API key and HTML content:**
   - Open `Program.cs` and set your PDF4me API key and HTML content
5. **Place your PDF file** in the directory (default: `sample.pdf`)
6. **Run the application:**
   - Visual Studio: Press F5 or use "Start Debugging"
   - CLI:
     ```bash
     dotnet run
     ```

## Configuration

Edit the constants or variables in `Program.cs` to set your API key, PDF file path, and HTML content.

## Output

The processed PDF with HTML header/footer will be saved as `sample.with_html_header_footer.pdf` in the same directory.

## Error Handling

- File validation for input PDF
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses

## Troubleshooting

- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure `sample.pdf` exists
- **API request failed**: Check internet connection and API status
- **HTML rendering issues**: Check HTML syntax and CSS
- **Processing timeout**: Large files may take longer to process

## License

MIT License - see project root for details 