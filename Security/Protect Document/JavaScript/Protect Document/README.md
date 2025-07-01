# Protect Document - JavaScript Implementation

Protect PDF documents with password using the PDF4Me API. This project adds password protection and permission restrictions to PDF files.

## Features

- ✅ Add password protection to PDF documents
- ✅ Set PDF permissions to control access
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
2. **Place your PDF file** in the project directory (rename to `sample.pdf` or update the path in `app.js`)
3. **Run the protection**:
   ```bash
   node app.js
   ```

The protected PDF will be saved as `sample.protected.pdf` in the same directory.

## Project Structure

```
Protect Document/JavaScript/Protect Document/
├── app.js              # Main application file
├── package.json        # Project configuration
├── README.md          # This file
└── sample.pdf         # Sample PDF file (your input)
```

## Configuration

### File Paths
Edit the constants in `app.js` to customize file paths:

```javascript
const PDF_FILE_PATH = "sample.pdf";                    // Your PDF file
const OUTPUT_PATH = "sample.protected.pdf";           // Output protected PDF name
```

### API Settings
The API key and endpoint are pre-configured:

```javascript
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
```

### Protection Options
Customize the protection settings in the payload:

```javascript
const payload = {
    docName: "output.pdf",        // Output document name
    docContent: base64Content,    // Base64 encoded PDF content
    password: "1234",             // Password for the protected PDF
    pdfPermission: "All",         // PDF permissions
    async: true                   // Enable async processing
};
```

## Usage Examples

### Basic Protection
```bash
# Simple protection with default settings
node app.js
```

### Custom File Paths
Edit `app.js` to use different files:
```javascript
const PDF_FILE_PATH = "my-document.pdf";
const OUTPUT_PATH = "protected-document.pdf";
```

### Custom Password
Modify the payload for different passwords:
```javascript
password: "mySecurePassword123",  // Your custom password
```

## API Response Handling

The application handles different API responses:

- **200 (Success)**: Direct protected PDF response, saved immediately
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

1. **"PDF file not found"**
   - Ensure your PDF file exists in the project directory
   - Check the file path in `PDF_FILE_PATH`

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
- **Complex documents**: May take longer to process

## API Documentation

This project uses the PDF4Me Protect API v2:

- **Endpoint**: `https://api.pdf4me.com/api/v2/Protect`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: application/json

### Supported PDF Features

- ✅ Password protection
- ✅ Permission restrictions
- ✅ Document formatting preservation
- ✅ All PDF versions and standards

## Security Features

The API adds the following security to PDF documents:

- ✅ Password protection (required to open)
- ✅ Permission restrictions (printing, copying, editing)
- ✅ Document encryption
- ✅ Access control settings

## License

MIT License - feel free to use and modify as needed.

## Support

For issues with the PDF4Me API, refer to the official documentation or contact support. 