# PDF4me - Extract Pages from PDF (AWS Lambda)

AWS Lambda function for extracting specific pages from PDF documents using the PDF4me API. This function creates shorter versions of PDF documents by extracting only the specified pages.

## Features

- ✅ Extract specific pages from PDF documents based on page numbers
- ✅ Support for various page number formats:
  - Single pages: "1", "3", "5"
  - Multiple pages: "1,3,5"
  - Page ranges: "2-4", "1-3,5-7"
- ✅ Configurable page extraction settings
- ✅ Handle both single and multiple page extractions
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling and logging
- ✅ AWS Lambda integration with HTTP API and S3 triggers
- ✅ Binary data handling for PDF processing
- ✅ Export extracted pages as a new PDF document

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
- **HTTP API:** `POST /extract-pages`
- **S3:** `pdf-extract-pages-input-bucket` (ObjectCreated events for .pdf files)

## Usage Examples

### HTTP API Trigger

```bash
curl -X POST https://your-api-gateway-url/extract-pages \
  -H "Content-Type: application/json" \
  -d '{
    "inputPdfPath": "sample.pdf",
    "outputPdfName": "extracted.pdf",
    "pageNumbers": "1,3"
  }'
```

### S3 Trigger

Upload a PDF file to the `pdf-extract-pages-input-bucket` S3 bucket, and the Lambda function will automatically process it.

### Local Testing

```bash
# Test with default settings
npm start

# Test with custom parameters
node extract_pages_lambda.js
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
Extract Pages/
├── extract_pages_lambda.js                    # Main Lambda function
├── package.json                               # Dependencies and scripts
├── serverless.yml                             # AWS Lambda configuration
├── README.md                                  # This file
├── sample.pdf                                 # Sample PDF for testing
└── Extract_pages_PDF_output.pdf              # Output file (generated)
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
    "message": "PDF page extraction completed successfully",
    "outputFileName": "Extract_pages_PDF_output.pdf",
    "fileSize": 12345,
    "pageNumbers": "1,3"
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
    "message": "PDF page extraction failed",
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

- **POST** `/api/v2/Extract` - Extracts specific pages from a PDF document

## Request Payload

```json
{
  "docContent": "base64-encoded-pdf-content",
  "docName": "output.pdf",
  "pageNumbers": "1,3",
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