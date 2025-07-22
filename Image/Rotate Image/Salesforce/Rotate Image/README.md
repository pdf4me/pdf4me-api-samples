# Rotate Image (Salesforce)

A Salesforce Apex sample project for rotating images using the PDF4Me API.

## Project Structure

```
Rotate Image/
├── RotateImage.cls                          # Main Apex class for image rotation
├── RotateImageTest.cls                      # Test class with examples
├── Executable_Anonymous_code_RotateImage.txt # Anonymous Apex execution examples
└── README.md                                # This file
```

## Features

- ✅ Rotate images by custom angles (0-360 degrees)
- ✅ Configurable background color for rotation
- ✅ Proportionate resize option during rotation
- ✅ Support for multiple image formats
- ✅ Base64 encoding/decoding for secure image transmission
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
   - Deploy `RotateImage.cls` to your Salesforce org
   - Deploy `RotateImageTest.cls` for testing

2. **Configure your API key:**
   - Open `RotateImage.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Enable callouts (if needed):**
   - Ensure your org can make external callouts
   - Add PDF4Me domain to remote site settings if required

## Usage

### Method 1: Direct Apex Class Usage

```apex
// Rotate image and save as Salesforce File
String imageBase64 = 'your_base64_encoded_image_here';
String result = RotateImage.rotateImageAndSave(
    imageBase64,
    'my_image.jpg',
    90,              // Rotation angle in degrees
    '#FFFFFF',       // Background color in hex format
    true             // Maintain proportions during rotation
);
```

### Method 2: Anonymous Apex Execution

Use the examples in `Executable_Anonymous_code_RotateImage.txt`:

```apex
// Example: Rotate image 90 degrees
String imageBase64 = 'base64_encoded_image';
RotateImage.RotateImageResult result = 
    RotateImage.rotateImageAndSave(imageBase64, 'sample.jpg', 90, '#FFFFFF', true);

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
RotateImageTest.testRotateImage();
Test.stopTest();
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/RotateImage`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)

## Configuration

- **API Key:** Set in `RotateImage.cls` as `API_KEY` constant
- **Endpoint URL:** `https://api.pdf4me.com/api/v2/RotateImage`
- **Supported Formats:** JPG, PNG, and other common image formats

## Rotation Options

The API supports various rotation configurations:

### Rotation Angle
```apex
"RotationAngle": 90  // Rotate 90 degrees clockwise
```

Common rotation angles:
- **0°:** No rotation
- **90°:** Quarter turn clockwise
- **180°:** Half turn (upside down)
- **270°:** Three-quarter turn clockwise
- **Custom:** Any angle between 0-360 degrees

### Background Color
```apex
"Backgroundcolor": "#FFFFFF"  // White background
```

Color options:
- **Hex colors:** "#FFFFFF" (white), "#000000" (black), "#FF0000" (red)
- **Transparent:** Use transparent background (if supported)
- **Custom:** Any valid hex color code

### Proportionate Resize
```apex
"ProportionateResize": true  // Maintain proportions during rotation
```

This option:
- **True:** Maintains image proportions and fits within original dimensions
- **False:** Allows image to expand beyond original boundaries

## Return Values

The `rotateImageAndSave` method returns a `RotateImageResult` object with:

- **base64:** Base64 encoded rotated image
- **downloadUrl:** Salesforce File download URL
- **error:** Error message (null if successful)

## Error Handling

- Invalid image data or format
- API authentication errors (401)
- Processing errors (400, 500)
- Network connectivity issues
- Salesforce File creation errors
- JSON serialization errors
- Invalid rotation parameters
- Image processing failures

## Code Structure

### RotateImage Class
- **rotateImageAndSave:** Main image rotation method
- **makeFilePublic:** Utility method for creating public file links
- **RotateImageResult:** Inner class for result wrapping

### RotateImageTest Class
- **testRotateImage:** Test method with example usage

## Troubleshooting

### Common Issues

1. **"Callout failed"**
   - Verify API key is correct
   - Check internet connectivity
   - Ensure remote site settings allow PDF4Me domain

2. **"Base64 encoding error"**
   - Ensure image data is properly base64 encoded
   - Check for null or empty image data

3. **"Invalid rotation angle"**
   - Ensure rotation angle is between 0 and 360 degrees
   - Check that the angle is an integer value

4. **"Invalid background color"**
   - Ensure color is in valid hex format (e.g., "#FFFFFF")
   - Check for proper color syntax

5. **"Image quality issues"**
   - Large rotation angles may affect image quality
   - Consider using proportionate resize for better results
   - Test with different background colors

6. **"File creation failed"**
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
RotateImageTest.testRotateImage();
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

### Image Correction
- Fix incorrectly oriented photos
- Correct landscape/portrait orientation
- Align images for proper viewing

### Creative Editing
- Create artistic rotated compositions
- Generate tilted image effects
- Produce dynamic visual layouts

### Document Processing
- Rotate scanned documents
- Correct document orientation
- Prepare images for OCR processing

### Web and Print
- Optimize images for web display
- Prepare images for print layouts
- Create thumbnail variations

## Performance Considerations

- **Image Size:** Larger images take longer to process
- **Rotation Angle:** Complex angles may require more processing time
- **Background Color:** Transparent backgrounds may increase file size
- **Proportionate Resize:** May affect final image dimensions
- **Network:** Stable internet connection improves reliability

## Best Practices

### Image Preparation
- Use high-resolution images for better results
- Ensure images are in supported formats
- Consider the target use case when choosing rotation parameters

### Rotation Parameters
- Use standard angles (90°, 180°, 270°) for best results
- Choose appropriate background colors for your use case
- Enable proportionate resize to maintain image quality
- Test with different angles to find optimal settings

### Processing
- Monitor response times and adjust timeouts
- Validate output images for quality
- Handle multiple rotation operations appropriately

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer documentation](https://developer.salesforce.com/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 