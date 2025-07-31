# Flip Image - Google Apps Script

This Google Apps Script flips images using the PDF4Me API. It allows you to flip an image horizontally or vertically, creating a mirror effect.

## Prerequisites

- Google Apps Script access
- PDF4Me API key
- Google Drive with Input and Output folders
- An image file in the Input folder

## Setup

1. **Create Google Apps Script Project:**
   - Go to [Google Apps Script](https://script.google.com/)
   - Create a new project
   - Copy the code from `flip_image.gs`

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
   var outputFileName = 'flipped.jpg';
   ```

## Usage

1. **Prepare your image file:**
   - Place your image file in the Input folder
   - Update the `inputFileName` variable to match your file name

2. **Configure flip direction:**
   ```javascript
   var flipDirection = 'horizontal'; // 'horizontal' or 'vertical'
   ```

3. **Run the script:**
   - Save the script
   - Click the "Run" button
   - Grant necessary permissions when prompted

4. **Check results:**
   - The flipped image will be saved in the Output folder
   - Check the execution logs for status information

## API Endpoint

- **URL:** `https://api.pdf4me.com/api/v2/FlipImage`
- **Method:** POST
- **Authentication:** Bearer token

## Request Payload

```json
{
  "imageName": "flipped.jpg",
  "imageContent": "base64_encoded_image_content",
  "flipDirection": "horizontal",
  "async": true
}
```

## Configuration Options

### Flip Direction
- **horizontal:** Flips the image left-to-right (mirror effect)
- **vertical:** Flips the image top-to-bottom (upside down)

### Flip Effects

#### Horizontal Flip
- Creates a mirror image
- Left side becomes right side
- Useful for correcting selfie orientation
- Common in photography and design

#### Vertical Flip
- Turns image upside down
- Top becomes bottom
- Useful for correcting orientation
- Common in document scanning

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
- **Invalid direction:** Validates flip direction parameter

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
   - Verify flip direction is valid ('horizontal' or 'vertical')
   - Ensure image format is supported

4. **"Invalid flip direction" error:**
   - Use only 'horizontal' or 'vertical' as flip direction
   - Check spelling and case sensitivity

5. **"Timeout" error:**
   - Large images may take longer to process
   - Increase the `maxAttempts` value if needed

### Performance Tips

- Flip operation is generally fast for most image sizes
- Consider image resolution when processing large files
- Test with smaller images first
- Both flip directions have similar performance characteristics

## Security Considerations

- Store your API key securely
- Don't share your script with API keys exposed
- Use environment variables or secure storage for production
- Regularly rotate your API keys

## Performance Notes

- Processing time depends on image size
- Large images may require async processing
- Flip operation is generally fast
- Network latency may impact response times

## Best Practices

1. **Direction selection:** Choose appropriate flip direction for your use case
2. **Testing:** Test with different image types before production use
3. **Backup:** Keep original images as backup
4. **Naming:** Use descriptive output file names
5. **Quality:** Consider image quality impact of processing

## Example Use Cases

### Horizontal Flip
- **Selfie correction:** Fix mirror image from front-facing cameras
- **Design work:** Create symmetrical designs
- **Photography:** Correct orientation issues
- **Social media:** Prepare images for specific platforms

### Vertical Flip
- **Document scanning:** Correct upside-down scanned documents
- **Photography:** Fix camera orientation issues
- **Artwork:** Create inverted effects
- **Technical diagrams:** Adjust orientation for presentations

## Use Case Examples

### Selfie Correction
```javascript
var flipDirection = 'horizontal'; // Correct mirror effect
```

### Document Orientation
```javascript
var flipDirection = 'vertical'; // Fix upside-down documents
```

### Design Symmetry
```javascript
var flipDirection = 'horizontal'; // Create mirror effects for design
```

## Support

For issues related to:
- **PDF4Me API:** Contact PDF4Me support
- **Google Apps Script:** Check Google Apps Script documentation
- **Google Drive:** Refer to Google Drive help

## Additional Notes

- The flip operation preserves image quality
- Aspect ratio remains unchanged
- File size may vary slightly due to compression
- Metadata is preserved in the output image 