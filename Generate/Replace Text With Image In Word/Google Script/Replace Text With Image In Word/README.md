# Replace Text With Image In Word - Google Script

This Google Script allows you to replace specific text in a Word document with an image using the PDF4Me API.

## Prerequisites

1. **PDF4Me API Key**: Get your API key from [PDF4Me Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
2. **Google Drive**: Access to Google Drive for file storage
3. **Google Apps Script**: Access to Google Apps Script editor

## Setup Instructions

### 1. Create Google Drive Folders

Create the following folders in your Google Drive:
- `PDF4ME input` - For input files (Word document and image)
- `PDF4ME output` - For the processed output file

### 2. Prepare Your Files

1. **Word Document**: Place your Word document (`.docx`) in the `PDF4ME input` folder
2. **Image File**: Place your image file (`.png`, `.jpg`, `.jpeg`, etc.) in the `PDF4ME input` folder

### 3. Configure the Script

Open the `replace_text_with_image_in_word.gs` file in Google Apps Script and update the following variables:

```javascript
// Set your PDF4Me API key
var apiKey = 'YOUR_API_KEY_HERE'; 

// Set the folder and file name for the input Word document
var folderName = 'PDF4ME input';
var fileName = 'your_document.docx';

// Set the folder and file name for the input image
var imageFolderName = 'PDF4ME input';
var imageFileName = 'your_image.png';

// Set the output file name for the modified Word document
var outputFileName = 'output_document.docx';
var outputFolderName = 'PDF4ME output';

// Set the text to replace with image
var textToReplace = 'REPLACE_ME';
```

### 4. Run the Script

1. Open Google Apps Script editor
2. Copy the code from `replace_text_with_image_in_word.gs`
3. Paste it into a new script project
4. Save the project
5. Click the "Run" button to execute the function

## How It Works

1. **File Retrieval**: The script retrieves both the Word document and image from Google Drive
2. **Base64 Encoding**: Both files are converted to base64 format for API transmission
3. **API Request**: Sends the files to PDF4Me API with the text replacement request
4. **Processing**: The API processes the request (synchronously or asynchronously)
5. **Result**: The modified Word document is saved back to your output folder

## API Endpoint

The script uses the PDF4Me API endpoint:
```
POST https://api.pdf4me.com/api/v2/ReplaceTextWithImageInWord
```

## Request Payload

```json
{
    "docName": "output_document.docx",
    "docContent": "base64_encoded_word_document",
    "imageContent": "base64_encoded_image",
    "textToReplace": "REPLACE_ME",
    "isAsync": true
}
```

## Response Handling

The script handles both synchronous and asynchronous processing:

- **Synchronous (200)**: Immediate response with the modified document
- **Asynchronous (202)**: Polls the API until processing is complete
- **Error Handling**: Comprehensive error logging and handling

## Supported File Formats

### Input Word Documents
- `.docx` (Word 2007 and later)

### Input Images
- `.png`
- `.jpg`
- `.jpeg`
- `.gif`
- `.bmp`
- `.tiff`

### Output
- `.docx` (Word document with image replacement)

## Configuration Options

### Text Replacement
- **Exact Match**: The script replaces the exact text specified in `textToReplace`
- **Case Sensitive**: Text matching is case-sensitive
- **Multiple Occurrences**: All occurrences of the specified text will be replaced

### Processing Options
- **Async Processing**: Set `isAsync: true` for large files or high-volume processing
- **Polling**: Configurable retry attempts and delay intervals for async processing

## Error Handling

The script includes comprehensive error handling for:
- Missing folders or files
- API authentication errors
- Network connectivity issues
- Processing timeouts
- Invalid file formats

## Logging

The script provides detailed logging for:
- File operations (names, sizes)
- API requests and responses
- Processing status updates
- Error messages and exceptions

## Troubleshooting

### Common Issues

1. **"Folder not found"**: Ensure the folder names match exactly
2. **"File not found"**: Check that files exist in the specified folders
3. **"API response code: 401"**: Verify your API key is correct
4. **"Timeout"**: Increase `maxRetries` or `retryDelay` for large files

### Debug Steps

1. Check the execution logs in Google Apps Script
2. Verify file permissions in Google Drive
3. Test with smaller files first
4. Ensure stable internet connection

## Security Considerations

- Store your API key securely
- Use appropriate file permissions in Google Drive
- Regularly rotate your API keys
- Monitor API usage and quotas

## Performance Tips

- Use async processing for files larger than 10MB
- Optimize image sizes before processing
- Consider batch processing for multiple files
- Monitor API rate limits

## Support

For technical support or questions about the PDF4Me API:
- [PDF4Me Documentation](https://dev.pdf4me.com/docs/)
- [API Reference](https://dev.pdf4me.com/docs/api-reference/)
- [Support Portal](https://dev.pdf4me.com/support/)

## License

This script is provided as-is for educational and development purposes. Please refer to PDF4Me's terms of service for API usage guidelines. 