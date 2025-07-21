# Delete Blank Pages from PDF - Python Implementation

Delete blank pages from PDF documents using the PDF4Me API. This Python project removes pages that contain no text or images based on configurable detection criteria.

## Features

- ✅ Delete blank pages from PDF documents based on specified criteria
- ✅ Support for different blank page detection options:
  - NoTextNoImages: Pages with no text and no images
  - NoText: Pages with no text content
  - NoImages: Pages with no images
- ✅ Configurable blank page detection settings
- ✅ Handle both single and multiple blank pages
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling and logging
- ✅ File I/O operations with proper error handling
- ✅ HTTP client implementation using requests library
- ✅ Page validation and processing status tracking
- ✅ Export cleaned PDF in original format
- ✅ Simple, dependency-light Python implementation

## Prerequisites

- **Python 3.8+**
- **requests library** (install with `pip install requests`)
- **Internet connection** for API access
- **Valid PDF4Me API key** (get from https://dev.pdf4me.com/dashboard/#/api-keys/)
- **PDF file** for testing blank page removal

## Project Structure

```
Delete Blank Pages from PDF/
├── delete_blank_pages_from_pdf.py                # Main script for blank page deletion
├── sample.pdf                                    # Sample PDF file for testing
├── Delete_blank_pages_from_PDF_output.pdf        # Output PDF with blank pages removed (generated)
└── README.md                                     # This file
```

## Setup

### 1. Install Dependencies

```bash
pip install requests
```

### 2. Get API Key
First, you need to get a valid API key from PDF4me:
1. Visit https://dev.pdf4me.com/dashboard/#/api-keys/
2. Create an account and generate an API key
3. Replace the placeholder in `delete_blank_pages_from_pdf.py`:
   ```python
   api_key = "Please get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
   ```

## Usage

### Running the Application

1. **Run the script:**
   ```bash
   python delete_blank_pages_from_pdf.py
   ```

### Expected Output

```
Starting PDF Document Blank Pages Deletion Process
=== Deleting Blank Pages from PDF Document ===
Input PDF: sample.pdf
Output PDF: Delete_blank_pages_from_PDF_output.pdf
Delete page option: NoTextNoImages
Reading and encoding PDF file...
PDF file read successfully: 2456 bytes
Processing blank pages deletion...
Processing response and saving file...
Blank pages deletion completed successfully!
Input file: sample.pdf
Processed file: Delete_blank_pages_from_PDF_output.pdf
Blank pages have been deleted successfully
```

### Input and Output

- **Input:** 
  - `sample.pdf` (PDF file with potential blank pages)
- **Output:** `Delete_blank_pages_from_PDF_output.pdf` (PDF with blank pages removed)

## API Configuration

The application uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/DeleteBlankPages`
- **Authentication:** Basic authentication with API key
- **Features:** Blank page detection, page removal, metadata handling

## Blank Page Detection Settings

The implementation supports these settings:
- **Delete Page Option:** "NoTextNoImages" (configurable - NoTextNoImages, NoText, NoImages)
- **Async Processing:** true (recommended for large files)
- **Document Name:** "output.pdf"

### Supported Detection Options

- **NoTextNoImages:** Removes pages that contain neither text nor images
- **NoText:** Removes pages that contain no text content (may keep pages with images)
- **NoImages:** Removes pages that contain no images (may keep pages with text)

## Implementation Details

### Main Components

1. **Main Functions:**
   - `read_and_encode_pdf()`: Read and encode PDF to base64
   - `delete_blank_pages_from_pdf()`: Main method for blank page deletion
   - `handle_async_response_and_save()`: Handle API responses and save files
   - `main()`: Orchestrator function

### Key Features

- **Async Processing:** Handles both sync and async API responses
- **Retry Logic:** Implements polling with configurable retry attempts (10 retries, 10-second delays)
- **Error Handling:** Comprehensive exception handling and logging
- **File Management:** Efficient file I/O with proper resource management
- **HTTP Client:** Uses requests library for modern HTTP operations

## API Endpoints

- **POST** `/api/v2/DeleteBlankPages` - Deletes blank pages from a PDF document

## Request Payload

```json
{
  "docContent": "base64-encoded-pdf-content",
  "docName": "output.pdf",
  "deletePageOption": "NoTextNoImages",
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
- `requests` - HTTP client for API communication
- `base64` - Base64 encoding/decoding (built-in)
- `json` - JSON serialization (built-in)
- `time` - Time utilities (built-in)
- `os` - Operating system interface (built-in)

## Security Considerations

- API keys should be stored securely (not hardcoded in production)
- Use HTTPS for all API communications
- Validate input files before processing
- Implement proper error handling for sensitive operations
- Consider using environment variables for API keys in production

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error:**
   - Ensure you have set a valid API key in `delete_blank_pages_from_pdf.py`
   - Check that your API key is active and has sufficient credits

2. **File Not Found:**
   - Make sure `sample.pdf` exists in the project directory
   - Check file permissions

3. **Module Not Found:**
   - Run `pip install requests` to install dependencies
   - Ensure you're using Python 3.8 or higher

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
A sample PDF document that will be used for testing blank page deletion functionality.

### Delete_blank_pages_from_PDF_output.pdf
The output file that will be generated after successful blank page removal.

## Expected Workflow

1. Load the PDF document ✅
2. Analyze each page for blank content based on selected criteria ✅
3. Prepare the API request payload with page analysis data ✅
4. Call the PDF4me API to delete blank pages ✅
5. Handle the response (sync/async) ✅
6. Save the resulting PDF without blank pages ✅
7. Provide status feedback to the user ✅

## Next Steps

To complete the testing:
1. Get a valid API key from https://dev.pdf4me.com/dashboard/#/api-keys/
2. Replace the placeholder API key in `delete_blank_pages_from_pdf.py`
3. Run the program to test actual blank page deletion
4. Verify the output file `Delete_blank_pages_from_PDF_output.pdf` is generated and has blank pages removed

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch processing multiple files
- [ ] Configurable detection settings via command line arguments
- [ ] Progress reporting for long-running operations
- [ ] Support for different blank page detection algorithms
- [ ] Web-based user interface

## License

This project is part of the PDF4ME API samples collection.

## Support

For API-related issues, contact PDF4ME support.
For implementation questions, refer to the PDF4ME documentation. 