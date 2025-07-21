# Generate Documents Multiple - Python Implementation

This project demonstrates how to generate multiple documents using the PDF4Me API with Python. It combines template files with JSON data to create customized documents in various formats.

## ✅ Features

- Generate documents from Word, HTML, and PDF templates
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- Multiple output formats (PDF, DOCX, HTML, Excel)
- Dynamic data integration with JSON
- Document signature validation

## Prerequisites

- Python 3.7 or higher
- PDF4Me API key
- Internet connection for API access
- Required Python packages (see Dependencies section)

## Project Structure

```
Generate Documents Multiple/
├── generate_documents_multiple.py  # Main application logic
├── README.md                       # This documentation
├── sample.docx                     # Sample Word template file
├── sample.json                     # Sample JSON data file
├── invoice_sample.html             # Alternative HTML template
└── sample.generated.docx           # Generated output file
```

## Setup

1. **Clone or download this project**
2. **Install dependencies**:
   ```bash
   pip install requests
   ```
3. **Configure your API key** in `generate_documents_multiple.py`:
   ```python
   API_KEY = "your-api-key-here"
   ```
4. **Place your template and data files** in the project directory
5. **Run the application**:
   ```bash
   python generate_documents_multiple.py
   ```

## Usage

The application will:
1. Read the template file (Word, HTML, or PDF)
2. Read the JSON data file
3. Convert both to Base64
4. Send a request to generate the document
5. Handle the response (synchronous or asynchronous)
6. Save the generated document

### Expected Output

```
=== Generating DOCX Document ===
Response Content-Type: application/json; charset=utf-8
Received 15219 characters
Valid DOCX file signature detected
Generated DOCX document saved to: sample.generated.docx
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/v2/GenerateDocumentMultiple
```

## Specific Settings

### Template Types
- **Word**: `"Docx"` - Microsoft Word documents (.docx, .doc)
- **HTML**: `"HTML"` - HTML template files (.html, .htm)
- **PDF**: `"PDF"` - PDF template files (.pdf)

### Output Types
- **PDF**: `"PDF"` - Portable Document Format
- **Word**: `"Docx"` - Microsoft Word document
- **HTML**: `"HTML"` - HyperText Markup Language
- **Excel**: `"Excel"` - Microsoft Excel spreadsheet

### Data Types
- **JSON**: `"Json"` - JSON data format
- **XML**: `"XML"` - XML data format

## Implementation Details

### Key Components

1. **File Reading**: Reads template and data files and converts to Base64
2. **Request Building**: Constructs JSON payload with template and data
3. **API Communication**: Sends HTTP POST request to PDF4Me API
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Download**: Downloads generated document and saves to local file system
6. **Document Validation**: Validates document signatures for integrity

### Error Handling

- **File Not Found**: Handles missing template or data files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format
- **Document Validation**: Checks document signatures

## API Endpoints

### Generate Documents Multiple
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/GenerateDocumentMultiple`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload

```json
{
  "templateFileType": "Docx",
  "templateFileName": "sample.docx",
  "templateFileData": "base64-encoded-template-content",
  "documentDataType": "Json",
  "outputType": "Docx",
  "documentDataText": "json-data-content",
  "metaDataJson": "{}"
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
- **Document Validation**: Signature verification

## Dependencies

### Required Packages
```
requests>=2.25.1
```

### Installation
```bash
pip install requests
```

Or install from requirements.txt:
```bash
pip install -r requirements.txt
```

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
   - Ensure template file is in correct format (Word, HTML, PDF)
   - Check if template contains valid placeholders

5. **Invalid JSON Data**
   - Validate JSON data format
   - Ensure JSON matches template placeholders

6. **Document Signature Invalid**
   - Check if generated document is corrupted
   - Verify API response format

7. **Python Version Issues**
   - Ensure Python 3.7+ is installed
   - Check if virtual environment is activated

### Debug Mode

Enable detailed logging by setting:
```python
DEBUG_MODE = True
```

## Sample Files

- **sample.docx**: Word template with placeholders
- **sample.json**: Sample JSON data for template
- **invoice_sample.html**: Alternative HTML template

## Expected Workflow

1. **Input**: Template file (Word/HTML/PDF) + JSON data file
2. **Processing**: Merge template with data using PDF4Me API
3. **Output**: Generated document in specified output format

## Next Steps

- Implement batch processing for multiple documents
- Add support for more template formats
- Integrate with web interface
- Add progress tracking for large files

## Future Enhancements

- **GUI Interface**: Create tkinter or PyQt application
- **Batch Processing**: Handle multiple documents simultaneously
- **Preview Feature**: Show document preview before generation
- **Template Editor**: Built-in template editing capabilities
- **Advanced Options**: Support for complex data structures
- **Output Format Conversion**: Convert between different output formats
- **Web Interface**: Create Flask/Django web application

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Python Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 