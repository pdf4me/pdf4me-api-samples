# PDF4me - Rotate Page (AWS Lambda)

AWS Lambda function for rotating specific pages in a PDF document using the PDF4me API. This function rotates only the specified pages while leaving other pages unchanged.

## Features
- ✅ Rotate specific pages in a PDF document
- ✅ Supported rotation types: NoRotation, Clockwise, CounterClockwise, UpsideDown
- ✅ Configurable rotation direction and page selection
- ✅ Flexible page selection (single page, multiple pages, page ranges)
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
  - HTTP API: POST /rotate-page
  - S3: pdf-rotate-page-input-bucket (ObjectCreated events for .pdf files)

## Usage Examples
### HTTP API Trigger
```bash
curl -X POST https://your-api-gateway-url/rotate-page \
  -H "Content-Type: application/json" \
  -d '{
    "inputPdfPath": "sample.pdf",
    "outputPdfName": "rotated.pdf",
    "rotationType": "Clockwise",
    "page": "1,3,5"
  }'
```
### S3 Trigger
Upload a PDF file to the `pdf-rotate-page-input-bucket` S3 bucket, and the Lambda function will automatically process it.
### Local Testing
```bash
npm start
```

## Page Selection Examples
- **Single page:** `"1"` - Rotates only page 1
- **Multiple pages:** `"1,3,5"` - Rotates pages 1, 3, and 5
- **Page range:** `"2-4"` - Rotates pages 2, 3, and 4
- **Mixed selection:** `"1,3-5,7"` - Rotates pages 1, 3, 4, 5, and 7

## Lambda Response Format
### Success
```json
{
  "statusCode": 200,
  "headers": {"Content-Type": "application/json","Access-Control-Allow-Origin": "*"},
  "body": {
    "success": true,
    "message": "PDF page rotation completed successfully",
    "outputFileName": "Rotate_page_PDF_output.pdf",
    "fileSize": 12345,
    "rotationType": "Clockwise",
    "page": "1,3,5"
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
    "message": "PDF page rotation failed",
    "error": "Error details here"
  }
}
```

## Troubleshooting
- **401 Unauthorized:** Check your API key
- **File Not Found:** Ensure the input PDF exists
- **Timeout:** Large PDFs may take longer; increase Lambda timeout if needed
- **Memory Issues:** Increase Lambda memory for large PDFs
- **Invalid Page Numbers:** Ensure page numbers are within the document's page range

## License
This project is part of the PDF4ME API samples collection.

## Support
For API-related issues, contact PDF4ME support.
For implementation questions, refer to the PDF4ME documentation. 