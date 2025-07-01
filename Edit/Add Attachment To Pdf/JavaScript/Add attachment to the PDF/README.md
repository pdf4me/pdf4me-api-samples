# PDF Attachment Adder

Add file attachments to PDF documents using PDF4Me API. This JavaScript application allows you to attach various file types (like .txt, .doc, .jpg, .png, etc.) to PDF documents for enhanced document management.

## Features

- **File Attachment**: Add any file type as an attachment to PDF documents
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Async Processing**: Supports both synchronous and asynchronous API processing
- **Error Handling**: Comprehensive error handling with retry logic
- **No Dependencies**: Uses only Node.js built-in modules

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Usually comes with Node.js

## Installation

1. **Clone or download** this project to your local machine
2. **Navigate** to the project directory:
   ```bash
   cd "Add attachment to the PDF"
   ```
3. **Verify** Node.js installation:
   ```bash
   node --version
   npm --version
   ```

## Usage

### Basic Usage

1. **Prepare your files**:
   - Place your PDF file as `sample.pdf` in the project directory
   - Place your attachment file as `sample.txt` in the project directory

2. **Run the application**:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

3. **Check the output**:
   - The processed PDF will be saved as `Add_attachment_to_PDF_output.pdf`
   - Open the PDF in a PDF viewer and look for the attachment panel

### Customizing File Paths

You can modify the file paths in `app.js`:

```javascript
// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                    // Path to the main PDF file
const ATTACHMENT_FILE_PATH = "sample.txt";              // Path to the attachment file
const OUTPUT_PDF_PATH = "Add_attachment_to_PDF_output.pdf"; // Output PDF file name
```

### Supported File Types

The attachment feature supports various file types:
- **Text files**: .txt, .md, .log
- **Documents**: .doc, .docx, .pdf
- **Images**: .jpg, .jpeg, .png, .gif, .bmp
- **Spreadsheets**: .xls, .xlsx, .csv
- **Presentations**: .ppt, .pptx
- **And more**: Any file type can be attached

## API Configuration

The application uses the PDF4Me API with the following configuration:

```javascript
// API Configuration
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/AddAttachmentToPdf`;
```

## Process Flow

1. **File Validation**: Checks if input files exist
2. **Base64 Encoding**: Converts PDF and attachment files to base64
3. **API Request**: Sends request to PDF4Me API
4. **Response Handling**: 
   - **200**: Immediate success, saves PDF
   - **202**: Asynchronous processing, polls for completion
   - **Other**: Error handling with status codes
5. **File Saving**: Saves the processed PDF with attachments

## Error Handling

The application handles various error scenarios:

- **File not found**: Validates input files before processing
- **API errors**: Displays status codes and error messages
- **Network issues**: Retry logic for async processing
- **Invalid responses**: Graceful handling of unexpected response formats

## Output

- **Success**: PDF file saved with attachments
- **Instructions**: How to access attachments in PDF viewers
- **Error messages**: Clear error descriptions for troubleshooting

## Troubleshooting

### Common Issues

1. **"PDF file not found"**
   - Ensure `sample.pdf` exists in the project directory
   - Check file permissions

2. **"Attachment file not found"**
   - Ensure `sample.txt` exists in the project directory
   - Verify the file path in the code

3. **"API request failed"**
   - Check your internet connection
   - Verify the API key is valid
   - Ensure the API endpoint is accessible

4. **"Timeout: Processing did not complete"**
   - The API is taking longer than expected
   - Try running the application again
   - Check if the API service is experiencing high load

### Debug Information

The application provides detailed logging:
- File sizes and encoding status
- API request status codes
- Processing progress for async operations
- Error details with status codes

## Technical Details

### Dependencies
- **Node.js built-in modules**: `fs`, `path`
- **Global fetch**: Available in Node.js 18+

### API Endpoints
- **Main endpoint**: `https://api.pdf4me.com/api/v2/AddAttachmentToPdf`
- **Polling**: Uses Location header for async processing

### Response Handling
- **Binary PDF**: Direct file saving
- **JSON response**: Extracts PDF data from various response formats
- **Error responses**: Displays status codes and error messages

## License

This project is licensed under the MIT License.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Application functionality**: Check the troubleshooting section
- **Node.js issues**: Refer to Node.js documentation

## Version History

- **v1.0.0**: Initial release with PDF attachment functionality
  - Support for various file types
  - Async processing with retry logic
  - Comprehensive error handling
  - Cross-platform compatibility 