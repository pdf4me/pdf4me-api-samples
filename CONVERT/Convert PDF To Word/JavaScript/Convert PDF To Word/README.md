# PDF to Word Converter

This JavaScript project converts PDF files to Word documents using the PDF4Me API. It supports both small files (direct processing) and large files (upload-process-download approach) with automatic retry logic and async polling.

## Features

- ✅ Convert PDF files to Word documents (.docx)
- ✅ Support for both small and large files
- ✅ Automatic retry logic for failed requests
- ✅ Async polling for long-running operations
- ✅ No external dependencies (uses native Node.js APIs)
- ✅ Detailed error handling and logging

## Prerequisites

- Node.js 18.0.0 or higher
- PDF4Me API key (get one at [pdf4me.com](https://pdf4me.com))

## Setup

1. **Clone or download this project**
2. **Get your PDF4Me API key:**
   - Sign up at [pdf4me.com](https://pdf4me.com)
   - Get your API key from the dashboard
3. **Update the API key in `app.js`:**
   ```javascript
   const API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';
   ```
4. **Place your PDF file in the project directory** (or update the file path in the code)

## Usage

### Quick Start

```bash
# Run the converter
node app.js
```

### File Structure

```
Convert PDF To Word/
├── app.js              # Main application file
├── package.json        # Project configuration
├── README.md          # This file
└── sample.pdf         # Sample PDF file for testing
```

### Code Structure

The application uses a 3-function approach for maintainability:

1. **`convertPdfToWord(filePath)`** - Main function that handles both small and large files
2. **`processSmallFile(base64Data)`** - Direct processing for files under 10MB
3. **`processLargeFile(filePath)`** - Upload-process-download for files 10MB+

### Configuration Options

You can modify these settings in `app.js`:

```javascript
// API Configuration
const API_KEY = 'YOUR_API_KEY';
const API_BASE_URL = 'https://api.pdf4me.com';

// Processing Settings
const MAX_RETRIES = 3;
const POLLING_DELAY = 2000; // 2 seconds
const MAX_POLLING_ATTEMPTS = 10;
const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024; // 10MB
```

## API Endpoints Used

- **POST** `/api/Convert/ConvertPdfToWord` - Direct conversion for small files
- **POST** `/api/Job/CreateJob` - Create job for large files
- **GET** `/api/Job/GetJob` - Check job status
- **GET** `/api/Job/GetJobDocument` - Download completed file

## Error Handling

The application includes comprehensive error handling:

- **Network errors** - Automatic retry with exponential backoff
- **API errors** - Detailed error messages with status codes
- **File errors** - Validation and helpful error messages
- **Timeout errors** - Configurable polling limits

## Troubleshooting

### Common Issues

1. **"Invalid API key" error:**
   - Verify your API key is correct
   - Check if your account is active

2. **"File not found" error:**
   - Ensure the PDF file exists in the specified path
   - Check file permissions

3. **"Request timeout" error:**
   - Large files may take longer to process
   - Increase `MAX_POLLING_ATTEMPTS` or `POLLING_DELAY`

4. **"202 Accepted" but no completion:**
   - The API is still processing your file
   - Wait longer or try with a smaller file

### Performance Tips

- **Small files (< 10MB):** Use direct processing (faster)
- **Large files (≥ 10MB):** Use upload-process-download (more reliable)
- **Batch processing:** Process files sequentially to avoid rate limits

## API Response Format

### Success Response
```json
{
  "document": "base64_encoded_word_document",
  "jobId": "job_id_for_large_files"
}
```

### Error Response
```json
{
  "error": "Error description",
  "statusCode": 400
}
```

## Rate Limits

- PDF4Me API has rate limits based on your plan
- The application includes retry logic to handle temporary failures
- For high-volume usage, consider implementing request queuing

## Support

- **PDF4Me API Documentation:** [api.pdf4me.com](https://api.pdf4me.com)
- **Node.js Documentation:** [nodejs.org](https://nodejs.org)
- **Issues:** Check the troubleshooting section above

## License

MIT License - feel free to use this code in your projects. 