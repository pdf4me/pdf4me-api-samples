# Convert URL To PDF (C#)

A C# sample project for converting web URLs to PDF documents using the PDF4Me API.

## Project Structure

```
Convert Url to PDF/
├── Program.cs                  # Main application entry point (conversion logic)
├── sample.pdf                  # Sample PDF (used as template, optional)
├── sample.url2pdf.pdf          # Output PDF (generated)
├── Convert_Url_to_PDF.csproj   # .NET project file
├── Convert_Url_to_PDF.sln      # Visual Studio solution file
├── global.json                 # .NET SDK version
└── README.md                   # This file
```

## Features

- ✅ Convert web URLs to PDF with preserved styling and layout
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Configurable page settings (size, orientation, margins, background, headers/footers)
- ✅ C# async/await implementation with HttpClient

## Prerequisites

- .NET 8.0 SDK
- Visual Studio 2022+ (recommended) or `dotnet` CLI
- Internet connection (for PDF4Me API access)
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))

## Setup

1. **Open the project:**
   - Visual Studio: Open `Convert_Url_to_PDF.sln`
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

2. **Set the target URL and output file (optional):**
   - Edit the `webUrl` field in the payload inside `ConvertUrlToPdfAsync()`
   - Change output file name by editing `_outputPdfPath` logic if needed

3. **Run the application:**
   - Visual Studio: Press F5 or use "Start Debugging"
   - CLI:
     ```bash
     dotnet run
     ```

### Input and Output

- **Input:** Web URL (set in code)
- **Output:** PDF file (saved as `sample.url2pdf.pdf` by default)

## Configuration

- **API Key:** Set in `Program.cs` (`API_KEY` constant)
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ConvertUrlToPdf`
- **Payload Options:**
  - `webUrl`: Target web page URL
  - `authType`: Authentication type (NoAuth, Basic, etc.)
  - `layout`: "portrait" or "landscape"
  - `format`: "A4", "Letter", etc.
  - `scale`: 0.1–2.0 (scaling factor)
  - `topMargin`, `leftMargin`, `rightMargin`, `bottomMargin`: Margins (e.g., "20px")
  - `printBackground`: true/false
  - `displayHeaderFooter`: true/false
  - `async`: true/false (async recommended for large/complex pages)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ConvertUrlToPdf`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: PDF file (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Error Handling

- Invalid URL or inaccessible web page
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Invalid PDF response detection
- Network connectivity issues

## Troubleshooting

### Common Issues

1. **"Input PDF file not found"**
   - Ensure `sample.pdf` exists if used as a template (optional)
   - Check file path in code

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the target URL is valid and accessible

3. **"Polling timeout"**
   - Large/complex web pages may take longer
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