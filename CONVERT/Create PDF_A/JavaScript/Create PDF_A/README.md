# PDF to PDF/A Converter

A Node.js application that converts regular PDF files to PDF/A format using the PDF4Me API. PDF/A is an ISO standard for long-term archival and preservation of electronic documents.

## Features

- **PDF/A Compliance**: Converts PDFs to various PDF/A compliance levels (PdfA1b, PdfA1a, PdfA2b, etc.)
- **Asynchronous Processing**: Supports both synchronous and asynchronous API processing
- **Retry Logic**: Robust polling mechanism for long-running conversions
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **No Dependencies**: Uses only built-in Node.js modules

## PDF/A Compliance Levels

The application supports multiple PDF/A compliance levels:

- **PdfA1b** (Default): Level B basic conformance - Most common for archival
- **PdfA1a**: Level A accessible conformance - Includes accessibility features
- **PdfA2b**: Part 2 basic compliance - Supports newer PDF features
- **PdfA2u**: Part 2 with Unicode mapping
- **PdfA2a**: Part 2 accessible compliance
- **PdfA3b**: Part 3 basic - allows file embedding
- **PdfA3u**: Part 3 with Unicode mapping
- **PdfA3a**: Part 3 accessible compliance

## Prerequisites

- Node.js version 18.0.0 or higher
- A PDF4Me API key
- A sample PDF file for conversion

## Installation

1. Clone or download this project
2. Navigate to the project directory
3. No additional dependencies required - uses built-in Node.js modules

## Configuration

### API Configuration

The application uses the following configuration:

```javascript
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/PdfA`;
```

### File Configuration

```javascript
const INPUT_PDF_PATH = "sample.pdf";                    // Path to input PDF file
const OUTPUT_PDFA_PATH = "PDF_to_PDF_A_output.pdf";     // Output PDF/A file name
```

### Retry Configuration

```javascript
const MAX_RETRIES = 10;        // Maximum polling attempts
const RETRY_DELAY = 10000;     // 10 seconds between attempts
```

## Usage

### Basic Usage

1. Place your input PDF file in the project directory (default: `sample.pdf`)
2. Run the conversion:

```bash
npm start
```

or

```bash
node app.js
```

### Programmatic Usage

```javascript
const { createPdfA } = require('./app.js');

// Run the conversion
createPdfA().then(() => {
    console.log('Conversion completed successfully!');
}).catch(error => {
    console.error('Conversion failed:', error);
});
```

## How It Works

### 1. File Validation
- Checks if the input PDF file exists
- Validates file accessibility

### 2. File Encoding
- Reads the PDF file as binary data
- Converts to base64 encoding for API transmission

### 3. API Request
- Sends conversion request to PDF4Me API
- Includes PDF/A compliance settings
- Supports both sync and async processing

### 4. Response Handling
- **200 Status**: Immediate conversion result
- **202 Status**: Asynchronous processing with polling
- **Other Status**: Error handling with detailed messages

### 5. Result Processing
- Validates PDF header in response
- Handles both binary and base64 encoded responses
- Saves the converted PDF/A file

### 6. Polling Logic (Async Processing)
- Polls the API every 10 seconds
- Maximum 10 retry attempts
- Handles processing status updates

## API Response Codes

- **200 - Success**: Conversion completed, file saved
- **202 - Accepted**: Asynchronous processing started, polling required
- **Other Codes**: Error with status code and response details

## Error Handling

The application includes comprehensive error handling:

- **File Not Found**: Validates input file existence
- **API Errors**: Handles various HTTP status codes
- **Network Issues**: Retry logic for polling failures
- **Invalid Responses**: Validates PDF format in responses
- **JSON Parsing**: Graceful handling of malformed responses

## Output

The converted PDF/A file will be saved as `PDF_to_PDF_A_output.pdf` in the project directory. The file will be compliant with the specified PDF/A standard for long-term archival.

## Customization

### Changing Compliance Level

Modify the `compliance` field in the payload:

```javascript
const payload = {
    // ... other fields
    compliance: "PdfA1a",  // Change to desired compliance level
    // ... other fields
};
```

### Adjusting Retry Settings

Modify the retry configuration:

```javascript
const MAX_RETRIES = 15;        // More retry attempts
const RETRY_DELAY = 5000;      // 5 seconds between attempts
```

### Custom File Paths

Update the file path constants:

```javascript
const INPUT_PDF_PATH = "path/to/your/input.pdf";
const OUTPUT_PDFA_PATH = "path/to/your/output.pdf";
```

## Troubleshooting

### Common Issues

1. **"Input PDF file not found"**
   - Ensure the input file exists in the specified path
   - Check file permissions

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connectivity
   - Ensure PDF4Me service is available

3. **"Polling timeout"**
   - Large files may take longer to process
   - Increase `MAX_RETRIES` or `RETRY_DELAY`
   - Check API service status

4. **"No PDF data found in response"**
   - API may have returned an error message
   - Check the full response for error details

### Debug Information

The application provides detailed logging:
- File encoding status
- API request details
- Response status codes
- Polling progress
- File save confirmation

## License

MIT License - see package.json for details

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Application Logic**: Check the error messages and troubleshooting section
- **Node.js**: Ensure you're using version 18.0.0 or higher 