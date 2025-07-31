# Convert Image Format - Google Script

This Google Script allows you to convert images between different formats using the PDF4Me API.

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

Open the `convert_image_format.gs` file in Google Apps Script and update the following variables:

```javascript
// Set your PDF4Me API key
var apiKey = 'YOUR_API_KEY_HERE'; 

// Set the folder and file name for the input image
var folderName = 'PDF4ME input';
var fileName = 'your_image.jpg';

// Set the output file name and format
var outputFileName = 'your_image_converted.png'; // Change extension for desired format
var outputFolderName = 'PDF4ME output';

// Conversion settings
var quality = 90; // Quality percentage for lossy formats (1-100)
```

### 4. Run the Script

1. Open Google Apps Script editor
2. Copy the code from `convert_image_format.gs`
3. Paste it into a new script project
4. Save the project
5. Click the "Run" button to execute the function

## How It Works

1. **File Retrieval**: The script retrieves the input image from Google Drive
2. **Base64 Encoding**: The image is converted to base64 format for API transmission
3. **API Request**: Sends the image to PDF4Me API with format conversion settings
4. **Processing**: The API processes the request (synchronously or asynchronously)
5. **Result**: The converted image is saved back to your output folder

## API Endpoint

The script uses the PDF4Me API endpoint:
```
POST https://api.pdf4me.com/api/v2/ConvertImageFormat
```

## Request Payload

```json
{
    "imageName": "output_converted.png",
    "imageContent": "base64_encoded_image",
    "quality": 90,
    "async": true
}
```

## Supported Format Conversions

### Input Formats
- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.bmp`
- `.tiff`
- `.webp`

### Output Formats
- `.jpg` / `.jpeg` - Lossy compression, good for photographs
- `.png` - Lossless compression, supports transparency
- `.gif` - Lossless compression, supports animations
- `.bmp` - Uncompressed bitmap format
- `.tiff` - High-quality format, supports layers
- `.webp` - Modern web format, good compression

## Format Conversion Examples

### JPG to PNG (for transparency)
```javascript
var fileName = 'photo.jpg';
var outputFileName = 'photo.png';
var quality = 90;
```

### PNG to JPG (for smaller file size)
```javascript
var fileName = 'logo.png';
var outputFileName = 'logo.jpg';
var quality = 85;
```

### GIF to PNG (for better quality)
```javascript
var fileName = 'animation.gif';
var outputFileName = 'animation.png';
var quality = 90;
```

### JPG to WebP (for web optimization)
```javascript
var fileName = 'image.jpg';
var outputFileName = 'image.webp';
var quality = 80;
```

## Quality Settings

### For Lossy Formats (JPG, WebP)
- **90-100**: High quality, larger file size
- **80-89**: Good quality, balanced file size
- **70-79**: Medium quality, smaller file size
- **60-69**: Lower quality, much smaller file size

### For Lossless Formats (PNG, GIF, BMP, TIFF)
- Quality setting is ignored (lossless conversion)

## Response Handling

The script handles both synchronous and asynchronous processing:

- **Synchronous (200)**: Immediate response with the converted image
- **Asynchronous (202)**: Polls the API until processing is complete
- **Error Handling**: Comprehensive error logging and handling

## Error Handling

The script includes comprehensive error handling for:
- Missing folders or files
- API authentication errors
- Network connectivity issues
- Processing timeouts
- Invalid file formats
- Unsupported format conversions

## Logging

The script provides detailed logging for:
- File operations (names, sizes)
- API requests and responses
- Processing status updates
- Error messages and exceptions
- Format conversion details

## Troubleshooting

### Common Issues

1. **"Folder not found"**: Ensure the folder names match exactly
2. **"File not found"**: Check that files exist in the specified folders
3. **"API response code: 401"**: Verify your API key is correct
4. **"Timeout"**: Increase `maxRetries` or `retryDelay` for large files
5. **"Unsupported format"**: Check that the output format is supported
6. **"Conversion failed"**: Verify input image is not corrupted

### Debug Steps

1. Check the execution logs in Google Apps Script
2. Verify file permissions in Google Drive
3. Test with smaller files first
4. Ensure stable internet connection
5. Verify output file extension is correct

## Security Considerations

- Store your API key securely
- Use appropriate file permissions in Google Drive
- Regularly rotate your API keys
- Monitor API usage and quotas

## Performance Tips

- Use async processing for images larger than 10MB
- Choose appropriate quality settings for your use case
- Consider file size implications of different formats
- Use batch processing for multiple conversions
- Monitor API rate limits

## Best Practices

### Format Selection Guidelines

| Use Case | Recommended Format | Quality | Benefits |
|----------|-------------------|---------|----------|
| Web Photos | JPG | 80-85% | Small file size, good quality |
| Web Graphics | PNG | N/A | Transparency support, lossless |
| Animations | GIF | N/A | Animation support, small size |
| Print Quality | TIFF | N/A | High quality, professional |
| Web Optimization | WebP | 80-85% | Modern format, excellent compression |
| Screenshots | PNG | N/A | Lossless, sharp text |

### Quality vs File Size Trade-offs

- **JPG**: Best for photographs, supports quality compression
- **PNG**: Best for graphics with transparency, lossless
- **GIF**: Best for animations, limited color palette
- **WebP**: Best for web, excellent compression
- **TIFF**: Best for professional printing, high quality
- **BMP**: Uncompressed, largest file size

## Format-Specific Considerations

### JPG/JPEG
- Lossy compression
- Good for photographs
- No transparency support
- Quality setting affects file size

### PNG
- Lossless compression
- Supports transparency
- Good for graphics and screenshots
- Larger file sizes than JPG

### GIF
- Lossless compression
- Supports animations
- Limited to 256 colors
- Good for simple graphics

### WebP
- Modern web format
- Excellent compression
- Supports transparency
- Good browser support

### TIFF
- High-quality format
- Supports layers
- Large file sizes
- Professional printing standard

### BMP
- Uncompressed bitmap
- Largest file sizes
- Universal compatibility
- No compression benefits

## Support

For technical support or questions about the PDF4Me API:
- [PDF4Me Documentation](https://dev.pdf4me.com/docs/)
- [API Reference](https://dev.pdf4me.com/docs/api-reference/)
- [Support Portal](https://dev.pdf4me.com/support/)

## License

This script is provided as-is for educational and development purposes. Please refer to PDF4Me's terms of service for API usage guidelines. 