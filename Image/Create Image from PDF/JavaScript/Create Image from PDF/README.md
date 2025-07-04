# Create Image from PDF - JavaScript Implementation

Create image from PDF using the PDF4me API. This project demonstrates how to convert PDF pages to images using the PDF4me service.

## Features

- ✅ Create image from PDF using PDF4me API
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling
- ✅ No external dependencies (uses Node.js built-in modules)
- ✅ Detailed logging and progress tracking
- ✅ Support for multiple output formats
- ✅ Configurable page selection and resolution
- ✅ Polling mechanism for long-running operations

## Prerequisites

- **Node.js 18.0.0 or higher** (required for built-in `fetch` API)
- **Internet connection** for API access
- **Valid PDF4me API key** (get from https://dev.pdf4me.com/dashboard/#/api-keys/)
- **Input PDF file**

## Project Structure

```
Create Image from PDF/
├── app.js                    # Main application logic
├── package.json             # Project configuration
├── README.md               # This documentation
├── sample.pdf              # Sample input PDF file
└── page_1.jpg              # Output image file
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
   cd "Image/Create Image from PDF/JavaScript/Create Image from PDF"
   ```

2. **Run the application:**
   ```bash
   node app.js
   ```

### Expected Output

```
=== Creating Image from PDF ===
✅ Input PDF validation passed
✅ API request sent with PDF to image parameters
✅ Immediate success response (200 OK)
✅ Image saved to: page_1.jpg
✅ PDF to image conversion completed successfully

🎉 PDF to image conversion completed successfully!
📁 Output file: page_1.jpg
📊 Page number: 1
📊 Image format: JPG
📊 Resolution: 300 DPI
```

## API Endpoints

- **POST** `/api/v2/CreateImageFromPdf` - Creates image from PDF

## Request Parameters

```json
{
  "docName": "sample.pdf",
  "docContent": "base64-encoded-pdf-content",
  "PageNumber": 1,
  "OutputFormat": "JPG",
  "Resolution": 300,
  "async": true
}
```

## Configuration Options

- **PageNumber**: Page number to convert (1-based)
- **OutputFormat**: Output image format (JPG, PNG, etc.)
- **Resolution**: DPI resolution for the output image

## Response Handling

The application handles two types of responses:

1. **200 OK**: Immediate success, returns the image
2. **202 Accepted**: Asynchronous processing, polls for completion

## Error Handling

- Invalid PDF format errors
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
- Validate PDF files before processing
- Implement proper error handling for sensitive operations

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check your API key configuration
2. **Invalid PDF format**: Ensure input files are valid PDFs
3. **Network errors**: Verify internet connectivity and API endpoint accessibility
4. **Node.js version**: Ensure you're using Node.js 18.0.0 or higher

### Debug Mode

Enable debug logging by adding console.log statements or using a logging framework.

## License

This project is part of the PDF4me API samples collection.

## Support

For API-related issues, contact PDF4me support.
For implementation questions, refer to the PDF4me documentation. 