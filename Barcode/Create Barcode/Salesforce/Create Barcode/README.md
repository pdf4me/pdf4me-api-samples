# Create Barcode (Salesforce)

A Salesforce (Apex) implementation for creating barcode images using the PDF4me API.

## Project Structure

```
Create Barcode/
├── CreateBarcodePDF4me.cls            # Apex class with barcode creation logic
├── CreateBarcodePDF4meTest.cls        # Apex test class
├── Executable_Anonymous _code_CreateBarcodePDF4me.txt # Anonymous Apex execution sample
├── README.md                          # This file
```

## Project Status

✅ **IMPLEMENTATION COMPLETE** - Full barcode creation functionality is implemented and working.

## Features

- ✅ Create various barcode types as images
- ✅ Support for different barcode formats (QR Code, Code128, DataMatrix, etc.)
- ✅ Configurable text and barcode options
- ✅ Async API calling support
- ✅ Comprehensive error handling and logging

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
3. Replace the placeholder in `CreateBarcodePDF4me.cls`:
   ```apex
   public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
   ```

### 2. Deploy Apex Classes

1. Deploy `CreateBarcodePDF4me.cls` and `CreateBarcodePDF4meTest.cls` to your Salesforce org (via Developer Console, VS Code, or Metadata API).
2. Ensure you have permission to execute HTTP callouts and Apex code.

## Usage

### Execute Barcode Creation

1. **Run Anonymous Apex:**
   - Use the code in `Executable_Anonymous _code_CreateBarcodePDF4me.txt` to trigger barcode creation.
   - Or call methods from `CreateBarcodePDF4me.cls` directly in your application logic.

### Input and Output

- **Input:** 
  - Text to encode (passed as a parameter in Apex code)
- **Output:** Barcode image as a Salesforce File (ContentVersion) and as a base64 string

## API Configuration

The application uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/CreateBarcode`
- **Authentication:** Basic authentication with API key
- **Features:** Create barcode images

## Barcode Settings

The implementation supports these settings:
- **Text:** Configurable text to encode
- **Barcode Type:** QR Code, Code128, DataMatrix, Aztec, etc.
- **Output Format:** PNG (default)
- **Async Processing:** true (recommended for large files)

## Implementation Details

### Main Components

1. **Apex Class:**
   - Main logic for barcode creation
   - Configuration constants (API key, URLs, settings)
   - HTTP callout logic

2. **Key Methods:**
   - `createBarcodeAndSave()`: Main method for barcode creation and saving as Salesforce File
   - File I/O operations with proper error handling (as supported in Apex)

### Key Features

- **Async Processing:** Handles both sync and async API responses
- **Retry Logic:** Implements polling with configurable retry attempts
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

### Barcode_create_output.png
A sample output file showing the expected result after barcode creation (as Salesforce File).

## Expected Workflow

1. Configure barcode text and type
2. Prepare API request parameters
3. Call the PDF4me API to create the barcode
4. Handle the response (sync/async)
5. Save the resulting barcode image as Salesforce File
6. Provide status feedback to the user

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error:**
   - Ensure you have set a valid API key in `CreateBarcodePDF4me.cls`
   - Check that your API key is active and has sufficient credits

2. **Apex Errors:**
   - Ensure you have permission to execute HTTP callouts
   - Check that all source files are in the correct location

3. **Network Issues:**
   - Verify internet connectivity
   - Check firewall settings
   - Ensure the PDF4me API is accessible

## Performance Notes

- **Processing Time:** Depends on barcode complexity and server load
- **Image Quality:** High-resolution output suitable for printing
- **Format Support:** PNG output by default

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch barcode creation
- [ ] Custom styling and color options
- [ ] Integration with other document formats
- [ ] Lightning Web Component UI 