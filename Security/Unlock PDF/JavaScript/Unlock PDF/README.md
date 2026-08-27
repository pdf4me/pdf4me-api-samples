# Unlock PDF - JavaScript Implementation

Unlock password-protected PDF documents using the PDF4Me API. This project removes password protection from PDF files while maintaining document integrity.

## Features

- ✅ Remove password protection from PDF documents
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling
- ✅ No external dependencies (uses Node.js built-in modules)
- ✅ Detailed logging and progress tracking
- ✅ Preserves document formatting and content
- ✅ Polling mechanism for long-running operations

## Prerequisites

- **Node.js 18.0.0 or higher** (required for built-in `fetch` API)
- **Internet connection** for API access
- **Valid PDF4Me API key** (get from https://dev.pdf4me.com/dashboard/#/api-keys/)
- **Password-protected PDF file** for testing

## Project Structure

```
Unlock PDF/
├── app.js                    # Main application logic
├── package.json             # Project configuration
├── README.md               # This documentation
├── sample.protected.pdf    # Sample password-protected PDF file
└── sample.protected.unlocked.pdf  # Output unlocked PDF file
```

## Configuration

### API Key Setup

1. Get your API key from [PDF4Me Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
2. Update the `API_KEY` constant in `app.js`:

```javascript
const API_KEY = "Please get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
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
   cd "Security/Unlock PDF/JavaScript/Unlock PDF"
   ```

2. **Run the application:**
   ```bash
   node app.js
   ```

### Expected Output

```
=== Unlocking PDF Document ===
✅ File validation passed
✅ PDF read and base64 encoded successfully (14,601 bytes)
✅ API request sent with unlock parameters
✅ Immediate success response (200 OK)
✅ Unlocked PDF saved to: sample.protected.unlocked.pdf
✅ Password protection removed successfully

🎉 PDF unlocking completed successfully!
📁 Output file: sample.protected.unlocked.pdf
📊 File size: 13,406 bytes
🔓 Password: 1234
```

## API Endpoints

- **POST** `/api/v2/Unlock` - Unlocks a password-protected PDF document

## Request Payload

```json
{
  "docName": "output.pdf",
  "docContent": "base64-encoded-pdf-content",
  "password": "1234",
  "isAsync": true
}
```

## Response Handling

The application handles two types of responses:

1. **200 OK**: Immediate success, returns the unlocked PDF
2. **202 Accepted**: Asynchronous processing, polls for completion

## Error Handling

- File not found errors
- API authentication errors (401)
- Network connectivity issues
- Timeout errors for long-running operations
- Invalid password errors
- File read/write errors

## Dependencies

This project uses only Node.js built-in modules:
- `fs` - File system operations
- `path` - Path utilities
- `fetch` - HTTP client (built-in since Node.js 18)

## Security Considerations

- API keys should be stored securely (not hardcoded in production)
- Use HTTPS for all API communications
- Validate input files before processing
- Implement proper error handling for sensitive operations
- Be cautious when removing password protection from sensitive documents

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check your API key configuration
2. **File not found**: Ensure `sample.protected.pdf` exists in the project directory
3. **Network errors**: Verify internet connectivity and API endpoint accessibility
4. **Invalid password**: Ensure the correct password is provided for the protected PDF
5. **Node.js version**: Ensure you're using Node.js 18.0.0 or higher

### Debug Mode

Enable debug logging by adding console.log statements or using a logging framework.

## License

This project is part of the PDF4Me API samples collection.

## Support

For API-related issues, contact PDF4Me support.
For implementation questions, refer to the PDF4Me documentation. 