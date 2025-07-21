# Extract Attachment From PDF (C#)

A C# .NET sample project for extracting file attachments from PDF documents using the PDF4Me API.

## Project Structure

```
Extract_Attachment_From_PDF/
├── Program.cs                               # Main program with attachment extraction logic
├── Extract_Attachment_From_PDF.csproj       # Project file with dependencies
├── Extract_Attachment_From_PDF.sln          # Solution file
├── global.json                              # .NET SDK configuration
├── sample.pdf                               # Sample PDF file for testing
├── attachment_extraction_result.json        # Output extraction results (generated)
└── README.md                                # This file
```

## Features

- ✅ Extract all file attachments from PDF documents
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Base64 encoding for secure document transmission
- ✅ Multiple output formats (ZIP, individual files, metadata)
- ✅ Automatic ZIP file extraction
- ✅ Metadata preservation for extracted files
- ✅ Modern C# async/await patterns
- ✅ .NET 8.0 compatibility

## Prerequisites

- .NET 8.0 SDK or later
- Visual Studio 2022, VS Code, or any .NET-compatible IDE
- Internet connection (for PDF4Me API access)
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))

## Setup

1. **Install .NET SDK:**
   - Download and install .NET 8.0 SDK from [Microsoft](https://dotnet.microsoft.com/download)

2. **Configure your API key:**
   - Open `Program.cs`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Prepare your document:**
   - Place your PDF file in the project directory
   - Update the `pdfPath` variable in `Program.cs` if needed

## Usage

### Method 1: Using Visual Studio

1. **Open the solution:**
   ```bash
   # Open Extract_Attachment_From_PDF.sln in Visual Studio
   # Or use command line:
   dotnet open Extract_Attachment_From_PDF.sln
   ```

2. **Build and run:**
   ```bash
   dotnet build
   dotnet run
   ```

### Method 2: Using Command Line

1. **Navigate to the project directory:**
   ```bash
   cd Extract_Attachment_From_PDF
   ```

2. **Restore dependencies and run:**
   ```bash
   dotnet restore
   dotnet run
   ```

### Input and Output

- **Input:** PDF document file with embedded attachments (default: `sample.pdf`)
- **Output:** 
  - JSON file with extraction results (default: `attachment_extraction_result.json`)
  - Individual extracted files (if applicable)
  - ZIP archive (if multiple files)

## Configuration

- **API Key:** Set in `Program.cs`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ExtractAttachmentFromPdf`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF document content
  - `docName`: Source PDF file name with .pdf extension
  - `async`: true/false (async recommended for large documents)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ExtractAttachmentFromPdf`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Extracted attachments (ZIP file or JSON metadata)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Response Format

The extraction result can be:

### Binary Response (ZIP file)
- Contains all extracted attachments in a ZIP archive
- Automatically extracted to individual files

### JSON Response (Metadata)
- Contains metadata about extracted attachments
- Includes file names, sizes, and content information
- Individual files are extracted and saved separately

## Extracted File Types

The API can extract various file types including:
- Text files (.txt)
- Images (.jpg, .png, .gif, etc.)
- Documents (.doc, .docx, .pdf, etc.)
- Spreadsheets (.xls, .xlsx, etc.)
- Any other file type embedded in the PDF

## Code Structure

The project consists of two main classes:

### Program Class
- Main entry point
- Configuration setup
- HTTP client initialization

### PdfAttachmentExtractor Class
- Core extraction logic
- API communication
- Async operation handling
- Polling mechanism for long-running operations
- ZIP file processing
- File export functionality

## Error Handling

- Missing or invalid PDF file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- Invalid ZIP file detection
- File I/O exceptions during extraction

## Troubleshooting

### Common Issues

1. **"PDF file not found"**
   - Ensure the PDF file exists in the specified path
   - Check file permissions and path correctness

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the PDF file is valid and accessible

3. **"Polling timeout"**
   - Large/complex documents may take longer
   - Increase retry count or delay in code if needed

4. **"No attachments found"**
   - The PDF may not contain any embedded attachments
   - Check if the PDF actually has file attachments

5. **"ZIP extraction failed"**
   - The response may not be a valid ZIP file
   - Check the response content type and format

### Debugging

- Use Visual Studio debugger or add console output
- Check exception messages in the console
- Review the generated JSON output file
- Enable detailed logging in the code

## Dependencies

The project uses the following NuGet packages:
- `DocumentFormat.OpenXml` (3.0.1) - For document processing capabilities

## Build Configuration

- **Target Framework:** .NET 8.0
- **Output Type:** Console Application
- **Implicit Usings:** Enabled
- **Nullable Reference Types:** Enabled

## Output Structure

After successful extraction, you'll find:
- `attachment_extraction_result.json`: Contains information about all extracted files
- Individual extracted files with their original names (if applicable)
- Any additional metadata provided by the API

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For .NET issues, consult [Microsoft .NET Documentation](https://docs.microsoft.com/en-us/dotnet/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 