# Merge Two PDF Files One Over Another as Overlay (Salesforce)

A Salesforce Apex sample project for merging two PDF files by overlaying one on top of another using the PDF4Me API.

## Project Structure

```
Merge two PDF files one over another as Overlay/
├── MergeOverlay.cls                          # Main Apex class for PDF overlay merging
├── MergeOverlayTest.cls                      # Test class with examples
├── Executable_Anonymous_code_MergeOverlay.txt # Anonymous Apex execution examples
└── README.md                                 # This file
```

## Features

- ✅ Merge two PDF files by overlaying one on top of another
- ✅ Precision content integration with layer positioning
- ✅ Support for complex PDF layouts and content
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
   - Deploy `MergeOverlay.cls` to your Salesforce org
   - Deploy `MergeOverlayTest.cls` for testing

2. **Configure your API key:**
   - Open `MergeOverlay.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Enable callouts (if needed):**
   - Ensure your org can make external callouts
   - Add PDF4Me domain to remote site settings if required

## Usage

### Method 1: Direct Apex Class Usage

```apex
// Merge PDFs by overlay and save as Salesforce File
String basePdfBase64 = 'your_base64_encoded_base_pdf_here';
String layerPdfBase64 = 'your_base64_encoded_layer_pdf_here';
String result = MergeOverlay.mergeOverlayAndSave(
    basePdfBase64,
    'base_document.pdf',
    layerPdfBase64,
    'layer_document.pdf'
);
```

### Method 2: Anonymous Apex Execution

Use the examples in `Executable_Anonymous_code_MergeOverlay.txt`:

```apex
// Example: Merge PDFs by overlay
String basePdfBase64 = 'base64_encoded_base_pdf';
String layerPdfBase64 = 'base64_encoded_layer_pdf';
MergeOverlay.MergeOverlayResult result = 
    MergeOverlay.mergeOverlayAndSave(basePdfBase64, 'base.pdf', layerPdfBase64, 'layer.pdf');

if (result.error == null) {
    System.debug('Success! File URL: ' + result.downloadUrl);
    System.debug('Base64: ' + result.base64);
} else {
    System.debug('Error: ' + result.error);
}
```

### Method 3: Test Class Examples

Run the test class for working examples:

```apex
Test.startTest();
MergeOverlayTest.testMergeOverlay();
Test.stopTest();
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/MergeOverlay`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)

## Configuration

- **API Key:** Set in `MergeOverlay.cls` as `API_KEY` constant
- **Endpoint URL:** `https://api.pdf4me.com/api/v2/MergeOverlay`
- **Supported Formats:** PDF files

## Overlay Process

The API merges PDFs by overlaying content:

### Base PDF (First Layer)
- Serves as the background/underlying document
- Contains the main content and layout
- Remains unchanged in the final output

### Layer PDF (Second Layer)
- Overlaid on top of the base PDF
- Content is positioned precisely over the base
- Can include forms, stamps, watermarks, or additional content

### Result
- Single PDF with both layers combined
- Layer content appears on top of base content
- Maintains original positioning and formatting

## Return Values

The `mergeOverlayAndSave` method returns a `MergeOverlayResult` object with:

- **base64:** Base64 encoded overlay merged PDF
- **downloadUrl:** Salesforce File download URL
- **error:** Error message (null if successful)

## Error Handling

- Invalid PDF data or format
- API authentication errors (401)
- Processing errors (400, 500)
- Network connectivity issues
- Salesforce File creation errors
- JSON serialization errors
- Missing input data
- PDF processing failures

## Code Structure

### MergeOverlay Class
- **mergeOverlayAndSave:** Main PDF overlay merging method
- **makeFilePublic:** Utility method for creating public file links
- **MergeOverlayResult:** Inner class for result wrapping

### MergeOverlayTest Class
- **testMergeOverlay:** Test method with example usage

## Troubleshooting

### Common Issues

1. **"Callout failed"**
   - Verify API key is correct
   - Check internet connectivity
   - Ensure remote site settings allow PDF4Me domain

2. **"Base64 encoding error"**
   - Ensure PDF data is properly base64 encoded
   - Check for null or empty PDF data

3. **"Overlay not appearing correctly"**
   - Check that both PDFs have compatible page sizes
   - Verify layer PDF content positioning
   - Ensure PDFs are not corrupted

4. **"File creation failed"**
   - Verify user has permissions to create ContentVersion records
   - Check available storage space

5. **"Large file processing issues"**
   - Large PDFs may exceed Salesforce callout limits
   - Consider compressing PDFs before processing
   - Check org storage limits

### Debugging

- Use `System.debug()` statements for additional output
- Check debug logs for detailed error messages
- Verify API responses in debug logs

## Salesforce Integration

### File Management
- Automatically creates ContentVersion records
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
MergeOverlayTest.testMergeOverlay();
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
- Add watermarks to existing documents
- Overlay forms on template documents
- Combine letterheads with content
- Add stamps or signatures to PDFs

### Business Applications
- Merge contracts with terms and conditions
- Overlay company branding on documents
- Add approval stamps to reports
- Combine invoices with payment forms

### Creative Projects
- Create layered document designs
- Overlay graphics on text documents
- Combine multiple design elements
- Create composite documents

### Legal and Compliance
- Add legal disclaimers to documents
- Overlay compliance stamps
- Merge certificates with content
- Add digital signatures

## Performance Considerations

- **PDF Size:** Larger PDFs take longer to process
- **Content Complexity:** Complex layouts may require more processing time
- **Page Count:** More pages increase processing time
- **Network:** Stable internet connection improves reliability
- **Processing Time:** Depends on PDF size and complexity

## Best Practices

### PDF Preparation
- Ensure both PDFs have compatible page sizes
- Check for any password protection
- Verify PDF integrity before processing
- Consider file size limitations

### Content Positioning
- Test layer positioning with sample files
- Ensure important content isn't obscured
- Check for content overlap issues
- Validate final output quality

### Processing
- Monitor response times and adjust timeouts
- Validate output PDFs for quality
- Handle multiple overlay operations appropriately

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer documentation](https://developer.salesforce.com/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 