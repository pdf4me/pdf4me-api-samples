# Split PDF by Barcode (Salesforce)

A Salesforce Apex sample project for splitting PDF documents based on barcode detection using the PDF4Me API.

## Project Structure

```
Split PDF by Barcode/
├── SplitPDFByBarcode.cls                    # Main Apex class for PDF barcode splitting
├── SplitPDFByBarcodeTest.cls                # Test class with examples
├── Executable_Anonymous_code_SplitPDFByBarcode.txt  # Anonymous Apex execution examples
└── README.md                                # This file
```

## Features

- ✅ Split PDF documents based on barcode detection
- ✅ Support for multiple barcode types (QR, DataMatrix, PDF417, etc.)
- ✅ Configurable barcode filtering options
- ✅ Flexible split positioning (before, after, remove)
- ✅ Option to combine consecutive pages with same barcodes
- ✅ Base64 encoding/decoding for secure PDF transmission
- ✅ Comprehensive error handling and result wrapping
- ✅ Automatic Salesforce File (ContentVersion) creation
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
   - Deploy `SplitPDFByBarcode.cls` to your Salesforce org
   - Deploy `SplitPDFByBarcodeTest.cls` for testing

2. **Configure your API key:**
   - Open `SplitPDFByBarcode.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Enable callouts (if needed):**
   - Ensure your org can make external callouts
   - Add PDF4Me domain to remote site settings if required

## Usage

### Method 1: Direct Apex Class Usage

```apex
// Split PDF by barcode and save as Salesforce Files
String pdfBase64 = 'your_base64_encoded_pdf_here';
String result = SplitPDFByBarcode.splitPdfByBarcodeAndSave(
    pdfBase64,
    'document.pdf',
    'Test PDF Barcode',           // Barcode string to search for
    'startsWith',                 // Filter type
    'any',                        // Barcode type
    'after',                      // Split position
    true,                         // Combine consecutive pages
    '150'                         // PDF render DPI
);
```

### Method 2: Anonymous Apex Execution

Use the examples in `Executable_Anonymous_code_SplitPDFByBarcode.txt`:

```apex
// Example: Split PDF by barcode
String pdfBase64 = 'base64_encoded_pdf';
SplitPDFByBarcode.SplitPDFByBarcodeResult result = 
    SplitPDFByBarcode.splitPdfByBarcodeAndSave(
        pdfBase64, 'sample.pdf', 'Test PDF Barcode', 'startsWith', 'any', 'after', true, '150'
    );

if (result.error == null) {
    System.debug('Success! File URLs: ' + result.downloadUrls);
    System.debug('Base64: ' + result.base64);
} else {
    System.debug('Error: ' + result.error);
}
```

### Method 3: Test Class Examples

Run the test class for working examples:

```apex
Test.startTest();
SplitPDFByBarcodeTest.testSplitPdfByBarcode();
Test.stopTest();
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/SplitPdfByBarcode_old`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)

## Configuration

- **API Key:** Set in `SplitPDFByBarcode.cls` as `API_KEY` constant
- **Endpoint URL:** `https://api.pdf4me.com/api/v2/SplitPdfByBarcode_old`
- **Supported Formats:** PDF files with embedded barcodes

## Barcode Split Options

The API supports various barcode splitting configurations:

### Barcode String
```apex
"barcodeString": "Test PDF Barcode"  // Barcode text to search for
```

### Barcode Filter
```apex
"barcodeFilter": "startsWith"  // Filter type options
```

Filter options:
- **startsWith:** Split when barcode starts with the specified string
- **endsWith:** Split when barcode ends with the specified string
- **contains:** Split when barcode contains the specified string
- **exact:** Split when barcode exactly matches the specified string

### Barcode Type
```apex
"barcodeType": "any"  // Barcode type options
```

Supported barcode types:
- **any:** Detect all barcode types
- **datamatrix:** DataMatrix barcodes only
- **qrcode:** QR codes only
- **pdf417:** PDF417 barcodes only

### Split Position
```apex
"splitBarcodePage": "after"  // Split position options
```

Split position options:
- **before:** Split before the page containing the barcode
- **after:** Split after the page containing the barcode
- **remove:** Remove the page containing the barcode

### Additional Options
```apex
"combinePagesWithSameConsecutiveBarcodes": true,  // Combine consecutive pages
"pdfRenderDpi": "150"                              // PDF render DPI
```

## Return Values

The `splitPdfByBarcodeAndSave` method returns a `SplitPDFByBarcodeResult` object with:

- **base64:** Base64 encoded split PDFs (array)
- **downloadUrls:** Salesforce File download URLs (array)
- **error:** Error message (null if successful)

## Error Handling

- Invalid PDF data or format
- API authentication errors (401)
- Processing errors (400, 500)
- Network connectivity issues
- Salesforce File creation errors
- JSON serialization errors
- Missing barcodes in PDF
- PDF processing failures

## Code Structure

### SplitPDFByBarcode Class
- **splitPdfByBarcodeAndSave:** Main PDF barcode splitting method
- **makeFilePublic:** Utility method for creating public file links
- **SplitPDFByBarcodeResult:** Inner class for result wrapping

### SplitPDFByBarcodeTest Class
- **testSplitPdfByBarcode:** Test method with example usage

## Troubleshooting

### Common Issues

1. **"Callout failed"**
   - Verify API key is correct
   - Check internet connectivity
   - Ensure remote site settings allow PDF4Me domain

2. **"Base64 encoding error"**
   - Ensure PDF data is properly base64 encoded
   - Check for null or empty PDF data

3. **"No barcodes found"**
   - Verify the PDF contains barcodes
   - Check barcode type and filter settings
   - Ensure barcode string matches exactly

4. **"Split not working as expected"**
   - Verify barcode detection settings
   - Check split position configuration
   - Test with different filter options

5. **"File creation failed"**
   - Verify user has permissions to create ContentVersion records
   - Check available storage space

6. **"Large file processing issues"**
   - Large PDFs may exceed Salesforce callout limits
   - Consider compressing PDFs before processing
   - Check org storage limits

### Debugging

- Use `System.debug()` statements for additional output
- Check debug logs for detailed error messages
- Verify API responses in debug logs

## Salesforce Integration

### File Management
- Automatically creates ContentVersion records for each split PDF
- Generates download URLs for easy access
- Supports public file sharing

### Security
- Uses Salesforce's built-in security model
- Respects user permissions and sharing rules
- Secure API key storage (consider using Custom Settings for production)

## Development

### Testing
```apex
// Run tests in Developer Console
Test.startTest();
SplitPDFByBarcodeTest.testSplitPdfByBarcode();
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

## Use Cases

### Document Processing
- Split invoices by customer barcodes
- Separate forms by batch numbers
- Divide reports by section identifiers
- Organize documents by category codes

### Business Applications
- Process bulk document workflows
- Automate document routing
- Separate contracts by client codes
- Split invoices by payment references

### Logistics and Inventory
- Process shipping documents by tracking codes
- Split inventory reports by product codes
- Organize delivery notes by route codes
- Separate manifests by destination codes

### Compliance and Legal
- Split legal documents by case numbers
- Organize compliance reports by regulation codes
- Separate audit documents by department codes
- Process certificates by serial numbers

## Performance Considerations

- **PDF Size:** Larger PDFs take longer to process
- **Barcode Count:** More barcodes increase processing time
- **Barcode Type:** Complex barcodes may require more processing
- **Network:** Stable internet connection improves reliability
- **Processing Time:** Depends on PDF size and barcode complexity

## Best Practices

### PDF Preparation
- Ensure PDFs contain clear, readable barcodes
- Use high-quality scans for better barcode detection
- Verify barcode format and encoding
- Test with sample documents first

### Barcode Configuration
- Use appropriate barcode type settings
- Choose correct filter options for your use case
- Test split positions with sample data
- Validate barcode string matching

### Processing
- Monitor response times and adjust timeouts
- Validate output files for completeness
- Handle multiple split operations appropriately

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer documentation](https://developer.salesforce.com/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 