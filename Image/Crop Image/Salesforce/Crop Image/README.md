# Crop Image (Salesforce)

A Salesforce Apex sample project for cropping images using the PDF4Me API.

## Project Structure

```
Crop Image/
├── CropImage.cls                           # Main Apex class for image cropping
├── CropImageTest.cls                       # Test class with examples
├── Executable_Anonymous_code_CropImage.txt # Anonymous Apex execution examples
└── README.md                               # This file
```

## Features

- ✅ Crop images using border-based or rectangle-based methods
- ✅ Configurable crop dimensions and coordinates
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
   - Deploy `CropImage.cls` to your Salesforce org
   - Deploy `CropImageTest.cls` for testing

2. **Configure your API key:**
   - Open `CropImage.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Enable callouts (if needed):**
   - Ensure your org can make external callouts
   - Add PDF4Me domain to remote site settings if required

## Usage

### Method 1: Direct Apex Class Usage

```apex
// Crop image and save as Salesforce File
String imageBase64 = 'your_base64_encoded_image_here';
String result = CropImage.cropImageAndSave(
    imageBase64,
    'my_image.jpg',
    'Border',  // Crop type: Border or Rectangle
    10, 10, 20, 20  // Left, Right, Top, Bottom borders
);
```

### Method 2: Anonymous Apex Execution

Use the examples in `Executable_Anonymous_code_CropImage.txt`:

```apex
// Example: Crop image using border method
String imageBase64 = 'base64_encoded_image';
CropImage.CropImageResult result = 
    CropImage.cropImageAndSave(imageBase64, 'sample.jpg', 'Border', 10, 10, 20, 20);

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
CropImageTest.testCropImage();
Test.stopTest();
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/CropImage?schemaVal=Border`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 120 seconds (configurable)

## Configuration

- **API Key:** Set in `CropImage.cls` as `API_KEY` constant
- **Endpoint URL:** `https://api.pdf4me.com/api/v2/CropImage?schemaVal=Border`
- **Supported Formats:** JPG, PNG, GIF, BMP, TIFF
- **Crop Types:**
  - **Border:** Crop by removing borders from all sides
  - **Rectangle:** Crop to a specific rectangular area

## Crop Methods

### Method 1: Border Cropping
Remove borders from all sides of the image:
```apex
"CropType": "Border",
"LeftBorder": "10",      // Remove 10 pixels from left
"RightBorder": "10",     // Remove 10 pixels from right
"TopBorder": "20",       // Remove 20 pixels from top
"BottomBorder": "20"     // Remove 20 pixels from bottom
```

### Method 2: Rectangle Cropping
Crop to a specific rectangular area:
```apex
"CropType": "Rectangle",
"UpperLeftX": 10,        // X coordinate of upper-left corner
"UpperLeftY": 10,        // Y coordinate of upper-left corner
"Width": 50,             // Width of crop area
"Height": 50             // Height of crop area
```

## Return Values

The `cropImageAndSave` method returns a `CropImageResult` object with:

- **base64:** Base64 encoded cropped image
- **downloadUrl:** Salesforce File download URL
- **error:** Error message (null if successful)

## Error Handling

- Invalid image data or format
- API authentication errors (401)
- Processing errors (400, 500)
- Network connectivity issues
- Salesforce File creation errors
- JSON serialization errors
- Invalid crop parameters

## Code Structure

### CropImage Class
- **cropImageAndSave:** Main cropping method
- **makeFilePublic:** Utility method for creating public file links
- **CropImageResult:** Inner class for result wrapping

### CropImageTest Class
- **testCropImage:** Test method with example usage
- **testMakeFilePublic:** Test method for public file creation

## Troubleshooting

### Common Issues

1. **"Callout failed"**
   - Verify API key is correct
   - Check internet connectivity
   - Ensure remote site settings allow PDF4Me domain

2. **"Invalid crop parameters"**
   - Ensure crop dimensions don't exceed image size
   - Check that coordinates are within image bounds
   - Verify crop type is correctly specified

3. **"File creation failed"**
   - Verify user has permissions to create ContentVersion records
   - Check available storage space

4. **"Base64 encoding error"**
   - Ensure image data is properly base64 encoded
   - Check for null or empty image data

5. **"Crop area too large"**
   - Reduce crop dimensions
   - Check that crop area fits within original image

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
CropImageTest.testCropImage();
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

## Crop Examples

### Remove Borders
```apex
// Remove 10 pixels from each side
CropImage.cropImageAndSave(imageBase64, 'image.jpg', 'Border', 10, 10, 10, 10);
```

### Crop to Center
```apex
// Crop to center 100x100 area
// Note: Rectangle cropping requires different method signature
```

### Crop Top Portion
```apex
// Remove bottom 20% of image
CropImage.cropImageAndSave(imageBase64, 'image.jpg', 'Border', 0, 0, 0, 80);
```

## Performance Considerations

- **Large Images:** Consider using smaller images for faster processing
- **Crop Size:** Smaller crop areas process faster
- **Image Format:** Some formats may process faster than others
- **Network:** Stable internet connection improves reliability

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer documentation](https://developer.salesforce.com/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 