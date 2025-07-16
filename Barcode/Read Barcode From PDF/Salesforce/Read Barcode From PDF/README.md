# Read Barcode From PDF (Salesforce)

A Salesforce (Apex) implementation for reading barcode images from PDF documents using the PDF4me API.

## Project Structure

```
Read Barcode From PDF/
├── ReadBarcodeFromPDF.cls            # Apex class with barcode reading logic
├── ReadBarcodeFromPDFTest.cls        # Apex test class
├── Executable_Anonymous _code_ReadBarcodeFromPDF.txt # Anonymous Apex execution sample
├── README.md                         # This file
```

## Project Status

✅ **IMPLEMENTATION COMPLETE** - Full barcode reading functionality is implemented and working.

## Features

- ✅ Read various barcode types from PDF documents
- ✅ Support for different barcode formats (QR Code, Code128, DataMatrix, etc.)
- ✅ Extract barcode data and metadata
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
3. Replace the placeholder in `ReadBarcodeFromPDF.cls`:
   ```apex
   public static final String API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
   ```

### 2. Deploy Apex Classes

1. Deploy `ReadBarcodeFromPDF.cls` and `ReadBarcodeFromPDFTest.cls` to your Salesforce org (via Developer Console, VS Code, or Metadata API).
2. Ensure you have permission to execute HTTP callouts and Apex code.

## Usage

### Execute Barcode Reading

1. **Run Anonymous Apex:**
   - Use the code in `Executable_Anonymous _code_ReadBarcodeFromPDF.txt` to trigger barcode reading.
   - Or call methods from `ReadBarcodeFromPDF.cls` directly in your application logic.

### Input and Output

- **Input:** 
  - PDF file as a Base64 string (see Apex code for details)
- **Output:** Barcode data as a Salesforce File (ContentVersion), as a base64 string, and as JSON data

## API Configuration

The application uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ReadBarcodes`
- **Authentication:** Basic authentication with API key
- **Features:** Read barcode data from PDF documents

## Barcode Reading Settings

The implementation supports these settings:
- **PDF Input:** Configurable PDF file path (as base64)
- **Barcode Types:** QR Code, Code128, DataMatrix, Aztec, etc.
- **Output Format:** JSON with barcode data and metadata
- **Page Range:** Specific pages to scan for barcodes
- **Async Processing:** true (recommended for large files)

## Implementation Details

### Main Components

1. **Apex Class:**
   - Main logic for barcode reading
   - Configuration constants (API key, URLs, settings)
   - HTTP callout logic

2. **Key Methods:**
   - `readBarcodesFromPDFAndSave()`: Main method for barcode reading and saving as Salesforce File
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

### Read_barcode_output.json
A sample output file showing the expected result after barcode reading (as Salesforce File).

## Expected Workflow

1. Load PDF document containing barcodes (as base64)
2. Prepare API request parameters
3. Call the PDF4me API to read barcodes
4. Handle the response (sync/async)
5. Save the extracted barcode data as Salesforce File
6. Provide status feedback to the user

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error:**
   - Ensure you have set a valid API key in `ReadBarcodeFromPDF.cls`
   - Check that your API key is active and has sufficient credits

2. **Apex Errors:**
   - Ensure you have permission to execute HTTP callouts
   - Check that all source files are in the correct location

3. **Network Issues:**
   - Verify internet connectivity
   - Check firewall settings
   - Ensure the PDF4me API is accessible

## Performance Notes

- **Processing Time:** Depends on PDF size and number of barcodes
- **Detection Accuracy:** High accuracy for various barcode types
- **Format Support:** Multiple barcode formats supported

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch PDF processing
- [ ] Custom barcode detection settings
- [ ] Integration with other document formats
- [ ] Lightning Web Component UI 