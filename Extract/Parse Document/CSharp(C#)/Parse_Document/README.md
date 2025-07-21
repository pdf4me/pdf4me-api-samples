# Parse Document (C#)

A C# .NET sample project for parsing and analyzing documents using the PDF4Me API.

## Project Structure

```
Parse_Document/
├── Program.cs                               # Main program with document parsing logic
├── Parse_Document.csproj                    # Project file with dependencies
├── Parse_Document.sln                       # Solution file
├── global.json                              # .NET SDK configuration
├── sample.pdf                               # Sample PDF file for testing
└── README.md                                # This file
```

## Features

- ✅ Parse documents with template-based analysis
- ✅ Extract document type and metadata
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Base64 encoding for secure document transmission
- ✅ Multiple output formats (TXT, JSON metadata)
- ✅ Document type detection and classification
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
   # Open Parse_Document.sln in Visual Studio
   # Or use command line:
   dotnet open Parse_Document.sln
   ```

2. **Build and run:**
   ```bash
   dotnet build
   dotnet run
   ```

### Method 2: Using Command Line

1. **Navigate to the project directory:**
   ```bash
   cd Parse_Document
   ```

2. **Restore dependencies and run:**
   ```bash
   dotnet restore
   dotnet run
   ```

### Input and Output

- **Input:** PDF document file (default: `sample.pdf`)
- **Output:** 
  - Console output with parsing results
  - Structured data extracted from the document

## Configuration

- **API Key:** Set in `Program.cs`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ParseDocument`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF document content
  - `docName`: Source PDF file name with .pdf extension
  - `async`: true/false (async recommended for large documents)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ParseDocument`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Parsing results (JSON)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Response Format

The parsing result includes:
- `documentType`: Type/category of the document
- `pageCount`: Number of pages in the document
- `parsedData`: Structured data extracted from the document
- `confidence`: Confidence score for the parsing results
- `templateId`: Template identifier used for parsing
- Additional metadata and extracted fields

## Parsing Capabilities

### Document Type Detection
- Automatically identifies document types
- Classifies documents based on content and structure
- Supports various document categories

### Data Extraction
- Extracts structured data from documents
- Identifies key fields and values
- Preserves document hierarchy and relationships

### Template-Based Parsing
- Uses predefined templates for consistent extraction
- Supports custom template configurations
- Provides confidence scores for extracted data

## Code Structure

The project consists of two main classes:

### Program Class
- Main entry point
- Configuration setup
- HTTP client initialization

### DocumentParser Class
- Core parsing logic
- API communication
- Async operation handling
- Polling mechanism for long-running operations
- Data processing and formatting

## Error Handling

- Missing or invalid PDF file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- Invalid parsing response detection
- File I/O exceptions during processing

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

4. **"No parsing data found"**
   - The document may not be recognized by any template
   - Check if the document format is supported

5. **"Low confidence parsing"**
   - The document may not match expected templates well
   - Consider using different parsing options

### Debugging

- Use Visual Studio debugger or add console output
- Check exception messages in the console
- Review the generated output
- Enable detailed logging in the code

## Dependencies

The project uses the following NuGet packages:
- `DocumentFormat.OpenXml` (3.0.1) - For document processing capabilities

## Build Configuration

- **Target Framework:** .NET 8.0
- **Output Type:** Console Application
- **Implicit Usings:** Enabled
- **Nullable Reference Types:** Enabled

## Use Cases

### Document Processing
- Invoice and receipt processing
- Form data extraction
- Contract analysis
- Report generation

### Data Extraction
- Key-value pair extraction
- Table data extraction
- Header and footer analysis
- Metadata extraction

### Document Classification
- Document type identification
- Content categorization
- Template matching
- Quality assessment

## Output Structure

After successful parsing, you'll find:
- Console output with parsing results and metadata
- Structured data extracted from the document
- Document type and confidence information

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For .NET issues, consult [Microsoft .NET Documentation](https://docs.microsoft.com/en-us/dotnet/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 