# Word Tracking Changes Enabler

A JavaScript application that enables tracking changes functionality in Word documents using the PDF4Me API. This tool allows users to activate the track changes feature in Word documents, making it possible to see modifications, additions, and deletions when the document is opened in Microsoft Word.

## Features

- **Enable Tracking Changes**: Activates the track changes functionality in Word documents
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Async Processing**: Supports both synchronous and asynchronous API processing
- **Retry Logic**: Robust error handling with automatic retry mechanism
- **File Validation**: Validates input files and output results
- **Professional Output**: Clean, professional console output without emojis

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Node package manager (usually comes with Node.js)

## Installation

1. **Clone or download** this project to your local machine
2. **Navigate** to the project directory:
   ```bash
   cd "Generate/Enable Tracking changes in word/JavaScript/Enable Tracking changes in word"
   ```
3. **No additional dependencies** required - the project uses only Node.js built-in modules

## Usage

### Basic Usage

1. **Place your Word document** in the project directory with the name `sample.docx`
2. **Run the application**:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

### Configuration

You can modify the following settings in `app.js`:

```javascript
// API Configuration
const API_KEY = "your-api-key-here";
const BASE_URL = "https://api.pdf4me.com/";

// File paths
const INPUT_WORD_PATH = "sample.docx";                    // Input file
const OUTPUT_WORD_PATH = "sample_tracking_output.docx";   // Output file

// Retry settings
const MAX_RETRIES = 10;        // Maximum polling attempts
const RETRY_DELAY = 10000;     // Delay between attempts (10 seconds)
```

## How It Works

### Process Flow

1. **File Validation**: Checks if the input Word document exists
2. **File Encoding**: Reads and encodes the Word document to base64
3. **API Request**: Sends the encoded document to PDF4Me API
4. **Response Handling**: 
   - **200**: Immediate success - saves the result
   - **202**: Asynchronous processing - polls for completion
   - **Other**: Error handling with detailed messages
5. **Result Processing**: Saves the processed Word document with tracking enabled

### API Endpoints

- **Base URL**: `https://api.pdf4me.com/`
- **Endpoint**: `/api/v2/EnableTrackingChangesInWord`
- **Method**: POST
- **Authentication**: Basic Auth with API key

### Payload Structure

```json
{
  "docContent": "base64-encoded-word-document",
  "docName": "output.docx",
  "async": true
}
```

## Response Handling

### Status Codes

- **200**: Success - Word document with tracking enabled returned immediately
- **202**: Accepted - Processing asynchronously, requires polling
- **Other**: Error - Detailed error message provided

### Async Processing

When the API returns status 202:
1. Extracts the polling URL from the `Location` header
2. Polls the URL every 10 seconds
3. Continues until completion or maximum retries reached
4. Saves the result when processing completes

## Output

The application generates:
- **Console output**: Progress messages and status updates
- **Output file**: `sample_tracking_output.docx` (or configured name)
- **Error messages**: Detailed error information if processing fails

## Error Handling

The application handles various error scenarios:
- **File not found**: Validates input file existence
- **API errors**: Handles HTTP error responses
- **Network issues**: Retry logic for connection problems
- **Invalid responses**: Validates response format and content

## File Formats

### Input
- **Supported**: `.docx` (Word 2007+ format)
- **Encoding**: Binary file read and base64 encoded

### Output
- **Format**: `.docx` (Word 2007+ format)
- **Features**: Tracking changes enabled
- **Compatibility**: Opens in Microsoft Word with track changes visible

## Troubleshooting

### Common Issues

1. **"Input Word document file not found"**
   - Ensure `sample.docx` exists in the project directory
   - Check file permissions

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure API endpoint is accessible

3. **"Polling failed"**
   - Increase `MAX_RETRIES` for slow processing
   - Check API service status
   - Verify file size isn't too large

4. **"Response doesn't appear to be a valid Word document"**
   - Check API response format
   - Verify API key permissions
   - Contact PDF4Me support if issue persists

### Debug Mode

To enable detailed logging, modify the console.log statements in the code or add debug flags.

## API Documentation

For detailed API documentation, visit:
- PDF4Me API Documentation: [https://api.pdf4me.com/](https://api.pdf4me.com/)

## License

This project is licensed under the MIT License.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **This application**: Check the troubleshooting section above
- **Word document issues**: Ensure the input file is a valid .docx format

## Version History

- **v1.0.0**: Initial release with basic tracking changes functionality
  - Support for .docx files
  - Async processing with retry logic
  - Cross-platform compatibility
  - Professional console output 