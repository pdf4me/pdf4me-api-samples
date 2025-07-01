# Generate Document Single - JavaScript

This project demonstrates how to generate single documents using the PDF4Me API with JavaScript. It supports generating documents from various template types (HTML, Word, PDF) using JSON or XML data.

## Features

- **Multiple Template Types**: Support for HTML, Word, and PDF templates
- **Dynamic Output Format**: Output format automatically matches input format
- **Data Integration**: JSON and XML data integration for dynamic content
- **Multiple Output Formats**: Generate PDF, Word, Excel, or HTML documents
- **Asynchronous Processing**: Handles both synchronous and asynchronous API responses
- **Retry Logic**: Robust polling mechanism for long-running operations
- **Error Handling**: Comprehensive error handling and validation
- **Auto-detection**: Automatically detects file type from extension

## Prerequisites

- Node.js version 18.0.0 or higher
- npm (comes with Node.js)
- PDF4Me API key

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Generate Document Single/JavaScript/Generate Document Single"
   ```

2. No additional dependencies required - uses built-in Node.js modules only.

## Configuration

### API Configuration

Update the following constants in `app.js`:

```javascript
const API_KEY = "your-api-key-here";
const BASE_URL = "https://api.pdf4me.com/";
```

### File Paths

Configure the input file path (output is automatically determined):

```javascript
const TEMPLATE_FILE_PATH = "invoice_sample.pdf";      // Your template file (HTML/Word/PDF)
const JSON_DATA_PATH = "invoice_sample_data.json";   // Your data file
// Output file is automatically generated as: invoice_sample.generated.pdf
```

## Usage

### Basic Usage

Run the document generation:

```bash
npm start
```

Or directly with Node.js:

```bash
node app.js
```

### Template Types

The application automatically detects template type from file extension and sets output format accordingly:

#### HTML Template (.html, .htm)
- Input: `template.html` → Output: `template.generated.html`
- Template type: `html`
- Output type: `html`

#### Word Template (.docx, .doc)
- Input: `template.docx` → Output: `template.generated.docx`
- Template type: `Word`
- Output type: `Word`

#### PDF Template (.pdf)
- Input: `template.pdf` → Output: `template.generated.pdf`
- Template type: `PDF`
- Output type: `PDF`

The payload is automatically configured based on the detected file type:

```javascript
// Auto-detected payload configuration
const payload = {
    "templateFileType": fileType,            // Auto-detected from file extension
    "templateFileName": templateFileName,    // Original filename
    "templateFileData": templateBase64,     // Base64 encoded template
    "documentDataType": "text",              // JSON/XML data type
    "outputType": fileType,                  // Same as input type
    "documentDataText": jsonData,           // Your data
    "async": true
};
```

### Output Types

The application automatically determines output format based on input file type:

| Input File | Output File | Template Type | Output Type |
|------------|-------------|---------------|-------------|
| `template.html` | `template.generated.html` | `html` | `html` |
| `template.docx` | `template.generated.docx` | `Word` | `Word` |
| `template.pdf` | `template.generated.pdf` | `PDF` | `PDF` |

Supported formats:
- **HTML**: Web page format (.html, .htm)
- **Word**: Microsoft Word document (.docx, .doc)
- **PDF**: Portable Document Format (.pdf)

The output format always matches the input format for consistency.

## API Response Handling

### Status Codes

- **200**: Success - Document generated immediately
- **202**: Accepted - Processing asynchronously (requires polling)
- **Other**: Error - Check response text for details

### Asynchronous Processing

For large files or high server load, the API may return a 202 status code indicating asynchronous processing. The application automatically handles this by:

1. Extracting the polling URL from the `Location` header
2. Polling the status every 10 seconds
3. Retrying up to 10 times (configurable)
4. Saving the result when processing completes

## Error Handling

The application includes comprehensive error handling:

- **File Validation**: Checks if input files exist before processing
- **API Errors**: Handles various HTTP status codes and error responses
- **Network Issues**: Retry logic for temporary network problems
- **Timeout Protection**: Prevents infinite waiting for stuck operations

## Sample Files

The project includes sample files for testing:

- `invoice_sample.html`: HTML template with placeholders
- `invoice_sample_data.json`: Sample JSON data for the template
- `invoice_sample.docx`: Word template alternative
- `sample_data_word.json`: Alternative JSON data format

## Customization

### Retry Configuration

Adjust polling behavior:

```javascript
const MAX_RETRIES = 10;        // Number of polling attempts
const RETRY_DELAY = 10000;     // Delay between attempts (milliseconds)
```

### Payload Options

Additional payload parameters available:

```javascript
const payload = {
    // ... basic parameters ...
    "metaDataJson": "{}",      // Additional metadata for fields
    "fileMetaData": "{}",      // File-specific metadata
    "documentDataFile": dataFileBase64  // Alternative to documentDataText
};
```

## Troubleshooting

### Common Issues

1. **File Not Found**: Ensure template and data files exist in the specified paths
2. **API Key Invalid**: Verify your PDF4Me API key is correct
3. **Network Errors**: Check internet connection and API endpoint accessibility
4. **Timeout Errors**: Increase `MAX_RETRIES` for large files or slow processing

### Debug Information

The application provides detailed logging:
- File reading and encoding status
- API request details
- Response status codes
- Polling progress
- Error messages with context

## API Documentation

For detailed API documentation, visit:
- [PDF4Me API Documentation](https://developer.pdf4me.com/)
- [Generate Document Single Endpoint](https://developer.pdf4me.com/docs/api/generate-document-single)

## License

This project is licensed under the MIT License.

## Support

For technical support or questions:
- Check the PDF4Me API documentation
- Review error messages in the console output
- Verify file formats and data structure 