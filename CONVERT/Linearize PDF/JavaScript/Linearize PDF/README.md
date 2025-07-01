# PDF Linearizer

A JavaScript application that linearizes PDF documents using the PDF4Me API for optimal web viewing performance.

## Overview

PDF linearization optimizes documents for web viewing by restructuring the PDF file to enable:
- **Faster loading**: Progressive display as the file downloads
- **Better performance**: Optimized for online viewing
- **Reduced bandwidth**: Efficient streaming capabilities
- **Improved user experience**: Documents appear faster in web browsers

## Features

- **Web Optimization**: Optimizes PDFs specifically for web viewing
- **Multiple Profiles**: Support for various optimization profiles (web, print, max compression, etc.)
- **Async Processing**: Handles both synchronous and asynchronous API responses
- **Retry Logic**: Robust polling mechanism for long-running operations
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **No Dependencies**: Uses only Node.js built-in modules

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: For package management (included with Node.js)

## Installation

1. **Clone or download** the project files
2. **Navigate** to the project directory:
   ```bash
   cd "Convert/Linearize PDF/JavaScript/Linearize PDF"
   ```
3. **Install dependencies** (none required, but npm install is available):
   ```bash
   npm install
   ```

## Configuration

### API Configuration

The application uses the PDF4Me API with the following configuration:

```javascript
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/LinearizePdf`;
```

### File Configuration

```javascript
const INPUT_PDF_PATH = "sample.pdf";              // Path to input PDF file
const OUTPUT_PDF_PATH = "Linearize_PDF_output.pdf"; // Output linearized PDF file name
```

### Optimization Profiles

The application supports various optimization profiles:

| Profile | Description | Use Case |
|---------|-------------|----------|
| `web` | Optimized for web viewing | Fast loading, progressive display |
| `Max` | Maximum compression | Smallest file size, slower processing |
| `Print` | Optimized for printing | Correct fonts, colors, resolution |
| `Default` | Standard optimization | Balanced approach |
| `WebMax` | Maximum web optimization | Best for online viewing |
| `PrintMax` | Maximum print optimization | Best quality for printing |
| `PrintGray` | Print optimized with grayscale | Grayscale printing |
| `Compress` | General compression | Size reduction without specific optimization |
| `CompressMax` | Maximum compression | Aggressive size reduction |

## Usage

### Basic Usage

1. **Place your PDF file** in the project directory with the name `sample.pdf`
2. **Run the application**:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```
3. **Check the output**: The linearized PDF will be saved as `Linearize_PDF_output.pdf`

### Custom File Names

To use different file names, modify the configuration in `app.js`:

```javascript
const INPUT_PDF_PATH = "your-input-file.pdf";
const OUTPUT_PDF_PATH = "your-output-file.pdf";
```

### Custom Optimization Profile

To change the optimization profile, modify the payload in `app.js`:

```javascript
const payload = {
    docContent: pdfBase64,
    docName: "output.pdf",
    optimizeProfile: "WebMax",  // Change this value
    async: true
};
```

## API Response Handling

The application handles different API response scenarios:

### Status Code 200 - Success
- **Immediate processing**: PDF linearization completed synchronously
- **Direct PDF response**: Binary PDF data saved to file
- **JSON response**: Extracts PDF data from JSON structure

### Status Code 202 - Accepted
- **Asynchronous processing**: API processes the request in the background
- **Polling mechanism**: Automatically polls for completion
- **Retry logic**: Up to 10 attempts with 10-second intervals
- **Progress tracking**: Shows polling attempts and status

### Error Handling
- **File validation**: Checks if input file exists
- **API errors**: Displays status codes and error messages
- **Network issues**: Handles connection problems gracefully
- **Timeout protection**: Prevents infinite polling

## Output

### Success Output
```
Starting PDF Linearization Process...
This optimizes PDF documents for web viewing with faster loading
Linearized PDFs display progressively as they download
Perfect for web applications and online document viewing
-----------------------------------------------------------------
Linearizing: sample.pdf → Linearize_PDF_output.pdf
Reading and encoding PDF file...
PDF file successfully encoded to base64
Sending request to PDF4Me API...
Optimization profile: web
Optimizing PDF for web viewing and faster loading...
Status code: 200
PDF linearization completed immediately!
Response is a valid PDF file
Linearized PDF saved successfully to: Linearize_PDF_output.pdf
PDF is now optimized for web viewing and faster loading
```

### Async Processing Output
```
Status code: 202
Request accepted. PDF4Me is processing asynchronously...
Polling URL: https://api.pdf4me.com/api/v2/...
Waiting for result... (Attempt 1/10)
PDF linearization completed successfully!
Linearized PDF saved successfully to: Linearize_PDF_output.pdf
PDF is now optimized for web viewing and faster loading
```

## Technical Details

### Architecture
- **Modular design**: Separate functions for different responsibilities
- **Error handling**: Comprehensive error catching and reporting
- **Async/await**: Modern JavaScript async patterns
- **Buffer handling**: Efficient binary data processing

### File Processing
- **Base64 encoding**: Converts PDF to text format for API transmission
- **Binary validation**: Checks for valid PDF headers
- **Multiple formats**: Handles both direct PDF and JSON responses
- **Fallback mechanisms**: Multiple strategies for saving files

### API Integration
- **RESTful calls**: Uses fetch API for HTTP requests
- **Authentication**: Basic auth with API key
- **Content negotiation**: Proper headers for JSON and binary data
- **Status handling**: Comprehensive response code processing

## Troubleshooting

### Common Issues

1. **"Input PDF file not found"**
   - Ensure `sample.pdf` exists in the project directory
   - Check file permissions and path

2. **"API request failed"**
   - Verify internet connection
   - Check API key validity
   - Ensure PDF file is not corrupted

3. **"Polling failed"**
   - Network connectivity issues
   - API service temporarily unavailable
   - Large file processing timeout

4. **"No PDF data found in response"**
   - API response format changed
   - Check API documentation for updates
   - Verify payload structure

### Debug Information

The application provides detailed logging:
- File operations and encoding status
- API request details and response codes
- Polling attempts and timing
- Error messages with context

## Performance Considerations

- **File size**: Larger PDFs take longer to process
- **Network speed**: Affects upload and download times
- **API limits**: Consider rate limiting for bulk operations
- **Memory usage**: Large files require more memory for base64 encoding

## Security

- **API key**: Stored in code (consider environment variables for production)
- **File handling**: Validates input files before processing
- **Error messages**: Avoids exposing sensitive information
- **Network**: Uses HTTPS for all API communications

## License

MIT License - see package.json for details

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Application bugs**: Check troubleshooting section
- **Configuration**: Review configuration examples

## Version History

- **v1.0.0**: Initial release with web optimization support 