# Disable Tracking Changes In Word - AWS Lambda Implementation

Disable tracking changes in Word documents using the PDF4Me API. This AWS Lambda function removes all tracked changes, comments, and revision marks from Word documents.

## Features

- ✅ Disable tracking changes in Word documents
- ✅ Remove revision marks and comments
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling and logging
- ✅ AWS Lambda integration with HTTP API and S3 triggers
- ✅ Preserves document formatting and content
- ✅ Support for DOCX file format

## Prerequisites

- **Node.js 18.x or higher** (required for AWS Lambda)
- **AWS CLI configured** with appropriate permissions
- **Serverless Framework** installed globally (`npm install -g serverless`)
- **Internet connection** for API access
- **Valid PDF4Me API key** (get from https://dev.pdf4me.com/dashboard/#/api-keys/)
- **Word document with tracking changes** for testing

## Project Structure

```
Disable Tracking changes In Word/
├── disable_tracking_changes_in_word_lambda.js    # Main Lambda handler function
├── package.json                                   # Node.js dependencies and scripts
├── serverless.yml                                 # AWS Lambda deployment configuration
├── sample.docx                                    # Sample Word document with tracking changes
├── sample.tracking_disabled.docx                  # Output Word document (generated)
└── README.md                                      # This file
```

## Quick Start

### Standalone Usage (Local Testing)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set your API key:**
   ```bash
   # Windows
   set PDF4ME_API_KEY=your-api-key-here
   
   # Linux/Mac
   export PDF4ME_API_KEY=your-api-key-here
   ```

3. **Run the function:**
   ```bash
   npm start
   ```

### AWS Lambda Deployment

1. **Deploy to AWS Lambda:**
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

1. **Get your API key:**
   - Visit https://dev.pdf4me.com/dashboard/#/api-keys/
   - Create an account and generate an API key

2. **Set environment variable:**
   ```bash
   # Windows
   set PDF4ME_API_KEY=your-api-key-here
   
   # Linux/Mac
   export PDF4ME_API_KEY=your-api-key-here
   ```

3. **For AWS Lambda deployment:**
   - The API key is automatically included in the deployment
   - No additional configuration needed

## AWS Lambda Configuration

### Function Details
- **Runtime:** Node.js 18.x
- **Region:** us-east-1 (configurable)
- **Timeout:** 300 seconds (5 minutes)
- **Memory:** 512MB
- **Handler:** `disable_tracking_changes_in_word_lambda.handler`

### Triggers
1. **HTTP API Gateway:**
   - **Endpoint:** `POST /disable-tracking-changes`
   - **Usage:** Direct API calls

2. **S3 Bucket:**
   - **Bucket:** `word-tracking-input-bucket-{stage}`
   - **Trigger:** `s3:ObjectCreated:*`
   - **Filter:** Files with `.docx` extension
   - **Usage:** Automatic processing when Word documents are uploaded

### IAM Permissions
- **Lambda Execution Role:** Basic execution permissions
- **S3 Access:** Read/Write access to input bucket
- **CloudWatch Logs:** Automatic logging

## Usage Examples

### HTTP API Call

```bash
curl -X POST https://your-api-gateway-url/disable-tracking-changes \
  -H "Content-Type: application/json" \
  -d '{
    "inputDocxPath": "sample.docx",
    "outputDocxName": "sample.tracking_disabled.docx",
    "trackingConfig": {}
  }'
```

### S3 Trigger
1. Upload a Word document to the S3 bucket
2. Lambda function automatically processes the file
3. Processed file is saved back to S3

### Local Testing

```bash
# Test with default settings
npm start

# Test with custom parameters
node disable_tracking_changes_in_word_lambda.js
```

## Development Scripts

```bash
# Local testing
npm start

# Deploy to AWS Lambda
npm run deploy

# Deploy to production
npm run deploy:prod

# Remove deployment
npm run remove

# Local development with serverless offline
npm run offline

# View Lambda logs
npm run logs
```

## Input and Output

### Input
- **File Format:** DOCX (Word document)
- **Requirements:** Word document with tracking changes enabled
- **Size Limit:** Based on Lambda memory allocation (512MB)

### Output
- **File Format:** DOCX (Word document)
- **Content:** Original document with tracking changes disabled
- **Location:** Same directory as input file (local) or S3 bucket (Lambda)

## API Configuration

The function uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/DisableTrackingChangesInWord`
- **Authentication:** Basic authentication with API key
- **Features:** Word document processing, tracking changes removal

## Processing Settings

The implementation supports these settings:
- **Async Processing:** true (recommended for large files)
- **Document Name:** "output.docx"
- **File Format:** DOCX (Word document format)

## Key Differences: Standalone vs Lambda

| Feature | Standalone | AWS Lambda |
|---------|------------|------------|
| **File I/O** | Local file system | S3 bucket integration |
| **Triggers** | Manual execution | HTTP API + S3 events |
| **Scaling** | Single instance | Auto-scaling |
| **Cost** | Free (local) | Pay-per-use |
| **Deployment** | None required | Serverless deployment |
| **Monitoring** | Console logs | CloudWatch logs |

## Lambda Response Format

### Success Response (200)
```json
{
  "success": true,
  "message": "Word document tracking changes disable completed successfully",
  "outputFileName": "sample.tracking_disabled.docx",
  "fileSize": 12345,
  "trackingConfig": {}
}
```

### Error Response (500)
```json
{
  "success": false,
  "message": "Word document tracking changes disable failed",
  "error": "Error description"
}
```

## Security Considerations

- **API Key Management:** Use environment variables, never hardcode
- **S3 Bucket Security:** Configure appropriate bucket policies
- **Lambda Permissions:** Follow principle of least privilege
- **HTTPS:** All API communications use HTTPS
- **Input Validation:** Validate file types and sizes

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error:**
   - Ensure `PDF4ME_API_KEY` environment variable is set
   - Verify API key is valid and has sufficient credits

2. **File Not Found:**
   - Check that `sample.docx` exists in the project directory
   - Verify file permissions

3. **Deployment Errors:**
   - Ensure AWS CLI is configured with appropriate permissions
   - Check that Serverless Framework is installed globally
   - Verify region and account settings

4. **Timeout Errors:**
   - Large files may require longer processing time
   - Consider increasing Lambda timeout in `serverless.yml`

5. **Memory Errors:**
   - Large Word documents may exceed memory limit
   - Consider increasing Lambda memory allocation

### Performance Tips

- **Small files (< 1MB):** Usually processed synchronously (200 response)
- **Large files (> 1MB):** Processed asynchronously (202 response) with polling
- **Complex documents:** May take longer to process

### Debugging

1. **Local Testing:**
   ```bash
   npm start
   ```

2. **Lambda Logs:**
   ```bash
   npm run logs
   ```

3. **Serverless Offline:**
   ```bash
   npm run offline
   ```

## Sample Files

### sample.docx
A sample Word document with tracking changes that will be used for testing the disable functionality.

### sample.tracking_disabled.docx
The output file that will be generated after successful processing.

## Expected Workflow

1. Load the Word document ✅
2. Validate the document format ✅
3. Prepare processing parameters ✅
4. Call the PDF4me API to disable tracking changes ✅
5. Handle the response (sync/async) ✅
6. Save the resulting processed Word document ✅
7. Provide status feedback to the user ✅

## Next Steps

To complete the testing:
1. Get a valid API key from https://dev.pdf4me.com/dashboard/#/api-keys/
2. Set the `PDF4ME_API_KEY` environment variable
3. Ensure you have a Word document with tracking changes named `sample.docx`
4. Run the function to test actual tracking changes removal
5. Verify the output file `sample.tracking_disabled.docx` is generated and has tracking changes disabled

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch processing multiple files
- [ ] Configurable processing settings via API parameters
- [ ] Progress reporting for long-running operations
- [ ] Support for different Word document formats
- [ ] Web-based user interface
- [ ] Integration with other AWS services (SQS, EventBridge)

## License

This project is part of the PDF4ME API samples collection.

## Support

For API-related issues, contact PDF4ME support.
For implementation questions, refer to the PDF4ME documentation. 