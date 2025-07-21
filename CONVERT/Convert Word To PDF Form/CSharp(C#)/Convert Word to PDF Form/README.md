# Convert Word To PDF Form (C#)

A C# sample project for converting Word documents (.docx) to interactive PDF forms using the PDF4Me API.

## Project Structure

```
Convert Word to PDF Form/
├── Program.cs                      # Main application entry point (conversion logic)
├── sample.docx                     # Sample Word document for testing
├── sample.pdf                      # Output PDF form (generated)
├── Convert_Word_to_PDF_Form.csproj # .NET project file
├── Convert_Word_to_PDF_Form.sln    # Visual Studio solution file
├── global.json                     # .NET SDK version
└── README.md                       # This file
```

## Features

- ✅ Convert Word documents (.docx) to PDF forms with fillable fields
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Preserves form fields and document layout
- ✅ C# async/await implementation with HttpClient

## Prerequisites

- .NET 8.0 SDK
- Visual Studio 2022+ (recommended) or `dotnet` CLI
- Internet connection (for PDF4Me API access)
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))

## Setup

1. **Open the project:**
   - Visual Studio: Open `Convert_Word_to_PDF_Form.sln`
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

2. **Set the input Word file and output file (optional):**
   - Edit the `inputWordPath` and output file logic in `Program.cs` if needed

3. **Run the application:**
   - Visual Studio: Press F5 or use "Start Debugging"
   - CLI:
     ```bash
     dotnet run
     ```

### Input and Output

- **Input:** Word document (default: `sample.docx`)
- **Output:** PDF form (default: `sample.pdf`)

## Configuration

- **API Key:** Set in `Program.cs` (`API_KEY` constant)
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ConvertWordToPdfForm`
- **Payload Options:**
  - `docContent`: Base64 encoded Word document
  - `docName`: Output file name
  - `async`: true/false (async recommended for large/complex files)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ConvertWordToPdfForm`
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

1. **"Input Word file not found"**
   - Ensure `sample.docx` exists in the project directory
   - Check file path in code

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the Word file is valid and supported

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