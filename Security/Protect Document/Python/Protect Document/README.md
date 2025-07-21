# Protect Document - Python Implementation

Protect PDF documents with password using the PDF4Me API. This Python project adds password protection and permission restrictions to PDF files.

## Features

- ✅ Add password protection to PDF documents
- ✅ Set PDF permissions to control access
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling and logging
- ✅ File I/O operations with proper error handling
- ✅ HTTP client implementation using requests library
- ✅ Preserves document formatting and content
- ✅ Simple, dependency-light Python implementation

## Prerequisites

- **Python 3.8+**
- **requests library** (install with `pip install requests`)
- **Internet connection** for API access
- **Valid PDF4Me API key** (get from https://dev.pdf4me.com/dashboard/#/api-keys/)

## Project Structure

```
Protect Document/
├── protect_document.py           # Main script for PDF protection
├── sample.pdf                    # Sample PDF file for testing
├── sample.protected.pdf          # Output protected PDF (generated)
└── README.md                     # This file
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
3. Replace the placeholder in `protect_document.py`:
   ```python
   api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
   ```

## Usage

### Running the Application

1. **Run the script:**
   ```bash
   python protect_document.py
   ```

### Expected Output

```
Starting PDF Document Protection Process
=== Protecting PDF Document ===
Input PDF: sample.pdf
Output protected PDF: sample.protected.pdf
Protection password: 1234
PDF permissions: All
Reading and encoding PDF file...
PDF file read successfully: 14601 bytes
Processing PDF protection...
Processing response and saving file...
PDF protection completed successfully!
Input file: sample.pdf
Protected file: sample.protected.pdf
PDF document has been protected with password: 1234
The protected PDF requires the password to open
```

### Input and Output

- **Input:** 
  - `sample.pdf` (PDF file to protect)
- **Output:** `sample.protected.pdf` (Protected PDF with password)

## API Configuration

The application uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/Protect`
- **Authentication:** Basic authentication with API key
- **Features:** PDF protection, password security

## Protection Settings

The implementation supports these settings:
- **Password:** "1234" (configurable)
- **PDF Permissions:** "All" (configurable)
- **Async Processing:** true (recommended for large files)
- **Document Name:** "output.pdf"

## Implementation Details

### Main Components

1. **Main Functions:**
   - `read_and_encode_pdf()`: Read and encode PDF to base64
   - `protect_pdf_document()`: Main method for PDF protection
   - `handle_async_response_and_save()`: Handle API responses and save files
   - `main()`: Orchestrator function

### Key Features

- **Async Processing:** Handles both sync and async API responses
- **Retry Logic:** Implements polling with configurable retry attempts (10 retries, 10-second delays)
- **Error Handling:** Comprehensive exception handling and logging
- **File Management:** Efficient file I/O with proper resource management
- **HTTP Client:** Uses requests library for modern HTTP operations

## API Endpoints

- **POST** `/api/v2/Protect` - Protects a PDF document with password and permissions

## Request Payload

```json
{
  "docName": "output.pdf",
  "docContent": "base64-encoded-pdf-content",
  "password": "1234",
  "pdfPermission": "All",
  "async": true
}
```

## Response Handling

The application handles two types of responses:

1. **200 OK**: Immediate success, returns the protected PDF
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
   - Ensure you have set a valid API key in `protect_document.py`
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

- **Small files (< 1MB):** Usually processed synchronously (200 response)
- **Large files (> 1MB):** Processed asynchronously (202 response) with polling
- **Complex documents:** May take longer to process

## Sample Files

### sample.pdf
A sample PDF document that will be used for testing protection functionality.

### sample.protected.pdf
The output file that will be generated after successful protection.

## Expected Workflow

1. Load the PDF document ✅
2. Validate the document format ✅
3. Prepare protection parameters ✅
4. Call the PDF4me API to protect the PDF ✅
5. Handle the response (sync/async) ✅
6. Save the resulting protected PDF ✅
7. Provide status feedback to the user ✅

## Next Steps

To complete the testing:
1. Get a valid API key from https://dev.pdf4me.com/dashboard/#/api-keys/
2. Replace the placeholder API key in `protect_document.py`
3. Run the program to test actual PDF protection
4. Verify the output file `sample.protected.pdf` is generated and requires password to open

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch processing multiple files
- [ ] Configurable protection settings via command line arguments
- [ ] Progress reporting for long-running operations
- [ ] Support for different permission levels
- [ ] Web-based user interface

## License

This project is part of the PDF4ME API samples collection.

## Support

For API-related issues, contact PDF4ME support.
For implementation questions, refer to the PDF4ME documentation. 