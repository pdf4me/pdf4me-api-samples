# Extract Text from Word (C#)

A C# .NET sample project for extracting text content from Word documents using the PDF4Me API.

## Project Structure

```
Extract_Text_from_word/
├── Program.cs                               # Main program with text extraction logic
├── Extract_Text_from_word.csproj            # Project file with dependencies
├── Extract_Text_from_word.sln               # Solution file
├── global.json                              # .NET SDK configuration
├── sample.docx                              # Sample Word document for testing
├── word_text_extraction_result.json         # Output extraction results (generated)
└── README.md                                # This file
```

## Features

- ✅ Extract text content from Word documents (.docx, .doc)
- ✅ Configurable page range extraction
- ✅ Remove comments, headers, and footers
- ✅ Accept or reject tracked changes
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Base64 encoding for secure document transmission
- ✅ Multiple output formats (TXT, JSON metadata)
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
   - Place your Word file in the project directory
   - Update the `wordPath` variable in `Program.cs` if needed

## Usage

### Method 1: Using Visual Studio

1. **Open the solution:**
   ```bash
   # Open Extract_Text_from_word.sln in Visual Studio
   # Or use command line:
   dotnet open Extract_Text_from_word.sln
   ```

2. **Build and run:**
   ```bash
   dotnet build
   dotnet run
   ```

### Method 2: Using Command Line

1. **Navigate to the project directory:**
   ```bash
   cd Extract_Text_from_word
   ```

2. **Restore dependencies and run:**
   ```bash
   dotnet restore
   dotnet run
   ```

### Input and Output

- **Input:** Word document file (.docx or .doc) (default: `sample.docx`)
- **Output:** 
  - JSON file with extraction results (default: `word_text_extraction_result.json`)
  - Text content extracted from the document

## Configuration

- **API Key:** Set in `Program.cs`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ExtractTextFromWord`
- **Payload Options:**
  - `docContent`: Base64 encoded Word document content
  - `docName`: Name of the input Word file
  - `StartPageNumber`: Starting page number for extraction
  - `EndPageNumber`: Ending page number for extraction
  - `RemoveComments`: true/false (remove comments from text)
  - `RemoveHeaderFooter`: true/false (remove headers and footers)
  - `AcceptChanges`: true/false (accept tracked changes)
  - `async`: true/false (async recommended for large documents)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ExtractTextFromWord`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Extracted text content (JSON or text file)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Response Format

The extraction result can be:

### JSON Response (Structured Data)
- Contains extracted text with page information
- Includes metadata about the extraction process
- Preserves document structure and formatting information

### Text Response (Plain Text)
- Contains extracted text content in plain text format
- Suitable for further processing or analysis

## Extraction Options

### Page Range
- Specify start and end page numbers
- Extract text from specific sections of the document
- Useful for large documents where you only need certain pages

### Content Filtering
- **Remove Comments:** Exclude comment text from extraction
- **Remove Headers/Footers:** Exclude header and footer content
- **Accept Changes:** Include or exclude tracked changes

### Processing Options
- **Synchronous vs Asynchronous:** Choose based on document size
- **Error Handling:** Comprehensive error detection and reporting

## Code Structure

The project consists of two main classes:

### Program Class
- Main entry point
- Configuration setup
- HTTP client initialization

### WordTextExtractor Class
- Core extraction logic
- API communication
- Async operation handling
- Polling mechanism for long-running operations
- Text processing and formatting

## Error Handling

- Missing or invalid Word file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- Invalid page range specifications
- File I/O exceptions during processing

## Troubleshooting

### Common Issues

1. **"Word file not found"**
   - Ensure the Word file exists in the specified path
   - Check file permissions and path correctness

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the Word file is valid and accessible

3. **"Polling timeout"**
   - Large/complex documents may take longer
   - Increase retry count or delay in code if needed

4. **"Invalid page range"**
   - Ensure start page is less than or equal to end page
   - Check that page numbers are within document bounds

5. **"No text extracted"**
   - The document may be empty or contain only images
   - Check if the document has actual text content

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
- `word_text_extraction_result.json`: Contains extracted text and metadata
- Console output with extraction summary and statistics

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For .NET issues, consult [Microsoft .NET Documentation](https://docs.microsoft.com/en-us/dotnet/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 