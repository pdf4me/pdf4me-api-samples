# Convert VISIO (C#)

A C# sample project for converting Microsoft Visio files (.vsdx, .vsd, .vsdm) to PDF using the PDF4Me API.

## Project Structure

```
Convert VISIO/
├── Program.cs                  # Main application entry point (conversion logic)
├── sample.vsdx                 # Sample Visio file for testing
├── sample.pdf                  # Output PDF (generated)
├── Convert_VISIO.csproj        # .NET project file
├── Convert_VISIO.sln           # Visual Studio solution file
├── global.json                 # .NET SDK version
└── README.md                   # This file
```

## Features

- ✅ Convert Visio files (.vsdx, .vsd, .vsdm) to PDF
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Configurable output options (page range, hidden pages, toolbar, auto-fit)
- ✅ C# async/await implementation with HttpClient

## Prerequisites

- .NET 8.0 SDK
- Visual Studio 2022+ (recommended) or `dotnet` CLI
- Internet connection (for PDF4Me API access)
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))

## Setup

1. **Open the project:**
   - Visual Studio: Open `Convert_VISIO.sln`
   - CLI: Navigate to the project directory

2. **Restore dependencies:**
   - Visual Studio: Restore happens automatically
   - CLI: `dotnet restore`

3. **Build the project:**
   - Visual Studio: Build Solution
   - CLI: `dotnet build`

## Usage

### Running the Application

1. **Configure your API key:**
   - Open `Program.cs`
   - Replace the placeholder in `API_KEY` with your actual PDF4Me API key

2. **Set the input Visio file and output file (optional):**
   - Edit the `inputVisioPath` and output file logic in `Program.cs` if needed

3. **Run the application:**
   - Visual Studio: Press F5 or use "Start Debugging"
   - CLI:
     ```bash
     dotnet run
     ```

### Input and Output

- **Input:** Visio file (default: `sample.vsdx`)
- **Output:** PDF file (default: `sample.pdf`)

## Configuration

- **API Key:** Set in `Program.cs` (`API_KEY` constant)
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ConvertVisio?schemaVal=PDF`
- **Payload Options:**
  - `docContent`: Base64 encoded Visio file
  - `docName`: Output file name
  - `OutputFormat`: "PDF" (default), can also use "JPG", "PNG", "TIFF"
  - `IsPdfCompliant`: true/false
  - `PageIndex`: Starting page (0-indexed)
  - `PageCount`: Number of pages to convert
  - `IncludeHiddenPages`: true/false
  - `SaveForegroundPage`: true/false
  - `SaveToolBar`: true/false
  - `AutoFit`: true/false
  - `async`: true/false (async recommended for large/complex files)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ConvertVisio?schemaVal=PDF`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: PDF file (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Error Handling

- File not found or unsupported format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Invalid PDF response detection
- Network connectivity issues

## Troubleshooting

### Common Issues

1. **"Input Visio file not found"**
   - Ensure `sample.vsdx` exists in the project directory
   - Check file path in code

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the Visio file is valid and supported

3. **"Polling timeout"**
   - Large/complex diagrams may take longer
   - Increase retry count or delay in code if needed

4. **"No PDF data found in response"**
   - API may have returned an error message
   - Check the full response for details

### Debugging

- Use `Console.WriteLine` statements in `Program.cs` for additional output
- Check exception messages for details

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For C#/.NET issues, consult [Microsoft Docs](https://docs.microsoft.com/dotnet/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 