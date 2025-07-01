# PDF Attachment Extraction - JavaScript

A simple JavaScript client for extracting attachments from PDF documents using the PDF4me API.

## Features

- ✅ Extract all file attachments embedded within PDF documents
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for network issues
- ✅ Comprehensive error handling
- ✅ No external dependencies required
- ✅ Cross-platform compatibility (Windows, Mac, Linux)

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Extract Attachment From PDF"
   ```

2. Install dependencies (none required, but npm install is good practice):
   ```bash
   npm install
   ```

## Usage

### Quick Start

1. Place your PDF file in the project directory and name it `sample.pdf`
2. Run the application:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

### Configuration

The application uses the following configuration:

```javascript
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const INPUT_FILE = 'sample.pdf'; // Path to the main PDF file
const OUTPUT_FOLDER = 'Extract_attachment_outputs'; // Output folder for extracted attachments
```

### Output

The application will:

1. Create an `Extract_attachment_outputs` folder if it doesn't exist
2. Extract all attachments from the PDF
3. Save extracted content as `.txt` files with descriptive names
4. Handle both text and binary attachments
5. Provide detailed logging of the extraction process

### Response Handling

- **200 Success**: Attachment extraction completed immediately
- **202 Accepted**: Asynchronous processing with automatic polling
- **Other codes**: Error message with status code and response text

### Retry Logic

- **Max retries**: 10 attempts
- **Retry delay**: 10 seconds between attempts
- **Polling retries**: 10 attempts for async processing
- **Polling delay**: 10 seconds between status checks

## File Structure

```
Extract Attachment From PDF/
├── app.js                 # Main application file
├── package.json           # Project configuration
├── README.md             # This file
├── sample.pdf            # Input PDF file (place your PDF here)
└── Extract_attachment_outputs/  # Output folder (created automatically)
    ├── attachment_1_extracted.txt
    ├── attachment_1_barcode.txt
    ├── attachment_1_doctext.txt
    └── extraction_info.txt
```

## API Endpoint

- **Base URL**: `https://api.pdf4me.com/`
- **Endpoint**: `/api/v2/ExtractAttachmentFromPdf`
- **Method**: POST
- **Authentication**: Basic Auth with API key

## Error Handling

The application includes comprehensive error handling:

- File not found errors
- Network connectivity issues
- API authentication errors
- Processing timeouts
- Invalid response formats

All errors are logged to the console and saved to error files in the output folder.

## Cross-Platform Compatibility

This application works on:
- ✅ Windows
- ✅ macOS
- ✅ Linux

No additional software installation required beyond Node.js and npm.

## Troubleshooting

### Common Issues

1. **"Input file sample.pdf not found"**
   - Make sure your PDF file is named `sample.pdf` and is in the project directory

2. **"Error making API request"**
   - Check your internet connection
   - Verify the API key is correct
   - Ensure the PDF file is not corrupted

3. **"Timeout: Processing did not complete"**
   - The PDF might be very large or complex
   - Try with a smaller PDF file
   - Check if the API service is available

### Logs

The application provides detailed console output including:
- File reading status
- API request progress
- Processing status updates
- Success/failure messages
- Error details

## License

MIT License - see package.json for details. 