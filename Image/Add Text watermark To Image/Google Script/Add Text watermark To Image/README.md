# Add Text Watermark To Image - Google Script

This Google Script allows you to add text watermarks to images using the PDF4Me API.

## Prerequisites

1. **PDF4Me API Key**: Get your API key from [PDF4Me Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
2. **Google Drive**: Access to Google Drive for file storage
3. **Google Apps Script**: Access to Google Apps Script editor

## Setup Instructions

### 1. Create Google Drive Folders

Create the following folders in your Google Drive:
- `PDF4ME input` - For input image files
- `PDF4ME output` - For the processed output file

### 2. Prepare Your Files

1. **Image**: Place your image file (`.jpg`, `.png`, etc.) in the `PDF4ME input` folder

### 3. Configure the Script

Open the `add_text_watermark_to_image.gs` file in Google Apps Script and update the following variables:

```javascript
// Set your PDF4Me API key
var apiKey = 'YOUR_API_KEY_HERE'; 

// Set the folder and file name for the input image
var folderName = 'PDF4ME input';
var fileName = 'your_image.jpg';

// Set the output file name for the watermarked image
var outputFileName = 'output_watermarked.jpg';
var outputFolderName = 'PDF4ME output';

// Text watermark configuration
var watermarkText = 'CONFIDENTIAL';
var position = 'center'; // Options: top-left, top-center, top-right, center-left, center, center-right, bottom-left, bottom-center, bottom-right
var opacity = 0.5; // Opacity value between 0 and 1
var fontSize = 24; // Font size in points
var fontColor = '#FF0000'; // Font color in hex format
var fontFamily = 'Arial'; // Font family name
```

### 4. Run the Script

1. Open Google Apps Script editor
2. Copy the code from `add_text_watermark_to_image.gs`
3. Paste it into a new script project
4. Save the project
5. Click the "Run" button to execute the function

## How It Works

1. **File Retrieval**: The script retrieves the input image from Google Drive
2. **Base64 Encoding**: The image is converted to base64 format for API transmission
3. **API Request**: Sends the image to PDF4Me API with text watermark configuration
4. **Processing**: The API processes the request (synchronously or asynchronously)
5. **Result**: The watermarked image is saved back to your output folder

## API Endpoint

The script uses the PDF4Me API endpoint:
```
POST https://api.pdf4me.com/api/v2/AddTextWatermarkToImage
```

## Request Payload

```json
{
    "imageName": "output_watermarked.jpg",
    "imageContent": "base64_encoded_image",
    "watermarkText": "CONFIDENTIAL",
    "position": "center",
    "opacity": 0.5,
    "fontSize": 24,
    "fontColor": "#FF0000",
    "fontFamily": "Arial",
    "async": true
}
```

## Text Watermark Configuration Options

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

### Text Properties
- **watermarkText**: The text to display as watermark
- **opacity**: Value between 0 and 1 (0 = transparent, 1 = opaque)
- **fontSize**: Font size in points (e.g., 12, 24, 36)
- **fontColor**: Color in hex format (e.g., '#FF0000' for red)
- **fontFamily**: Font family name (e.g., 'Arial', 'Times New Roman', 'Helvetica')

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

### Output
- Same format as input image (preserves original format)

## Configuration Examples

### Subtle Watermark
```javascript
var watermarkText = 'DRAFT';
var position = 'bottom-right';
var opacity = 0.3;
var fontSize = 18;
var fontColor = '#666666';
var fontFamily = 'Arial';
```

### Prominent Watermark
```javascript
var watermarkText = 'CONFIDENTIAL';
var position = 'center';
var opacity = 0.7;
var fontSize = 48;
var fontColor = '#FF0000';
var fontFamily = 'Arial Bold';
```

### Corner Label
```javascript
var watermarkText = 'SAMPLE';
var position = 'top-left';
var opacity = 0.8;
var fontSize = 16;
var fontColor = '#000000';
var fontFamily = 'Arial';
```

### Diagonal Watermark
```javascript
var watermarkText = 'COPYRIGHT 2024';
var position = 'center';
var opacity = 0.4;
var fontSize = 32;
var fontColor = '#000000';
var fontFamily = 'Arial';
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
5. **"Text too small/large"**: Adjust the `fontSize` parameter
6. **"Text too visible/invisible"**: Adjust the `opacity` parameter
7. **"Text color not visible"**: Change the `fontColor` parameter

### Debug Steps

1. Check the execution logs in Google Apps Script
2. Verify file permissions in Google Drive
3. Test with smaller files first
4. Ensure stable internet connection
5. Verify text watermark parameters

## Security Considerations

- Store your API key securely
- Use appropriate file permissions in Google Drive
- Regularly rotate your API keys
- Monitor API usage and quotas

## Performance Tips

- Use async processing for images larger than 10MB
- Keep watermark text concise for better performance
- Use standard font families for faster processing
- Consider batch processing for multiple images
- Monitor API rate limits

## Best Practices

### Text Watermark Design
- Use clear, readable fonts
- Choose appropriate font sizes for image resolution
- Select colors that provide good contrast
- Keep text concise and meaningful
- Test different opacity levels

### Image Quality
- Use high-quality source images
- Maintain aspect ratios
- Test with different image sizes
- Verify output quality
- Consider watermark placement carefully

## Font Recommendations

### Standard Fonts
- Arial
- Times New Roman
- Helvetica
- Verdana
- Georgia

### Color Suggestions
- `#FF0000` - Red (attention-grabbing)
- `#000000` - Black (professional)
- `#FFFFFF` - White (on dark backgrounds)
- `#666666` - Gray (subtle)
- `#0000FF` - Blue (corporate)

## Support

For technical support or questions about the PDF4Me API:
- [PDF4Me Documentation](https://dev.pdf4me.com/docs/)
- [API Reference](https://dev.pdf4me.com/docs/api-reference/)
- [Support Portal](https://dev.pdf4me.com/support/)

## License

This script is provided as-is for educational and development purposes. Please refer to PDF4Me's terms of service for API usage guidelines. 