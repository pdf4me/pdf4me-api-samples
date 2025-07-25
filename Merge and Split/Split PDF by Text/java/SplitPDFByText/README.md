# Split PDF by Text - Java Implementation

This project demonstrates how to split PDF files by text content using the PDF4Me API with Java.

## ✅ Features

- Split PDF documents by text content detection
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- Configurable split positions (before, after text)
- Multiple file naming options
- Cross-platform compatibility

## Prerequisites

- Java 8 or higher
- PDF4Me API key
- IntelliJ IDEA or Eclipse (recommended)
- Internet connection for API access

## Project Structure

```
SplitPDFByText/
├── src/
│   └── Main.java              # Main application logic
├── README.md                  # This documentation
├── SplitPDFByText.iml         # IntelliJ IDEA project file
├── .gitignore                 # Git ignore file
├── sample.pdf                 # Sample input PDF file
└── sample_text_split_output/  # Output directory for split PDFs
    └── text_split_result.zip  # Generated split PDF archive
```

## Setup

1. **Clone or download this project**
2. **Configure your API key** in `src/Main.java`:
   ```java
   private static final String API_KEY = "your-api-key-here";
   ```
3. **Place your input file** in the project directory:
   - `sample.pdf` - Your PDF file with text content
4. **Compile and run the application**:
   ```bash
   javac -d out src/Main.java
   java -cp out Main
   ```

## Usage

The application will:
1. Read the input PDF file
2. Convert it to Base64
3. Send a request to split the PDF by text content
4. Handle the response (synchronous or asynchronous)
5. Save the split PDF files as a ZIP archive

### Expected Output

```
=== Splitting PDF by Text Content ===
Input PDF file: sample.pdf
Output directory: sample_text_split_output
Text to split by: Chapter
Split position: before
File naming: NameAsPerOrder
Reading and encoding PDF file...
PDF file read successfully: 12345 bytes
Sending split PDF by text request...
Status code: 202
Request accepted. Processing asynchronously...
Polling URL: https://api.pdf4me.com/api/v2/SplitPdfByText/...
Polling attempt 1/10...
PDF splitting completed successfully!
Split PDFs saved to: sample_text_split_output/text_split_result.zip
PDF splitting operation completed successfully!
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/v2/SplitPdfByText
```

## Specific Settings

### Text Splitting Parameters
- **docContent**: Base64 encoded PDF content
- **docName**: Output document name
- **text**: The text string to search for
- **splitTextPage**: Where to split relative to text (before, after)
- **fileNaming**: Naming convention for split files (NameAsPerOrder, NameAsPerText)
- **async**: `true` for asynchronous processing (recommended for large files)

## Implementation Details

### Key Components

1. **File Reading**: Reads PDF file and converts to Base64
2. **Request Building**: Constructs JSON payload with PDF content and text parameters
3. **API Communication**: Sends HTTP POST request to PDF4Me API
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Processing**: Saves the split PDF files as a ZIP archive

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format
- **Polling Timeout**: Handles cases where async processing takes too long

## API Endpoints

### Split PDF by Text
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/SplitPdfByText`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload

```json
{
  "docContent": "base64-encoded-pdf-content",
  "docName": "output.pdf",
  "text": "Chapter",
  "splitTextPage": "before",
  "fileNaming": "NameAsPerOrder",
  "async": true
}
```

## Response Handling

### Success Response (200 OK)
- Returns the split PDF files as a ZIP archive

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
- **Response Processing**: Invalid responses, unexpected status codes
- **Base64 Operations**: Encoding/decoding errors
- **Polling Operations**: Timeout handling for async operations

## Dependencies

- **java.net.http**: HTTP client for API communication (Java 11+)
- **java.util**: JSON handling and utilities
- **java.io**: File operations
- **java.util.Base64**: Base64 encoding/decoding

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
   - Ensure `sample.pdf` exists in the project directory
   - Check file permissions

3. **Network Errors**
   - Verify internet connection
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid PDF Format**
   - Ensure input file is a valid PDF document
   - Check if document is corrupted or password-protected

5. **Text Not Found**
   - Ensure the PDF contains the specified text
   - Verify text matching is case-sensitive
   - Check for exact text matching

6. **Polling Timeout**
   - Large PDFs may take longer to process
   - Increase max retry count if needed
   - Check server status

7. **Java Version Issues**
   - Ensure Java 8 or higher is installed
   - Check JAVA_HOME environment variable
   - Verify Java compiler and runtime versions

### Debug Mode

Enable detailed logging by setting:
```java
private static final boolean DEBUG_MODE = true;
```

## Sample Files

- **sample.pdf**: Sample PDF file with text content
- **text_split_result.zip**: Generated archive containing split PDF files

## Expected Workflow

1. **Input**: PDF document with text content
2. **Processing**: Split PDF at specified text positions
3. **Output**: ZIP archive containing individual PDF files

## Text Configuration Options

### Split Positions
- **before**: Split before the page containing the text
- **after**: Split after the page containing the text

### File Naming Options
- **NameAsPerOrder**: Name files based on their order (1.pdf, 2.pdf, etc.)
- **NameAsPerText**: Name files based on the text content found

## Use Cases

### Document Organization
- Split large documents by chapter headings
- Separate different sections of reports
- Organize invoices by customer names
- Split contracts by section titles

### Content Extraction
- Extract specific chapters from books
- Separate different types of forms
- Split multi-page invoices
- Organize scanned documents by content

### Automation
- Process large batches of documents
- Automate document routing
- Extract specific sections from reports
- Organize scanned documents by content

## Next Steps

- Implement batch processing for multiple files
- Add support for regular expressions
- Integrate with web interface
- Add progress tracking for large files
- Add preview functionality

## Future Enhancements

- **GUI Interface**: Create Swing or JavaFX application
- **Batch Processing**: Handle multiple PDF documents simultaneously
- **Preview Feature**: Show split points before processing
- **Custom Options**: Configure text detection sensitivity
- **Advanced Options**: Support for multiple text patterns in one document
- **Export Options**: Support for different output formats
- **Regular Expressions**: Support for complex text matching patterns
- **Maven/Gradle Integration**: Add proper dependency management

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Java Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 