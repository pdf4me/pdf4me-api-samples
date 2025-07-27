# PDF4me Document Protection - Google Apps Script

## Overview

This Google Apps Script provides seamless integration with the PDF4me API to add password protection and access control to PDF documents. Perfect for securing sensitive documents, controlling user permissions, and maintaining document integrity while preventing unauthorized access and usage.

## Key Features

### Document Protection Capabilities
- **Password Protection**: Add secure password authentication to PDF documents
- **Permission Control**: Restrict printing, copying, editing, and other document actions
- **Access Management**: Control who can view and use protected documents
- **Document Integrity**: Maintain original formatting and structure while adding security

### Processing Features
- **Asynchronous Processing**: Handle large documents with background processing
- **Smart Polling**: Automatic status checking with configurable retry logic
- **Error Recovery**: Comprehensive error handling with detailed logging
- **File Management**: Automatic file naming with protection indicators

### Output Management
- **Clean File Naming**: Automatic output filename generation with protection suffixes
- **Size Reporting**: File size information for protected documents
- **Error Documentation**: Detailed error logs for troubleshooting
- **No Summary Files**: Clean output with only the protected PDF file

## Prerequisites

### Required Setup
- **PDF4me API Key**: Get your API key from [PDF4me Developer Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
- **Google Drive Access**: Ensure the script has permission to access Google Drive
- **Security Configuration**: Define protection password and permission levels

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
var fileName = 'sample.pdf';
```

#### Option B: Direct File ID
```javascript
var pdfFileId = 'your_google_drive_file_id';
```

### 3. Output Configuration
```javascript
var outputFolderName = 'PDF4ME output';
```

### 4. Protection Configuration
```javascript
var protectionPassword = 'your_secure_password';
var pdfPermission = 'All'; // All, Print, Copy, None
```

## Input and Output

### Input Requirements
- **Source File**: PDF file to be protected with password and permissions
- **Protection Password**: Secure password for document access control
- **Permission Level**: Document usage restrictions (printing, copying, etc.)
- **API Key**: Valid PDF4me API key with document processing permissions

### Output Files
- **Primary Output**: `filename.protected.pdf` - Password-protected PDF file
- **Error Files**: `protection_error.txt` - Error details (only created on errors)
- **Debug Files**: `raw_response.txt` - Raw API response (fallback, only on errors)

## Usage Examples

### Basic Document Protection
```javascript
// Set your configuration
var apiKey = 'your_api_key';
var protectionPassword = 'secure123';
var pdfPermission = 'All';

// Run the protection
protectDocument();
```

### Restricted Access Protection
```javascript
var protectionPassword = 'confidential2024';
var pdfPermission = 'Print'; // Allow printing only

protectDocument();
```

### No Permissions Protection
```javascript
var protectionPassword = 'viewonly';
var pdfPermission = 'None'; // No permissions - view only

protectDocument();
```

## Processing Details

### API Communication Flow
1. **Authentication**: Uses Basic auth with PDF4me API key
2. **Request Preparation**: Encodes source file and prepares protection payload
3. **Document Protection**: Sends request to PDF4me Protect endpoint
4. **Response Handling**: Processes 200 (success) or 202 (async) responses
5. **Polling Logic**: For async operations, polls status until completion
6. **File Saving**: Saves protected PDF to Google Drive

### Asynchronous Processing
- **Initial Response**: 202 Accepted for large documents
- **Polling Interval**: 10 seconds between status checks
- **Maximum Retries**: 10 attempts before timeout
- **Success Detection**: 200 OK response indicates completion

### Protection Parameters
- **Password**: Required for opening the protected document
- **PDF Permission**: Controls document usage restrictions
  - **All**: Full access to document
  - **Print**: Allow printing only
  - **Copy**: Allow content copying only
  - **None**: View only, no other permissions

### Error Handling
- **Network Errors**: Automatic retry with exponential backoff
- **API Errors**: Detailed error logging with response codes
- **File Errors**: Graceful handling of missing files or folders
- **Timeout Errors**: Clear timeout messages for long operations

## Security Best Practices

### Password Security
- **Strong Passwords**: Use complex passwords with letters, numbers, and symbols
- **Password Length**: Minimum 8 characters, preferably 12+ characters
- **Unique Passwords**: Use different passwords for different documents
- **Secure Storage**: Store passwords securely, not in plain text

### Permission Management
- **Principle of Least Privilege**: Grant minimum necessary permissions
- **Document Classification**: Apply appropriate protection based on sensitivity
- **Access Control**: Limit document access to authorized users only
- **Audit Trail**: Monitor document access and usage patterns

### API Security
- **Secure Storage**: Store API keys securely in Google Apps Script
- **Access Control**: Use API keys with minimal required permissions
- **Key Rotation**: Regularly update API keys for security
- **Audit Logs**: Monitor API usage for suspicious activity

## Performance Optimization

### Best Practices
- **Use Async Mode**: Recommended for documents larger than 1MB
- **Optimize File Size**: Compress documents before protection if possible
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

#### Password Protection Errors
```
Error: 400 - Invalid password format
```
**Solution**: Ensure password meets minimum requirements and is properly formatted.

#### Polling Timeout
```
Timeout: Document protection did not complete after multiple retries
```
**Solution**: Increase maxRetries or retryDelay for large documents.

#### File Access Errors
```
Folder not found: PDF4ME input
```
**Solution**: Verify folder names and file locations in Google Drive.

### Debug Steps
1. **Check API Key**: Verify PDF4me API key is valid
2. **Verify Password**: Ensure password meets security requirements
3. **Check File Permissions**: Confirm Google Drive access permissions
4. **Review Logs**: Check execution logs for detailed error information
5. **Test Connectivity**: Verify internet connection and API accessibility

## Version History

### Version 1.0.0
- **Initial Release**: Basic document protection functionality
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

**Ready to secure your PDF documents?** Set up your API key and protection configuration, then run the script to start adding password protection and access control with seamless Google Drive integration. 