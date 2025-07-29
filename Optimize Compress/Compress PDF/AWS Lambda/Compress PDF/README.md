# Compress PDF - AWS Lambda Function

Compress and optimize PDF documents using the PDF4Me API in AWS Lambda. This serverless function reduces PDF file sizes while maintaining document quality and readability.

## Features

- ✅ Compress PDF documents with configurable quality settings
- ✅ Control over compression settings and optimization profiles
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling and logging
- ✅ AWS Lambda integration with HTTP API and S3 triggers
- ✅ Preserves document quality and readability
- ✅ Multiple optimization profiles (Web, Print, Screen)

## Prerequisites

- **Node.js 18.x or higher** (for local development)
- **AWS CLI** configured with appropriate permissions
- **Serverless Framework** installed globally
- **Internet connection** for API access
- **Valid PDF4Me API key** (get from https://dev.pdf4me.com/dashboard/#/api-keys/)
- **PDF file** for compression testing

## Project Structure

```
Compress PDF/
├── compress_pdf_lambda.js        # Main Lambda handler function
├── package.json                  # Node.js dependencies and scripts
├── serverless.yml               # Serverless Framework configuration
├── README.md                    # This file
├── sample.pdf                   # Sample PDF file for testing
└── compress_PDF_output.pdf      # Output compressed PDF (generated)
```

## Quick Start

### 1. Get API Key
First, you need to get a valid API key from PDF4me:
1. Visit https://dev.pdf4me.com/dashboard/#/api-keys/
2. Create an account and generate an API key
3. Set it as an environment variable:
   ```bash
   export PDF4ME_API_KEY="your-api-key-here"
   ```

### 2. Install Dependencies
```bash
npm install
```

### 3. Local Testing
```bash
npm start
```

### 4. Deploy to AWS
```bash
npm run deploy
```

## Configuration

### Environment Variables

- `PDF4ME_API_KEY`: Your PDF4me API key (required)

### Optimization Profiles

The function supports these optimization profiles:
- **Web:** Optimized for web viewing and fast loading
- **Print:** Optimized for high-quality printing  
- **Screen:** Balanced optimization for screen viewing

### Lambda Configuration

- **Runtime:** Node.js 18.x
- **Memory:** 512MB
- **Timeout:** 300 seconds (5 minutes)
- **Region:** us-east-1

## Usage

### HTTP API Endpoint

After deployment, you can call the function via HTTP API:

```bash
curl -X POST https://your-api-gateway-url/compress-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "inputPdfPath": "sample.pdf",
    "outputPdfName": "compressed.pdf",
    "optimizeProfile": "Web"
  }'
```

### S3 Trigger

The function automatically processes PDF files uploaded to the S3 bucket:
- **Input Bucket:** `pdf-compress-input-bucket`
- **Output Bucket:** `pdf-compress-output-bucket`

### Local Testing

For local testing, the function uses these default values:
- **Input:** `sample.pdf`
- **Output:** `compress_PDF_output.pdf`
- **Profile:** `Web`

## API Configuration

The function uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/Optimize`
- **Authentication:** Basic authentication with API key
- **Features:** PDF compression, optimization

## Request Payload

```json
{
  "inputPdfPath": "sample.pdf",
  "outputPdfName": "compressed.pdf", 
  "optimizeProfile": "Web"
}
```

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "message": "PDF compression completed successfully",
  "outputFileName": "compress_PDF_output.pdf",
  "fileSize": 12345,
  "optimizeProfile": "Web"
}
```

### Error Response (500)
```json
{
  "success": false,
  "message": "PDF compression failed",
  "error": "Error details here"
}
```

## Development Scripts

- `npm start` - Run local test
- `npm run deploy` - Deploy to AWS
- `npm run deploy:prod` - Deploy to production stage
- `npm run remove` - Remove from AWS
- `npm run offline` - Run with serverless-offline
- `npm run logs` - View CloudWatch logs

## Key Differences from Standalone

| Feature | Standalone | AWS Lambda |
|---------|------------|------------|
| **Execution** | Local Node.js | AWS Lambda runtime |
| **Triggers** | Manual execution | HTTP API + S3 events |
| **Storage** | Local file system | S3 buckets |
| **Scaling** | Manual | Automatic |
| **Cost** | Development time | Pay per execution |
| **Monitoring** | Console logs | CloudWatch logs |

## Security Considerations

- API keys are stored as environment variables
- HTTPS for all API communications
- IAM roles with minimal required permissions
- Input validation and sanitization
- Error handling without exposing sensitive data

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error:**
   - Ensure `PDF4ME_API_KEY` environment variable is set
   - Verify API key is valid and has sufficient credits

2. **File Not Found:**
   - Check that input PDF exists in the specified path
   - Verify file permissions

3. **Timeout Errors:**
   - Large files may require longer processing time
   - Check CloudWatch logs for detailed error information

4. **S3 Permission Errors:**
   - Verify IAM role has appropriate S3 permissions
   - Check bucket names in serverless.yml

### Performance Tips

- **Small files (< 5MB):** Usually processed synchronously
- **Large files (> 5MB):** Processed asynchronously with polling
- **Complex documents:** May take longer to process

## Monitoring and Logging

- **CloudWatch Logs:** All console.log statements appear in CloudWatch
- **Metrics:** Lambda execution time, memory usage, error rates
- **Alarms:** Set up CloudWatch alarms for error rates and duration

## Cost Optimization

- **Memory:** 512MB is sufficient for most PDF operations
- **Timeout:** 300 seconds covers most processing scenarios
- **Cold Starts:** Consider provisioned concurrency for high-frequency usage

## Sample Files

### sample.pdf
A sample PDF document that will be used for testing compression functionality.

### compress_PDF_output.pdf
The output file that will be generated after successful compression.

## Expected Workflow

1. Load the PDF document ✅
2. Validate the document format ✅
3. Prepare compression parameters ✅
4. Call the PDF4me API to compress the PDF ✅
5. Handle the response (sync/async) ✅
6. Save the resulting compressed PDF ✅
7. Provide status feedback ✅

## Next Steps

To complete the testing:
1. Get a valid API key from https://dev.pdf4me.com/dashboard/#/api-keys/
2. Set the environment variable: `export PDF4ME_API_KEY="your-key"`
3. Run `npm start` to test locally
4. Deploy with `npm run deploy` for AWS testing
5. Verify the output file is generated and smaller than the original

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch processing multiple files
- [ ] Configurable compression settings via API parameters
- [ ] Progress reporting for long-running operations
- [ ] Support for different compression algorithms
- [ ] Integration with other AWS services (SQS, EventBridge)

## License

This project is part of the PDF4ME API samples collection.

## Support

For API-related issues, contact PDF4ME support.
For implementation questions, refer to the PDF4ME documentation. 