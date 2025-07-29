# PDF4me PDF Splitting by Barcode - AWS Lambda & Standalone

This project provides both **standalone Node.js** and **AWS Lambda** versions of the PDF4me PDF splitting by barcode functionality, based on the Python implementation.

## 📁 Files Overview

- **`get_document_from_pdf4me.js`** - Standalone Node.js script (runs locally)
- **`get_document_from_pdf4me_lambda.js`** - AWS Lambda handler function
- **`serverless.yml`** - Serverless Framework configuration
- **`package.json`** - Dependencies and scripts
- **`sample.pdf`** - Sample PDF file for testing

## 🚀 Quick Start

### Option 1: Standalone Node.js (Local)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Replace API key** in `get_document_from_pdf4me_lambda.js`:
   ```javascript
   const API_KEY = 'your-actual-api-key-here';
   ```

3. **Run the script:**
   ```bash
   npm start
   ```

### Option 2: AWS Lambda (Cloud)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variable:**
   ```bash
   export PDF4ME_API_KEY="your-actual-api-key-here"
   ```

3. **Deploy to AWS Lambda:**
   ```bash
   npm run deploy
   ```

## 🔧 Configuration

### API Key Setup

Get your API key from: https://dev.pdf4me.com/dashboard/#/api-keys

**For Standalone:**
- Edit `get_document_from_pdf4me_lambda.js` and replace the `API_KEY` constant

**For Lambda:**
- Set the `PDF4ME_API_KEY` environment variable
- Or update the serverless.yml file

### Barcode Configuration

The function supports various barcode types and configurations:

```javascript
const barcodeConfig = {
    barcodeString: 'hello',                    // Text to search for in barcodes
    barcodeFilter: 'startsWith',               // 'startsWith', 'contains', 'equals'
    barcodeType: 'qrcode',                     // 'qrcode', 'code128', 'code39'
    splitBarcodePage: 'before',                // 'before', 'after'
    combinePagesWithSameConsecutiveBarcodes: true, // true/false
    pdfRenderDpi: '1'                          // DPI for PDF rendering
};
```

### AWS Lambda Configuration

The Lambda function is configured with:
- **Runtime:** Node.js 18.x
- **Timeout:** 5 minutes (300 seconds)
- **Memory:** 512MB
- **Triggers:** HTTP API + S3 events

## 📋 Usage Examples

### Standalone Usage

```bash
# Basic usage
npm start

# Direct execution
node get_document_from_pdf4me_lambda.js
```

### Lambda Usage

#### HTTP API Call
```bash
curl -X POST https://your-api-gateway-url/split-pdf-by-barcode \
  -H "Content-Type: application/json" \
  -d '{
    "inputPdfPath": "sample.pdf",
    "outputZipName": "split_result.zip",
    "barcodeConfig": {
      "barcodeString": "hello",
      "barcodeFilter": "startsWith",
      "barcodeType": "qrcode",
      "splitBarcodePage": "before",
      "combinePagesWithSameConsecutiveBarcodes": true,
      "pdfRenderDpi": "1"
    }
  }'
```

#### S3 Trigger
Upload a PDF file to the configured S3 bucket and the Lambda function will automatically split it by barcodes.

### Local Lambda Testing

```bash
# Start serverless offline
npm run offline

# Test locally
curl -X POST http://localhost:3000/split-pdf-by-barcode \
  -H "Content-Type: application/json" \
  -d '{
    "inputPdfPath": "sample.pdf",
    "barcodeConfig": {
      "barcodeString": "hello",
      "barcodeType": "qrcode"
    }
  }'
```

## 🛠️ Development

### Available Scripts

```bash
# Standalone
npm start                    # Run standalone script

# Lambda
npm run deploy              # Deploy to AWS
npm run deploy:prod         # Deploy to production
npm run remove              # Remove from AWS
npm run offline             # Test locally
npm run logs                # View Lambda logs
```

### Project Structure

```
├── get_document_from_pdf4me.js              # Standalone version
├── get_document_from_pdf4me_lambda.js       # Lambda version
├── serverless.yml                           # Lambda configuration
├── package.json                             # Dependencies
├── sample.pdf                               # Test file
├── swiss_qr_split_output/                   # Output directory
└── README.md                                # This file
```

## 🔍 Key Differences

| Feature | Standalone | Lambda |
|---------|------------|--------|
| **File I/O** | Local file system | S3 or event-based |
| **Execution** | Direct Node.js | AWS Lambda runtime |
| **Scaling** | Manual | Automatic |
| **Cost** | Free (local) | Pay per execution |
| **Deployment** | None needed | AWS infrastructure |

## 📊 Lambda Response Format

### Success Response
```json
{
  "statusCode": 200,
  "body": {
    "success": true,
    "message": "PDF splitting by barcode completed successfully",
    "outputFileName": "swiss_qr_split_result.zip",
    "outputPath": "swiss_qr_split_output/swiss_qr_split_result.zip",
    "archiveSize": 12345,
    "barcodeConfig": {
      "barcodeString": "hello",
      "barcodeFilter": "startsWith",
      "barcodeType": "qrcode",
      "splitBarcodePage": "before",
      "combinePagesWithSameConsecutiveBarcodes": true,
      "pdfRenderDpi": "1"
    }
  }
}
```

### Error Response
```json
{
  "statusCode": 500,
  "body": {
    "success": false,
    "message": "PDF splitting by barcode failed",
    "error": "Error details"
  }
}
```

## 🔐 Security

- API keys are stored as environment variables
- Lambda function has minimal IAM permissions
- S3 bucket has CORS configuration for web access
- All API calls use HTTPS

## 🚨 Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check your API key is correct
   - Verify the key has proper permissions

2. **404 Not Found**
   - Ensure the PDF file exists
   - Check file path is correct

3. **No Barcodes Found**
   - The PDF may not contain any barcodes
   - Check if the PDF actually has barcodes

4. **Lambda Timeout**
   - Large PDFs may take longer
   - Increase timeout in serverless.yml

5. **Memory Issues**
   - Increase memory allocation in serverless.yml
   - Consider chunking large files

### Debugging

```bash
# View Lambda logs
npm run logs

# Test locally with detailed output
npm run offline
```

## 📈 Performance

- **Small PDFs (< 1MB):** ~3-8 seconds
- **Medium PDFs (1-10MB):** ~8-20 seconds
- **Large PDFs (> 10MB):** May require async processing

## 🔄 Updates

To update the Lambda function:

```bash
npm run deploy
```

To update dependencies:

```bash
npm install
npm run deploy
```

## 📞 Support

- **PDF4me API:** https://developer.pdf4me.com/
- **Serverless Framework:** https://www.serverless.com/
- **AWS Lambda:** https://aws.amazon.com/lambda/ 