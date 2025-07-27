# PDF4me Document Retrieval - Google Apps Script

## Overview

This Google Apps Script provides seamless integration with the PDF4me API to retrieve documents from PDF4me storage using document IDs. Perfect for accessing previously uploaded or processed documents, downloading async operation results, and managing document workflows within Google Drive.

## Key Features

### Document Retrieval Capabilities
- **PDF4me Storage Access**: Retrieve documents stored in PDF4me cloud storage
- **Document ID Support**: Use unique PDF4me document identifiers for precise retrieval
- **Async Result Download**: Download results from asynchronous PDF processing operations
- **Google Drive Integration**: Seamless file handling within Google Drive ecosystem

### Processing Features
- **Asynchronous Processing**: Handle large documents with background processing
- **Smart Polling**: Automatic status checking with configurable retry logic
- **Error Recovery**: Comprehensive error handling with detailed logging
- **File Management**: Automatic file naming with document ID integration

### Output Management
- **Clean File Naming**: Automatic output filename generation with document ID
- **Size Reporting**: File size information for retrieved documents
- **Error Documentation**: Detailed error logs for troubleshooting
- **No Summary Files**: Clean output with only the retrieved document file

## Prerequisites

### Required Setup
- **PDF4me API Key**: Get your API key from [PDF4me Developer Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
- **Google Drive Access**: Ensure the script has permission to access Google Drive
- **Document ID**: Valid PDF4me document ID for the document you want to retrieve

### Google Apps Script Services
Enable the following services in your Google Apps Script project:
- **DriveApp**: For Google Drive file operations
- **UrlFetchApp**: For API communication
- **Utilities**: For base64 encoding and JSON operations

## Setup Instructions

### 1. API Configuration
```javascript
var apiKey = 'your_pdf4me_api_key_here';
var documentId = 'your_pdf4me_document_id';
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

## Input and Output

### Input Requirements
- **Source File**: Any PDF file in Google Drive (used for API authentication)
- **Document ID**: Valid PDF4me document ID for retrieval
- **API Key**: Valid PDF4me API key with document access permissions

### Output Files
- **Primary Output**: `filename_retrieved_documentId.pdf` - Retrieved document file
- **Error Files**: `retrieval_error.txt` - Error details (only created on errors)
- **Debug Files**: `raw_response.txt` - Raw API response (fallback, only on errors)

## Usage Examples

### Basic Document Retrieval
```javascript
// Set your configuration
var apiKey = 'your_api_key';
var documentId = 'abc123-def456-ghi789';

// Run the retrieval
getDocumentFromPdf4me();
```

### Retrieving Async Processing Results
```javascript
// After running an async PDF operation, use the returned document ID
var asyncDocumentId = 'async_result_doc_id';
getDocumentFromPdf4me();
```

## Processing Details

### API Communication Flow
1. **Authentication**: Uses Basic auth with PDF4me API key
2. **Request Preparation**: Encodes source file and prepares payload
3. **Document Retrieval**: Sends request to PDF4me GetDocument endpoint
4. **Response Handling**: Processes 200 (success) or 202 (async) responses
5. **Polling Logic**: For async operations, polls status until completion
6. **File Saving**: Saves retrieved document to Google Drive

### Asynchronous Processing
- **Initial Response**: 202 Accepted for large documents
- **Polling Interval**: 10 seconds between status checks
- **Maximum Retries**: 10 attempts before timeout
- **Success Detection**: 200 OK response indicates completion

### Error Handling
- **Network Errors**: Automatic retry with exponential backoff
- **API Errors**: Detailed error logging with response codes
- **File Errors**: Graceful handling of missing files or folders
- **Timeout Errors**: Clear timeout messages for long operations

## Performance Optimization

### Best Practices
- **Use Async Mode**: Recommended for documents larger than 1MB
- **Optimize Polling**: Adjust retry delays based on document size
- **Monitor Logs**: Check execution logs for performance insights
- **Batch Operations**: Process multiple documents sequentially

### Resource Management
- **Memory Usage**: Efficient blob handling for large files
- **API Limits**: Respect PDF4me API rate limits
- **Drive Quota**: Monitor Google Drive storage usage
- **Execution Time**: Stay within Google Apps Script time limits

## Security Considerations

### API Key Security
- **Secure Storage**: Store API keys securely in Google Apps Script
- **Access Control**: Use API keys with minimal required permissions
- **Key Rotation**: Regularly update API keys for security
- **Audit Logs**: Monitor API usage for suspicious activity

### Data Privacy
- **Local Processing**: Files processed within Google's secure environment
- **Temporary Storage**: No permanent storage of sensitive data
- **Access Logging**: All operations logged for audit purposes
- **Error Handling**: Sensitive data not exposed in error messages

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

#### Document Not Found
```
Error: 404 - Document not found
```
**Solution**: Check that the document ID is valid and accessible with your API key.

#### Polling Timeout
```
Timeout: Document retrieval did not complete after multiple retries
```
**Solution**: Increase maxRetries or retryDelay for large documents.

#### File Access Errors
```
Folder not found: PDF4ME input
```
**Solution**: Verify folder names and file locations in Google Drive.

### Debug Steps
1. **Check API Key**: Verify PDF4me API key is valid
2. **Verify Document ID**: Ensure document ID exists and is accessible
3. **Check File Permissions**: Confirm Google Drive access permissions
4. **Review Logs**: Check execution logs for detailed error information
5. **Test Connectivity**: Verify internet connection and API accessibility

## Version History

### Version 1.0.0
- **Initial Release**: Basic document retrieval functionality
- **Google Drive Integration**: Seamless file handling
- **Async Processing**: Support for large document retrieval
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

**Ready to retrieve documents from PDF4me?** Set up your API key and document ID, then run the script to start retrieving your documents from PDF4me storage with seamless Google Drive integration. 