# Compress Image - Google Script

This Google Script allows you to compress images to reduce file size while maintaining quality using the PDF4Me API.

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

Open the `compress_image.gs` file in Google Apps Script and update the following variables:

```javascript
// Set your PDF4Me API key
var apiKey = 'YOUR_API_KEY_HERE'; 

// Set the folder and file name for the input image
var folderName = 'PDF4ME input';
var fileName = 'your_image.jpg';

// Set the output file name for the compressed image
var outputFileName = 'output_compressed.jpg';
var outputFolderName = 'PDF4ME output';

// Compression settings
var quality = 80; // Quality percentage (1-100)
var maxWidth = 1920; // Maximum width in pixels (0 for no limit)
var maxHeight = 1080; // Maximum height in pixels (0 for no limit)
```

### 4. Run the Script

1. Open Google Apps Script editor
2. Copy the code from `compress_image.gs`
3. Paste it into a new script project
4. Save the project
5. Click the "Run" button to execute the function

## How It Works

1. **File Retrieval**: The script retrieves the input image from Google Drive
2. **Base64 Encoding**: The image is converted to base64 format for API transmission
3. **API Request**: Sends the image to PDF4Me API with compression settings
4. **Processing**: The API processes the request (synchronously or asynchronously)
5. **Result**: The compressed image is saved back to your output folder

## API Endpoint

The script uses the PDF4Me API endpoint:
```
POST https://api.pdf4me.com/api/v2/CompressImage
```

## Request Payload

```json
{
    "imageName": "output_compressed.jpg",
    "imageContent": "base64_encoded_image",
    "quality": 80,
    "maxWidth": 1920,
    "maxHeight": 1080,
    "async": true
}
```

## Compression Configuration Options

### Quality Settings
- **quality**: Value between 1 and 100
  - 100 = Best quality, largest file size
  - 80 = Good quality, balanced file size
  - 60 = Medium quality, smaller file size
  - 40 = Lower quality, much smaller file size
  - 20 = Low quality, smallest file size

### Size Constraints
- **maxWidth**: Maximum width in pixels (0 = no limit)
- **maxHeight**: Maximum height in pixels (0 = no limit)
- Both dimensions maintain aspect ratio

## Response Handling

The script handles both synchronous and asynchronous processing:

- **Synchronous (200)**: Immediate response with the compressed image
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

### High Quality Compression
```javascript
var quality = 90;
var maxWidth = 0; // No width limit
var maxHeight = 0; // No height limit
```

### Web Optimization
```javascript
var quality = 80;
var maxWidth = 1920;
var maxHeight = 1080;
```

### Mobile Optimization
```javascript
var quality = 70;
var maxWidth = 800;
var maxHeight = 600;
```

### Maximum Compression
```javascript
var quality = 50;
var maxWidth = 640;
var maxHeight = 480;
```

### Social Media Optimization
```javascript
var quality = 85;
var maxWidth = 1200;
var maxHeight = 630;
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
- Compression statistics (original vs compressed file sizes)

## Troubleshooting

### Common Issues

1. **"Folder not found"**: Ensure the folder names match exactly
2. **"File not found"**: Check that files exist in the specified folders
3. **"API response code: 401"**: Verify your API key is correct
4. **"Timeout"**: Increase `maxRetries` or `retryDelay` for large files
5. **"File size not reduced"**: Lower the quality setting or add size constraints
6. **"Image too small"**: Increase maxWidth/maxHeight or set to 0 for no limits

### Debug Steps

1. Check the execution logs in Google Apps Script
2. Verify file permissions in Google Drive
3. Test with smaller files first
4. Ensure stable internet connection
5. Monitor compression ratios

## Security Considerations

- Store your API key securely
- Use appropriate file permissions in Google Drive
- Regularly rotate your API keys
- Monitor API usage and quotas

## Performance Tips

- Use async processing for images larger than 10MB
- Choose appropriate quality settings for your use case
- Set reasonable size constraints for faster processing
- Consider batch processing for multiple images
- Monitor API rate limits

## Best Practices

### Quality vs File Size
- **Web use**: 70-85% quality
- **Print use**: 90-100% quality
- **Mobile use**: 60-75% quality
- **Social media**: 80-90% quality

### Size Optimization
- Set appropriate max dimensions for your use case
- Use 0 for dimensions you don't want to limit
- Consider aspect ratio preservation
- Test different settings for optimal results

### File Format Considerations
- JPEG: Best for photographs, supports quality compression
- PNG: Best for graphics with transparency, lossless
- GIF: Best for animations, limited color palette

## Compression Guidelines

### Quality Recommendations by Use Case

| Use Case | Quality | Max Width | Max Height | Expected Reduction |
|----------|---------|-----------|------------|-------------------|
| Web Thumbnails | 60% | 300 | 300 | 80-90% |
| Web Images | 80% | 1200 | 800 | 60-70% |
| Social Media | 85% | 1200 | 630 | 50-60% |
| Email Attachments | 70% | 800 | 600 | 70-80% |
| Print Preview | 90% | 0 | 0 | 30-40% |

## Support

For technical support or questions about the PDF4Me API:
- [PDF4Me Documentation](https://dev.pdf4me.com/docs/)
- [API Reference](https://dev.pdf4me.com/docs/api-reference/)
- [Support Portal](https://dev.pdf4me.com/support/)

## License

This script is provided as-is for educational and development purposes. Please refer to PDF4Me's terms of service for API usage guidelines. 