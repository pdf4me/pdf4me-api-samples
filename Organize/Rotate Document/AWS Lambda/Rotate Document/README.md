# PDF4me - Rotate Document (AWS Lambda)

AWS Lambda function for rotating all pages in a PDF document using the PDF4me API. This function rotates every page in the document in the specified direction.

## Features
- ✅ Rotate all pages in a PDF document
- ✅ Supported rotation types: NoRotation, Clockwise, CounterClockwise, UpsideDown
- ✅ Configurable rotation direction
- ✅ Handles both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling and logging
- ✅ AWS Lambda integration with HTTP API and S3 triggers
- ✅ Binary data handling for PDF processing
- ✅ Exports rotated PDF in original format

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
- **Runtime:** Node.js 18.x
- **Timeout:** 300 seconds
- **Memory:** 512 MB
- **Region:** us-east-1
- **Environment Variable:** PDF4ME_API_KEY
- **Triggers:**
  - HTTP API: POST /rotate-document
  - S3: pdf-rotate-document-input-bucket (ObjectCreated events for .pdf files)

## Usage Examples
### HTTP API Trigger
```bash
curl -X POST https://your-api-gateway-url/rotate-document \
  -H "Content-Type: application/json" \
  -d '{
    "inputPdfPath": "sample.pdf",
    "outputPdfName": "rotated.pdf",
    "rotationType": "UpsideDown"
  }'
```
### S3 Trigger
Upload a PDF file to the `pdf-rotate-document-input-bucket` S3 bucket, and the Lambda function will automatically process it.
### Local Testing
```bash
npm start
```

## Lambda Response Format
### Success
```json
{
  "statusCode": 200,
  "headers": {"Content-Type": "application/json","Access-Control-Allow-Origin": "*"},
  "body": {
    "success": true,
    "message": "PDF document rotation completed successfully",
    "outputFileName": "Rotate_document_PDF_output.pdf",
    "fileSize": 12345,
    "rotationType": "UpsideDown"
  }
}
```
### Error
```json
{
  "statusCode": 500,
  "headers": {"Content-Type": "application/json","Access-Control-Allow-Origin": "*"},
  "body": {
    "success": false,
    "message": "PDF document rotation failed",
    "error": "Error details here"
  }
}
```

## Troubleshooting
- **401 Unauthorized:** Check your API key
- **File Not Found:** Ensure the input PDF exists
- **Timeout:** Large PDFs may take longer; increase Lambda timeout if needed
- **Memory Issues:** Increase Lambda memory for large PDFs

## License
This project is part of the PDF4ME API samples collection.

## Support
For API-related issues, contact PDF4ME support.
For implementation questions, refer to the PDF4ME documentation. 