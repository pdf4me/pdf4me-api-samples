# Add Image Watermark To Image - Google Script

This Google Script allows you to add an image watermark to any image using the PDF4Me API.

## Prerequisites

1. **PDF4Me API Key**: Get your API key from [PDF4Me Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
2. **Google Drive**: Access to Google Drive for file storage
3. **Google Apps Script**: Access to Google Apps Script editor

## Setup Instructions

### 1. Create Google Drive Folders

Create the following folders in your Google Drive:
- `PDF4ME input` - For input files (main image and watermark image)
- `PDF4ME output` - For the processed output file

### 2. Prepare Your Files

1. **Main Image**: Place your main image file (`.jpg`, `.png`, etc.) in the `PDF4ME input` folder
2. **Watermark Image**: Place your watermark image file (`.png`, `.jpg`, etc.) in the `PDF4ME input` folder

### 3. Configure the Script

Open the `add_image_watermark_to_image.gs` file in Google Apps Script and update the following variables:

```javascript
// Set your PDF4Me API key
var apiKey = 'YOUR_API_KEY_HERE'; 

// Set the folder and file name for the input image
var folderName = 'PDF4ME input';
var fileName = 'your_image.jpg';

// Set the folder and file name for the watermark image
var watermarkFolderName = 'PDF4ME input';
var watermarkFileName = 'your_watermark.png';

// Set the output file name for the watermarked image
var outputFileName = 'output_watermarked.jpg';
var outputFolderName = 'PDF4ME output';

// Watermark positioning options
var position = 'center'; // Options: top-left, top-center, top-right, center-left, center, center-right, bottom-left, bottom-center, bottom-right
var opacity = 0.5; // Opacity value between 0 and 1
var scale = 1.0; // Scale factor for watermark size
```

### 4. Run the Script

1. Open Google Apps Script editor
2. Copy the code from `add_image_watermark_to_image.gs`
3. Paste it into a new script project
4. Save the project
5. Click the "Run" button to execute the function

## How It Works

1. **File Retrieval**: The script retrieves both the main image and watermark image from Google Drive
2. **Base64 Encoding**: Both files are converted to base64 format for API transmission
3. **API Request**: Sends the images to PDF4Me API with watermark configuration
4. **Processing**: The API processes the request (synchronously or asynchronously)
5. **Result**: The watermarked image is saved back to your output folder

## API Endpoint

The script uses the PDF4Me API endpoint:
```
POST https://api.pdf4me.com/api/v2/AddImageWatermarkToImage
```

## Request Payload

```json
{
    "imageName": "output_watermarked.jpg",
    "imageContent": "base64_encoded_main_image",
    "watermarkContent": "base64_encoded_watermark_image",
    "position": "center",
    "opacity": 0.5,
    "scale": 1.0,
    "isAsync": true
}
```

## Watermark Configuration Options

### Position Options
- `top-left` - Top left corner
- `top-center` - Top center
- `top-right` - Top right corner
- `center-left` - Center left
- `center` - Center of image
- `center-right` - Center right
- `bottom-left` - Bottom left corner
- `bottom-center` - Bottom center
- `bottom-right` - Bottom right corner

### Opacity
- Value between 0 and 1
- 0 = Completely transparent
- 1 = Completely opaque
- 0.5 = 50% opacity

### Scale
- Scale factor for watermark size
- 1.0 = Original size
- 0.5 = Half size
- 2.0 = Double size

## Response Handling

The script handles both synchronous and asynchronous processing:

- **Synchronous (200)**: Immediate response with the watermarked image
- **Asynchronous (202)**: Polls the API until processing is complete
- **Error Handling**: Comprehensive error logging and handling

## Supported File Formats

### Input Images
- `.jpg`
- `.jpeg`
- `.png`
- `.gif`
- `.bmp`
- `.tiff`

### Watermark Images
- `.png` (recommended for transparency)
- `.jpg`
- `.jpeg`
- `.gif`
- `.bmp`

### Output
- Same format as input image (preserves original format)

## Configuration Examples

### Subtle Watermark
```javascript
var position = 'bottom-right';
var opacity = 0.3;
var scale = 0.8;
```

### Prominent Watermark
```javascript
var position = 'center';
var opacity = 0.7;
var scale = 1.5;
```

### Corner Logo
```javascript
var position = 'top-left';
var opacity = 0.9;
var scale = 0.5;
```

## Error Handling

The script includes comprehensive error handling for:
- Missing folders or files
- API authentication errors
- Network connectivity issues
- Processing timeouts
- Invalid file formats

## Logging

The script provides detailed logging for:
- File operations (names, sizes)
- API requests and responses
- Processing status updates
- Error messages and exceptions

## Troubleshooting

### Common Issues

1. **"Folder not found"**: Ensure the folder names match exactly
2. **"File not found"**: Check that files exist in the specified folders
3. **"API response code: 401"**: Verify your API key is correct
4. **"Timeout"**: Increase `maxRetries` or `retryDelay` for large files
5. **Watermark too large/small"**: Adjust the `scale` parameter
6. **Watermark too visible/invisible"**: Adjust the `opacity` parameter

### Debug Steps

1. Check the execution logs in Google Apps Script
2. Verify file permissions in Google Drive
3. Test with smaller files first
4. Ensure stable internet connection
5. Verify watermark image format (PNG recommended)

## Security Considerations

- Store your API key securely
- Use appropriate file permissions in Google Drive
- Regularly rotate your API keys
- Monitor API usage and quotas

## Performance Tips

- Use async processing for images larger than 10MB
- Optimize watermark image size before processing
- Use PNG format for watermarks with transparency
- Consider batch processing for multiple images
- Monitor API rate limits

## Best Practices

### Watermark Design
- Use PNG format for transparency support
- Keep watermark file size reasonable
- Test different opacity levels
- Consider watermark placement carefully

### Image Quality
- Use high-quality source images
- Maintain aspect ratios
- Test with different image sizes
- Verify output quality

## Support

For technical support or questions about the PDF4Me API:
- [PDF4Me Documentation](https://dev.pdf4me.com/docs/)
- [API Reference](https://dev.pdf4me.com/docs/api-reference/)
- [Support Portal](https://dev.pdf4me.com/support/)

## License

This script is provided as-is for educational and development purposes. Please refer to PDF4Me's terms of service for API usage guidelines. 