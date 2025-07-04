# Remove EXIF Tags From Image - JavaScript Implementation

Remove EXIF tags from image using the PDF4me API. This project demonstrates how to remove EXIF metadata from images using the PDF4me service.

## Features

- ✅ Remove EXIF tags from image using PDF4me API
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling
- ✅ No external dependencies (uses Node.js built-in modules)
- ✅ Detailed logging and progress tracking
- ✅ Polling mechanism for long-running operations

## Prerequisites

- **Node.js 18.0.0 or higher** (required for built-in `fetch` API)
- **Internet connection** for API access
- **Valid PDF4me API key** (get from https://dev.pdf4me.com/dashboard/#/api-keys/)
- **Input image file** (JPG, PNG, etc.)

## Project Structure

```
Remove EXIF Tags From Image/
├── app.js                    # Main application logic
├── package.json             # Project configuration
├── README.md               # This documentation
├── sample.jpg              # Sample input image file
└── sample.noexif.jpg       # Output image file without EXIF tags
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
   cd "Image/Remove EXIF Tags From Image/JavaScript/Remove EXIF Tags From Image"
   ```

2. **Run the application:**
   ```bash
   node app.js
   ```

### Expected Output

```
=== Removing EXIF Tags From Image ===
✅ Input image validation passed
✅ API request sent for EXIF removal
✅ Immediate success response (200 OK)
✅ Image without EXIF tags saved to: sample.noexif.jpg
✅ EXIF tag removal completed successfully

🎉 EXIF tag removal completed successfully!
📁 Output file: sample.noexif.jpg
```

## API Endpoints

- **POST** `/api/v2/RemoveExifTagsFromImage` - Removes EXIF tags from image

## Request Parameters

```json
{
  "docName": "sample.jpg",
  "docContent": "base64-encoded-image-content",
  "async": true
}
```

## Response Handling

The application handles two types of responses:

1. **200 OK**: Immediate success, returns the image without EXIF tags
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