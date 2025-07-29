# PDF4me PDF Document Unlocking - AWS Lambda & Standalone

This project provides both **standalone Node.js** and **AWS Lambda** versions of the PDF4me PDF document unlocking functionality, based on the Python implementation.

## 📁 Files Overview

- **`unlock_pdf.js`** - Standalone Node.js script (runs locally)
- **`unlock_pdf_lambda.js`** - AWS Lambda handler function
- **`serverless.yml`** - Serverless Framework configuration
- **`package.json`** - Dependencies and scripts
- **`sample.protected.pdf`** - Sample protected PDF file for testing

## 🚀 Quick Start

### Option 1: Standalone Node.js (Local)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Replace API key** in `unlock_pdf_lambda.js`:
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
- Edit `unlock_pdf_lambda.js` and replace the `API_KEY` constant

**For Lambda:**
- Set the `PDF4ME_API_KEY` environment variable
- Or update the serverless.yml file

### Unlock Configuration

The function supports various unlock settings:

```javascript
const unlockConfig = {
    password: '1234'                    // Password for the protected PDF
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
node unlock_pdf_lambda.js
```

### Lambda Usage

#### HTTP API Call
```bash
curl -X POST https://your-api-gateway-url/unlock-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "inputPdfPath": "sample.protected.pdf",
    "outputPdfName": "sample.unlocked.pdf",
    "unlockConfig": {
      "password": "1234"
    }
  }'
```

#### S3 Trigger
Upload a protected PDF file to the configured S3 bucket and the Lambda function will automatically unlock it.

### Local Lambda Testing

```bash
# Start serverless offline
npm run offline

# Test locally
curl -X POST http://localhost:3000/unlock-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "inputPdfPath": "sample.protected.pdf",
    "unlockConfig": {
      "password": "1234"
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
├── unlock_pdf.js              # Standalone version
├── unlock_pdf_lambda.js       # Lambda version
├── serverless.yml             # Lambda configuration
├── package.json               # Dependencies
├── sample.protected.pdf       # Test file
└── README.md                  # This file
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
    "message": "PDF document unlocking completed successfully",
    "outputFileName": "sample.unlocked.pdf",
    "fileSize": 12345,
    "unlockConfig": {
      "password": "1234"
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
    "message": "PDF document unlocking failed",
    "error": "Error details"
  }
}
```

## 🔐 Security

- API keys are stored as environment variables
- Lambda function has minimal IAM permissions
- S3 bucket has CORS configuration for web access
- All API calls use HTTPS
- Password-protected PDFs are unlocked using provided credentials

## 🚨 Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check your API key is correct
   - Verify the key has proper permissions

2. **404 Not Found**
   - Ensure the protected PDF file exists
   - Check file path is correct

3. **Wrong Password**
   - Verify the password matches the protected PDF
   - Check if the PDF is actually password-protected

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

- **Small PDFs (< 1MB):** ~2-5 seconds
- **Medium PDFs (1-10MB):** ~5-15 seconds
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