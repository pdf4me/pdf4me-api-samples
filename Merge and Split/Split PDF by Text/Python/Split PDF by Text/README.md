# Split PDF by Text - Python Implementation

This project demonstrates how to split PDF files by text content using the PDF4Me API with Python.

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

- Python 3.7 or higher
- PDF4Me API key
- pip (Python package installer)
- Internet connection for API access

## Project Structure

```
Split PDF by Text/
├── split_pdf_by_text.py       # Main application logic
├── README.md                  # This documentation
├── requirements.txt           # Python dependencies
├── sample.pdf                # Sample input PDF file
└── Split_PDF_Text_outputs/    # Output directory for split PDFs
    ├── sample 1.pdf          # Generated split PDF file
    └── sample 2.pdf          # Generated split PDF file
```

## Setup

1. **Clone or download this project**
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Configure your API key** in `split_pdf_by_text.py`:
   ```python
   API_KEY = "your-api-key-here"
   ```
4. **Place your input file** in the project directory:
   - `sample.pdf` - Your PDF file with text content
5. **Run the application**:
   ```bash
   python split_pdf_by_text.py
   ```

## Usage

The application will:
1. Read the input PDF file
2. Convert it to Base64
3. Send a request to split the PDF by text content
4. Handle the response (synchronous or asynchronous)
5. Save the split PDF files individually

### Expected Output

```
=== Splitting PDF by Text Content ===
Input PDF file: sample.pdf
Output directory: Split_PDF_Text_outputs
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
Split PDFs saved to: Split_PDF_Text_outputs/
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
5. **File Processing**: Saves the split PDF files individually

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
- Returns the split PDF files as individual PDFs

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

- **requests**: HTTP client for API communication
- **json**: JSON serialization/deserialization
- **base64**: Base64 encoding/decoding
- **os**: File operations and path handling
- **time**: Time delays for polling operations

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

7. **Python Version Issues**
   - Ensure Python 3.7 or higher is installed
   - Check Python path and environment
   - Verify pip is installed and working

8. **Dependency Issues**
   - Install required packages: `pip install requests`
   - Check for package conflicts
   - Use virtual environment if needed

### Debug Mode

Enable detailed logging by setting:
```python
DEBUG_MODE = True
```

## Sample Files

- **sample.pdf**: Sample PDF file with text content
- **sample 1.pdf**: Generated split PDF file
- **sample 2.pdf**: Generated split PDF file

## Expected Workflow

1. **Input**: PDF document with text content
2. **Processing**: Split PDF at specified text positions
3. **Output**: Individual PDF files for each split section

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

### Academic and Research
- Split research papers by sections
- Extract specific chapters from textbooks
- Organize thesis documents by chapters
- Separate different types of academic content

## Next Steps

- Implement batch processing for multiple files
- Add support for regular expressions
- Integrate with web interface
- Add progress tracking for large files
- Add preview functionality

## Future Enhancements

- **GUI Interface**: Create Tkinter or PyQt application
- **Batch Processing**: Handle multiple PDF documents simultaneously
- **Preview Feature**: Show split points before processing
- **Custom Options**: Configure text detection sensitivity
- **Advanced Options**: Support for multiple text patterns in one document
- **Export Options**: Support for different output formats
- **Regular Expressions**: Support for complex text matching patterns
- **Web Interface**: Create Flask or Django web application
- **CLI Interface**: Add command-line argument support
- **OCR Integration**: Support for splitting scanned documents

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Python Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 