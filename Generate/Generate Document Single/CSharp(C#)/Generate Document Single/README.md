# Generate Document Single - C# Implementation

This project demonstrates how to generate single documents using the PDF4Me API with C#. It combines HTML templates with JSON data to create customized documents.

## ✅ Features

- Generate documents from HTML, Word, and PDF templates
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- Multiple output formats (HTML, PDF, DOCX)
- Dynamic data integration with JSON

## Prerequisites

- .NET Framework 4.7.2 or higher / .NET Core 2.1 or higher
- PDF4Me API key
- Visual Studio 2019 or later (recommended)
- Internet connection for API access

## Project Structure

```
Generate Document Single/
├── Program.cs                 # Main application logic
├── README.md                  # This documentation
├── invoice_sample.html        # Sample HTML template file
├── invoice_sample_data.json   # Sample JSON data file
├── invoice_sample.docx        # Sample Word template file
├── sample_data_word.json      # Sample Word data file
└── generated-output-html.pdf  # Generated output file
```

## Setup

1. **Clone or download this project**
2. **Configure your API key** in `Program.cs`:
   ```csharp
   public static readonly string API_KEY = "your-api-key-here";
   ```
3. **Place your template and data files** in the project directory
4. **Run the application**:
   ```bash
   dotnet run
   ```

## Usage

The application will:
1. Read the template file (HTML, Word, or PDF)
2. Read the JSON data file
3. Convert both to Base64
4. Send a request to generate the document
5. Handle the response (synchronous or asynchronous)
6. Save the generated document

### Expected Output

```
=== Generating Single Document ===
Generated document saved to: invoice_sample.generated.html
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/v2/GenerateDocumentSingle
```

## Specific Settings

### Template Types
- **HTML**: `"html"` - HTML template files (.html, .htm)
- **Word**: `"Word"` - Microsoft Word documents (.docx, .doc)
- **PDF**: `"PDF"` - PDF template files (.pdf)

### Output Types
- **HTML**: `"html"` - Web page format
- **Word**: `"Word"` - Microsoft Word document
- **PDF**: `"PDF"` - Portable Document Format

### Data Types
- **Text**: `"text"` - JSON or XML data as text
- **File**: `"file"` - Data file (Base64 encoded)

## Implementation Details

### Key Components

1. **File Reading**: Reads template and data files and converts to Base64
2. **Request Building**: Constructs JSON payload with template and data
3. **API Communication**: Sends HTTP POST request to PDF4Me API
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Download**: Downloads generated document and saves to local file system

### Error Handling

- **File Not Found**: Handles missing template or data files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format

## API Endpoints

### Generate Document Single
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/GenerateDocumentSingle`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload

```json
{
  "templateFileType": "html",
  "templateFileName": "invoice_template.html",
  "templateFileData": "base64-encoded-template-content",
  "documentDataType": "text",
  "outputType": "html",
  "documentDataText": "json-data-content",
  "async": true
}
```

## Response Handling

### Success Response (200 OK)
```json
{
  "document": {
    "docData": "base64-encoded-generated-document"
  }
}
```

### Asynchronous Response (202 Accepted)
```json
{
  "jobId": "job-12345",
  "status": "Accepted"
}
```

## Error Handling

The application includes comprehensive error handling for:

- **File Operations**: Missing files, permission issues
- **API Communication**: Network errors, timeouts
- **Response Processing**: Invalid JSON, unexpected status codes
- **Base64 Operations**: Encoding/decoding errors

## Dependencies

- **System.Net.Http**: HTTP client for API communication
- **System.Text.Json**: JSON serialization/deserialization
- **System.IO**: File operations
- **System.Text**: Base64 encoding/decoding

## Security Considerations

- **API Key Protection**: Store API keys securely, not in source code
- **File Validation**: Validate input files before processing
- **Error Information**: Avoid exposing sensitive information in error messages
- **HTTPS**: All API communications use HTTPS

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify your API key is correct
   - Check if the key has necessary permissions

2. **File Not Found**
   - Ensure template and data files exist in the project directory
   - Check file permissions

3. **Network Errors**
   - Verify internet connection
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid Template Format**
   - Ensure template file is in correct format (HTML, Word, PDF)
   - Check if template contains valid placeholders

5. **Invalid JSON Data**
   - Validate JSON data format
   - Ensure JSON matches template placeholders

### Debug Mode

Enable detailed logging by setting:
```csharp
private const bool DEBUG_MODE = true;
```

## Sample Files

- **invoice_sample.html**: HTML template with placeholders
- **invoice_sample_data.json**: Sample JSON data for HTML template
- **invoice_sample.docx**: Word template alternative
- **sample_data_word.json**: Alternative JSON data format

## Expected Workflow

1. **Input**: Template file (HTML/Word/PDF) + JSON data file
2. **Processing**: Merge template with data using PDF4Me API
3. **Output**: Generated document in same format as template

## Next Steps

- Implement batch processing for multiple documents
- Add support for more template formats
- Integrate with web interface
- Add progress tracking for large files

## Future Enhancements

- **GUI Interface**: Create Windows Forms or WPF application
- **Batch Processing**: Handle multiple documents simultaneously
- **Preview Feature**: Show document preview before generation
- **Template Editor**: Built-in template editing capabilities
- **Advanced Options**: Support for complex data structures

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **C# Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 