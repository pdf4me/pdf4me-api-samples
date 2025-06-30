# Get Document from PDF4me - JavaScript Implementation

Get document from PDF4Me using the PDF4Me API. This project retrieves documents from the PDF4Me service.

## Features

- ✅ Get document from PDF4Me service
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
- **Document ID** for retrieval

## Project Structure

```
Get Document from PDF4me/
├── app.js                    # Main application logic
├── package.json             # Project configuration
├── README.md               # This documentation
├── sample.pdf              # Sample PDF file for testing
└── retrieved_document.pdf  # Output retrieved document file
```

## Configuration

### API Key Setup

1. Get your API key from [PDF4Me Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
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
   cd "PDF4me/Get Document from PDF4me/JavaScript/Get Document from PDF4me"
   ```

2. **Run the application:**
   ```bash
   node app.js
   ```

### Expected Output

```
=== Getting Document from PDF4Me ===
✅ Document ID validation passed
✅ API request sent with document retrieval parameters
✅ Immediate success response (200 OK)
✅ Document saved to: retrieved_document.pdf
✅ Document retrieved successfully

🎉 Document retrieval completed successfully!
📁 Output file: retrieved_document.pdf
📊 File size: 13,406 bytes
```

## API Endpoints

- **GET** `/api/v2/GetDocument` - Retrieves document from PDF4Me service

## Request Parameters

```json
{
  "documentId": "your-document-id-here"
}
```

## Response Handling

The application handles two types of responses:

1. **200 OK**: Immediate success, returns the document
2. **202 Accepted**: Asynchronous processing, polls for completion

## Error Handling

- Invalid document ID errors
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
- Validate document IDs before processing
- Implement proper error handling for sensitive operations

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check your API key configuration
2. **Document not found**: Ensure the document ID is valid and accessible
3. **Network errors**: Verify internet connectivity and API endpoint accessibility
4. **Node.js version**: Ensure you're using Node.js 18.0.0 or higher

### Debug Mode

Enable debug logging by adding console.log statements or using a logging framework.

## License

This project is part of the PDF4Me API samples collection.

## Support

For API-related issues, contact PDF4Me support.
For implementation questions, refer to the PDF4Me documentation. 