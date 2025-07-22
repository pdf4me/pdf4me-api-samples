# Create Image from PDF (Salesforce)

A Salesforce Apex sample project for converting PDF pages to images using the PDF4Me API.

## Project Structure

```
Create Image from PDF/
├── CreateImageFromPDF.cls                    # Main Apex class for PDF to image conversion
├── CreateImageFromPDFTest.cls                # Test class with examples
├── Executable_Anonymous_code_CreateImageFromPDF.txt  # Anonymous Apex execution examples
└── README.md                                 # This file
```

## Features

- ✅ Convert PDF pages to images with customizable settings
- ✅ Support for multiple output formats (JPEG, PNG, BMP, GIF, TIFF, etc.)
- ✅ Configurable image dimensions and quality
- ✅ Page selection (specific pages or ranges)
- ✅ Automatic Salesforce File (ContentVersion) creation for each image
- ✅ Base64 encoding/decoding for secure PDF transmission
- ✅ Comprehensive error handling and result wrapping
- ✅ Public file sharing capabilities
- ✅ Test coverage with example implementations
- ✅ Anonymous Apex execution examples

## Prerequisites

- Salesforce org (Developer, Enterprise, or Unlimited Edition)
- API access enabled
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- Internet access from Salesforce (if using callouts)

## Setup

1. **Deploy the Apex classes:**
   - Deploy `CreateImageFromPDF.cls` to your Salesforce org
   - Deploy `CreateImageFromPDFTest.cls` for testing

2. **Configure your API key:**
   - Open `CreateImageFromPDF.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Enable callouts (if needed):**
   - Ensure your org can make external callouts
   - Add PDF4Me domain to remote site settings if required

## Usage

### Method 1: Direct Apex Class Usage

```apex
// Convert PDF pages to images and save as Salesforce Files
String pdfBase64 = 'your_base64_encoded_pdf_here';
String result = CreateImageFromPDF.createImagesFromPdfAndSave(
    pdfBase64,
    'my_document.pdf',
    'jpeg',
    '1-2'  // Convert pages 1 and 2
);
```

### Method 2: Anonymous Apex Execution

Use the examples in `Executable_Anonymous_code_CreateImageFromPDF.txt`:

```apex
// Example: Convert PDF pages 1-2 to JPEG images
String pdfBase64 = 'base64_encoded_pdf_content';
CreateImageFromPDF.CreateImageFromPdfResult result = 
    CreateImageFromPDF.createImagesFromPdfAndSave(pdfBase64, 'sample.pdf', 'jpeg', '1-2');

if (result.error == null) {
    System.debug('Success! Created ' + result.images.size() + ' images');
    for (CreateImageFromPDF.ImageResult img : result.images) {
        System.debug('Image URL: ' + img.downloadUrl);
    }
} else {
    System.debug('Error: ' + result.error);
}
```

### Method 3: Test Class Examples

Run the test class for working examples:

```apex
Test.startTest();
CreateImageFromPDFTest.testCreateImagesFromPdf();
Test.stopTest();
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/CreateImages`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)

## Configuration

- **API Key:** Set in `CreateImageFromPDF.cls` as `API_KEY` constant
- **Endpoint URL:** `https://api.pdf4me.com/api/v2/CreateImages`
- **Supported Output Formats:** jpg, jpeg, bmp, gif, jb2, jp2, jpf, jpx, png, tif, tiff
- **Payload Options:**
  - `docContent`: Base64 encoded PDF content
  - `docname`: Input PDF filename
  - `imageAction`: Image conversion settings
    - `WidthPixel`: Output image width in pixels
    - `ImageExtension`: Output format (jpeg, png, etc.)
    - `PageSelection`: Page selection settings
  - `pageNrs`: Page range as string (e.g., "1-2", "1,3,5")
  - `async`: false (synchronous processing)

## Page Selection Options

### Method 1: Page Range String
```apex
"1-2"          // Convert pages 1 and 2
"1,3,5"        // Convert pages 1, 3, and 5
"2-"           // Convert from page 2 to end
"1"            // Convert only page 1
```

### Method 2: Page Numbers Array
```apex
// In the API payload
"PageSelection": {
    "PageNrs": [1, 2, 3]  // Convert pages 1, 2, and 3
}
```

## Return Values

The `createImagesFromPdfAndSave` method returns a `CreateImageFromPdfResult` object with:

- **images:** List of `ImageResult` objects (one per converted page)
- **error:** Error message (null if successful)

Each `ImageResult` contains:
- **base64:** Base64 encoded converted image
- **downloadUrl:** Salesforce File download URL
- **pageNumber:** Page number of the converted image
- **fileName:** Generated filename for the image

## Error Handling

- Invalid PDF data or format
- API authentication errors (401)
- Processing errors (400, 500)
- Network connectivity issues
- Salesforce File creation errors
- JSON serialization errors
- Page selection validation

## Code Structure

### CreateImageFromPDF Class
- **createImagesFromPdfAndSave:** Main conversion method
- **makeFilePublic:** Utility method for creating public file links
- **CreateImageFromPdfResult:** Inner class for result wrapping
- **ImageResult:** Inner class for individual image results

### CreateImageFromPDFTest Class
- **testCreateImagesFromPdf:** Test method with example usage
- **testMakeFilePublic:** Test method for public file creation

## Troubleshooting

### Common Issues

1. **"Callout failed"**
   - Verify API key is correct
   - Check internet connectivity
   - Ensure remote site settings allow PDF4Me domain

2. **"Invalid PDF format"**
   - Check that the PDF is valid and accessible
   - Ensure PDF is properly base64 encoded

3. **"Page selection error"**
   - Verify page numbers are valid for the PDF
   - Check page range format (e.g., "1-2", "1,3,5")

4. **"File creation failed"**
   - Verify user has permissions to create ContentVersion records
   - Check available storage space

5. **"No images returned"**
   - Check the API response for error details
   - Verify page selection is correct
   - Ensure output format is supported

### Debugging

- Use `System.debug()` statements for additional output
- Check debug logs for detailed error messages
- Verify API responses in debug logs

## Salesforce Integration

### File Management
- Automatically creates ContentVersion records for each converted image
- Generates download URLs for easy access
- Supports public file sharing
- Maintains page number information in filenames

### Security
- Uses Salesforce's built-in security model
- Respects user permissions and sharing rules
- Secure API key storage (consider using Custom Settings for production)

## Development

### Testing
```apex
// Run tests in Developer Console
Test.startTest();
CreateImageFromPDFTest.testCreateImagesFromPdf();
Test.stopTest();
```

### Deployment
- Deploy to sandbox first for testing
- Use Change Sets or Metadata API for production deployment
- Consider using Custom Settings for API key management in production

## Limitations

- **Async Processing:** Current implementation uses synchronous processing
- **File Size:** Limited by Salesforce callout timeout (300 seconds)
- **API Limits:** Subject to Salesforce API call limits
- **Storage:** Limited by org storage limits
- **Page Count:** Large PDFs may require async processing

## Performance Considerations

- **Large PDFs:** Consider processing fewer pages at a time
- **Image Quality:** Higher resolution images require more processing time
- **Page Selection:** Converting fewer pages is faster
- **Network:** Stable internet connection improves reliability

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer documentation](https://developer.salesforce.com/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 