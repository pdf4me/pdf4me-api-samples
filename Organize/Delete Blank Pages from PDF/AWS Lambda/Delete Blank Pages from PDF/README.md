# PDF4me - Delete Blank Pages from PDF (AWS Lambda)

AWS Lambda function for deleting blank pages from PDF documents using the PDF4me API. This function removes pages that contain no text or images based on configurable detection criteria.

## Features

- ✅ Delete blank pages from PDF documents based on specified criteria
- ✅ Support for different blank page detection options:
  - NoTextNoImages: Pages with no text and no images
  - NoText: Pages with no text content
  - NoImages: Pages with no images
- ✅ Configurable blank page detection settings
- ✅ Handle both single and multiple blank pages
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling and logging
- ✅ AWS Lambda integration with HTTP API and S3 triggers
- ✅ Binary data handling for PDF processing
- ✅ Export cleaned PDF in original format

## Quick Start

### Standalone Usage

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set your API key:**
   ```bash
   export PDF4ME_API_KEY="your-api-key-here"
   ```

3. **Run locally:**
   ```bash
   npm start
   ```

### AWS Lambda Deployment

1. **Deploy to AWS:**
   ```bash
   npm run deploy
   ```

2. **Deploy to production:**
   ```bash
   npm run deploy:prod
   ```

3. **Remove deployment:**
   ```bash
   npm run remove
   ```

## API Key Setup

1. Get your API key from [PDF4me Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
2. Set it as an environment variable:
   ```bash
   export PDF4ME_API_KEY="your-api-key-here"
   ```

## AWS Lambda Configuration

### Environment Variables
- `PDF4ME_API_KEY`: Your PDF4me API key

### Function Settings
- **Runtime:** Node.js 18.x
- **Timeout:** 300 seconds
- **Memory:** 512 MB
- **Region:** us-east-1

### Triggers
- **HTTP API:** `POST /delete-blank-pages`
- **S3:** `pdf-blank-pages-input-bucket` (ObjectCreated events for .pdf files)

## Usage Examples

### HTTP API Trigger

```bash
curl -X POST https://your-api-gateway-url/delete-blank-pages \
  -H "Content-Type: application/json" \
  -d '{
    "inputPdfPath": "sample.pdf",
    "outputPdfName": "cleaned.pdf",
    "deletePageOption": "NoTextNoImages"
  }'
```

### S3 Trigger

Upload a PDF file to the `pdf-blank-pages-input-bucket` S3 bucket, and the Lambda function will automatically process it.

### Local Testing

```bash
# Test with default settings
npm start

# Test with custom parameters
node delete_blank_pages_from_pdf_lambda.js
```

## Development Scripts

- `npm start` - Run the function locally
- `npm run deploy` - Deploy to AWS Lambda
- `npm run deploy:prod` - Deploy to production stage
- `npm run remove` - Remove AWS Lambda deployment
- `npm run offline` - Run serverless offline for local development
- `npm run logs` - View Lambda function logs

## Project Structure

```
Delete Blank Pages from PDF/
├── delete_blank_pages_from_pdf_lambda.js    # Main Lambda function
├── package.json                             # Dependencies and scripts
├── serverless.yml                           # AWS Lambda configuration
├── README.md                                # This file
├── sample.pdf                               # Sample PDF for testing
└── Delete_blank_pages_from_PDF_output.pdf   # Output file (generated)
```

## Key Differences: Standalone vs Lambda

| Feature | Standalone | Lambda |
|---------|------------|--------|
| File I/O | Local file system | S3 or event data |
| API Key | Environment variable | Lambda environment variable |
| Execution | Direct Node.js | AWS Lambda runtime |
| Triggers | Manual execution | HTTP API, S3 events |
| Response | Console output | JSON response |

## Lambda Response Format

### Success Response
```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": {
    "success": true,
    "message": "PDF blank pages deletion completed successfully",
    "outputFileName": "Delete_blank_pages_from_PDF_output.pdf",
    "fileSize": 12345,
    "deletePageOption": "NoTextNoImages"
  }
}
```

### Error Response
```json
{
  "statusCode": 500,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": {
    "success": false,
    "message": "PDF blank pages deletion failed",
    "error": "Error details here"
  }
}
```

## Security Considerations

- API keys are stored as environment variables
- HTTPS is used for all API communications
- Input validation is performed on all parameters
- Error messages don't expose sensitive information
- S3 bucket permissions are restricted to necessary operations

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error:**
   - Check that your API key is valid and active
   - Ensure the API key has sufficient credits

2. **File Not Found:**
   - Verify the input PDF file exists
   - Check file permissions

3. **Timeout Errors:**
   - Large PDFs may take longer to process
   - Consider increasing Lambda timeout

4. **Memory Issues:**
   - Large PDFs may require more memory
   - Increase Lambda memory allocation

### Performance Tips

- **Small files (< 5MB):** Usually processed synchronously
- **Large files (> 5MB):** Processed asynchronously with polling
- **Complex documents:** May take longer to process

## API Endpoints

- **POST** `/api/v2/DeleteBlankPages` - Deletes blank pages from a PDF document

## Request Payload

```json
{
  "docContent": "base64-encoded-pdf-content",
  "docName": "output.pdf",
  "deletePageOption": "NoTextNoImages",
  "isAsync": true
}
```

## Response Handling

The function handles two types of responses:

1. **200 OK**: Immediate success, returns the processed PDF
2. **202 Accepted**: Asynchronous processing, polls for completion

## Error Handling

The function handles various error scenarios:
- **401 Unauthorized:** Invalid or missing API key
- **404 Not Found:** Input file not found
- **202 Accepted:** Async processing (handled with polling)
- **500 Server Error:** API server issues
- **Timeout:** Long-running operations that exceed retry limits

## Dependencies

- `axios` - HTTP client for API communication
- `fs` - File system operations
- `path` - Path utilities

## License

This project is part of the PDF4ME API samples collection.

## Support

For API-related issues, contact PDF4ME support.
For implementation questions, refer to the PDF4ME documentation. 