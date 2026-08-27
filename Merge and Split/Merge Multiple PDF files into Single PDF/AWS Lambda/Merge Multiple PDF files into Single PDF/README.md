# Merge Multiple PDF Files into Single PDF - AWS Lambda

This AWS Lambda function merges multiple PDF files into a single PDF document using the PDF4me API.

## Features

- Merge multiple PDF files into a single document
- Support for S3 file input and output
- Asynchronous processing with polling
- Error handling and logging
- CORS enabled for web applications

## Prerequisites

- AWS CLI configured
- Node.js 14.x or later
- Serverless Framework
- PDF4me API key

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
export PDF4ME_API_KEY="your-pdf4me-api-key"
export OUTPUT_S3_BUCKET="your-output-bucket-name"
export INPUT_S3_BUCKET="your-input-bucket-name"
```

## Deployment

### Deploy to AWS
```bash
npm run deploy
```

### Remove from AWS
```bash
npm run remove
```

### Local Development
```bash
serverless offline start
```

## Usage

### HTTP API Endpoint

The function is exposed as an HTTP API endpoint that accepts POST requests.

**Endpoint:** `POST /merge-pdfs`

**Request Body:**
```json
{
  "pdfFiles": [
    "s3://bucket-name/path/to/file1.pdf",
    "s3://bucket-name/path/to/file2.pdf"
  ]
}
```

**Response:**
```json
{
  "message": "PDF merging completed successfully",
  "mergedPdfBase64": "base64-encoded-pdf-content",
  "fileName": "Merged_pdf_output.pdf"
}
```

### Direct Lambda Invocation

```javascript
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

const params = {
  FunctionName: 'merge-multiple-pdf-files-into-single-pdf',
  Payload: JSON.stringify({
    pdfFiles: [
      's3://bucket-name/path/to/file1.pdf',
      's3://bucket-name/path/to/file2.pdf'
    ]
  })
};

lambda.invoke(params, (err, data) => {
  if (err) console.error(err);
  else console.log(data);
});
```

## Configuration

### Environment Variables

- `PDF4ME_API_KEY`: Your PDF4me API key
- `OUTPUT_S3_BUCKET`: S3 bucket for storing merged PDF files
- `INPUT_S3_BUCKET`: S3 bucket for reading input PDF files

### IAM Permissions

The function requires the following S3 permissions:
- `s3:GetObject` - Read input PDF files
- `s3:PutObject` - Write merged PDF files
- `s3:DeleteObject` - Clean up temporary files

## API Reference

### PDF4me API

The function uses the PDF4me Merge API endpoint:
- **URL:** `https://api.pdf4me.com/api/v2/Merge`
- **Method:** POST
- **Authentication:** Basic Auth with API key

### Request Payload

```json
{
  "docContent": ["base64-pdf1", "base64-pdf2"],
  "docName": "Merged_pdf_output.pdf",
  "isAsync": true
}
```

## Error Handling

The function handles various error scenarios:

- **File not found:** Returns 404 with error message
- **API errors:** Returns 500 with detailed error information
- **Timeout:** Returns 500 if processing takes too long
- **Invalid input:** Returns 400 for malformed requests

## Logging

The function logs detailed information for debugging:

- Input file processing
- API request/response details
- Polling status updates
- Error conditions

## Testing

### Local Testing

1. Create test PDF files:
```bash
# Create sample PDF files for testing
echo "Sample PDF 1" > sample1.pdf
echo "Sample PDF 2" > sample2.pdf
```

2. Test locally:
```bash
serverless invoke local --function mergeMultiplePdfFiles --data '{"pdfFiles": ["sample1.pdf", "sample2.pdf"]}'
```

### AWS Testing

```bash
serverless invoke --function mergeMultiplePdfFiles --data '{"pdfFiles": ["s3://bucket/file1.pdf", "s3://bucket/file2.pdf"]}'
```

## Monitoring

### CloudWatch Metrics

Monitor the function using CloudWatch:
- Invocation count
- Duration
- Error rate
- Throttles

### CloudWatch Logs

Logs are automatically sent to CloudWatch Logs with the log group:
`/aws/lambda/merge-multiple-pdf-files-into-single-pdf`

## Troubleshooting

### Common Issues

1. **Timeout errors:** Increase the timeout in serverless.yml
2. **Memory errors:** Increase memory allocation
3. **S3 permission errors:** Check IAM role permissions
4. **API key errors:** Verify PDF4me API key is correct

### Debug Mode

Enable debug logging by setting the log level:
```bash
export LOG_LEVEL=debug
```

## Security

- API keys are stored as environment variables
- S3 access is restricted to specific buckets
- CORS is configured for web applications
- Input validation prevents malicious requests

## Cost Optimization

- Use S3 for file storage instead of Lambda storage
- Implement proper error handling to avoid unnecessary retries
- Monitor function duration and optimize code

## Support

For issues and questions:
- Check CloudWatch Logs for detailed error information
- Verify API key and permissions
- Test with smaller files first
- Contact PDF4me support for API-related issues 