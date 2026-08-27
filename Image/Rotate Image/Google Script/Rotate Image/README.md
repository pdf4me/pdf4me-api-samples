# Rotate Image - Google Apps Script

This Google Apps Script rotates images using the PDF4Me API. It can rotate images by specific angles to correct orientation, create artistic effects, or adjust image positioning.

## Prerequisites

- Google Apps Script access
- PDF4Me API key
- Google Drive with Input and Output folders
- An image file in the Input folder

## Setup

1. **Create Google Apps Script Project:**
   - Go to [Google Apps Script](https://script.google.com/)
   - Create a new project
   - Copy the code from `rotate_image.gs`

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
   var outputFileName = 'rotated.jpg';
   ```

## Usage

1. **Prepare your image file:**
   - Place your image file in the Input folder
   - Update the `inputFileName` variable to match your file name

2. **Configure rotation settings:**
   ```javascript
   var angle = 90; // Rotation angle in degrees (90, 180, 270, -90, -180, -270)
   ```

3. **Run the script:**
   - Save the script
   - Click the "Run" button
   - Grant necessary permissions when prompted

4. **Check results:**
   - The rotated image will be saved in the Output folder
   - Check the execution logs for status information

## API Endpoint

- **URL:** `https://api.pdf4me.com/api/v2/RotateImage`
- **Method:** POST
- **Authentication:** Bearer token

## Request Payload

```json
{
  "imageName": "rotated.jpg",
  "imageContent": "base64_encoded_image_content",
  "angle": 90,
  "isAsync": true
}
```

## Configuration Options

### Rotation Angles
- **90 degrees:** Rotate clockwise by 90 degrees
- **180 degrees:** Rotate by 180 degrees (upside down)
- **270 degrees:** Rotate clockwise by 270 degrees (or -90 degrees)
- **-90 degrees:** Rotate counterclockwise by 90 degrees
- **-180 degrees:** Rotate by 180 degrees (same as 180)
- **-270 degrees:** Rotate counterclockwise by 270 degrees (or 90 degrees)

### Common Rotation Values
- **90°:** Turn image to the right
- **180°:** Flip image upside down
- **270°:** Turn image to the left
- **-90°:** Turn image to the left (same as 270°)

## Supported Input Formats

- JPG (JPEG)
- PNG
- GIF
- BMP
- TIFF
- WebP
- And other common image formats

## Supported Output Formats

- JPG (JPEG)
- PNG
- GIF
- BMP
- TIFF
- WebP
- And other common image formats

## Error Handling

The script includes comprehensive error handling:

- **File not found:** Checks if input file exists
- **API errors:** Handles HTTP error responses
- **Authentication errors:** Validates API key
- **Processing errors:** Monitors async job status
- **Timeout handling:** Prevents infinite polling
- **Invalid angles:** Validates rotation angle parameters

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
   - Verify rotation angle is valid

4. **"Invalid angle" error:**
   - Use standard rotation angles (90, 180, 270, -90, -180, -270)
   - Avoid non-standard angles that may not be supported
   - Check angle value is a number

5. **"Timeout" error:**
   - Large images may take longer to process
   - Increase the `maxAttempts` value if needed

### Performance Tips

- Use standard rotation angles for best results
- Consider image dimensions after rotation
- Test with smaller images first
- Be aware that rotation may change image dimensions

## Security Considerations

- Store your API key securely
- Don't share your script with API keys exposed
- Use environment variables or secure storage for production
- Regularly rotate your API keys

## Performance Notes

- Processing time depends on image size
- Large images may require async processing
- Rotation is generally fast for most image sizes
- Network latency may impact response times

## Best Practices

1. **Angle selection:** Use standard rotation angles for best results
2. **Testing:** Test with sample images before batch processing
3. **Dimensions:** Be aware that rotation may change image dimensions
4. **Backup:** Keep original images as backup
5. **Quality:** Rotation preserves image quality

## Example Use Cases

### Orientation Correction
- Fix images taken in wrong orientation
- Correct camera orientation issues
- Adjust scanned document orientation
- Fix mobile photo orientation

### Creative Effects
- Create artistic rotated compositions
- Add visual interest to images
- Create abstract effects
- Experiment with different orientations

### Document Processing
- Rotate scanned documents for proper reading
- Adjust form orientation
- Correct document alignment
- Prepare documents for processing

### Photography
- Fix landscape/portrait orientation
- Correct camera angle issues
- Adjust composition after capture
- Create panoramic effects

## Use Case Examples

### Portrait to Landscape
```javascript
var angle = 90; // Rotate portrait to landscape
```

### Landscape to Portrait
```javascript
var angle = 270; // Rotate landscape to portrait
```

### Upside Down Correction
```javascript
var angle = 180; // Flip upside down image
```

### Creative Rotation
```javascript
var angle = 45; // Creative diagonal rotation (if supported)
```

## Rotation Effects

### 90° Clockwise Rotation
- Width becomes height
- Height becomes width
- Image turns to the right
- Common for portrait to landscape conversion

### 180° Rotation
- Image flips upside down
- Dimensions remain the same
- Useful for correcting upside-down images
- Creates mirror effect

### 270° Clockwise Rotation (or -90°)
- Width becomes height
- Height becomes width
- Image turns to the left
- Common for landscape to portrait conversion

## Dimension Changes

### Square Images
- No dimension changes with any rotation
- Maintains aspect ratio perfectly
- Ideal for rotation operations

### Rectangular Images
- 90° and 270° rotations swap width and height
- 180° rotation maintains original dimensions
- May require cropping or resizing after rotation

## Support

For issues related to:
- **PDF4Me API:** Contact PDF4Me support
- **Google Apps Script:** Check Google Apps Script documentation
- **Google Drive:** Refer to Google Drive help

## Additional Notes

- Rotation preserves image quality and color information
- File size may change slightly after rotation
- Processing preserves original image file
- Consider using this tool as part of an image correction workflow
- Standard rotation angles provide the best results 