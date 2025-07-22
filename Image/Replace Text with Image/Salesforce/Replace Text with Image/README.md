# Replace Text with Image (Salesforce)

A Salesforce Apex sample project for replacing text in PDF documents with images using the PDF4Me API.

## Project Structure

```
Replace Text with Image/
├── ReplaceTextWithImage.cls                    # Main Apex class for text replacement with image
├── ReplaceTextWithImageTest.cls                # Test class with examples
├── Executable_Anonymous_code_ReplaceTextWithImage.txt  # Anonymous Apex execution examples
└── README.md                                   # This file
```

## Features

- ✅ Replace specific text in PDF documents with images
- ✅ Support for multiple page selection options
- ✅ Configurable image dimensions (width and height)
- ✅ Base64 encoding/decoding for secure file transmission
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
   - Deploy `ReplaceTextWithImage.cls` to your Salesforce org
   - Deploy `ReplaceTextWithImageTest.cls` for testing

2. **Configure your API key:**
   - Open `ReplaceTextWithImage.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Enable callouts (if needed):**
   - Ensure your org can make external callouts
   - Add PDF4Me domain to remote site settings if required

## Usage

### Method 1: Direct Apex Class Usage

```apex
// Replace text with image in PDF and save as Salesforce File
String pdfBase64 = 'your_base64_encoded_pdf_here';
String imageBase64 = 'your_base64_encoded_image_here';
String result = ReplaceTextWithImage.replaceTextWithImageAndSave(
    pdfBase64,
    'my_document.pdf',
    'PDF Document',  // Text to replace
    'all',           // Page selection
    imageBase64,
    'replacement.png',
    100,             // Image width
    50               // Image height
);
```

### Method 2: Anonymous Apex Execution

Use the examples in `Executable_Anonymous_code_ReplaceTextWithImage.txt`:

```apex
// Example: Replace text with image
String pdfBase64 = 'base64_encoded_pdf';
String imageBase64 = 'base64_encoded_image';
ReplaceTextWithImage.ReplaceTextWithImageResult result = 
    ReplaceTextWithImage.replaceTextWithImageAndSave(
        pdfBase64, 'sample.pdf', 'PDF Document', 'all', 
        imageBase64, 'logo.png', 100, 50
    );

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
ReplaceTextWithImageTest.testReplaceTextWithImage();
Test.stopTest();
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ReplaceTextWithImage`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)

## Configuration

- **API Key:** Set in `ReplaceTextWithImage.cls` as `API_KEY` constant
- **Endpoint URL:** `https://api.pdf4me.com/api/v2/ReplaceTextWithImage`
- **Supported Formats:** PDF input, various image formats for replacement

## Page Selection Options

The API supports various page selection formats:

### Single Page
```apex
"pageSequence": "1"  // Replace text on page 1 only
```

### Multiple Specific Pages
```apex
"pageSequence": "1,3,5"  // Replace text on pages 1, 3, and 5
```

### Page Range
```apex
"pageSequence": "2-5"  // Replace text on pages 2 through 5
```

### Mixed Selection
```apex
"pageSequence": "1,3,7-10"  // Replace text on pages 1, 3, and 7 through 10
```

### All Pages
```apex
"pageSequence": "all"  // Replace text on all pages
```

### From Page to End
```apex
"pageSequence": "2-"  // Replace text from page 2 to the end
```

## Return Values

The `replaceTextWithImageAndSave` method returns a `ReplaceTextWithImageResult` object with:

- **base64:** Base64 encoded modified PDF
- **downloadUrl:** Salesforce File download URL
- **error:** Error message (null if successful)

## Error Handling

- Invalid PDF or image data
- API authentication errors (401)
- Processing errors (400, 500)
- Network connectivity issues
- Salesforce File creation errors
- JSON serialization errors
- Text not found in document
- Invalid page selection
- Image processing failures

## Code Structure

### ReplaceTextWithImage Class
- **replaceTextWithImageAndSave:** Main text replacement method
- **makeFilePublic:** Utility method for creating public file links
- **ReplaceTextWithImageResult:** Inner class for result wrapping

### ReplaceTextWithImageTest Class
- **testReplaceTextWithImage:** Test method with example usage

## Troubleshooting

### Common Issues

1. **"Callout failed"**
   - Verify API key is correct
   - Check internet connectivity
   - Ensure remote site settings allow PDF4Me domain

2. **"Base64 encoding error"**
   - Ensure PDF and image data are properly base64 encoded
   - Check for null or empty data

3. **"Text not found"**
   - Ensure the text to replace exists in the PDF
   - Check for exact text matching (case-sensitive)
   - Verify the text is on the selected pages

4. **"Invalid page selection"**
   - Ensure page numbers are valid for the document
   - Check the page selection format

5. **"File creation failed"**
   - Verify user has permissions to create ContentVersion records
   - Check available storage space

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
ReplaceTextWithImageTest.testReplaceTextWithImage();
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

### Document Branding
- Replace company names with logos
- Add watermarks or stamps
- Insert signature images

### Content Management
- Replace placeholder text with actual images
- Update document headers or footers
- Add visual elements to reports

### Document Automation
- Generate personalized documents
- Replace text placeholders with dynamic images
- Create branded templates

### Legal and Business
- Add signature images to contracts
- Replace text with official stamps
- Insert company logos in documents

## Performance Considerations

- **Document Size:** Larger PDFs may take longer to process
- **Image Size:** Larger replacement images increase processing time
- **Text Frequency:** Multiple text occurrences require more processing
- **Page Count:** More pages increase processing time
- **Network:** Stable internet connection improves reliability

## Best Practices

### Document Preparation
- Use clear, unique text for replacement
- Ensure text exists on the specified pages
- Use appropriate image formats (PNG, JPG)

### Image Sizing
- Set appropriate width and height for the replacement image
- Consider the original text size and spacing
- Test with different image dimensions

### Processing
- Monitor response times and adjust timeouts
- Validate output PDFs for completeness
- Handle multiple text replacements appropriately

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer documentation](https://developer.salesforce.com/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 