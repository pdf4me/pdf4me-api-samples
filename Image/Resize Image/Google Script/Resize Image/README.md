# Resize Image - Google Apps Script

This Google Apps Script resizes images using the PDF4Me API. It can change the dimensions of images while maintaining quality and optionally preserving the aspect ratio.

## Prerequisites

- Google Apps Script access
- PDF4Me API key
- Google Drive with Input and Output folders
- An image file in the Input folder

## Setup

1. **Create Google Apps Script Project:**
   - Go to [Google Apps Script](https://script.google.com/)
   - Create a new project
   - Copy the code from `resize_image.gs`

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
   var outputFileName = 'resized.jpg';
   ```

## Usage

1. **Prepare your image file:**
   - Place your image file in the Input folder
   - Update the `inputFileName` variable to match your file name

2. **Configure resize settings:**
   ```javascript
   var width = 800; // New width in pixels
   var height = 600; // New height in pixels
   var maintainAspectRatio = true; // true to maintain aspect ratio, false to stretch
   var quality = 90; // Image quality (1-100) for lossy formats
   ```

3. **Run the script:**
   - Save the script
   - Click the "Run" button
   - Grant necessary permissions when prompted

4. **Check results:**
   - The resized image will be saved in the Output folder
   - Check the execution logs for status information

## API Endpoint

- **URL:** `https://api.pdf4me.com/api/v2/ResizeImage`
- **Method:** POST
- **Authentication:** Bearer token

## Request Payload

```json
{
  "imageName": "resized.jpg",
  "imageContent": "base64_encoded_image_content",
  "width": 800,
  "height": 600,
  "maintainAspectRatio": true,
  "quality": 90,
  "async": true
}
```

## Configuration Options

### Dimensions
- **width:** New width in pixels (positive integer)
- **height:** New height in pixels (positive integer)
- Both dimensions are required for resizing

### Aspect Ratio
- **maintainAspectRatio:** Controls how the image is resized
  - `true` (default): Maintains original aspect ratio, may add padding
  - `false`: Stretches image to exact dimensions, may distort

### Quality Settings
- **quality:** Image quality for lossy formats (1-100)
  - Higher values = better quality, larger file size
  - Lower values = smaller file size, reduced quality
  - Only applies to JPG and other lossy formats

## Resize Modes

### Maintain Aspect Ratio (maintainAspectRatio = true)
- Preserves original proportions
- Fits image within specified dimensions
- May add padding to maintain aspect ratio
- No distortion of the image

### Stretch to Fit (maintainAspectRatio = false)
- Stretches image to exact dimensions
- May distort proportions
- No padding added
- Useful for specific size requirements

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
- **Invalid dimensions:** Validates width and height parameters

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
   - Verify dimensions are valid positive integers

4. **"Invalid dimensions" error:**
   - Ensure width and height are positive integers
   - Check that dimensions are reasonable (not too large or small)
   - Verify aspect ratio settings are appropriate

5. **"Timeout" error:**
   - Large images may take longer to process
   - Increase the `maxAttempts` value if needed

### Performance Tips

- Use appropriate dimensions for your needs
- Consider aspect ratio when setting dimensions
- Balance quality vs file size for web use
- Test with smaller images first
- Use maintainAspectRatio=true for most cases

## Security Considerations

- Store your API key securely
- Don't share your script with API keys exposed
- Use environment variables or secure storage for production
- Regularly rotate your API keys

## Performance Notes

- Processing time depends on image size and target dimensions
- Large images may require async processing
- Resizing is generally fast for reasonable dimensions
- Network latency may impact response times

## Best Practices

1. **Dimension planning:** Plan dimensions based on intended use
2. **Aspect ratio:** Use maintainAspectRatio=true to avoid distortion
3. **Quality settings:** Balance quality vs file size appropriately
4. **Testing:** Test with sample images before batch processing
5. **Backup:** Keep original images as backup

## Example Use Cases

### Web Optimization
- Resize images for web display
- Create thumbnails and preview images
- Optimize images for different screen sizes
- Reduce file sizes for faster loading

### Social Media
- Create properly sized images for platforms
- Generate profile pictures and cover photos
- Optimize images for mobile viewing
- Meet platform-specific size requirements

### Print Preparation
- Resize images for print specifications
- Create images for specific paper sizes
- Optimize resolution for printing
- Prepare images for different print formats

### Content Management
- Standardize image sizes across collections
- Create consistent thumbnail sizes
- Optimize images for storage
- Prepare images for different devices

## Common Dimension Examples

### Web Thumbnails
```javascript
var width = 150;
var height = 150;
var maintainAspectRatio = true;
```

### Social Media Posts
```javascript
var width = 1080;
var height = 1080;
var maintainAspectRatio = true;
```

### Profile Pictures
```javascript
var width = 400;
var height = 400;
var maintainAspectRatio = true;
```

### Banner Images
```javascript
var width = 1200;
var height = 400;
var maintainAspectRatio = true;
```

## Quality Guidelines

### Web Use
- **Quality:** 70-85 for good balance
- **Dimensions:** Optimize for target display size
- **Format:** JPG for photos, PNG for graphics

### Print Use
- **Quality:** 90-100 for high quality
- **Dimensions:** Match print resolution requirements
- **Format:** TIFF or high-quality JPG

### Mobile Use
- **Quality:** 60-80 for faster loading
- **Dimensions:** Optimize for mobile screens
- **Format:** JPG or WebP for efficiency

## Support

For issues related to:
- **PDF4Me API:** Contact PDF4Me support
- **Google Apps Script:** Check Google Apps Script documentation
- **Google Drive:** Refer to Google Drive help

## Additional Notes

- Resizing preserves image quality when possible
- File size typically decreases with smaller dimensions
- Processing preserves original image file
- Consider using this tool as part of an image optimization workflow
- Aspect ratio maintenance prevents image distortion 