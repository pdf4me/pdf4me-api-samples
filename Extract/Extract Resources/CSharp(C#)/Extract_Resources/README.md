# Extract Resources from PDF - C#

Extract text content and embedded images from PDF documents using the PDF4me API in C#. This tool supports both synchronous and asynchronous processing with automatic retry logic.

## Features

- Extract all text content from PDF documents
- Extract embedded images from PDF files
- Asynchronous processing with polling
- Multiple output formats (text, images, JSON)
- Comprehensive error handling and logging

## Prerequisites

- **.NET 8.0 SDK**
- **Visual Studio 2022+** (recommended) or `dotnet` CLI
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **A PDF file** for testing

## Project Structure

```
Extract Resources/CSharp(C#)/Extract_Resources/
├── Program.cs                          # Main application entry point
├── sample.pdf                          # Input PDF file
├── resource_extraction_result.json      # Output JSON with extraction results
├── Extract_Resources.csproj             # .NET project file
├── Extract_Resources.sln                # Visual Studio solution file
├── global.json                          # .NET global config
└── README.md                            # This file
```

## Quick Start

1. **Open the project:**
   - Visual Studio: Open `Extract_Resources.sln`
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

Edit the constants or variables in `Program.cs` to set your API key and file paths.

## Output

The application creates a `resource_extraction_result.json` file and may output extracted text and images to additional files or folders as configured.

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