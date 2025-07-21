# Unlock PDF - Python Implementation

Unlock password-protected PDF documents using the PDF4Me API. This Python project removes password protection from PDF files while maintaining document integrity.

## Features

- ✅ Remove password protection from PDF documents
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling and logging
- ✅ File I/O operations with proper error handling
- ✅ HTTP client implementation using requests library
- ✅ Preserves document formatting and content
- ✅ Maintains document integrity
- ✅ Simple, dependency-light Python implementation

## Prerequisites

- **Python 3.8+**
- **requests library** (install with `pip install requests`)
- **Internet connection** for API access
- **Valid PDF4Me API key** (get from https://dev.pdf4me.com/dashboard/#/api-keys/)
- **Password-protected PDF file** for testing

## Project Structure

```
Unlock PDF/
├── unlock_pdf.py                 # Main script for PDF unlocking
├── sample.protected.pdf          # Sample password-protected PDF file for testing
├── sample.protected.unlocked.pdf # Output unlocked PDF (generated)
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
3. Replace the placeholder in `unlock_pdf.py`:
   ```python
   api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
   ```

## Usage

### Running the Application

1. **Run the script:**
   ```bash
   python unlock_pdf.py
   ```

### Expected Output

```
Starting PDF Document Unlocking Process
=== Unlocking PDF Document ===
Input PDF: sample.protected.pdf
Output unlocked PDF: sample.protected.unlocked.pdf
Unlock password: 1234
Reading and encoding PDF file...
PDF file read successfully: 13406 bytes
Processing PDF unlocking...
Processing response and saving file...
PDF unlocking completed successfully!
Input file: sample.protected.pdf
Unlocked file: sample.protected.unlocked.pdf
Password protection removed successfully
```

### Input and Output

- **Input:** 
  - `sample.protected.pdf` (Password-protected PDF file)
- **Output:** `sample.protected.unlocked.pdf` (Unlocked PDF without password)

## API Configuration

The application uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/Unlock`
- **Authentication:** Basic authentication with API key
- **Features:** PDF unlocking, password removal

## Unlock Settings

The implementation supports these settings:
- **Password:** "1234" (configurable - must match the protected PDF's password)
- **Async Processing:** true (recommended for large files)
- **Document Name:** "output.pdf"

## Implementation Details

### Main Components

1. **Main Functions:**
   - `read_and_encode_pdf()`: Read and encode PDF to base64
   - `unlock_pdf_document()`: Main method for PDF unlocking
   - `handle_async_response_and_save()`: Handle API responses and save files
   - `main()`: Orchestrator function

### Key Features

- **Async Processing:** Handles both sync and async API responses
- **Retry Logic:** Implements polling with configurable retry attempts (10 retries, 10-second delays)
- **Error Handling:** Comprehensive exception handling and logging
- **File Management:** Efficient file I/O with proper resource management
- **HTTP Client:** Uses requests library for modern HTTP operations

## API Endpoints

- **POST** `/api/v2/Unlock` - Unlocks a password-protected PDF document

## Request Payload

```json
{
  "docName": "output.pdf",
  "docContent": "base64-encoded-pdf-content",
  "password": "1234",
  "async": true
}
```

## Response Handling

The application handles two types of responses:

1. **200 OK**: Immediate success, returns the unlocked PDF
2. **202 Accepted**: Asynchronous processing, polls for completion

## Error Handling

The application handles various error scenarios:
- **401 Unauthorized:** Invalid or missing API key
- **404 Not Found:** Input file not found
- **202 Accepted:** Async processing (handled with polling)
- **500 Server Error:** API server issues
- **Timeout:** Long-running operations that exceed retry limits
- **Invalid Password:** Wrong password for the protected PDF

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
- Be cautious when removing password protection from sensitive documents
- Consider using environment variables for API keys in production

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error:**
   - Ensure you have set a valid API key in `unlock_pdf.py`
   - Check that your API key is active and has sufficient credits

2. **File Not Found:**
   - Make sure `sample.protected.pdf` exists in the project directory
   - Check file permissions

3. **Invalid Password Error:**
   - Ensure the correct password is provided for the protected PDF
   - Check that the password matches the one used to protect the PDF

4. **Module Not Found:**
   - Run `pip install requests` to install dependencies
   - Ensure you're using Python 3.8 or higher

5. **Network Issues:**
   - Verify internet connectivity
   - Check firewall settings
   - Ensure the PDF4me API is accessible

### Performance Tips

- **Small files (< 1MB):** Usually processed synchronously (200 response)
- **Large files (> 1MB):** Processed asynchronously (202 response) with polling
- **Complex documents:** May take longer to process

## Sample Files

### sample.protected.pdf
A sample password-protected PDF document that will be used for testing unlock functionality.

### sample.protected.unlocked.pdf
The output file that will be generated after successful unlocking.

## Expected Workflow

1. Load the protected PDF document ✅
2. Validate the document format ✅
3. Prepare unlock parameters ✅
4. Call the PDF4me API to unlock the PDF ✅
5. Handle the response (sync/async) ✅
6. Save the resulting unlocked PDF ✅
7. Provide status feedback to the user ✅

## Next Steps

To complete the testing:
1. Get a valid API key from https://dev.pdf4me.com/dashboard/#/api-keys/
2. Replace the placeholder API key in `unlock_pdf.py`
3. Ensure you have a password-protected PDF file named `sample.protected.pdf`
4. Run the program to test actual PDF unlocking
5. Verify the output file `sample.protected.unlocked.pdf` is generated and can be opened without password

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch processing multiple files
- [ ] Configurable unlock settings via command line arguments
- [ ] Progress reporting for long-running operations
- [ ] Support for different password formats
- [ ] Web-based user interface

## License

This project is part of the PDF4ME API samples collection.

## Support

For API-related issues, contact PDF4ME support.
For implementation questions, refer to the PDF4ME documentation. 