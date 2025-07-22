# Remove EXIF Tags From Image (Salesforce)

A Salesforce Apex sample project for removing EXIF tags and metadata from images using the PDF4Me API.

## Project Structure

```
Remove EXIF Tags From Image/
├── RemoveExifTagsFromImage.cls                    # Main Apex class for EXIF tag removal
├── RemoveExifTagsFromImageTest.cls                # Test class with examples
├── Executable_Anonymous_code_RemoveExifTagsFromImage.txt  # Anonymous Apex execution examples
└── README.md                                      # This file
```

## Features

- ✅ Remove EXIF tags and metadata from images
- ✅ Support for multiple image formats (JPG, PNG)
- ✅ Base64 encoding/decoding for secure image transmission
- ✅ Comprehensive error handling and result wrapping
- ✅ Automatic Salesforce File (ContentVersion) creation
- ✅ Public file sharing capabilities
- ✅ Test coverage with example implementations
- ✅ Anonymous Apex execution examples
- ✅ Privacy protection and file size optimization

## Prerequisites

- Salesforce org (Developer, Enterprise, or Unlimited Edition)
- API access enabled
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- Internet access from Salesforce (if using callouts)

## Setup

1. **Deploy the Apex classes:**
   - Deploy `RemoveExifTagsFromImage.cls` to your Salesforce org
   - Deploy `RemoveExifTagsFromImageTest.cls` for testing

2. **Configure your API key:**
   - Open `RemoveExifTagsFromImage.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Enable callouts (if needed):**
   - Ensure your org can make external callouts
   - Add PDF4Me domain to remote site settings if required

## Usage

### Method 1: Direct Apex Class Usage

```apex
// Remove EXIF tags from image and save as Salesforce File
String imageBase64 = 'your_base64_encoded_image_here';
String result = RemoveExifTagsFromImage.removeExifTagsAndSave(
    imageBase64,
    'my_image.jpg',
    'JPG'  // Image type: JPG or PNG
);
```

### Method 2: Anonymous Apex Execution

Use the examples in `Executable_Anonymous_code_RemoveExifTagsFromImage.txt`:

```apex
// Example: Remove EXIF tags from image
String imageBase64 = 'base64_encoded_image';
RemoveExifTagsFromImage.RemoveExifTagsResult result = 
    RemoveExifTagsFromImage.removeExifTagsAndSave(imageBase64, 'sample.jpg', 'JPG');

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
RemoveExifTagsFromImageTest.testRemoveExifTags();
Test.stopTest();
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/RemoveEXIFTagsFromImage`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)

## Configuration

- **API Key:** Set in `RemoveExifTagsFromImage.cls` as `API_KEY` constant
- **Endpoint URL:** `https://api.pdf4me.com/api/v2/RemoveEXIFTagsFromImage`
- **Supported Formats:** JPG, PNG
- **Image Types:**
  - **JPG:** JPEG image format
  - **PNG:** PNG image format

## EXIF Data Removal

The API removes various types of metadata including:

### Camera Information
- **Make and Model:** Camera manufacturer and model
- **Lens Information:** Lens type and specifications
- **Serial Numbers:** Camera and lens serial numbers

### Capture Settings
- **Aperture:** F-stop values
- **Shutter Speed:** Exposure time
- **ISO:** Light sensitivity settings
- **Focal Length:** Lens focal length
- **Flash Information:** Flash usage and settings

### Location Data
- **GPS Coordinates:** Latitude and longitude
- **GPS Altitude:** Elevation data
- **GPS Timestamp:** Location timestamp

### Date and Time
- **Original Capture Date:** When the photo was taken
- **Modification Date:** Last modification timestamp
- **Software Information:** Editing software used

### Other Metadata
- **Color Space:** Color profile information
- **Resolution:** DPI and resolution data
- **Copyright:** Copyright information
- **Artist Information:** Photographer details

## Return Values

The `removeExifTagsAndSave` method returns a `RemoveExifTagsResult` object with:

- **base64:** Base64 encoded cleaned image
- **downloadUrl:** Salesforce File download URL
- **error:** Error message (null if successful)

## Error Handling

- Invalid image data or format
- API authentication errors (401)
- Processing errors (400, 500)
- Network connectivity issues
- Salesforce File creation errors
- JSON serialization errors
- EXIF removal failures

## Code Structure

### RemoveExifTagsFromImage Class
- **removeExifTagsAndSave:** Main EXIF removal method
- **makeFilePublic:** Utility method for creating public file links
- **RemoveExifTagsResult:** Inner class for result wrapping

### RemoveExifTagsFromImageTest Class
- **testRemoveExifTags:** Test method with example usage

## Troubleshooting

### Common Issues

1. **"Callout failed"**
   - Verify API key is correct
   - Check internet connectivity
   - Ensure remote site settings allow PDF4Me domain

2. **"Base64 encoding error"**
   - Ensure image data is properly base64 encoded
   - Check for null or empty image data

3. **"No EXIF data found"**
   - Some images may not contain EXIF data
   - The API will still return a cleaned image

4. **"Invalid image type"**
   - Ensure image type is "JPG" or "PNG"
   - Check that the image format matches the specified type

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
RemoveExifTagsFromImageTest.testRemoveExifTags();
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

### Privacy Protection
- Remove location data from social media images
- Strip camera information from sensitive photos
- Protect personal information in shared images

### File Optimization
- Reduce file size by removing unnecessary metadata
- Clean images for web publishing
- Optimize images for storage

### Compliance
- Meet privacy regulations (GDPR, CCPA)
- Remove metadata for legal documents
- Ensure data protection standards

### Content Management
- Standardize image metadata across collections
- Prepare images for public distribution
- Clean images for archival purposes

## Performance Considerations

- **Image Quality:** EXIF removal doesn't affect image quality
- **File Size:** May reduce file size by removing metadata
- **Image Size:** Larger images may take longer to process
- **Network:** Stable internet connection improves reliability
- **Processing Time:** Depends on image size and metadata complexity

## Best Practices

### Image Preparation
- Use high-resolution images for better results
- Ensure images are in supported formats (JPG, PNG)
- Check for existing EXIF data before processing

### Processing
- Monitor response times and adjust timeouts
- Validate output images for completeness
- Handle multiple image formats appropriately

### Privacy Considerations
- Always remove EXIF data from images shared publicly
- Consider EXIF removal for sensitive content
- Implement automated EXIF removal for user uploads

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer documentation](https://developer.salesforce.com/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 