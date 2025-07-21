# Delete Unwanted Pages from PDF - JavaScript Implementation

Delete specific pages from PDF documents using the PDF4Me API. This JavaScript project removes unwanted pages based on page numbers or ranges.

## Features

- ✅ Delete specific pages from PDF documents by page number
- ✅ Support for page ranges (e.g., "1-3, 5, 7-9")
- ✅ Configurable page deletion settings
- ✅ Handle both single and multiple page deletions
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling and logging
- ✅ File I/O operations with proper error handling
- ✅ HTTP client implementation using Node.js built-in modules
- ✅ Page validation and processing status tracking
- ✅ Export cleaned PDF in original format

## Prerequisites

- **Node.js 18.0.0 or higher**
- **Internet connection** for API access
- **Valid PDF4Me API key** (get from https://dev.pdf4me.com/dashboard/#/api-keys/)
- **PDF file** for testing page deletion

## Project Structure

```
Delete unwanted Pages from PDF/
├── app.js                                         # Main application with complete page deletion logic
├── package.json                                   # Node.js project configuration
├── sample.pdf                                     # Sample PDF file for testing
├── Delete_unwanted_pages_from_PDF_output.pdf      # Output PDF with unwanted pages removed (generated)
└── README.md                                      # This file
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Get API Key
First, you need to get a valid API key from PDF4me:
1. Visit https://dev.pdf4me.com/dashboard/#/api-keys/
2. Create an account and generate an API key
3. Replace the placeholder in `app.js`:
   ```javascript
   const API_KEY = "Please get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
   ```

## Usage

### Running the Application

1. **Run the script:**
   ```bash
   npm start
   ```

   or

   ```bash
   node app.js
   ```

### Expected Output

```
=== Deleting Unwanted Pages from PDF Document ===
Reading PDF file...
PDF file read successfully: sample.pdf (12345 bytes)
Sending PDF page deletion request to PDF4me API...
Response Status Code: 200
Success: Unwanted pages deleted successfully!
Output saved as: Delete_unwanted_pages_from_PDF_output.pdf
PDF with unwanted pages removed saved to: Delete_unwanted_pages_from_PDF_output.pdf
```

### Input and Output

- **Input:** 
  - `sample.pdf` (PDF file with unwanted pages)
- **Output:** `Delete_unwanted_pages_from_PDF_output.pdf` (PDF with unwanted pages removed)

## API Configuration

The application uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/DeletePages`
- **Authentication:** Basic authentication with API key
- **Features:** Page deletion, page range support, metadata handling

## Page Deletion Settings

The implementation supports these settings:
- **Page Numbers:** "1,3,5" (configurable - specify pages to delete)
- **Async Processing:** true (recommended for large files)
- **Document Name:** "output.pdf"

### Page Number Format

- **Single pages:** "1,3,5" - deletes pages 1, 3, and 5
- **Page ranges:** "1-3,5,7-9" - deletes pages 1,2,3,5,7,8,9
- **Mixed format:** "1,3-5,7,9-11" - deletes pages 1,3,4,5,7,9,10,11

## Implementation Details

### Main Components

1. **Main Functions:**
   - `readAndEncodePdf()`: Read and encode PDF to base64
   - `deleteUnwantedPagesFromPdf()`: Main method for page deletion
   - `executeUnwantedPageDeletion()`: HTTP requests and API integration
   - `handleAsyncResponse()`: Async processing with polling
   - `main()`: Orchestrator function

### Key Features

- **Async Processing:** Handles both sync and async API responses
- **Retry Logic:** Implements polling with configurable retry attempts (10 retries, 10-second delays)
- **Error Handling:** Comprehensive exception handling and logging
- **File Management:** Efficient file I/O with proper resource management
- **HTTP Client:** Uses Node.js built-in modules for HTTP operations

## API Endpoints

- **POST** `/api/v2/DeletePages` - Deletes specific pages from a PDF document

## Request Payload

```json
{
  "docContent": "base64-encoded-pdf-content",
  "docName": "output.pdf",
  "pageNumbers": "1,3,5",
  "async": true
}
```

## Response Handling

The application handles two types of responses:

1. **200 OK**: Immediate success, returns the processed PDF
2. **202 Accepted**: Asynchronous processing, polls for completion

## Error Handling

The application handles various error scenarios:
- **401 Unauthorized:** Invalid or missing API key
- **404 Not Found:** Input file not found
- **202 Accepted:** Async processing (handled with polling)
- **500 Server Error:** API server issues
- **Timeout:** Long-running operations that exceed retry limits

## Dependencies

This project uses minimal external dependencies:
- `fs` - File system operations (built-in)
- `path` - Path utilities (built-in)
- `https` - HTTP client (built-in)
- `Buffer` - Binary data handling (built-in)

## Security Considerations

- API keys should be stored securely (not hardcoded in production)
- Use HTTPS for all API communications
- Validate input files before processing
- Implement proper error handling for sensitive operations
- Consider using environment variables for API keys in production

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error:**
   - Ensure you have set a valid API key in `app.js`
   - Check that your API key is active and has sufficient credits

2. **File Not Found:**
   - Make sure `sample.pdf` exists in the project directory
   - Check file permissions

3. **Module Not Found:**
   - Run `npm install` to install dependencies
   - Ensure you're using Node.js 18.0.0 or higher

4. **Network Issues:**
   - Verify internet connectivity
   - Check firewall settings
   - Ensure the PDF4me API is accessible

### Performance Tips

- **Small files (< 5MB):** Usually processed synchronously (200 response)
- **Large files (> 5MB):** Processed asynchronously (202 response) with polling
- **Complex documents:** May take longer to process

## Sample Files

### sample.pdf
A sample PDF document that will be used for testing unwanted page deletion functionality.

### Delete_unwanted_pages_from_PDF_output.pdf
The output file that will be generated after successful page deletion.

## Expected Workflow

1. Load the PDF document ✅
2. Parse page numbers to delete ✅
3. Prepare the API request payload with page deletion data ✅
4. Call the PDF4me API to delete unwanted pages ✅
5. Handle the response (sync/async) ✅
6. Save the resulting PDF without unwanted pages ✅
7. Provide status feedback to the user ✅

## Next Steps

To complete the testing:
1. Get a valid API key from https://dev.pdf4me.com/dashboard/#/api-keys/
2. Replace the placeholder API key in `app.js`
3. Run the program to test actual page deletion
4. Verify the output file `Delete_unwanted_pages_from_PDF_output.pdf` is generated and has unwanted pages removed

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch processing multiple files
- [ ] Configurable page deletion settings via command line arguments
- [ ] Progress reporting for long-running operations
- [ ] Support for different page selection algorithms
- [ ] Web-based user interface

## License

This project is part of the PDF4ME API samples collection.

## Support

For API-related issues, contact PDF4ME support.
For implementation questions, refer to the PDF4ME documentation. 