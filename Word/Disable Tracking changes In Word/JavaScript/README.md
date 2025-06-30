# Word Document Tracking Changes Disable

Disable tracking changes in Word documents using the PDF4Me API. This project removes all tracked changes, comments, and revision marks from Word documents.

## Features

- ✅ Disable tracking changes in Word documents
- ✅ Remove revision marks and comments
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling
- ✅ No external dependencies (uses Node.js built-in modules)
- ✅ Detailed logging and progress tracking
- ✅ Preserves document formatting and content

## Prerequisites

- **Node.js 18.0.0 or higher** (required for built-in `fetch` API)
- **Internet connection** for API access
- **Valid PDF4Me API key**

## Quick Start

1. **Download the project folder**
2. **Place your Word document** in the project directory (rename to `sample.docx` or update the path in `app.js`)
3. **Run the conversion**:
   ```bash
   node app.js
   ```

The processed Word document will be saved as `sample.tracking_disabled.docx` in the same directory.

## Project Structure

```
Disable Tracking changes In Word/JavaScript/
├── app.js              # Main application file
├── package.json        # Project configuration
├── README.md          # This file
└── sample.docx        # Sample Word document (your input)
```

## Configuration

### File Paths
Edit the constants in `app.js` to customize file paths:

```javascript
const DOCX_FILE_PATH = "sample.docx";                    // Your Word document
const OUTPUT_PATH = "sample.tracking_disabled.docx";     // Output document name
```

### API Settings
The API key and endpoint are pre-configured:

```javascript
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
```

### Processing Options
Customize the processing settings in the payload:

```javascript
const payload = {
    docName: "output.docx",        // Output document name
    docContent: base64Content,     // Base64 encoded Word document
    async: true                    // Enable async processing
};
```

## Usage Examples

### Basic Processing
```bash
# Simple processing with default settings
node app.js
```

### Custom File Paths
Edit `app.js` to use different files:
```javascript
const DOCX_FILE_PATH = "my-document.docx";
const OUTPUT_PATH = "processed-document.docx";
```

## API Response Handling

The application handles different API responses:

- **200 (Success)**: Direct Word document response, saved immediately
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

1. **"Word document file not found"**
   - Ensure your Word document exists in the project directory
   - Check the file path in `DOCX_FILE_PATH`

2. **"API request failed"**
   - Verify internet connection
   - Check API key validity
   - Ensure Word document is valid

3. **"Polling failed"**
   - Large files may take longer to process
   - Increase `MAX_RETRIES` or `RETRY_DELAY` in the code

4. **"Node.js version too old"**
   - Upgrade to Node.js 18.0.0 or higher
   - Check version with: `node --version`

### Performance Tips

- **Small files (< 1MB)**: Usually process synchronously (200 response)
- **Large files (> 1MB)**: Process asynchronously (202 response) with polling
- **Complex documents**: May take longer to process

## API Documentation

This project uses the PDF4Me DisableTrackingChangesInWord API v2:

- **Endpoint**: `https://api.pdf4me.com/api/v2/DisableTrackingChangesInWord`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: application/json

### Supported Word Features

- ✅ Tracked changes and revisions
- ✅ Comments and annotations
- ✅ Revision marks
- ✅ Document formatting preservation
- ✅ All Word document versions (.docx)

## What Gets Removed

The API removes the following from Word documents:

- ✅ All tracked changes and revisions
- ✅ Comments and annotations
- ✅ Revision marks and highlighting
- ✅ Author information for changes
- ✅ Timestamps for modifications

## License

MIT License - feel free to use and modify as needed.

## Support

For issues with the PDF4Me API, refer to the official documentation or contact support. 