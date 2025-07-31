# Crop Image - Google Apps Script

This Google Apps Script crops images using the PDF4Me API. It allows you to extract a rectangular portion from an image by specifying the coordinates and dimensions of the crop area.

## Prerequisites

- Google Apps Script access
- PDF4Me API key
- Google Drive with Input and Output folders
- An image file in the Input folder

## Setup

1. **Create Google Apps Script Project:**
   - Go to [Google Apps Script](https://script.google.com/)
   - Create a new project
   - Copy the code from `crop_image.gs`

2. **Configure API Key:**
   ```javascript
   // Set your PDF4Me API key
   var apiKey = 'YOUR_API_KEY_HERE';
   ```

3. **Set up Google Drive Folders:**
   - Create a folder named "Input" in your Google Drive
   - Create a folder named "Output" in your Google Drive
   - Place your image file in the Input folder

4. **Configure File Names:**
   ```javascript
   var inputFileName = 'input.jpg';
   var outputFileName = 'cropped.jpg';
   ```

## Usage

1. **Prepare your image file:**
   - Place your image file in the Input folder
   - Update the `inputFileName` variable to match your file name

2. **Configure crop settings:**
   ```javascript
   var x = 100; // X coordinate of top-left corner (pixels)
   var y = 100; // Y coordinate of top-left corner (pixels)
   var width = 800; // Width of crop area (pixels)
   var height = 600; // Height of crop area (pixels)
   ```

3. **Run the script:**
   - Save the script
   - Click the "Run" button
   - Grant necessary permissions when prompted

4. **Check results:**
   - The cropped image will be saved in the Output folder
   - Check the execution logs for status information

## API Endpoint

- **URL:** `https://api.pdf4me.com/api/v2/CropImage`
- **Method:** POST
- **Authentication:** Bearer token

## Request Payload

```json
{
  "imageName": "cropped.jpg",
  "imageContent": "base64_encoded_image_content",
  "x": 100,
  "y": 100,
  "width": 800,
  "height": 600,
  "async": true
}
```

## Configuration Options

### Crop Coordinates
- **x:** X coordinate of the top-left corner of the crop area (in pixels)
- **y:** Y coordinate of the top-left corner of the crop area (in pixels)
- Coordinates start from (0,0) at the top-left corner of the image

### Crop Dimensions
- **width:** Width of the crop area in pixels
- **height:** Height of the crop area in pixels
- The crop area must fit within the original image boundaries

### Coordinate System
- Origin (0,0) is at the top-left corner of the image
- X increases from left to right
- Y increases from top to bottom
- All measurements are in pixels

## Supported Input Formats

- JPG (JPEG)
- PNG
- GIF
- BMP
- TIFF
- WebP

## Supported Output Formats

- JPG (JPEG)
- PNG
- GIF
- BMP
- TIFF
- WebP

## Error Handling

The script includes comprehensive error handling:

- **File not found:** Checks if input file exists
- **API errors:** Handles HTTP error responses
- **Authentication errors:** Validates API key
- **Processing errors:** Monitors async job status
- **Timeout handling:** Prevents infinite polling
- **Boundary validation:** Ensures crop area fits within image

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
   - Verify crop coordinates are within image boundaries
   - Ensure crop dimensions are valid

4. **"Crop area out of bounds" error:**
   - Check that x + width ≤ image width
   - Check that y + height ≤ image height
   - Verify coordinates are non-negative

5. **"Timeout" error:**
   - Large images may take longer to process
   - Increase the `maxAttempts` value if needed

### Performance Tips

- Use appropriate crop dimensions for your needs
- Consider image resolution when setting coordinates
- Test with smaller crop areas first
- Ensure crop area is meaningful and not too small

## Security Considerations

- Store your API key securely
- Don't share your script with API keys exposed
- Use environment variables or secure storage for production
- Regularly rotate your API keys

## Performance Notes

- Processing time depends on image size and crop area
- Large images may require async processing
- Crop operation is generally fast for reasonable image sizes
- Network latency may impact response times

## Best Practices

1. **Coordinate planning:** Plan your crop coordinates carefully
2. **Boundary checking:** Always verify crop area fits within image
3. **Aspect ratio:** Consider maintaining aspect ratio if needed
4. **Testing:** Test with different crop areas before final use
5. **Backup:** Keep original images as backup

## Example Use Cases

- **Profile pictures:** Crop square portions from larger images
- **Thumbnail creation:** Extract specific areas for previews
- **Content focus:** Remove unwanted areas from images
- **Social media:** Create properly sized images for platforms
- **Document scanning:** Crop scanned documents to remove borders
- **Product photography:** Focus on specific product details

## Coordinate Examples

### Center crop (assuming 1000x800 image):
```javascript
var x = 200; // (1000 - 600) / 2
var y = 100; // (800 - 600) / 2
var width = 600;
var height = 600;
```

### Top-left quarter crop:
```javascript
var x = 0;
var y = 0;
var width = 500; // Half of 1000
var height = 400; // Half of 800
```

### Bottom-right corner crop:
```javascript
var x = 600; // 1000 - 400
var y = 400; // 800 - 400
var width = 400;
var height = 400;
```

## Support

For issues related to:
- **PDF4Me API:** Contact PDF4Me support
- **Google Apps Script:** Check Google Apps Script documentation
- **Google Drive:** Refer to Google Drive help 