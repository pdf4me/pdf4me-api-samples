# Read SwissQR Code (Salesforce)

A Salesforce (Apex) implementation for reading Swiss QR codes from PDF documents using the PDF4me API.

## Project Structure

```
Read SwissQR Code/
├── ReadSwissQRCode.cls                # Apex class with Swiss QR reading logic
├── ReadSwissQRCodeTest.cls            # Apex test class
├── Executable_Anonymous _code_ReadSwissQRCode.txt # Anonymous Apex execution sample
├── README.md                          # This file
```

## Project Status

✅ **IMPLEMENTATION COMPLETE** - Full Swiss QR code reading functionality is implemented and working.

## Features

- ✅ Read Swiss QR codes from PDF documents
- ✅ Extract structured Swiss QR code data
- ✅ Async API calling support with extended polling
- ✅ Comprehensive error handling and logging
- ✅ JSON output with Swiss QR code details

## Requirements

- Salesforce org with API access
- Permission to execute Apex code
- Internet connection (for PDF4me API access)
- Valid PDF4me API key

## Setup

### 1. Get API Key
First, you need to get a valid API key from PDF4me:
1. Visit https://dev.pdf4me.com/dashboard/#/api-keys/
2. Create an account and generate an API key
3. Replace the placeholder in `ReadSwissQRCode.cls`:
   ```apex
   public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
   ```

### 2. Deploy Apex Classes

1. Deploy `ReadSwissQRCode.cls` and `ReadSwissQRCodeTest.cls` to your Salesforce org (via Developer Console, VS Code, or Metadata API).
2. Ensure you have permission to execute HTTP callouts and Apex code.

## Usage

### Execute Swiss QR Reading

1. **Run Anonymous Apex:**
   - Use the code in `Executable_Anonymous _code_ReadSwissQRCode.txt` to trigger Swiss QR reading.
   - Or call methods from `ReadSwissQRCode.cls` directly in your application logic.

### Input and Output

- **Input:** 
  - PDF file as a Base64 string (see Apex code for details)
- **Output:** Swiss QR data as a Salesforce File (ContentVersion), as a base64 string, and as JSON data

## API Configuration

The application uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ReadSwissQR`
- **Authentication:** Basic authentication with API key
- **Features:** Read Swiss QR code data from PDF documents

## Swiss QR Code Reading Settings

The implementation supports these settings:
- **PDF Input:** Configurable PDF file path (as base64)
- **Output Format:** JSON with Swiss QR code data and metadata
- **Async Processing:** Extended polling with 20 retries (10-second intervals)
- **Error Handling:** Comprehensive error handling and fallback mechanisms

## Implementation Details

### Main Components

1. **Apex Class:**
   - Main logic for Swiss QR reading
   - Configuration constants (API key, URLs, settings)
   - HTTP callout logic

2. **Key Methods:**
   - `readSwissQRCodeAndSave()`: Main method for Swiss QR reading and saving as Salesforce File
   - File I/O operations with proper error handling (as supported in Apex)

### Key Features

- **Async Processing:** Handles both sync and async API responses
- **Retry Logic:** Implements extended polling with 20 retries
- **Error Handling:** Comprehensive exception handling and logging
- **File Management:** Efficient handling of base64 and file objects
- **HTTP Client:** Uses Apex `Http` and `HttpRequest` for callouts

## Error Handling

The application handles various error scenarios:
- **401 Unauthorized:** Invalid or missing API key
- **404 Not Found:** Input file not found
- **202 Accepted:** Async processing (handled with polling)
- **500 Server Error:** API server issues
- **Timeout:** Long-running operations that exceed retry limits

## Sample Files

### read_swissqr_code_output.json
A sample output file showing the expected result after Swiss QR code reading (as Salesforce File).

## Expected Workflow

1. Load PDF document containing Swiss QR codes (as base64)
2. Prepare API request parameters
3. Call the PDF4me API to read Swiss QR codes
4. Handle the response (sync/async)
5. Save the extracted Swiss QR data as Salesforce File
6. Provide status feedback to the user

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error:**
   - Ensure you have set a valid API key in `ReadSwissQRCode.cls`
   - Check that your API key is active and has sufficient credits

2. **Apex Errors:**
   - Ensure you have permission to execute HTTP callouts
   - Check that all source files are in the correct location

3. **Network Issues:**
   - Verify internet connectivity
   - Check firewall settings
   - Ensure the PDF4me API is accessible

4. **Timeout Issues:**
   - Swiss QR processing may take longer than standard barcodes
   - The implementation uses extended polling (20 retries)
   - Check API service status if timeouts persist

## Performance Notes

- **Processing Time:** Swiss QR codes may take longer to process than standard barcodes
- **Detection Accuracy:** High accuracy for Swiss QR code format
- **Format Support:** Specifically designed for Swiss QR code standard

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch PDF processing
- [ ] Command line interface for PDF input
- [ ] Custom Swiss QR detection settings
- [ ] Integration with other document formats
- [ ] Lightning Web Component UI
- [ ] Swiss QR code validation and verification 