# Find and Replace Text in PDF

This JavaScript application uses the PDF4Me API to search for specific text in PDF documents and replace it with new text. The application supports both synchronous and asynchronous processing with automatic retry logic.

## Features

- **Text Search and Replace**: Find specific text in PDF documents and replace it with new text
- **Page Selection**: Specify which pages to process using page sequences
- **Async Processing**: Handles both immediate (200) and asynchronous (202) API responses
- **Retry Logic**: Automatic polling for async operations with configurable retry attempts
- **Cross-Platform**: Works on Windows, macOS, and Linux without additional dependencies
- **Error Handling**: Comprehensive error handling with detailed logging

## Prerequisites

- Node.js version 18.0.0 or higher
- npm (comes with Node.js)
- PDF4Me API key

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Find Search/Find and Replace Text/JavaScript/Find and Replace Text"
   ```

2. No additional dependencies required - the application uses only Node.js built-in modules.

## Configuration

### API Configuration

The application uses the following API configuration:

```javascript
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/FindAndReplace`;
```

### File Configuration

```javascript
const INPUT_PDF_PATH = "sample.pdf";                    // Path to input PDF file
const OUTPUT_PDF_PATH = "find_and_replace_PDF_output.pdf"; // Output PDF file name
```

### Find and Replace Configuration

```javascript
const OLD_TEXT = "This is some";                       // Text to be searched and replaced
const NEW_TEXT = "Here is few";                        // Text to replace with
const PAGE_SEQUENCE = "1";                             // Page indices (all pages if not specified)
```

### Retry Configuration

```javascript
const MAX_RETRIES = 10;                                // Maximum number of polling attempts
const RETRY_DELAY = 10000;                             // Delay between attempts (10 seconds)
```

## Usage

### Basic Usage

1. Place your input PDF file as `sample.pdf` in the project directory
2. Run the application:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

### Custom Configuration

To modify the find and replace parameters, edit the configuration constants in `app.js`:

```javascript
// Change these values as needed
const OLD_TEXT = "Your search text here";
const NEW_TEXT = "Your replacement text here";
const PAGE_SEQUENCE = "1,2,3";  // Process pages 1, 2, and 3
```

### Page Sequence Examples

- `"1"` - Process only page 1
- `"1,2,3"` - Process pages 1, 2, and 3
- `"1-5"` - Process pages 1 through 5
- `"1,3,5-7"` - Process pages 1, 3, and 5 through 7
- `""` or omit - Process all pages

## API Response Handling

The application handles different API response scenarios:

### Status 200 - Success
- Immediate processing completion
- PDF file saved directly to output path
- Success message displayed

### Status 202 - Accepted
- Asynchronous processing initiated
- Automatic polling with retry logic
- Progress updates during processing
- PDF file saved upon completion

### Error Responses
- Detailed error messages with status codes
- Response text displayed for debugging
- Graceful error handling with exit codes

## Output

The application generates:
- `find_and_replace_PDF_output.pdf` - The processed PDF with text replaced
- Console output showing:
  - Processing status and progress
  - File sizes and validation
  - Success/error messages
  - Polling attempts for async operations

## Error Handling

The application includes comprehensive error handling:

- **File Not Found**: Validates input PDF existence
- **API Errors**: Handles HTTP status codes and error responses
- **Network Issues**: Retry logic for connection problems
- **Invalid Responses**: Validates PDF content and JSON responses
- **Timeout Handling**: Configurable timeout for async operations

## Logging

The application provides detailed logging:

- Processing steps and progress
- File operations and sizes
- API request/response details
- Error messages and debugging information
- Polling status for async operations

## Cross-Platform Compatibility

This application is designed to work on multiple platforms:

- **Windows**: Tested on Windows 10/11
- **macOS**: Compatible with macOS 10.15+
- **Linux**: Works on Ubuntu, CentOS, and other distributions

No additional software installation required beyond Node.js and npm.

## Troubleshooting

### Common Issues

1. **"Input PDF file not found"**
   - Ensure `sample.pdf` exists in the project directory
   - Check file permissions

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure PDF4Me service is available

3. **"Timeout: Find and replace operation did not complete"**
   - Increase `MAX_RETRIES` value
   - Check PDF complexity and size
   - Verify API service status

4. **"No PDF data found in the response"**
   - Check API response format
   - Verify PDF content is valid
   - Review API documentation for changes

### Debug Mode

To enable additional debugging, modify the logging statements in `app.js` to include more detailed information about API responses and file operations.

## API Documentation

For more information about the PDF4Me Find and Replace API:

- **Endpoint**: `https://api.pdf4me.com/api/v2/FindAndReplace`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: application/json

### Request Payload

```json
{
  "docContent": "base64_encoded_pdf_content",
  "docName": "filename.pdf",
  "oldText": "text_to_search",
  "newText": "text_to_replace",
  "pageSequence": "1,2,3",
  "async": true
}
```

## License

This project is licensed under the MIT License.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Application Logic**: Review the code comments and error messages
- **Node.js Issues**: Check Node.js documentation and version compatibility 