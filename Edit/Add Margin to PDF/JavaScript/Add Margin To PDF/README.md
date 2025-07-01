# Add Margin to PDF - JavaScript

A Node.js application that adds custom margins to PDF documents using the PDF4Me API. This tool allows you to modify the margins of any PDF document and automatically adjusts the page size to accommodate the new margins.

## Features

- **Custom Margin Control**: Add margins to any side of the PDF (left, right, top, bottom)
- **Automatic Page Resizing**: Page size is automatically adjusted to fit the new margins
- **Asynchronous Processing**: Supports both synchronous and asynchronous API processing
- **Retry Logic**: Robust error handling with automatic retry for async operations
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **No Dependencies**: Uses only built-in Node.js modules

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Usually comes with Node.js
- **Internet Connection**: Required for API communication

## Installation

1. **Clone or download** this project to your local machine
2. **Navigate** to the project directory:
   ```bash
   cd "Add Margin To PDF"
   ```
3. **Install dependencies** (none required, but npm install is good practice):
   ```bash
   npm install
   ```

## Configuration

### API Key
The application uses a pre-configured API key for PDF4Me services. If you need to use your own API key, modify the `API_KEY` constant in `app.js`:

```javascript
const API_KEY = "your-api-key-here";
```

### File Paths
Default file paths are configured in `app.js`:

```javascript
const INPUT_PDF_PATH = "sample.pdf";                    // Input PDF file
const OUTPUT_PDF_PATH = "Add_margin_to_PDF_output.pdf"; // Output PDF file
```

### Margin Settings
Default margin values (in millimeters) are set in the payload:

```javascript
const payload = {
    marginLeft: 20,    // Left margin: 0-100mm
    marginRight: 20,   // Right margin: 0-100mm
    marginTop: 25,     // Top margin: 0-100mm
    marginBottom: 25,  // Bottom margin: 0-100mm
    async: true        // Enable async processing
};
```

## Usage

### Basic Usage

1. **Place your PDF file** in the project directory (default: `sample.pdf`)
2. **Run the application**:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

### Custom Margins

To modify the margins, edit the payload in `app.js`:

```javascript
const payload = {
    docContent: pdfBase64,
    docName: "output.pdf",
    marginLeft: 30,    // Custom left margin
    marginRight: 15,   // Custom right margin
    marginTop: 40,     // Custom top margin
    marginBottom: 20,  // Custom bottom margin
    async: true
};
```

### Programmatic Usage

You can also use the functions programmatically:

```javascript
const { addMarginToPdf } = require('./app.js');

// Run the complete process
addMarginToPdf().then(() => {
    console.log('Margin addition completed!');
}).catch(error => {
    console.error('Error:', error.message);
});
```

## API Response Handling

The application handles different API response scenarios:

### 200 - Success (Synchronous)
- Processing completed immediately
- PDF is saved directly to output file

### 202 - Accepted (Asynchronous)
- Request is being processed asynchronously
- Application polls the API until completion
- Retry logic with configurable attempts and delays

### Error Responses
- Detailed error messages with status codes
- Graceful error handling and exit

## File Structure

```
Add Margin To PDF/
├── app.js              # Main application file
├── package.json        # Project configuration
├── README.md          # This documentation
├── sample.pdf         # Input PDF file (your file)
└── Add_margin_to_PDF_output.pdf  # Output file (generated)
```

## Technical Details

### API Endpoint
- **Base URL**: `https://api.pdf4me.com/`
- **Endpoint**: `/api/v2/AddMargin`
- **Method**: POST
- **Content-Type**: application/json

### Authentication
- **Type**: Basic Authentication
- **Format**: `Authorization: Basic {api_key}`

### Payload Structure
```json
{
    "docContent": "base64-encoded-pdf",
    "docName": "output.pdf",
    "marginLeft": 20,
    "marginRight": 20,
    "marginTop": 25,
    "marginBottom": 25,
    "async": true
}
```

### Retry Configuration
- **Max Retries**: 10 attempts
- **Retry Delay**: 10 seconds between attempts
- **Total Timeout**: ~100 seconds for async processing

## Error Handling

The application includes comprehensive error handling:

- **File Validation**: Checks if input PDF exists and is valid
- **API Errors**: Handles HTTP status codes and error responses
- **Network Issues**: Retry logic for connection problems
- **Processing Timeouts**: Graceful handling of long-running operations

## Troubleshooting

### Common Issues

1. **"Input PDF file not found"**
   - Ensure `sample.pdf` exists in the project directory
   - Check file permissions

2. **"API request failed"**
   - Verify internet connection
   - Check API key validity
   - Ensure PDF file is not corrupted

3. **"Processing did not complete"**
   - Large PDFs may take longer to process
   - Increase `MAX_RETRIES` or `RETRY_DELAY` in the code
   - Check API service status

4. **"Response doesn't appear to be a valid PDF"**
   - API may have returned an error message instead of PDF
   - Check the console output for detailed error information

### Debug Mode

To enable more detailed logging, you can modify the console.log statements in `app.js` or add additional debugging information.

## Performance Considerations

- **File Size**: Larger PDFs take longer to process
- **Margin Values**: Very large margins may affect processing time
- **Network**: Processing time depends on internet connection speed
- **API Load**: Service response times may vary based on server load

## Security Notes

- API key is included in the code for demonstration purposes
- In production, use environment variables for sensitive data
- The application only reads local files and doesn't send data elsewhere

## License

This project is licensed under the MIT License.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Application Logic**: Check the troubleshooting section above
- **Node.js Issues**: Ensure you're using Node.js 18.0.0 or higher

## Changelog

### Version 1.0.0
- Initial release
- Support for custom margin addition
- Asynchronous processing with retry logic
- Cross-platform compatibility 