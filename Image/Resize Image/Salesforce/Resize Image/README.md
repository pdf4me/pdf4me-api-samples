# Resize Image (Salesforce)

A Salesforce Apex sample project for resizing images using the PDF4Me API.

## Project Structure

```
Resize Image/
├── ResizeImage.cls                          # Main Apex class for image resizing
├── ResizeImageTest.cls                      # Test class with examples
├── Executable_Anonymous_code_ResizeImage.txt # Anonymous Apex execution examples
└── README.md                                # This file
```

## Features

- ✅ Resize images by percentage or specific dimensions
- ✅ Maintain aspect ratio option
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
   - Deploy `ResizeImage.cls` to your Salesforce org
   - Deploy `ResizeImageTest.cls` for testing

2. **Configure your API key:**
   - Open `ResizeImage.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Enable callouts (if needed):**
   - Ensure your org can make external callouts
   - Add PDF4Me domain to remote site settings if required

## Usage

### Method 1: Direct Apex Class Usage

```apex
// Resize image and save as Salesforce File
String imageBase64 = 'your_base64_encoded_image_here';
String result = ResizeImage.resizeImageAndSave(
    imageBase64,
    'my_image.jpg',
    'Percentage',    // Resize type: Percentage or Specific
    '50.0',          // Resize percentage (for Percentage type)
    800,             // Width in pixels (for Specific type)
    600,             // Height in pixels (for Specific type)
    true             // Maintain aspect ratio
);
```

### Method 2: Anonymous Apex Execution

Use the examples in `Executable_Anonymous_code_ResizeImage.txt`:

```apex
// Example: Resize image by percentage
String imageBase64 = 'base64_encoded_image';
ResizeImage.ResizeImageResult result = 
    ResizeImage.resizeImageAndSave(imageBase64, 'sample.jpg', 'Percentage', '50.0', 0, 0, true);

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
ResizeImageTest.testResizeImage();
Test.stopTest();
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ResizeImage?schemaVal=Percentange`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)

## Configuration

- **API Key:** Set in `ResizeImage.cls` as `API_KEY` constant
- **Endpoint URL:** `https://api.pdf4me.com/api/v2/ResizeImage?schemaVal=Percentange`
- **Supported Formats:** JPG, PNG, and other common image formats

## Resize Options

The API supports two main resize types:

### Percentage Resize
```apex
"ImageResizeType": "Percentage",
"ResizePercentage": "50.0"  // Resize to 50% of original size
```

### Specific Dimensions
```apex
"ImageResizeType": "Specific",
"Width": 800,               // Target width in pixels
"Height": 600,              // Target height in pixels
"MaintainAspectRatio": true // Keep aspect ratio
```

## Return Values

The `resizeImageAndSave` method returns a `ResizeImageResult` object with:

- **base64:** Base64 encoded resized image
- **downloadUrl:** Salesforce File download URL
- **error:** Error message (null if successful)

## Error Handling

- Invalid image data or format
- API authentication errors (401)
- Processing errors (400, 500)
- Network connectivity issues
- Salesforce File creation errors
- JSON serialization errors
- Invalid resize parameters
- Image processing failures

## Code Structure

### ResizeImage Class
- **resizeImageAndSave:** Main image resizing method
- **makeFilePublic:** Utility method for creating public file links
- **ResizeImageResult:** Inner class for result wrapping

### ResizeImageTest Class
- **testResizeImage:** Test method with example usage

## Troubleshooting

### Common Issues

1. **"Callout failed"**
   - Verify API key is correct
   - Check internet connectivity
   - Ensure remote site settings allow PDF4Me domain

2. **"Base64 encoding error"**
   - Ensure image data is properly base64 encoded
   - Check for null or empty image data

3. **"Invalid resize parameters"**
   - Ensure percentage is between 0.1 and 1000.0
   - Check that width and height are positive integers
   - Verify resize type is "Percentage" or "Specific"

4. **"Image quality issues"**
   - Large percentage reductions may affect quality
   - Consider using specific dimensions for better control
   - Test with different resize parameters

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
ResizeImageTest.testResizeImage();
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

### Web Optimization
- Resize images for web display
- Reduce file sizes for faster loading
- Create thumbnails and previews

### Content Management
- Standardize image sizes across collections
- Prepare images for different platforms
- Create responsive image sets

### Storage Optimization
- Reduce storage space requirements
- Compress images for archival
- Optimize images for email attachments

### Social Media
- Resize images for platform requirements
- Create profile pictures and avatars
- Optimize images for mobile viewing

## Performance Considerations

- **Image Size:** Larger images take longer to process
- **Resize Percentage:** Extreme reductions may affect quality
- **Aspect Ratio:** Maintaining aspect ratio may limit size options
- **Network:** Stable internet connection improves reliability
- **Processing Time:** Depends on image size and resize parameters

## Best Practices

### Image Preparation
- Use high-resolution images for better results
- Ensure images are in supported formats
- Consider the target use case when choosing resize parameters

### Resize Parameters
- Use percentage resize for proportional scaling
- Use specific dimensions for exact size requirements
- Enable aspect ratio maintenance to prevent distortion
- Test with different parameters to find optimal settings

### Processing
- Monitor response times and adjust timeouts
- Validate output images for quality
- Handle multiple resize operations appropriately

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer documentation](https://developer.salesforce.com/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 