# Create PDF_A (C#)

A C# sample project for converting regular PDF files to PDF/A format using the PDF4Me API.

## Project Structure

```
Create PDF-A/
├── Program.cs                  # Main application entry point (conversion logic)
├── sample.pdf                  # Sample PDF file for testing
├── sample.pdfa.pdf             # Output PDF/A file (generated)
├── Create_PDF-A.csproj         # .NET project file
├── Create_PDF-A.sln            # Visual Studio solution file
├── global.json                 # .NET SDK version
└── README.md                   # This file
```

## Features

- ✅ Convert PDF files to PDF/A format (various compliance levels)
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Configurable compliance level and conversion options
- ✅ C# async/await implementation with HttpClient

## PDF/A Compliance Levels

- **PDF/A-1b**: Level B basic conformance (most common)
- **PDF/A-1a**: Level A accessible conformance
- **PDF/A-2b**: Part 2 basic compliance
- **PDF/A-2u**: Part 2 with Unicode mapping
- **PDF/A-2a**: Part 2 accessible compliance
- **PDF/A-3b**: Part 3 basic (allows file embedding)
- **PDF/A-3u**: Part 3 with Unicode mapping
- **PDF/A-3a**: Part 3 accessible compliance

## Prerequisites

- .NET 8.0 SDK
- Visual Studio 2022+ (recommended) or `dotnet` CLI
- Internet connection (for PDF4Me API access)
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))

## Setup

1. **Open the project:**
   - Visual Studio: Open `Create_PDF-A.sln`
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

2. **Set the input PDF file and output file (optional):**
   - Edit the `inputPdfPath` and output file logic in `Program.cs` if needed

3. **Set compliance level and options (optional):**
   - Edit the `compliance` field and other payload options in `Program.cs`

4. **Run the application:**
   - Visual Studio: Press F5 or use "Start Debugging"
   - CLI:
     ```bash
     dotnet run
     ```

### Input and Output

- **Input:** PDF file (default: `sample.pdf`)
- **Output:** PDF/A file (default: `sample.pdfa.pdf`)

## Configuration

- **API Key:** Set in `Program.cs` (`API_KEY` constant)
- **API Endpoint:** `https://api.pdf4me.com/api/v2/PdfA`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF file
  - `docName`: Output file name
  - `compliance`: PDF/A compliance level (e.g., "PdfA1b")
  - `allowUpgrade`: true/false
  - `allowDowngrade`: true/false
  - `async`: true/false (async recommended for large/complex files)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/PdfA`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: PDF/A file (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Error Handling

- File not found or unsupported format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Invalid PDF response detection
- Compliance conversion errors
- Network connectivity issues

## Troubleshooting

### Common Issues

1. **"Input PDF file not found"**
   - Ensure `sample.pdf` exists in the project directory
   - Check file path in code

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the PDF file is valid and supported

3. **"Polling timeout"**
   - Large/complex documents may take longer
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