# Extract Resources from PDF - JavaScript

This JavaScript application extracts text content and embedded images from PDF documents using the PDF4Me API. It supports both synchronous and asynchronous processing with automatic retry logic.

## Features

- **Text Extraction**: Extracts all text content from PDF documents
- **Image Extraction**: Extracts embedded images from PDF files
- **Asynchronous Processing**: Handles long-running operations with polling
- **Multiple Formats**: Supports various image data formats in API responses
- **Error Handling**: Comprehensive error handling and logging
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Prerequisites

- Node.js version 18.0.0 or higher
- npm (comes with Node.js)
- Internet connection for API access

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Extract/Extract Resources/JavaScript/Extract Resources"
   ```

2. Install dependencies (no external dependencies required):
   ```bash
   npm install
   ```

## Usage

### Basic Usage

1. Place your PDF file in the project directory and name it `sample.pdf`

2. Run the extraction script:
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
// API Configuration
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ExtractResources`;

// File paths
const INPUT_PDF_PATH = "sample.pdf";                    // Input PDF file
const OUTPUT_FOLDER = "Extract_resources_outputs";      // Output folder

// Retry configuration
const MAX_RETRIES = 10;        // Maximum polling attempts
const RETRY_DELAY = 10000;     // Delay between polls (10 seconds)
```

### Output

The application creates an `Extract_resources_outputs` folder containing:

- `extracted_resources.json` - Complete metadata and resource data
- `extracted_text.txt` - Extracted text content from the PDF
- `extracted_image_1.png`, `extracted_image_2.png`, etc. - Extracted images

## API Response Handling

The application handles various response formats:

### Status Codes
- **200**: Success - Processing completed immediately
- **202**: Accepted - Processing started asynchronously (requires polling)
- **Other**: Error - Displays error message with status code

### Response Formats
- **JSON**: Most common format containing structured data
- **Binary**: Fallback for non-JSON responses

### Image Data Detection
The application searches for images in multiple possible field names:
- `images`, `Images`, `imageData`, `extractedImages`, `img`, `pictures`

### Image Content Detection
For each image, it tries multiple content field names:
- `content`, `data`, `base64`, `imageData`, `docContent`

## Error Handling

The application includes comprehensive error handling:

- **File Validation**: Checks if input PDF exists
- **API Errors**: Handles various HTTP status codes
- **JSON Parsing**: Graceful fallback for non-JSON responses
- **Image Processing**: Individual error handling for each image
- **Timeout Protection**: Prevents infinite polling

## Logging

The application provides detailed logging:

- Processing status and progress
- File operations (read, write, create)
- API request/response details
- Error messages with context
- Extraction summary with counts

## Example Output

```
Starting PDF Resource Extraction Process...
This extracts text content and embedded images from PDF documents
------------------------------------------------------------
Created output folder: Extract_resources_outputs
Extracting resources from: sample.pdf
Reading and encoding PDF file...
PDF file read successfully: 102400 bytes
Sending resource extraction request to PDF4Me API...
Status code: 202
Request accepted. PDF4Me is processing asynchronously...
Polling URL: https://api.pdf4me.com/api/v2/ExtractResources/status/12345
Waiting for result... (Attempt 1/10)
Polling status code: 200
Resource extraction completed!
Successfully parsed JSON response
Resource metadata saved: Extract_resources_outputs/extracted_resources.json
Extracted text saved: Extract_resources_outputs/extracted_text.txt
Text preview: This is sample text content from the PDF document...
Found 'images' field with data type: object
Single image object found in 'images'
Found image content in 'content' field
Image saved: Extract_resources_outputs/extracted_image_1.png (45678 bytes)
Successfully extracted images from PDF

Extraction Summary:
  Text sections: 1
  Images: 1
```

## Troubleshooting

### Common Issues

1. **"Input PDF file not found"**
   - Ensure `sample.pdf` exists in the project directory
   - Check file permissions

2. **"API request failed"**
   - Verify internet connection
   - Check API key validity
   - Ensure PDF file is not corrupted

3. **"Timeout: Resource extraction did not complete"**
   - Large PDF files may take longer to process
   - Increase `MAX_RETRIES` or `RETRY_DELAY` values
   - Check API service status

4. **"No images found in PDF response"**
   - PDF may not contain embedded images
   - Check API response structure in `extracted_resources.json`

### Debug Mode

To see detailed API response information, the application logs:
- Response headers
- Response structure
- Image data formats
- Processing steps

## API Documentation

This application uses the PDF4Me ExtractResources API endpoint:
- **Endpoint**: `https://api.pdf4me.com/api/v2/ExtractResources`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: application/json

### Request Payload
```json
{
  "docContent": "base64_encoded_pdf_content",
  "docName": "sample.pdf",
  "extractText": true,
  "extractImage": true,
  "async": true
}
```

## License

MIT License - see package.json for details.

## Support

For issues related to:
- **API Access**: Contact PDF4Me support
- **Application Logic**: Check the troubleshooting section above
- **Node.js Issues**: Ensure you're using Node.js 18.0.0 or higher 