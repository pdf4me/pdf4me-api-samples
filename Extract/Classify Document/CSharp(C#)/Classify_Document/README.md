# Classify Document (C#)

A C# .NET sample project for classifying and identifying document types using the PDF4Me API.

## Project Structure

```
Classify_Document/
├── Program.cs                           # Main program with document classification logic
├── Classify_Document.csproj             # Project file with dependencies
├── Classify_Document.sln                # Solution file
├── global.json                          # .NET SDK configuration
├── sample.pdf                           # Sample PDF file for testing
├── document_classification_result.json  # Output classification results (generated)
└── README.md                            # This file
```

## Features

- ✅ Classify documents based on content analysis
- ✅ Identify document types and categories automatically
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Base64 encoding for secure document transmission
- ✅ JSON output with detailed classification results
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
   # Open Classify_Document.sln in Visual Studio
   # Or use command line:
   dotnet open Classify_Document.sln
   ```

2. **Build and run:**
   ```bash
   dotnet build
   dotnet run
   ```

### Method 2: Using Command Line

1. **Navigate to the project directory:**
   ```bash
   cd Classify_Document
   ```

2. **Restore dependencies and run:**
   ```bash
   dotnet restore
   dotnet run
   ```

### Input and Output

- **Input:** PDF document file (default: `sample.pdf`)
- **Output:** JSON file with classification results (default: `document_classification_result.json`)

## Configuration

- **API Key:** Set in `Program.cs`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ClassifyDocument`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF document content
  - `docName`: Source PDF file name with .pdf extension
  - `async`: true/false (async recommended for large documents)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ClassifyDocument`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Classification results (JSON)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Response Format

The classification result includes:
- `templateId`: Unique identifier for the document template
- `templateName`: Name of the identified template
- `className`: Document class/category
- `traceId`: Request tracking identifier
- `jobId`: Job identifier (if applicable)
- `statusUrl`: Status polling URL (if applicable)
- `subscriptionUsage`: API usage information

## Code Structure

The project consists of two main classes:

### Program Class
- Main entry point
- Configuration setup
- HTTP client initialization

### DocumentClassifier Class
- Core classification logic
- API communication
- Async operation handling
- Polling mechanism for long-running operations

## Error Handling

- Missing or invalid PDF file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- Invalid JSON response detection
- File I/O exceptions

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

4. **"No classification data found"**
   - API may have returned an error message
   - Check the full response for details

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

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For .NET issues, consult [Microsoft .NET Documentation](https://docs.microsoft.com/en-us/dotnet/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 