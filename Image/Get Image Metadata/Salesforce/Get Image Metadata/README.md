# Get Image Metadata (Salesforce)

A Salesforce Apex sample project for extracting metadata from images using the PDF4Me API.

## Project Structure

```
Get Image Metadata/
├── GetImageMetadata.cls                    # Main Apex class for metadata extraction
├── GetImageMetadataTest.cls                # Test class with examples
├── Executable_Anonymous_code_GetImageMetadata.txt  # Anonymous Apex execution examples
└── README.md                               # This file
```

## Features

- ✅ Extract comprehensive metadata from images
- ✅ Support for multiple image formats (JPG, PNG)
- ✅ EXIF data extraction and analysis
- ✅ Image properties and technical information
- ✅ Base64 encoding/decoding for secure image transmission
- ✅ Comprehensive error handling and result wrapping
- ✅ JSON output format for easy parsing
- ✅ Test coverage with example implementations
- ✅ Anonymous Apex execution examples

## Prerequisites

- Salesforce org (Developer, Enterprise, or Unlimited Edition)
- API access enabled
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- Internet access from Salesforce (if using callouts)

## Setup

1. **Deploy the Apex classes:**
   - Deploy `GetImageMetadata.cls` to your Salesforce org
   - Deploy `GetImageMetadataTest.cls` for testing

2. **Configure your API key:**
   - Open `GetImageMetadata.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Enable callouts (if needed):**
   - Ensure your org can make external callouts
   - Add PDF4Me domain to remote site settings if required

## Usage

### Method 1: Direct Apex Class Usage

```apex
// Extract metadata from image
String imageBase64 = 'your_base64_encoded_image_here';
String result = GetImageMetadata.getImageMetadata(
    imageBase64,
    'my_image.jpg',
    'JPG'  // Image type: JPG or PNG
);
```

### Method 2: Anonymous Apex Execution

Use the examples in `Executable_Anonymous_code_GetImageMetadata.txt`:

```apex
// Example: Extract metadata from PNG image
String imageBase64 = 'base64_encoded_image';
GetImageMetadata.GetImageMetadataResult result = 
    GetImageMetadata.getImageMetadata(imageBase64, 'sample.png', 'PNG');

if (result.error == null) {
    System.debug('Success! Metadata: ' + result.metadata);
} else {
    System.debug('Error: ' + result.error);
}
```

### Method 3: Test Class Examples

Run the test class for working examples:

```apex
Test.startTest();
GetImageMetadataTest.testGetImageMetadata();
Test.stopTest();
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/GetImageMetadata`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 120 seconds (configurable)

## Configuration

- **API Key:** Set in `GetImageMetadata.cls` as `API_KEY` constant
- **Endpoint URL:** `https://api.pdf4me.com/api/v2/GetImageMetadata`
- **Supported Formats:** JPG, PNG
- **Image Types:**
  - **JPG:** JPEG image format
  - **PNG:** PNG image format

## Metadata Information

The API extracts various types of metadata including:

### Basic Image Properties
- **Dimensions:** Width and height in pixels
- **File Size:** Size in bytes
- **Format:** Image format and version
- **Color Space:** RGB, CMYK, Grayscale, etc.
- **Bit Depth:** Color depth information

### EXIF Data (if available)
- **Camera Information:** Make, model, lens
- **Capture Settings:** Aperture, shutter speed, ISO
- **Date/Time:** Original capture date
- **GPS Data:** Location coordinates (if present)
- **Software:** Editing software used

### Technical Information
- **Compression:** Compression type and quality
- **Resolution:** DPI and resolution information
- **Color Profile:** Embedded color profiles
- **Metadata Standards:** EXIF, IPTC, XMP support

## Return Values

The `getImageMetadata` method returns a `GetImageMetadataResult` object with:

- **metadata:** JSON string containing extracted metadata
- **error:** Error message (null if successful)

## Error Handling

- Invalid image data or format
- API authentication errors (401)
- Processing errors (400, 500)
- Network connectivity issues
- JSON serialization errors
- Invalid image type

## Code Structure

### GetImageMetadata Class
- **getImageMetadata:** Main metadata extraction method
- **GetImageMetadataResult:** Inner class for result wrapping

### GetImageMetadataTest Class
- **testGetImageMetadata:** Test method with example usage

## Troubleshooting

### Common Issues

1. **"Callout failed"**
   - Verify API key is correct
   - Check internet connectivity
   - Ensure remote site settings allow PDF4Me domain

2. **"Invalid image type"**
   - Ensure image type is "JPG" or "PNG"
   - Check that the image format matches the specified type

3. **"Base64 encoding error"**
   - Ensure image data is properly base64 encoded
   - Check for null or empty image data

4. **"No metadata found"**
   - Some images may not contain metadata
   - Check if the image has EXIF data embedded

### Debugging

- Use `System.debug()` statements for additional output
- Check debug logs for detailed error messages
- Verify API responses in debug logs

## Salesforce Integration

### Data Handling
- Returns metadata as JSON string for easy parsing
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
GetImageMetadataTest.testGetImageMetadata();
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
- **Metadata Size:** Large metadata responses may be truncated

## Metadata Examples

### Basic Image Info
```json
{
  "width": 1920,
  "height": 1080,
  "format": "JPEG",
  "fileSize": 245760,
  "colorSpace": "RGB",
  "bitDepth": 8
}
```

### EXIF Data
```json
{
  "exif": {
    "make": "Canon",
    "model": "EOS 5D Mark IV",
    "dateTime": "2023:01:15 14:30:25",
    "exposureTime": "1/125",
    "fNumber": "f/2.8",
    "iso": 100
  }
}
```

## Use Cases

### Image Analysis
- Extract technical specifications
- Analyze image quality and properties
- Verify image authenticity

### Content Management
- Organize images by metadata
- Filter images by camera settings
- Track image origins and history

### Digital Forensics
- Extract embedded metadata
- Analyze image timestamps
- Verify image sources

## Performance Considerations

- **Large Images:** Consider using smaller images for faster processing
- **Image Format:** Some formats may process faster than others
- **Network:** Stable internet connection improves reliability
- **Metadata Size:** Images with extensive metadata may take longer

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer documentation](https://developer.salesforce.com/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 