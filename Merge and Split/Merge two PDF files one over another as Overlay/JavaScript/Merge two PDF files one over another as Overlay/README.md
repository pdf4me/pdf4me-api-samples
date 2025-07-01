# Merge Two PDF Files One Over Another as Overlay - JavaScript

A JavaScript implementation for merging two PDF files one over another as overlay using the PDF4Me API.

## Project Structure

```
Merge two PDF files one over another as Overlay/
├── app.js                 # Main application with complete overlay merge logic
├── package.json           # Node.js dependencies and scripts
├── README.md              # This file
├── sample1.pdf            # First sample PDF file for testing
├── sample2.pdf            # Second sample PDF file for testing
└── Merge_overlay_output.pdf # Output overlaid PDF (generated after successful merge)
```

## Project Status

✅ **IMPLEMENTATION COMPLETE** - Full PDF overlay merge logic implemented and tested.

## Features

- ✅ PDF overlay merge using PDF4me API
- ✅ Support for both base and layer PDF documents
- ✅ Async API calling support with polling
- ✅ Handles both synchronous (200) and asynchronous (202) API responses
- ✅ Comprehensive error handling and logging
- ✅ Configurable retry logic for async operations
- ✅ Base64 encoding for PDF content transmission

## Prerequisites

- Node.js 18.0.0 or higher
- Valid PDF4Me API key
- Two PDF files for testing (sample1.pdf and sample2.pdf)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API key:**
   - Get your API key from: https://dev.pdf4me.com/dashboard/#/api-keys/
   - Update the `API_KEY` constant in `app.js`

3. **Prepare sample files:**
   - Ensure `sample1.pdf` and `sample2.pdf` are in the project directory
   - These will be used as base and layer PDFs respectively

## Usage

### Basic Usage

```bash
npm start
```

### Programmatic Usage

```javascript
const { mergeOverlay } = require('./app.js');

// Merge two PDFs as overlay
const result = await mergeOverlay('sample1.pdf', 'sample2.pdf');
if (result) {
    console.log('Overlay merged PDF saved to:', result);
}
```

## API Configuration

### Endpoints
- **Base URL:** `https://api.pdf4me.com/`
- **Overlay Endpoint:** `api/v2/MergeOverlay`

### Request Payload Structure

```javascript
{
    "baseDocContent": "base64_encoded_base_pdf",
    "baseDocName": "base.pdf",
    "layerDocContent": "base64_encoded_layer_pdf", 
    "layerDocName": "layer.pdf",
    "async": true
}
```

## Response Handling

### Synchronous Response (200)
- Immediate processing completion
- PDF content returned directly in response body
- File saved immediately to output path

### Asynchronous Response (202)
- Processing started, requires polling
- Location header contains polling URL
- Automatic retry logic with configurable delays
- Maximum retry attempts: 10
- Retry delay: 10 seconds

## Error Handling

The application includes comprehensive error handling for:

- **File System Errors:** Missing input files, write permission issues
- **API Errors:** Authentication failures, invalid requests, server errors
- **Network Errors:** Connection timeouts, DNS resolution failures
- **Processing Errors:** Invalid PDF content, processing failures

## Logging

The application provides detailed logging for:

- File operations (read/write)
- API request/response details
- Processing status updates
- Error conditions and stack traces
- Performance metrics

## Configuration Options

### API Settings
```javascript
const API_KEY = "your_api_key_here";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/MergeOverlay`;
```

### File Settings
```javascript
const BASE_PDF_PATH = "sample1.pdf";
const LAYER_PDF_PATH = "sample2.pdf";
const OUTPUT_PDF_PATH = "Merge_overlay_output.pdf";
```

### Async Processing Settings
```javascript
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error**
   - Verify API key is correct and active
   - Check API key permissions

2. **File Not Found Errors**
   - Ensure sample PDF files exist in project directory
   - Check file permissions

3. **Network Timeout Errors**
   - Verify internet connectivity
   - Check firewall settings
   - Increase timeout values if needed

4. **Processing Failures**
   - Verify PDF files are valid and not corrupted
   - Check PDF file sizes (API has limits)
   - Review API response for specific error details

### Debug Mode

Enable detailed logging by setting:
```javascript
const DEBUG_MODE = true;
```

## Performance Considerations

- **File Size:** Large PDF files may require async processing
- **Memory Usage:** Base64 encoding increases memory usage by ~33%
- **Network:** Consider bandwidth for large file uploads
- **API Limits:** Be aware of PDF4Me API rate limits

## Security Notes

- Never commit API keys to version control
- Use environment variables for production deployments
- Validate input files before processing
- Implement proper error handling in production

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the troubleshooting section above
- Review PDF4Me API documentation
- Contact PDF4Me support for API-specific issues

## Changelog

### Version 1.0.0
- Initial implementation
- Complete overlay merge functionality
- Async processing support
- Comprehensive error handling
- Detailed logging and debugging 