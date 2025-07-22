# Flip Image (Salesforce)

A Salesforce Apex sample project for flipping images using the PDF4Me API.

## Project Structure

```
Flip Image/
├── FlipImage.cls                           # Main Apex class for image flipping
├── FlipImageTest.cls                       # Test class with examples
├── Executable_Anonymous_code_FlipImage.txt # Anonymous Apex execution examples
└── README.md                               # This file
```

## Features

- ✅ Flip images horizontally, vertically, or both directions
- ✅ Support for multiple image formats (JPG, PNG, GIF, BMP, TIFF)
- ✅ Automatic Salesforce File (ContentVersion) creation
- ✅ Base64 encoding/decoding for secure image transmission
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
   - Deploy `FlipImage.cls` to your Salesforce org
   - Deploy `FlipImageTest.cls` for testing

2. **Configure your API key:**
   - Open `FlipImage.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Enable callouts (if needed):**
   - Ensure your org can make external callouts
   - Add PDF4Me domain to remote site settings if required

## Usage

### Method 1: Direct Apex Class Usage

```apex
// Flip image and save as Salesforce File
String imageBase64 = 'your_base64_encoded_image_here';
String result = FlipImage.flipImageAndSave(
    imageBase64,
    'my_image.jpg',
    'Vertical'  // Orientation: Horizontal, Vertical, HorizontalAndVertical
);
```

### Method 2: Anonymous Apex Execution

Use the examples in `Executable_Anonymous_code_FlipImage.txt`:

```apex
// Example: Flip image vertically
String imageBase64 = 'base64_encoded_image';
FlipImage.FlipImageResult result = 
    FlipImage.flipImageAndSave(imageBase64, 'sample.jpg', 'Vertical');

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
FlipImageTest.testFlipImage();
Test.stopTest();
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/FlipImage`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 120 seconds (configurable)

## Configuration

- **API Key:** Set in `FlipImage.cls` as `API_KEY` constant
- **Endpoint URL:** `https://api.pdf4me.com/api/v2/FlipImage`
- **Supported Formats:** JPG, PNG, GIF, BMP, TIFF
- **Orientation Types:**
  - **Horizontal:** Flip image left to right
  - **Vertical:** Flip image top to bottom
  - **HorizontalAndVertical:** Flip image both horizontally and vertically

## Flip Options

### Horizontal Flip
```apex
"orientationType": "Horizontal"  // Flip left to right
```

### Vertical Flip
```apex
"orientationType": "Vertical"    // Flip top to bottom
```

### Both Directions
```apex
"orientationType": "HorizontalAndVertical"  // Flip both ways
```

## Return Values

The `flipImageAndSave` method returns a `FlipImageResult` object with:

- **base64:** Base64 encoded flipped image
- **downloadUrl:** Salesforce File download URL
- **error:** Error message (null if successful)

## Error Handling

- Invalid image data or format
- API authentication errors (401)
- Processing errors (400, 500)
- Network connectivity issues
- Salesforce File creation errors
- JSON serialization errors
- Invalid orientation type

## Code Structure

### FlipImage Class
- **flipImageAndSave:** Main flipping method
- **makeFilePublic:** Utility method for creating public file links
- **FlipImageResult:** Inner class for result wrapping

### FlipImageTest Class
- **testFlipImage:** Test method with example usage
- **testMakeFilePublic:** Test method for public file creation

## Troubleshooting

### Common Issues

1. **"Callout failed"**
   - Verify API key is correct
   - Check internet connectivity
   - Ensure remote site settings allow PDF4Me domain

2. **"Invalid orientation type"**
   - Ensure orientation type is one of: "Horizontal", "Vertical", "HorizontalAndVertical"
   - Check for typos in the orientation parameter

3. **"File creation failed"**
   - Verify user has permissions to create ContentVersion records
   - Check available storage space

4. **"Base64 encoding error"**
   - Ensure image data is properly base64 encoded
   - Check for null or empty image data

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
FlipImageTest.testFlipImage();
Test.stopTest();
```

### Deployment
- Deploy to sandbox first for testing
- Use Change Sets or Metadata API for production deployment
- Consider using Custom Settings for API key management in production

## Limitations

- **Async Processing:** Current implementation uses synchronous processing
- **File Size:** Limited by Salesforce callout timeout (120 seconds)
- **API Limits:** Subject to Salesforce API call limits
- **Storage:** Limited by org storage limits

## Use Cases

### Horizontal Flip
- Mirror images for design purposes
- Correct text that appears backwards
- Create symmetrical compositions

### Vertical Flip
- Invert images for artistic effects
- Correct upside-down images
- Create reflection effects

### Both Directions
- Rotate image 180 degrees
- Create complex transformations
- Artistic image manipulation

## Performance Considerations

- **Large Images:** Consider using smaller images for faster processing
- **Image Format:** Some formats may process faster than others
- **Network:** Stable internet connection improves reliability

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer documentation](https://developer.salesforce.com/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 