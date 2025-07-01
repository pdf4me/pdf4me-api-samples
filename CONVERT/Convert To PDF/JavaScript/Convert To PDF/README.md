# Document to PDF Converter

A Node.js application that converts various document formats (DOCX, XLSX, etc.) to PDF using the PDF4Me API. This tool supports both synchronous and asynchronous processing with automatic retry logic.

## Features

- **Multiple Format Support**: Converts Word documents (DOCX), Excel spreadsheets (XLSX), and other document formats to PDF
- **Asynchronous Processing**: Handles large files with background processing and polling
- **Automatic Retry Logic**: Implements robust retry mechanism for reliable conversions
- **Error Handling**: Comprehensive error handling with detailed logging
- **Modern JavaScript**: Uses ES6+ features and async/await patterns
- **No Dependencies**: Pure Node.js implementation with no external dependencies

## Prerequisites

- Node.js version 18.0.0 or higher
- PDF4Me API key
- Input document file (DOCX, XLSX, etc.)

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Convert/Convert To PDF/JavaScript/Convert To PDF"
   ```

2. Install dependencies (none required, but you can run):
   ```bash
   npm install
   ```

## Configuration

### API Configuration

The application uses the following configuration:

```javascript
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ConvertToPdf`;
```

### File Configuration

Update the file paths in `app.js`:

```javascript
const INPUT_DOC_PATH = "sample_pdf.docx";           // Path to input document file
const OUTPUT_PDF_PATH = "Document_to_PDF_output.pdf"; // Output PDF file name
```

### Retry Configuration

```javascript
const MAX_RETRIES = 10;        // Maximum number of polling attempts
const RETRY_DELAY = 10000;     // Delay between retries (10 seconds)
```

## Usage

### Basic Usage

1. Place your input document file in the project directory
2. Update the `INPUT_DOC_PATH` in `app.js` to match your file name
3. Run the conversion:

```bash
npm start
```

Or directly with Node.js:

```bash
node app.js
```

### Supported Input Formats

- **Word Documents**: .docx, .doc
- **Excel Spreadsheets**: .xlsx, .xls
- **PowerPoint Presentations**: .pptx, .ppt
- **Text Files**: .txt, .rtf
- **Other Office Formats**: Various Microsoft Office and OpenDocument formats

## API Response Handling

The application handles different API response scenarios:

### 200 - Success (Synchronous)
- Immediate conversion completion
- PDF data returned directly
- File saved immediately

### 202 - Accepted (Asynchronous)
- Request accepted for background processing
- Implements polling mechanism with retry logic
- Monitors conversion progress
- Downloads result when complete

### Error Responses
- Detailed error logging with status codes
- Response text included for debugging
- Graceful error handling

## Output

The converted PDF file will be saved as `Document_to_PDF_output.pdf` (or your configured output path) in the project directory.

## Logging

The application provides detailed logging throughout the conversion process:

- File validation and encoding
- API request details
- Response status and headers
- Polling progress for async operations
- Success/failure messages
- Error details for troubleshooting

## Error Handling

Comprehensive error handling includes:

- **File Validation**: Checks if input file exists
- **API Errors**: Handles various HTTP status codes
- **Network Issues**: Retry logic for connection problems
- **Processing Timeouts**: Maximum retry limits
- **Invalid Responses**: Graceful handling of unexpected data

## Code Structure

### Main Functions

- `convertDocumentToPdf()`: Main orchestration function
- `processDocumentToPdfConversion()`: Core API interaction logic
- `handleConversionResult()`: Result processing and file saving
- `pollForCompletion()`: Async polling with retry logic

### Key Features

- **Base64 Encoding**: Automatic encoding of input files
- **Fetch API**: Modern HTTP requests using native fetch
- **Buffer Handling**: Proper binary data processing
- **PDF Validation**: Checks for valid PDF headers
- **JSON Parsing**: Handles various response formats

## Troubleshooting

### Common Issues

1. **File Not Found**: Ensure input file path is correct
2. **API Key Issues**: Verify API key is valid and has proper permissions
3. **Network Problems**: Check internet connection and API endpoint accessibility
4. **Timeout Errors**: Large files may require longer processing times

### Debug Information

The application logs detailed information including:
- Request/response headers
- Status codes
- Response content (for errors)
- File sizes and encoding progress

## API Documentation

For more information about the PDF4Me API, visit:
- [PDF4Me API Documentation](https://api.pdf4me.com/)
- [Convert to PDF Endpoint](https://api.pdf4me.com/api/v2/ConvertToPdf)

## License

MIT License - see package.json for details.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Application Code**: Check error logs and configuration
- **File Format Issues**: Verify input file is in supported format 