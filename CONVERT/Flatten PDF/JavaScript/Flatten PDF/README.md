# PDF Flattener - JavaScript

A Node.js application that flattens PDF documents using the PDF4Me API. This tool converts interactive PDF elements (forms, annotations, layers) into static, non-editable content.

## What is PDF Flattening?

PDF flattening is the process of converting interactive elements in a PDF document into static content:

- **Form Fields** → Static text (no longer editable)
- **Annotations** → Permanent marks (comments become part of document)
- **Layers** → Single merged layer (all layers combined)
- **Digital Signatures** → Visual representation only (signatures become images)
- **Interactive Elements** → Static content (buttons, links become non-functional)

## Use Cases

- **Final Documents**: Convert editable forms to static documents for distribution
- **Preventing Edits**: Make documents non-editable for security purposes
- **Archival Purposes**: Create permanent, unchangeable versions of documents
- **Print Preparation**: Ensure consistent printing across different devices
- **Document Sharing**: Share documents without interactive elements

## Prerequisites

- Node.js version 18.0.0 or higher
- npm (comes with Node.js)
- Internet connection for API access

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Convert/Flatten PDF/JavaScript/Flatten PDF"
   ```

2. Install dependencies (if any):
   ```bash
   npm install
   ```

## Configuration

### API Configuration

The application uses the PDF4Me API for PDF flattening. The API key is already configured in the code:

```javascript
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/FlattenPdf`;
```

### File Configuration

Update the file paths in `app.js` as needed:

```javascript
const INPUT_PDF_PATH = "unflattened-sample.pdf";  // Your input PDF file
const OUTPUT_PDF_PATH = "Flatten_PDF_output.pdf"; // Output file name
```

## Usage

### Basic Usage

1. Place your PDF file in the project directory (or update the path in the code)
2. Run the application:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

### Programmatic Usage

You can also use the flattening function in your own code:

```javascript
const { flattenPdf } = require('./app.js');

// Customize file paths
const customInputPath = "path/to/your/input.pdf";
const customOutputPath = "path/to/your/output.pdf";

// Update the paths in the module before calling
// (You may need to modify the app.js file to accept parameters)

flattenPdf()
  .then(() => console.log("Flattening completed!"))
  .catch(error => console.error("Error:", error));
```

## API Response Handling

The application handles different API response scenarios:

### 200 - Success
- **Synchronous processing**: Immediate result
- **Response**: Binary PDF data or JSON with base64 PDF
- **Action**: Save PDF file directly

### 202 - Accepted
- **Asynchronous processing**: Requires polling
- **Response**: Location header for polling URL
- **Action**: Poll the API until completion

### Other Status Codes
- **Error handling**: Display status code and response text
- **Action**: Exit with error message

## Retry Configuration

For asynchronous processing, the application uses retry logic:

```javascript
const MAX_RETRIES = 10;        // Maximum polling attempts
const RETRY_DELAY = 10000;     // 10 seconds between attempts
```

## Output

The application generates:
- **Console output**: Progress messages and status updates
- **PDF file**: Flattened PDF saved to the specified output path

### Sample Output

```
Starting PDF Flattening Process...
This converts all interactive PDF elements into static, non-editable content
Use cases: Final documents, preventing edits, archival purposes
----------------------------------------------------------------------
Flattening: unflattened-sample.pdf → Flatten_PDF_output.pdf
Converting interactive elements to static content...
Reading and encoding PDF file...
PDF file successfully encoded to base64
Sending request to PDF4Me API...
Status code: 202
Request accepted. PDF4Me is processing asynchronously...
Polling URL: https://api.pdf4me.com/api/v2/FlattenPdf/...
Waiting for result... (Attempt 1/10)
PDF flattening completed successfully!
Response is a valid PDF file
Flattened PDF saved successfully to: Flatten_PDF_output.pdf
All interactive elements have been converted to static content
```

## Error Handling

The application includes comprehensive error handling:

- **File not found**: Validates input file existence
- **API errors**: Handles various HTTP status codes
- **Network issues**: Retry logic for async operations
- **Invalid responses**: Validates PDF content and JSON responses
- **File system errors**: Handles file read/write operations

## Cross-Platform Compatibility

This application is designed to run on:
- **Windows**: Tested on Windows 10/11
- **macOS**: Compatible with macOS 10.15+
- **Linux**: Works on Ubuntu, CentOS, and other distributions

## Dependencies

- **Node.js built-in modules**: `fs`, `path`
- **Global fetch API**: Available in Node.js 18+
- **No external dependencies**: Self-contained application

## Troubleshooting

### Common Issues

1. **"Input PDF file not found"**
   - Ensure the input file exists in the specified path
   - Check file permissions

2. **"API request failed"**
   - Verify internet connection
   - Check API key validity
   - Ensure PDF file is not corrupted

3. **"Timeout: PDF flattening did not complete"**
   - Large files may take longer to process
   - Increase `MAX_RETRIES` or `RETRY_DELAY` values
   - Check API service status

4. **"Response doesn't appear to be a valid PDF"**
   - API may have returned an error message instead of PDF
   - Check the response content for error details

### Debug Mode

To see more detailed information, you can modify the code to log additional details:

```javascript
// Add this to see full API responses
console.log("Full response:", JSON.stringify(response, null, 2));
```

## Security Considerations

- **API Key**: The API key is embedded in the code for demonstration
- **File Handling**: Input files are read locally, not uploaded to external servers
- **Data Privacy**: PDF content is processed by PDF4Me API according to their privacy policy

## License

This project is licensed under the MIT License.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Application functionality**: Check the troubleshooting section above
- **Code modifications**: Review the code comments for guidance 