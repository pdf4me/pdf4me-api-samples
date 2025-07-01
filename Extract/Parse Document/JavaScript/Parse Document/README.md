# Document Parser - JavaScript

A Node.js application that uses the PDF4Me API to parse documents and extract structured data. This tool can analyze various document types including invoices, receipts, forms, and other business documents to extract key information automatically.

## Features

- **AI-Powered Parsing**: Uses advanced AI to understand document structure and extract relevant data
- **Multiple Document Types**: Supports invoices, receipts, forms, contracts, and more
- **Asynchronous Processing**: Handles both immediate and background processing with automatic retry logic
- **Structured Output**: Saves extracted data in a readable text format with JSON details
- **Cross-Platform**: Works on Windows, macOS, and Linux without additional dependencies

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Usually comes with Node.js
- **Internet Connection**: Required for API communication

## Installation

1. **Navigate to the project directory**:
   ```bash
   cd "Extract/Parse Document/JavaScript/Parse Document"
   ```

2. **Verify Node.js installation**:
   ```bash
   node --version
   npm --version
   ```

3. **No additional dependencies required** - the application uses only built-in Node.js modules.

## Usage

### Basic Usage

1. **Place your PDF file** in the project directory and name it `sample.pdf`

2. **Run the application**:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

3. **Check the results**:
   - The parsed data will be saved to `parsed_document.txt`
   - Console output will show the parsing progress and key extracted information

### Configuration

You can modify the following settings in `app.js`:

```javascript
// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                    // Your input PDF file
const OUTPUT_PATH = "parsed_document.txt";              // Output file name

// Retry configuration for async processing
const MAX_RETRIES = 10;                                 // Maximum polling attempts
const RETRY_DELAY = 10000;                              // Delay between polls (10 seconds)
```

## How It Works

### 1. Document Analysis
The application reads your PDF file and converts it to base64 format for API transmission.

### 2. API Processing
- Sends the document to PDF4Me's AI-powered parsing service
- The service analyzes the document structure and identifies key fields
- Supports both synchronous (immediate) and asynchronous (background) processing

### 3. Data Extraction
The API extracts structured data such as:
- Document type and classification
- Page count and layout information
- Key-value pairs from forms
- Tabular data
- Text content with positioning
- Metadata and properties

### 4. Result Handling
- Saves comprehensive parsing results to a text file
- Displays key extracted information in the console
- Handles errors gracefully with detailed error messages

## Output Format

The application generates a `parsed_document.txt` file containing:

```
Document Parsing Results
========================
Parsed on: [timestamp]

Document Type: [detected document type]
Page Count: [number of pages]

Full Response:
[Complete JSON response with all extracted data]
```

## API Response Handling

### Status Codes
- **200**: Success - Parsing completed immediately
- **202**: Accepted - Processing asynchronously (will poll for completion)
- **Other**: Error - Detailed error message displayed

### Polling Logic
- Automatically polls the API every 10 seconds for async processing
- Maximum 10 retry attempts (configurable)
- Graceful timeout handling with informative messages

## Supported Document Types

The parser can handle various document formats including:
- **Invoices**: Extract vendor info, amounts, dates, line items
- **Receipts**: Capture merchant details, totals, tax information
- **Forms**: Extract form fields, checkboxes, signatures
- **Contracts**: Identify parties, dates, terms, signatures
- **Reports**: Extract tables, charts, key metrics
- **Letters**: Capture sender/recipient info, dates, content

## Error Handling

The application includes comprehensive error handling:
- **File not found**: Clear error message if input PDF is missing
- **API errors**: Detailed status codes and response messages
- **Network issues**: Automatic retry with exponential backoff
- **Invalid responses**: Graceful handling of unexpected data formats

## Troubleshooting

### Common Issues

1. **"Input PDF file not found"**
   - Ensure `sample.pdf` exists in the project directory
   - Check file permissions

2. **"API request failed"**
   - Verify internet connection
   - Check if the API key is valid
   - Ensure the PDF file is not corrupted

3. **"Timeout: Document parsing did not complete"**
   - Large or complex documents may take longer
   - Increase `MAX_RETRIES` or `RETRY_DELAY` in the code
   - Check API service status

4. **"No 'Location' header found"**
   - API response format may have changed
   - Contact PDF4Me support for API updates

### Performance Tips

- **File Size**: Larger files may take longer to process
- **Document Complexity**: Complex layouts with many elements require more processing time
- **Network**: Stable internet connection improves reliability

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **Base URL**: `https://api.pdf4me.com/`
- **Endpoint**: `/api/v2/ParseDocument`
- **Authentication**: Basic authentication with API key
- **Content Type**: JSON payload with base64 encoded document

## Security

- API key is embedded in the code (for demonstration purposes)
- In production, use environment variables for sensitive data
- All communication uses HTTPS for data security

## License

This project is licensed under the MIT License.

## Support

For issues related to:
- **API functionality**: Contact PDF4Me support
- **Application code**: Check the troubleshooting section above
- **Document parsing accuracy**: Ensure documents are clear and well-formatted

## Example Output

```
Starting Document Parsing Process...
This extracts structured data from documents using AI-powered parsing
Supports invoices, receipts, forms, and other document types
------------------------------------------------------------
Parsing: sample.pdf → parsed_document.txt
Reading and encoding PDF file...
PDF file read successfully: 98765 bytes
Sending document parsing request to PDF4Me API...
Status code: 202
Request accepted. PDF4Me is processing asynchronously...
Polling URL: https://api.pdf4me.com/api/v2/ParseDocument/status/12345
Checking status... (Attempt 1/10)
Polling status code: 200
Document parsing completed successfully!
Document parsing completed successfully!

Parsing Results:
  documentType: Invoice
  pageCount: 1
  confidence: 0.95
  extractedFields: {...}

Parsing results saved: parsed_document.txt
Document has been successfully parsed and data extracted
``` 