# Replace Text With Image In Word - JavaScript

A Node.js application that replaces specified text in Word documents with images using the PDF4Me API. This tool is useful for automating document customization, adding signatures, logos, or any image-based content to Word documents.

## Features

- **Text Replacement**: Replace specific text strings with images in Word documents
- **Multiple Page Support**: Process specific pages or entire documents
- **Async Processing**: Handles both synchronous and asynchronous API responses
- **Retry Logic**: Robust polling mechanism for long-running operations
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **No Dependencies**: Uses only Node.js built-in modules

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Node Package Manager (comes with Node.js)
- **PDF4Me API Key**: Valid API key for authentication

## Installation

1. **Clone or download** this project to your local machine
2. **Navigate** to the project directory:
   ```bash
   cd "Generate/Replace Text With Image In Word/JavaScript/Replace Text With Image In Word"
   ```
3. **Verify Node.js installation**:
   ```bash
   node --version
   npm --version
   ```

## Configuration

### API Configuration

The application uses the following configuration (already set in `app.js`):

```javascript
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ReplaceTextWithImageInWord`;
```

### File Configuration

Update these paths in `app.js` as needed:

```javascript
const INPUT_WORD_PATH = "sample.docx";                    // Your Word document
const INPUT_IMAGE_PATH = "sample.png";                    // Your image file
const OUTPUT_WORD_PATH = "Replace_text_with_image_output.docx"; // Output file
```

### Search Configuration

Customize the text replacement settings:

```javascript
const payload = {
    SearchText: "SIGN_HERE",                   // Text to search and replace
    PageNumbers: "1",                          // Pages to process
    IsFirstPageSkip: false,                    // Skip first page if needed
    // ... other options
};
```

## Usage

### Basic Usage

1. **Place your files** in the project directory:
   - `sample.docx` - Your Word document
   - `sample.png` - Your image file

2. **Run the application**:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

3. **Check the output**:
   - The modified Word document will be saved as `Replace_text_with_image_output.docx`

### Advanced Configuration

#### Multiple Pages
To process multiple pages, modify the `PageNumbers` parameter:
```javascript
PageNumbers: "1,2,3"  // Process pages 1, 2, and 3
```

#### Different Search Text
To replace different text, modify the `SearchText` parameter:
```javascript
SearchText: "YOUR_CUSTOM_TEXT"  // Replace your specific text
```

#### Skip First Page
To skip the first page during processing:
```javascript
IsFirstPageSkip: true  // Skip first page
```

## Supported File Formats

### Input Word Documents
- `.docx` (Word 2007 and later)
- `.doc` (Word 97-2003)

### Input Images
- `.png` (Portable Network Graphics)
- `.jpg` / `.jpeg` (JPEG)
- `.gif` (Graphics Interchange Format)
- `.bmp` (Bitmap)
- `.tiff` (Tagged Image File Format)

## API Response Handling

The application handles different API response scenarios:

### Status Code 200 - Success
- Immediate processing completion
- Word document saved directly

### Status Code 202 - Accepted
- Asynchronous processing initiated
- Automatic polling with retry logic
- Maximum 10 retries with 10-second intervals

### Other Status Codes
- Error messages displayed with status code and response text
- Application exits with error code 1

## Error Handling

The application includes comprehensive error handling:

- **File Validation**: Checks for input file existence
- **API Errors**: Handles network and API-specific errors
- **Response Validation**: Validates Word document format in responses
- **Timeout Protection**: Prevents infinite polling with retry limits

## Troubleshooting

### Common Issues

1. **"Input Word file not found"**
   - Ensure `sample.docx` exists in the project directory
   - Check file permissions

2. **"Input image file not found"**
   - Ensure `sample.png` exists in the project directory
   - Verify image file format is supported

3. **"API request failed"**
   - Check your internet connection
   - Verify API key is valid
   - Ensure PDF4Me service is available

4. **"Timeout: Text replacement did not complete"**
   - Large files may take longer to process
   - Check PDF4Me service status
   - Try with a smaller document

### Debug Information

The application provides detailed logging:
- File encoding progress
- API request details
- Response status codes
- Processing status updates
- Error messages with context

## Performance Considerations

- **File Size**: Larger documents take longer to process
- **Image Size**: High-resolution images increase processing time
- **Network**: Internet connection speed affects API response times
- **Async Processing**: Recommended for files larger than 1MB

## Security Notes

- API key is included in the code for demonstration
- In production, use environment variables for API keys
- Input files are processed locally and sent to PDF4Me API
- No files are stored permanently on PDF4Me servers

## API Documentation

For more information about the PDF4Me API:
- **Endpoint**: `https://api.pdf4me.com/api/v2/ReplaceTextWithImageInWord`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: application/json

## License

This project is licensed under the MIT License.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **This Application**: Check the troubleshooting section above
- **Node.js**: Refer to official Node.js documentation

## Changelog

### Version 1.0.0
- Initial release
- Support for Word document text replacement with images
- Async processing with retry logic
- Cross-platform compatibility
- Comprehensive error handling 