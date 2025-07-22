# Image Extract Text (Salesforce)

A Salesforce Apex sample project for extracting text from images using OCR (Optical Character Recognition) via the PDF4Me API.

## Project Structure

```
Image Extract Text/
├── ImageExtractText.cls                    # Main Apex class for text extraction
├── ImageExtractTextTest.cls                # Test class with examples
├── Executable_Anonymous_code_ImageExtractText.txt  # Anonymous Apex execution examples
└── README.md                               # This file
```

## Features

- ✅ Extract text from images using advanced OCR technology
- ✅ Support for multiple image formats (JPG, PNG, BMP, TIFF)
- ✅ Base64 encoding/decoding for secure image transmission
- ✅ Comprehensive error handling and result wrapping
- ✅ JSON output format with structured text data
- ✅ Test coverage with example implementations
- ✅ Anonymous Apex execution examples

## Prerequisites

- Salesforce org (Developer, Enterprise, or Unlimited Edition)
- API access enabled
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- Internet access from Salesforce (if using callouts)

## Setup

1. **Deploy the Apex classes:**
   - Deploy `ImageExtractText.cls` to your Salesforce org
   - Deploy `ImageExtractTextTest.cls` for testing

2. **Configure your API key:**
   - Open `ImageExtractText.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Enable callouts (if needed):**
   - Ensure your org can make external callouts
   - Add PDF4Me domain to remote site settings if required

## Usage

### Method 1: Direct Apex Class Usage

```apex
// Extract text from image
String imageBase64 = 'your_base64_encoded_image_here';
String result = ImageExtractText.extractTextFromImage(
    imageBase64,
    'my_image.jpg'
);
```

### Method 2: Anonymous Apex Execution

Use the examples in `Executable_Anonymous_code_ImageExtractText.txt`:

```apex
// Example: Extract text from image
String imageBase64 = 'base64_encoded_image';
ImageExtractText.ImageExtractTextResult result = 
    ImageExtractText.extractTextFromImage(imageBase64, 'sample.jpg');

if (result.error == null) {
    System.debug('Success! Extracted text: ' + result.extractedText);
} else {
    System.debug('Error: ' + result.error);
}
```

### Method 3: Test Class Examples

Run the test class for working examples:

```apex
Test.startTest();
ImageExtractTextTest.testExtractTextFromImage();
Test.stopTest();
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ImageExtractText`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)

## Configuration

- **API Key:** Set in `ImageExtractText.cls` as `API_KEY` constant
- **Endpoint URL:** `https://api.pdf4me.com/api/v2/ImageExtractText`
- **Supported Formats:** JPG, PNG, BMP, TIFF

## OCR Capabilities

The API provides advanced OCR functionality including:

### Text Recognition
- **Printed Text:** Clear, typed text in various fonts
- **Handwritten Text:** Cursive and printed handwriting
- **Mixed Content:** Documents with both text and images
- **Multi-language Support:** Various languages and scripts

### Layout Analysis
- **Text Positioning:** Maintains spatial relationships
- **Line Detection:** Identifies text lines and paragraphs
- **Column Recognition:** Handles multi-column layouts
- **Table Detection:** Recognizes tabular data

### Output Format
- **Structured JSON:** Organized text with positioning data
- **Confidence Scores:** Accuracy indicators for each text element
- **Bounding Boxes:** Precise location information
- **Text Hierarchy:** Headers, body text, captions

## Return Values

The `extractTextFromImage` method returns an `ImageExtractTextResult` object with:

- **extractedText:** JSON string containing extracted text and metadata
- **error:** Error message (null if successful)

## Error Handling

- Invalid image data or format
- API authentication errors (401)
- Processing errors (400, 500)
- Network connectivity issues
- JSON serialization errors
- OCR processing failures

## Code Structure

### ImageExtractText Class
- **extractTextFromImage:** Main text extraction method
- **ImageExtractTextResult:** Inner class for result wrapping

### ImageExtractTextTest Class
- **testExtractTextFromImage:** Test method with example usage

## Troubleshooting

### Common Issues

1. **"Callout failed"**
   - Verify API key is correct
   - Check internet connectivity
   - Ensure remote site settings allow PDF4Me domain

2. **"Base64 encoding error"**
   - Ensure image data is properly base64 encoded
   - Check for null or empty image data

3. **"No text found"**
   - Ensure the image contains readable text
   - Check image quality and resolution
   - Verify text is not too small or blurry

4. **"Poor OCR results"**
   - Use high-resolution images
   - Ensure good contrast between text and background
   - Avoid heavily stylized fonts

### Debugging

- Use `System.debug()` statements for additional output
- Check debug logs for detailed error messages
- Verify API responses in debug logs

## Salesforce Integration

### Data Handling
- Returns extracted text as JSON string for easy parsing
- Can be stored in custom fields or processed further
- Supports integration with other Salesforce features

### Security
- Uses Salesforce's built-in security model
- Respects user permissions and sharing rules
- Secure API key storage (consider using Custom Settings for production)

## Development

### Testing
```apex
// Run tests in Developer Console
Test.startTest();
ImageExtractTextTest.testExtractTextFromImage();
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
- **Response Size:** Large OCR responses may be truncated

## Output Examples

### Basic Text Extraction
```json
{
  "text": "This is sample text extracted from the image.",
  "confidence": 0.95,
  "regions": [
    {
      "text": "Sample text",
      "bbox": [100, 200, 300, 250],
      "confidence": 0.98
    }
  ]
}
```

### Structured Document
```json
{
  "pages": [
    {
      "pageNumber": 1,
      "textBlocks": [
        {
          "text": "Document Title",
          "type": "header",
          "bbox": [50, 50, 500, 80]
        },
        {
          "text": "This is the main content...",
          "type": "body",
          "bbox": [50, 100, 500, 400]
        }
      ]
    }
  ]
}
```

## Use Cases

### Document Digitization
- Convert scanned documents to searchable text
- Extract text from historical documents
- Process forms and applications

### Data Extraction
- Extract information from receipts and invoices
- Process business cards and contact information
- Analyze charts and graphs

### Content Analysis
- Extract text from screenshots
- Process handwritten notes
- Analyze printed materials

## Performance Considerations

- **Image Quality:** Higher resolution images provide better OCR results
- **Text Clarity:** Clear, high-contrast text improves accuracy
- **Image Size:** Larger images may take longer to process
- **Text Density:** Images with lots of text require more processing time
- **Network:** Stable internet connection improves reliability

## Best Practices

### Image Preparation
- Use high-resolution images (300+ DPI)
- Ensure good contrast between text and background
- Avoid shadows and reflections
- Use standard fonts when possible

### Processing
- Monitor response times and adjust timeouts
- Validate extracted text for accuracy
- Handle multiple languages appropriately

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer documentation](https://developer.salesforce.com/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 