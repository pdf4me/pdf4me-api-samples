# Add Barcode To PDF (Salesforce)

A Salesforce (Apex) implementation for adding barcodes to PDF documents using the PDF4me API.

## Project Structure

```
Add Barcode To PDF/
├── AddBarcodeToPDF.cls            # Apex class with barcode logic
├── AddBarcodeToPDFTest.cls        # Apex test class
├── Executable_Anonymous _code_AddBarcodeToPDF_.txt # Anonymous Apex execution sample
├── README.md                      # This file
```

## Project Status

✅ **IMPLEMENTATION COMPLETE** - Full Add Barcode functionality is implemented and working.

## Features

- ✅ Add various barcode types to PDF documents
- ✅ Control over position, size, and appearance
- ✅ Async API calling support
- ✅ Handles both synchronous and asynchronous API responses
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
3. Replace the placeholder in `AddBarcodeToPDF.cls`:
   ```apex
   String apiKey = 'Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/';
   ```

### 2. Deploy Apex Classes

1. Deploy `AddBarcodeToPDF.cls` and `AddBarcodeToPDFTest.cls` to your Salesforce org (via Developer Console, VS Code, or Metadata API).
2. Ensure you have permission to execute HTTP callouts and Apex code.

## Usage

### Execute Barcode Addition

1. **Run Anonymous Apex:**
   - Use the code in `Executable_Anonymous _code_AddBarcodeToPDF_.txt` to trigger barcode addition.
   - Or call methods from `AddBarcodeToPDF.cls` directly in your application logic.

### Input and Output

- **Input:** 
  - PDF file as a Base64 string (see Apex code for details)
- **Output:** PDF with barcode as a Base64 string (can be saved as an Attachment or File)

## API Configuration

The application uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/addbarcode`
- **Authentication:** Basic authentication with API key
- **Features:** Add barcode, PDF modification

## Barcode Settings

The current implementation uses these settings:
- **Text:** "PDF4me Barcode Sample"
- **Barcode Type:** "qrCode"
- **Pages:** "1-3"
- **Align X/Y:** "Right"/"Bottom"
- **Height/Width:** 40mm (113pt)
- **Margin:** 20mm (57pt)
- **Opacity:** 100
- **Display Text:** "below"
- **Hide Text:** false
- **Show Only In Print:** false
- **Is Text Above:** false
- **Async Processing:** true (recommended for large files)

## Implementation Details

### Main Components

1. **Apex Class:**
   - Main logic for barcode addition
   - Configuration constants (API key, URLs, retry settings)
   - HTTP callout logic

2. **Key Methods:**
   - `addBarcodeToPdf()`: Main method for barcode addition
   - `executeBarcodeAddition()`: HTTP requests and API integration
   - File I/O operations with proper error handling (as supported in Apex)

### Key Features

- **Async Processing:** Handles both sync and async API responses
- **Retry Logic:** Implements polling with configurable retry attempts
- **Error Handling:** Comprehensive exception handling and logging
- **File Management:** Efficient handling of Base64 and file objects
- **HTTP Client:** Uses Apex `Http` and `HttpRequest` for callouts

## Error Handling

The application handles various error scenarios:
- **401 Unauthorized:** Invalid or missing API key
- **404 Not Found:** Input file not found
- **202 Accepted:** Async processing (handled with polling)
- **500 Server Error:** API server issues
- **Timeout:** Long-running operations that exceed retry limits

## Sample Files

### Executable_Anonymous _code_AddBarcodeToPDF_.txt
Sample anonymous Apex code to trigger barcode addition.

### AddBarcodeToPDF.cls
Apex class with the barcode logic.

### AddBarcodeToPDFTest.cls
Apex test class for unit testing.

## Expected Workflow

1. Load the PDF document (as Base64)
2. Validate the document format
3. Prepare barcode parameters
4. Call the PDF4me API to add the barcode
5. Handle the response (sync/async)
6. Save the resulting PDF with barcode (as Base64)
7. Provide status feedback to the user

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error:**
   - Ensure you have set a valid API key in `AddBarcodeToPDF.cls`
   - Check that your API key is active and has sufficient credits

2. **File Not Found:**
   - Ensure the input PDF Base64 is valid and not empty

3. **Apex Errors:**
   - Ensure you have permission to execute HTTP callouts
   - Check that all source files are in the correct location

4. **Network Issues:**
   - Verify internet connectivity
   - Check firewall settings
   - Ensure the PDF4me API is accessible

## Performance Notes

- **Small Files (< 5MB):** Usually processed synchronously (200 response)
- **Large Files (> 5MB):** Processed asynchronously (202 response with polling)
- **Processing Time:** Depends on file size, barcode complexity, and server load
- **Retry Settings:** Configurable via retry constants in the code

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch processing multiple files
- [ ] Configurable barcode settings via custom metadata
- [ ] Progress reporting for long-running operations
- [ ] Support for additional barcode types
- [ ] Lightning Web Component UI 