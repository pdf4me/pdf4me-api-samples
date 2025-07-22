# Rotate Image By Exif Data (Salesforce)

A Salesforce Apex sample project for automatically rotating images based on their EXIF orientation metadata using the PDF4Me API.

## Project Structure

```
Rotate Image By Exif Data/
├── RotateImageByExifData.cls                    # Main Apex class for EXIF-based rotation
├── RotateImageByExifDataTest.cls                # Test class with examples
├── Executable_Anonymous_code_RotateImageByExifData.txt  # Anonymous Apex execution examples
└── README.md                                    # This file
```

## Features

- ✅ Automatically rotate images based on EXIF orientation data
- ✅ No manual angle specification required
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
   - Deploy `RotateImageByExifData.cls` to your Salesforce org
   - Deploy `RotateImageByExifDataTest.cls` for testing

2. **Configure your API key:**
   - Open `RotateImageByExifData.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Enable callouts (if needed):**
   - Ensure your org can make external callouts
   - Add PDF4Me domain to remote site settings if required

## Usage

### Method 1: Direct Apex Class Usage

```apex
// Rotate image by EXIF data and save as Salesforce File
String imageBase64 = 'your_base64_encoded_image_here';
String result = RotateImageByExifData.rotateImageByExifDataAndSave(
    imageBase64,
    'my_image.jpg'
);
```

### Method 2: Anonymous Apex Execution

Use the examples in `Executable_Anonymous_code_RotateImageByExifData.txt`:

```apex
// Example: Rotate image by EXIF data
String imageBase64 = 'base64_encoded_image';
RotateImageByExifData.RotateImageByExifDataResult result = 
    RotateImageByExifData.rotateImageByExifDataAndSave(imageBase64, 'sample.jpg');

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
RotateImageByExifDataTest.testRotateImageByExifData();
Test.stopTest();
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/RotateImageByExifData`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)

## Configuration

- **API Key:** Set in `RotateImageByExifData.cls` as `API_KEY` constant
- **Endpoint URL:** `https://api.pdf4me.com/api/v2/RotateImageByExifData`
- **Supported Formats:** JPG, PNG, and other common image formats

## EXIF Orientation Data

The API automatically detects and applies rotation based on EXIF orientation tags:

### Common EXIF Orientation Values
- **1:** Normal (no rotation needed)
- **2:** Mirrored horizontally
- **3:** Rotated 180°
- **4:** Mirrored vertically
- **5:** Mirrored horizontally and rotated 90° CCW
- **6:** Rotated 90° CW
- **7:** Mirrored horizontally and rotated 90° CW
- **8:** Rotated 90° CCW

### How It Works
1. **EXIF Detection:** API reads the image's EXIF orientation metadata
2. **Automatic Rotation:** Applies the appropriate rotation to correct orientation
3. **Output:** Returns the correctly oriented image

## Return Values

The `rotateImageByExifDataAndSave` method returns a `RotateImageByExifDataResult` object with:

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
- Missing EXIF data
- Image processing failures

## Code Structure

### RotateImageByExifData Class
- **rotateImageByExifDataAndSave:** Main EXIF-based rotation method
- **makeFilePublic:** Utility method for creating public file links
- **RotateImageByExifDataResult:** Inner class for result wrapping

### RotateImageByExifDataTest Class
- **testRotateImageByExifData:** Test method with example usage

## Troubleshooting

### Common Issues

1. **"Callout failed"**
   - Verify API key is correct
   - Check internet connectivity
   - Ensure remote site settings allow PDF4Me domain

2. **"Base64 encoding error"**
   - Ensure image data is properly base64 encoded
   - Check for null or empty image data

3. **"No rotation applied"**
   - Image may not contain EXIF orientation data
   - Image may already be correctly oriented
   - Check if the image has EXIF metadata

4. **"Unexpected rotation"**
   - Verify the image has correct EXIF orientation data
   - Check if the image was previously processed
   - Ensure the image format supports EXIF data

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
RotateImageByExifDataTest.testRotateImageByExifData();
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

### Photo Management
- Correct automatically captured photos from mobile devices
- Fix landscape/portrait orientation issues
- Standardize photo collections

### Content Processing
- Prepare images for web display
- Correct scanned document orientation
- Process bulk image uploads

### Digital Asset Management
- Automate image orientation correction
- Maintain consistent image presentation
- Process legacy image collections

### Mobile Applications
- Handle photos from various devices
- Correct camera orientation issues
- Improve user experience

## Performance Considerations

- **Image Size:** Larger images take longer to process
- **EXIF Data:** Images with complex EXIF data may require more processing
- **Format Support:** Some formats may not support EXIF data
- **Network:** Stable internet connection improves reliability
- **Processing Time:** Depends on image size and EXIF complexity

## Best Practices

### Image Preparation
- Use images with valid EXIF orientation data
- Ensure images are in supported formats (JPG, PNG)
- Check for existing EXIF data before processing

### Processing
- Monitor response times and adjust timeouts
- Validate output images for correct orientation
- Handle multiple images appropriately

### Quality Assurance
- Verify rotation results match expectations
- Test with various image orientations
- Check for any quality degradation
- Validate EXIF data preservation

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer documentation](https://developer.salesforce.com/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 