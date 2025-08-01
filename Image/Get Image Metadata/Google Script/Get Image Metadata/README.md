# Get Image Metadata - Google Apps Script

This Google Apps Script extracts metadata from images using the PDF4Me API. It provides detailed information about image properties including dimensions, format, file size, color space, EXIF data, and more.

## Prerequisites

- Google Apps Script access
- PDF4Me API key
- Google Drive with Input folder
- An image file in the Input folder

## Setup

1. **Create Google Apps Script Project:**
   - Go to [Google Apps Script](https://script.google.com/)
   - Create a new project
   - Copy the code from `get_image_metadata.gs`

2. **Configure API Key:**
   ```javascript
   // Set your PDF4Me API key
   var apiKey = 'YOUR_API_KEY_HERE';
   ```

3. **Set up Google Drive Folders:**
   - Create a folder named "Input" in your Google Drive
   - Place your image file in the Input folder

4. **Configure File Name:**
   ```javascript
   var inputFileName = 'input.jpg';
   ```

## Usage

1. **Prepare your image file:**
   - Place your image file in the Input folder
   - Update the `inputFileName` variable to match your file name

2. **Run the script:**
   - Save the script
   - Click the "Run" button
   - Grant necessary permissions when prompted

3. **Check results:**
   - View the execution logs to see the extracted metadata
   - All metadata information will be displayed in the logs

## API Endpoint

- **URL:** `https://api.pdf4me.com/api/v2/GetImageMetadata`
- **Method:** POST
- **Authentication:** Bearer token

## Request Payload

```json
{
  "imageContent": "base64_encoded_image_content"
}
```

## Response Data

The API returns comprehensive metadata including:

### Basic Information
- **width:** Image width in pixels
- **height:** Image height in pixels
- **format:** Image format (JPG, PNG, GIF, etc.)
- **fileSize:** File size in bytes

### Technical Properties
- **colorSpace:** Color space information (RGB, CMYK, etc.)
- **dpi:** Resolution in dots per inch
- **bitDepth:** Color depth in bits
- **channels:** Number of color channels
- **compression:** Compression type used

### EXIF Data
- **exifData:** Extended metadata including:
  - Camera make and model
  - Date and time taken
  - GPS coordinates
  - Exposure settings
  - ISO speed
  - Focal length
  - And many more camera-specific settings

### Color Management
- **iccProfile:** ICC color profile information

## Supported Input Formats

- JPG (JPEG)
- PNG
- GIF
- BMP
- TIFF
- WebP
- And many other image formats

## Error Handling

The script includes comprehensive error handling:

- **File not found:** Checks if input file exists
- **API errors:** Handles HTTP error responses
- **Authentication errors:** Validates API key
- **Parsing errors:** Handles malformed metadata responses
- **Missing data:** Gracefully handles missing metadata fields

## Troubleshooting

### Common Issues

1. **"File not found" error:**
   - Ensure the input file exists in the Input folder
   - Check the `inputFileName` variable matches your file name

2. **"API key invalid" error:**
   - Verify your PDF4Me API key is correct
   - Ensure the API key has sufficient permissions

3. **"Processing failed" error:**
   - Check if the image file is corrupted
   - Ensure image format is supported
   - Verify file is not password-protected

4. **"No metadata found" message:**
   - Some images may not contain extensive metadata
   - Basic information (width, height, format) should still be available
   - EXIF data depends on camera settings and image source

### Performance Tips

- Metadata extraction is generally fast
- Large images may take slightly longer to process
- EXIF data extraction depends on image source and camera settings
- Consider file size when processing multiple images

## Security Considerations

- Store your API key securely
- Don't share your script with API keys exposed
- Use environment variables or secure storage for production
- Regularly rotate your API keys
- Be aware that EXIF data may contain sensitive information

## Performance Notes

- Processing time depends on image size and metadata complexity
- Metadata extraction is typically fast
- EXIF data parsing may add processing time
- Network latency may impact response times

## Best Practices

1. **File selection:** Choose images with rich metadata for comprehensive analysis
2. **Log review:** Check execution logs for complete metadata information
3. **Data handling:** Be mindful of sensitive information in EXIF data
4. **Format support:** Test with different image formats to understand capabilities
5. **Error handling:** Monitor for missing or incomplete metadata

## Example Use Cases

### Photography Analysis
- Extract camera settings and shooting information
- Analyze image quality and technical specifications
- Review GPS location data (if present)
- Check color space and profile information

### Content Management
- Verify image dimensions and file sizes
- Validate image formats and compatibility
- Extract creation dates and modification times
- Analyze compression and quality settings

### Quality Assurance
- Check image resolution and DPI settings
- Verify color space and bit depth
- Analyze compression ratios
- Validate technical specifications

### Digital Forensics
- Extract timestamps and location data
- Analyze camera and device information
- Review editing history and software used
- Check for embedded metadata

## Metadata Examples

### Basic Image Information
```
Image Metadata:
File Name: sample.jpg
Width: 1920 pixels
Height: 1080 pixels
Format: JPEG
File Size: 245760 bytes
Color Space: RGB
DPI: 72
```

### EXIF Data Example
```
EXIF Data:
  Make: Canon
  Model: EOS 5D Mark IV
  DateTime: 2023:10:15 14:30:25
  ExposureTime: 1/125
  FNumber: f/2.8
  ISO: 100
  FocalLength: 50mm
  GPSLatitude: 40.7128
  GPSLongitude: -74.0060
```

## Support

For issues related to:
- **PDF4Me API:** Contact PDF4Me support
- **Google Apps Script:** Check Google Apps Script documentation
- **Google Drive:** Refer to Google Drive help

## Additional Notes

- Metadata availability depends on image source and format
- Some images may have minimal metadata
- EXIF data is most common in camera-captured images
- Metadata extraction preserves original image file
- Sensitive information in EXIF data should be handled carefully 