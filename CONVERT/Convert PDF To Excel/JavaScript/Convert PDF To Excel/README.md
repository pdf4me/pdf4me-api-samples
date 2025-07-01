# PDF to Excel Converter

Convert PDF files to Excel spreadsheets using the PDF4Me API. This project extracts tables, text, and data from PDF documents and converts them into editable Excel format.

## Features

- ✅ Convert PDF files to Excel spreadsheets (.xlsx)
- ✅ Extract tables, text, and structured data
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling
- ✅ No external dependencies (uses Node.js built-in modules)
- ✅ Detailed logging and progress tracking
- ✅ Configurable quality and formatting options

## Prerequisites

- **Node.js 18.0.0 or higher** (required for built-in `fetch` API)
- **Internet connection** for API access
- **Valid PDF4Me API key**

## Quick Start

1. **Download the project folder**
2. **Place your PDF file** in the project directory (rename to `sample.pdf` or update the path in `app.js`)
3. **Run the conversion**:
   ```bash
   node app.js
   ```

The converted Excel file will be saved as `PDF_to_EXCEL_output.xlsx` in the same directory.

## Project Structure

```
Convert PDF To Excel/
├── app.js              # Main application file
├── package.json        # Project configuration
├── README.md          # This file
└── sample.pdf         # Sample PDF file (your input)
```

## Configuration

### File Paths
Edit the constants in `app.js` to customize file paths:

```javascript
const INPUT_PDF_PATH = "sample.pdf";                    // Your PDF file
const OUTPUT_EXCEL_PATH = "PDF_to_EXCEL_output.xlsx";   // Output Excel name
```

### API Settings
The API key and endpoint are pre-configured:

```javascript
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
```

### Conversion Options
Customize the PDF to Excel conversion settings in the payload:

```javascript
const payload = {
    qualityType: "Draft",        // Draft, Standard, or High
    language: "English",         // OCR language for scanned documents
    mergeAllSheets: true,        // Merge all pages into single spreadsheet
    outputFormat: true,          // Enable output formatting
    ocrWhenNeeded: true,         // Use OCR for scanned content
    async: true                  // Enable async processing
};
```

## Usage Examples

### Basic Conversion
```bash
# Simple conversion with default settings
node app.js
```

### Custom File Paths
Edit `app.js` to use different files:
```javascript
const INPUT_PDF_PATH = "my-document.pdf";
const OUTPUT_EXCEL_PATH = "converted-data.xlsx";
```

### Different Quality Settings
Modify the payload for different conversion quality:

```javascript
// High quality conversion (slower but more accurate)
qualityType: "High",
mergeAllSheets: false,
outputFormat: true

// Fast draft conversion (faster but less accurate)
qualityType: "Draft",
mergeAllSheets: true,
outputFormat: false
```

## API Response Handling

The application handles different API responses:

- **200 (Success)**: Direct Excel response, saved immediately
- **202 (Accepted)**: Async processing, polls for completion
- **Other codes**: Error with detailed message

## Error Handling

The application includes comprehensive error handling:

- ✅ Input file validation
- ✅ API request errors
- ✅ Network connectivity issues
- ✅ Invalid responses
- ✅ File system errors
- ✅ Timeout handling for async operations

## Troubleshooting

### Common Issues

1. **"Input PDF file not found"**
   - Ensure your PDF file exists in the project directory
   - Check the file path in `INPUT_PDF_PATH`

2. **"API request failed"**
   - Verify internet connection
   - Check API key validity
   - Ensure PDF file is valid

3. **"Polling failed"**
   - Large files may take longer to process
   - Increase `MAX_RETRIES` or `RETRY_DELAY` in the code

4. **"Node.js version too old"**
   - Upgrade to Node.js 18.0.0 or higher
   - Check version with: `node --version`

### Performance Tips

- **Small files (< 1MB)**: Usually process synchronously (200 response)
- **Large files (> 1MB)**: Process asynchronously (202 response) with polling
- **Complex layouts**: May take longer to extract and convert
- **Scanned PDFs**: Require OCR processing and take more time

## API Documentation

This project uses the PDF4Me ConvertPdfToExcel API v2:

- **Endpoint**: `https://api.pdf4me.com/api/v2/ConvertPdfToExcel`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: application/json

### Supported PDF Features

- ✅ Table extraction and formatting
- ✅ Text content preservation
- ✅ Form field data extraction
- ✅ Multi-page document handling
- ✅ OCR for scanned documents
- ✅ Formatting preservation

## License

MIT License - feel free to use and modify as needed.

## Support

For issues with the PDF4Me API, refer to the official documentation or contact support. 