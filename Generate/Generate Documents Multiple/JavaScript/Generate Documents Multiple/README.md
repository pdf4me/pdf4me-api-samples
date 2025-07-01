# Generate Documents Multiple - JavaScript

This project demonstrates how to generate multiple documents using the PDF4Me API by combining template files with JSON data. It supports various template formats (Word, HTML, PDF) and output formats (PDF, Word, HTML, Excel).

## Features

- **Multiple Template Support**: Works with Word (.docx, .doc), HTML (.html, .htm), and PDF templates
- **Flexible Output Formats**: Generate documents in PDF, Word, HTML, or Excel formats
- **JSON Data Integration**: Merge structured JSON data into templates
- **Asynchronous Processing**: Handles both synchronous and asynchronous API responses
- **Retry Logic**: Robust polling mechanism for long-running operations
- **File Validation**: Validates input files and output document signatures
- **Cross-Platform**: Runs on Windows, macOS, and Linux
- **API Compliant**: Fully compliant with PDF4Me Generate Documents Multiple API specification

## Prerequisites

- Node.js version 18.0.0 or higher
- npm (comes with Node.js)
- PDF4Me API key

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Generate Documents Multiple/JavaScript/Generate Documents Multiple"
   ```

2. Install dependencies (no external dependencies required):
   ```bash
   npm install
   ```

## Configuration

### API Configuration

The application uses the following configuration:

```javascript
// API Configuration - PDF4Me service for generating multiple documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/GenerateDocumentMultiple`;
```

### File Configuration

```javascript
// File paths configuration
const TEMPLATE_FILE_PATH = "sample.docx";        // Path to the template file
const JSON_DATA_PATH = "sample.json";            // Path to the JSON data file
const OUTPUT_PATH = "Generate_Documents_Multiple_output.docx"; // Output file name

// Output type configuration (pdf, docx, html, excel)
const OUTPUT_TYPE = "docx";
```

### Retry Configuration

```javascript
// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds
```

## Usage

### Basic Usage

1. Ensure you have the required files:
   - `sample.docx` - Your template file
   - `sample.json` - Your JSON data file

2. Run the application:
   ```bash
   npm start
   ```

3. The generated document will be saved as `Generate_Documents_Multiple_output.docx`

### Supported Template Types

| File Extension | Template Type | API Value | Description |
|----------------|---------------|-----------|-------------|
| `.docx`, `.doc` | Word | `Docx` | Microsoft Word documents |
| `.html`, `.htm` | HTML | `HTML` | Web page templates |
| `.pdf` | PDF | `PDF` | PDF document templates |

### Supported Output Types

| Output Type | Description | API Value | File Extension |
|-------------|-------------|-----------|----------------|
| `pdf` | Portable Document Format | `PDF` | `.pdf` |
| `docx` | Microsoft Word Document | `Docx` | `.docx` |
| `html` | HyperText Markup Language | `HTML` | `.html` |
| `excel` | Microsoft Excel Spreadsheet | `Excel` | `.xlsx` |

### JSON Data Format

The JSON data file should contain the data you want to merge into your template. Example:

```json
{
    "VendorName": "PDF4me",
    "VendorCity": "Zurich",
    "VendorCountry": "Switzerland",
    "VendorZip": "8630",
    "VendorContact": "123456",
    "VendorPhone": "+41 44 123 4567",
    "InvoiceDate": "22-08-2022",
    "CustomerName": "John Doe",
    "CustomerCity": "Start City",
    "CustomerCountry": "US",
    "CustomerZip": "3214",
    "products": [
        {
            "productName": "PDF Converter",
            "value": 2000,
            "expires": "01/08/2025"
        },
        {
            "productName": "PDF API",
            "value": 1250,
            "expires": "18/02/2029"
        }
    ],
    "comment": "This document is <b>computer generated</b> and does not require a signature.",
    "invoicePaid": true
}
```

## API Compliance

This implementation is fully compliant with the PDF4Me Generate Documents Multiple API specification:

### Required Parameters
- **templateFileType**: Enum (Docx, HTML, PDF) - Template file type
- **templateFileName**: String - Name of template with proper file extension
- **templateFileData**: Base64 - Template file content encoded in base64
- **documentDataType**: Enum (Json, XML) - Data type for template
- **outputType**: Enum (PDF, Docx, Excel, HTML) - Output file format

### Optional Parameters
- **documentDataFile**: Base64 - Alternative to documentDataText for data file
- **documentDataText**: String - Manual data entry in JSON or XML format
- **metaDataJson**: String - Additional metadata for fields in JSON format

### API Response Handling

The application handles different API response scenarios:

#### Status Code 200 - Success
- Document generation completed immediately
- File is saved directly to the output path

#### Status Code 202 - Accepted
- Asynchronous processing initiated
- Application polls the API for completion
- Retry logic with configurable attempts and delays

#### Other Status Codes
- Error messages displayed with status code and response text
- Application exits with error code 1

## Advanced Configuration

### Customizing the Payload

You can modify the API payload in the `processDocumentGeneration()` function:

```javascript
const payload = {
    templateFileType: templateFileType,           // Type of template (Docx/HTML/PDF)
    templateFileName: path.basename(TEMPLATE_FILE_PATH), // Template file name
    templateFileData: templateBase64,             // Base64 encoded template content
    documentDataType: "Json",                     // Type of data (Json/XML)
    outputType: getOutputType(OUTPUT_TYPE),       // Output format (PDF/Docx/Excel/HTML)
    documentDataText: jsonData,                   // JSON data as text
    metaDataJson: "{}"                            // Additional metadata for fields in JSON format
    // Additional options:
    // documentDataFile: dataFileBase64,          // Alternative to documentDataText
    // metaDataJson: '{"customField": "value"}'
};
```

### Template Field Metadata

You can provide additional metadata for template fields:

```javascript
metaDataJson: '{"headerColor": "#FF0000", "footerText": "Confidential"}'
```

## Error Handling

The application includes comprehensive error handling:

- **File Validation**: Checks for existence of input files
- **API Errors**: Handles HTTP errors and API-specific errors
- **Response Validation**: Validates document signatures and content
- **Timeout Handling**: Manages long-running operations with retry limits

## Troubleshooting

### Common Issues

1. **Template file not found**
   - Ensure `sample.docx` exists in the project directory
   - Check file permissions

2. **JSON data file not found**
   - Ensure `sample.json` exists in the project directory
   - Verify JSON syntax is valid

3. **API authentication failed**
   - Verify your API key is correct
   - Check API key permissions

4. **Document generation timeout**
   - Increase `MAX_RETRIES` or `RETRY_DELAY` values
   - Check network connectivity

5. **Invalid output format**
   - Ensure `OUTPUT_TYPE` is one of: `pdf`, `docx`, `html`, `excel`

### Debug Information

The application provides detailed logging:
- File reading and encoding status
- API request details
- Response processing steps
- Document validation results
- Error messages with context

## File Structure

```
Generate Documents Multiple/
├── app.js                 # Main application file
├── package.json           # Project configuration
├── README.md             # This documentation
├── sample.docx           # Template file (Word document)
├── sample.json           # JSON data file
└── invoice_sample.html   # Alternative HTML template
```

## Dependencies

This project has no external dependencies and uses only Node.js built-in modules:
- `fs` - File system operations
- `path` - Path manipulation utilities
- `fetch` - HTTP requests (built-in since Node.js 18)

## License

MIT License - see LICENSE file for details.

## Support

For API-related issues, contact PDF4Me support.
For application issues, check the troubleshooting section above. 