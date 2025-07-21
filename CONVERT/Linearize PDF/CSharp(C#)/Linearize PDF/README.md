# Linearize PDF (C#)

A C# sample project for linearizing PDF documents (optimizing for web viewing) using the PDF4Me API.

## Project Structure

```
Linearize PDF/
├── Program.cs                  # Main application entry point (linearization logic)
├── sample.pdf                  # Sample PDF file for testing
├── sample.linearized.pdf       # Output linearized PDF (generated)
├── Linearize_PDF.csproj        # .NET project file
├── Linearize_PDF.sln           # Visual Studio solution file
├── global.json                 # .NET SDK version
└── README.md                   # This file
```

## Features

- ✅ Linearize PDF for fast web viewing and progressive display
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Configurable optimization profiles (web, print, max compression, etc.)
- ✅ C# async/await implementation with HttpClient

## What PDF Linearization Does

- **Faster Loading**: Optimizes PDF structure for quick web display
- **Progressive Rendering**: Pages display as they download
- **Web Streaming**: Enables streaming PDF viewing in browsers
- **Reduced Bandwidth**: Optimizes file size for web delivery
- **Better Performance**: Improves loading times for large PDFs

## Prerequisites

- .NET 8.0 SDK
- Visual Studio 2022+ (recommended) or `dotnet` CLI
- Internet connection (for PDF4Me API access)
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))

## Setup

1. **Open the project:**
   - Visual Studio: Open `Linearize_PDF.sln`
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

3. **Set optimization profile (optional):**
   - Edit the `optimizeProfile` field in the payload in `Program.cs` (e.g., "web", "Max", "Print", etc.)

4. **Run the application:**
   - Visual Studio: Press F5 or use "Start Debugging"
   - CLI:
     ```bash
     dotnet run
     ```

### Input and Output

- **Input:** PDF file (default: `sample.pdf`)
- **Output:** Linearized PDF file (default: `sample.linearized.pdf`)

## Configuration

- **API Key:** Set in `Program.cs` (`API_KEY` constant)
- **API Endpoint:** `https://api.pdf4me.com/api/v2/LinearizePdf`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF file
  - `docName`: Output file name
  - `optimizeProfile`: "web", "Max", "Print", "Default", "WebMax", "PrintMax", "PrintGray", "Compress", "CompressMax"
  - `async`: true/false (async recommended for large/complex files)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/LinearizePdf`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Linearized PDF file (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Error Handling

- File not found or unsupported format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Invalid PDF response detection
- Linearization conversion errors
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