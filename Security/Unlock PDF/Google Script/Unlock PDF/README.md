# PDF4me PDF Unlocking - Google Apps Script

## Overview

This Google Apps Script provides seamless integration with the PDF4me API to remove password protection from PDF documents. Perfect for recovering access to protected documents, restoring document functionality, and enabling content accessibility while maintaining document integrity and formatting.

## Key Features

### PDF Unlocking Capabilities
- **Password Removal**: Remove password protection from PDF documents
- **Access Restoration**: Unlock access to protected content and features
- **Document Recovery**: Restore full document functionality and permissions
- **Format Preservation**: Maintain document integrity and original formatting

### Processing Features
- **Asynchronous Processing**: Handle large documents with background processing
- **Smart Polling**: Automatic status checking with configurable retry logic
- **Error Recovery**: Comprehensive error handling with detailed logging
- **File Management**: Automatic file naming with unlocking indicators

### Output Management
- **Clean File Naming**: Automatic output filename generation with unlocking suffixes
- **Size Reporting**: File size information for unlocked documents
- **Error Documentation**: Detailed error logs for troubleshooting
- **No Summary Files**: Clean output with only the unlocked PDF file

## Prerequisites

### Required Setup
- **PDF4me API Key**: Get your API key from [PDF4me Developer Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
- **Google Drive Access**: Ensure the script has permission to access Google Drive
- **Document Password**: Valid password for the protected PDF document

### Google Apps Script Services
Enable the following services in your Google Apps Script project:
- **DriveApp**: For Google Drive file operations
- **UrlFetchApp**: For API communication
- **Utilities**: For base64 encoding and JSON operations

## Setup Instructions

### 1. API Configuration
```javascript
var apiKey = 'your_pdf4me_api_key_here';
```

### 2. File Input Configuration
Choose one of the following input methods:

#### Option A: Folder Structure (Recommended)
```javascript
var folderName = 'PDF4ME input';
var fileName = 'sample.protected.pdf';
```

#### Option B: Direct File ID
```javascript
var pdfFileId = 'your_google_drive_file_id';
```

### 3. Output Configuration
```javascript
var outputFolderName = 'PDF4ME output';
```

### 4. Unlocking Configuration
```javascript
var unlockPassword = 'your_document_password';
```

## Input and Output

### Input Requirements
- **Protected PDF**: Password-protected PDF file to be unlocked
- **Document Password**: Correct password for accessing the protected document
- **API Key**: Valid PDF4me API key with document processing permissions

### Output Files
- **Primary Output**: `filename.unlocked.pdf` - Unlocked PDF without password protection
- **Error Files**: `unlock_error.txt` - Error details (only created on errors)
- **Debug Files**: `raw_response.txt` - Raw API response (fallback, only on errors)

## Usage Examples

### Basic PDF Unlocking
```javascript
// Set your configuration
var apiKey = 'your_api_key';
var unlockPassword = 'document123';

// Run the unlocking
unlockPdf();
```

### Unlocking with Different Password
```javascript
var unlockPassword = 'confidential2024';

unlockPdf();
```

### Unlocking Protected Documents
```javascript
// For documents with complex passwords
var unlockPassword = 'MySecurePassword123!';

unlockPdf();
```

## Processing Details

### API Communication Flow
1. **Authentication**: Uses Basic auth with PDF4me API key
2. **Request Preparation**: Encodes protected file and prepares unlocking payload
3. **PDF Unlocking**: Sends request to PDF4me Unlock endpoint
4. **Response Handling**: Processes 200 (success) or 202 (async) responses
5. **Polling Logic**: For async operations, polls status until completion
6. **File Saving**: Saves unlocked PDF to Google Drive

### Asynchronous Processing
- **Initial Response**: 202 Accepted for large documents
- **Polling Interval**: 10 seconds between status checks
- **Maximum Retries**: 10 attempts before timeout
- **Success Detection**: 200 OK response indicates completion

### Unlocking Parameters
- **Password**: Required password for accessing the protected document
- **Document Content**: Base64 encoded PDF content for processing
- **Async Processing**: Background processing for large documents
- **Error Handling**: Comprehensive error management and recovery

### Error Handling
- **Network Errors**: Automatic retry with exponential backoff
- **API Errors**: Detailed error logging with response codes
- **File Errors**: Graceful handling of missing files or folders
- **Timeout Errors**: Clear timeout messages for long operations

## Security Best Practices

### Password Management
- **Secure Storage**: Store passwords securely, not in plain text
- **Access Control**: Limit script access to authorized personnel only
- **Password Validation**: Ensure correct password before processing
- **Audit Trail**: Log unlocking operations for security monitoring

### Authorization Requirements
- **Legitimate Access**: Only unlock documents you own or have permission to access
- **Password Verification**: Must provide correct password for successful unlocking
- **Document Ownership**: Ensure you have rights to modify the document
- **Compliance**: Follow organizational policies for document access

### API Security
- **Secure Storage**: Store API keys securely in Google Apps Script
- **Access Control**: Use API keys with minimal required permissions
- **Key Rotation**: Regularly update API keys for security
- **Audit Logs**: Monitor API usage for suspicious activity

## Performance Optimization

### Best Practices
- **Use Async Mode**: Recommended for documents larger than 1MB
- **Optimize File Size**: Consider document size for processing efficiency
- **Monitor Logs**: Check execution logs for performance insights
- **Batch Operations**: Process multiple documents sequentially

### Resource Management
- **Memory Usage**: Efficient blob handling for large files
- **API Limits**: Respect PDF4me API rate limits
- **Drive Quota**: Monitor Google Drive storage usage
- **Execution Time**: Stay within Google Apps Script time limits

## Logging and Monitoring

### Log Output
- **Status Messages**: Clear progress indicators
- **Error Details**: Comprehensive error information
- **Performance Metrics**: File sizes and processing times
- **Success Confirmations**: Clear completion messages

### Debug Information
- **API Responses**: Status codes and response lengths
- **File Operations**: File names, sizes, and locations
- **Processing Steps**: Step-by-step execution tracking
- **Error Context**: Detailed error context for troubleshooting

## Troubleshooting

### Common Issues

#### API Authentication Errors
```
Error: 401 - Unauthorized
```
**Solution**: Verify your PDF4me API key is correct and has proper permissions.

#### Incorrect Password
```
Error: 400 - Invalid password
```
**Solution**: Ensure the password is correct for the protected PDF document.

#### Polling Timeout
```
Timeout: PDF unlocking did not complete after multiple retries
```
**Solution**: Increase maxRetries or retryDelay for large documents.

#### File Access Errors
```
Folder not found: PDF4ME input
```
**Solution**: Verify folder names and file locations in Google Drive.

### Debug Steps
1. **Check API Key**: Verify PDF4me API key is valid
2. **Verify Password**: Ensure password is correct for the protected document
3. **Check File Permissions**: Confirm Google Drive access permissions
4. **Review Logs**: Check execution logs for detailed error information
5. **Test Connectivity**: Verify internet connection and API accessibility

## Version History

### Version 1.0.0
- **Initial Release**: Basic PDF unlocking functionality
- **Google Drive Integration**: Seamless file handling
- **Async Processing**: Support for large document processing
- **Error Handling**: Comprehensive error management
- **Clean Logging**: Professional logging without emojis

## Support and Resources

### Documentation
- **PDF4me API Documentation**: [Official API Reference](https://dev.pdf4me.com/docs/)
- **Google Apps Script Guide**: [GAS Documentation](https://developers.google.com/apps-script)
- **Drive API Reference**: [Google Drive API Docs](https://developers.google.com/drive/api)

### Community Support
- **PDF4me Community**: [Developer Forum](https://dev.pdf4me.com/community/)
- **Google Apps Script Community**: [GAS Community](https://developers.google.com/apps-script/community)
- **GitHub Issues**: Report bugs and request features

### Professional Support
- **PDF4me Support**: [Technical Support](https://dev.pdf4me.com/support/)
- **Enterprise Solutions**: [Enterprise Support](https://dev.pdf4me.com/enterprise/)

## License and Terms

### Usage Terms
- **PDF4me API**: Subject to PDF4me API terms of service
- **Google Apps Script**: Subject to Google Apps Script terms
- **Data Privacy**: Compliant with data protection regulations
- **Usage Limits**: Respect API rate limits and quotas

### License Information
This script is provided as-is for educational and commercial use. Users are responsible for compliance with PDF4me and Google terms of service.

---

**Ready to unlock your PDF documents?** Set up your API key and document password, then run the script to start removing password protection with seamless Google Drive integration. 