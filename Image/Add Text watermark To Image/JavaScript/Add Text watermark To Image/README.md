# Add Text watermark To Image - JavaScript Implementation

Add text watermark to image using the PDF4me API. This project demonstrates how to add text watermarks to images using the PDF4me service.

## Features

- ✅ Add text watermark to image using PDF4me API
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling
- ✅ No external dependencies (uses Node.js built-in modules)
- ✅ Detailed logging and progress tracking
- ✅ Configurable text styling and positioning
- ✅ Polling mechanism for long-running operations

## Prerequisites

- **Node.js 18.0.0 or higher** (required for built-in `fetch` API)
- **Internet connection** for API access
- **Valid PDF4me API key** (get from https://dev.pdf4me.com/dashboard/#/api-keys/)
- **Input image file** (JPG, PNG, etc.)

## Project Structure

```
Add Text watermark To Image/
├── app.js                    # Main application logic
├── package.json             # Project configuration
├── README.md               # This documentation
├── sample.jpg              # Sample input image file
└── sample.watermarked.jpg  # Output watermarked image file
```

## Configuration

### API Key Setup

1. Get your API key from [PDF4me Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
2. Update the `API_KEY` constant in `app.js`:

```javascript
const API_KEY = "your-api-key-here";
```

### Base URL

The project uses the production API endpoint by default:
```javascript
const BASE_URL = "https://api.pdf4me.com/";
```

## Usage

### Running the Application

1. **Navigate to the project directory:**
   ```bash
   cd "Image/Add Text watermark To Image/JavaScript/Add Text watermark To Image"
   ```

2. **Run the application:**
   ```bash
   node app.js
   ```

### Expected Output

```
=== Adding Text Watermark to Image ===
✅ Input image validation passed
✅ API request sent with text watermark parameters
✅ Immediate success response (200 OK)
✅ Watermarked image saved to: sample.watermarked.jpg
✅ Text watermarking completed successfully

🎉 Text watermarking completed successfully!
📁 Output file: sample.watermarked.jpg
📊 File size: 78,848 bytes
```

## API Endpoints

- **POST** `/api/v2/AddTextWatermarkToImage` - Adds text watermark to image

## Request Parameters

```json
{
  "docName": "sample.jpg",
  "docContent": "base64-encoded-image-content",
  "Text": "CONFIDENTIAL",
  "Position": "diagonal",
  "Opacity": 1.0,
  "PositionX": 1,
  "PositionY": 1,
  "Rotation": 45,
  "FontSize": 24,
  "FontColor": "#FF0000",
  "async": true
}
```

## Text Watermark Configuration Options

- **Text**: The text to display as watermark
- **Position**: "diagonal", "center", "top-left", "top-right", "bottom-left", "bottom-right"
- **Opacity**: 0.0 to 1.0 (0 = transparent, 1 = fully opaque)
- **PositionX**: X-axis offset in pixels
- **PositionY**: Y-axis offset in pixels
- **Rotation**: Rotation angle in degrees
- **FontSize**: Font size in points
- **FontColor**: Font color in hex format

## Response Handling

The application handles two types of responses:

1. **200 OK**: Immediate success, returns the watermarked image
2. **202 Accepted**: Asynchronous processing, polls for completion

## Error Handling

- Invalid image format errors
- API authentication errors (401)
- Network connectivity issues
- Timeout errors for long-running operations
- File read/write errors

## Dependencies

This project uses only Node.js built-in modules:
- `fs` - File system operations
- `path` - Path utilities
- `fetch` - HTTP client (built-in since Node.js 18)

## Security Considerations

- API keys should be stored securely (not hardcoded in production)
- Use HTTPS for all API communications
- Validate image files before processing
- Implement proper error handling for sensitive operations

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check your API key configuration
2. **Invalid image format**: Ensure input images are in supported formats
3. **Network errors**: Verify internet connectivity and API endpoint accessibility
4. **Node.js version**: Ensure you're using Node.js 18.0.0 or higher

### Debug Mode

Enable debug logging by adding console.log statements or using a logging framework.

## License

This project is part of the PDF4me API samples collection.

## Support

For API-related issues, contact PDF4me support.
For implementation questions, refer to the PDF4me documentation. 