# PDF4me Hyperlinks Annotation Update - Google Apps Script

## Overview

This Google Apps Script provides seamless integration with the PDF4me API to update hyperlink annotations in PDF documents. Perfect for modifying link text, changing URL destinations, and maintaining document structure while updating multiple hyperlinks in a single operation.

## Key Features

### Hyperlink Update Capabilities
- **Text and URL Updates**: Modify both display text and destination URLs
- **Multiple Updates**: Process multiple hyperlink changes in a single operation
- **Expression Matching**: Use flexible text search patterns for precise targeting
- **PDF Structure Preservation**: Maintain document formatting and layout integrity

### Processing Features
- **Asynchronous Processing**: Handle large documents with background processing
- **Smart Polling**: Automatic status checking with configurable retry logic
- **Error Recovery**: Comprehensive error handling with detailed logging
- **File Management**: Automatic file naming with descriptive suffixes

### Output Management
- **Clean File Naming**: Automatic output filename generation with update indicators
- **Size Reporting**: File size information for updated documents
- **Error Documentation**: Detailed error logs for troubleshooting
- **No Summary Files**: Clean output with only the updated PDF file

## Prerequisites

### Required Setup
- **PDF4me API Key**: Get your API key from [PDF4me Developer Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
- **Google Drive Access**: Ensure the script has permission to access Google Drive
- **Hyperlink Configuration**: Define text search patterns and update values

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

### 4. Hyperlink Update Configuration
```javascript
var hyperlinkUpdates = [
  {
    SearchOn: "Text",                                    // Search criteria type
    SearchValue: "http://www.google.com",               // Search for the hyperlinked text
    IsExpression: true,                                  // Whether to use expression matching
    TextCurrentValue: "http://www.google.com",          // Current hyperlinked text to replace
    TextNewValue: "https://pdf4me.com",                 // New display text for the hyperlink
    URLCurrentValue: "http://www.google.com",           // Current URL destination to replace
    URLNewValue: "https://pdf4me.com"                   // New URL destination
  }
];
```

## Input and Output

### Input Requirements
- **Source File**: PDF file containing hyperlinks to be updated
- **Hyperlink Updates**: Array of update objects with search and replacement values
- **API Key**: Valid PDF4me API key with document processing permissions

### Output Files
- **Primary Output**: `filename_hyperlinks_updated.pdf` - Updated PDF with new hyperlinks
- **Error Files**: `hyperlinks_update_error.txt` - Error details (only created on errors)
- **Debug Files**: `raw_response.txt` - Raw API response (fallback, only on errors)

## Usage Examples

### Basic Hyperlink Update
```javascript
// Set your configuration
var apiKey = 'your_api_key';
var hyperlinkUpdates = [
  {
    SearchOn: "Text",
    SearchValue: "old-website.com",
    IsExpression: true,
    TextCurrentValue: "Visit Old Website",
    TextNewValue: "Visit New Website",
    URLCurrentValue: "http://old-website.com",
    URLNewValue: "https://new-website.com"
  }
];

// Run the update
updateHyperlinksAnnotation();
```

### Multiple Hyperlink Updates
```javascript
var hyperlinkUpdates = [
  {
    SearchOn: "Text",
    SearchValue: "contact-us",
    IsExpression: true,
    TextCurrentValue: "Contact Us",
    TextNewValue: "Get in Touch",
    URLCurrentValue: "http://old-domain.com/contact",
    URLNewValue: "https://new-domain.com/contact"
  },
  {
    SearchOn: "Text",
    SearchValue: "privacy-policy",
    IsExpression: true,
    TextCurrentValue: "Privacy Policy",
    TextNewValue: "Data Protection",
    URLCurrentValue: "http://old-domain.com/privacy",
    URLNewValue: "https://new-domain.com/privacy"
  }
];
```

## Processing Details

### API Communication Flow
1. **Authentication**: Uses Basic auth with PDF4me API key
2. **Request Preparation**: Encodes source file and prepares hyperlink update payload
3. **Hyperlink Update**: Sends request to PDF4me UpdateHyperlinkAnnotation endpoint
4. **Response Handling**: Processes 200 (success) or 202 (async) responses
5. **Polling Logic**: For async operations, polls status until completion
6. **File Saving**: Saves updated PDF to Google Drive

### Asynchronous Processing
- **Initial Response**: 202 Accepted for large documents
- **Polling Interval**: 10 seconds between status checks
- **Maximum Retries**: 10 attempts before timeout
- **Success Detection**: 200 OK response indicates completion

### Hyperlink Update Parameters
- **SearchOn**: Search criteria type ("Text" for text-based search)
- **SearchValue**: Text pattern to find in the document
- **IsExpression**: Enable expression matching for flexible search
- **TextCurrentValue**: Current display text to replace
- **TextNewValue**: New display text for the hyperlink
- **URLCurrentValue**: Current URL destination to replace
- **URLNewValue**: New URL destination

### Error Handling
- **Network Errors**: Automatic retry with exponential backoff
- **API Errors**: Detailed error logging with response codes
- **File Errors**: Graceful handling of missing files or folders
- **Timeout Errors**: Clear timeout messages for long operations

## Performance Optimization

### Best Practices
- **Use Async Mode**: Recommended for documents larger than 1MB
- **Optimize Search Patterns**: Use specific search values for better performance
- **Batch Updates**: Process multiple hyperlinks in a single operation
- **Monitor Logs**: Check execution logs for performance insights

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

#### Hyperlink Not Found
```
Error: 404 - Hyperlink not found
```
**Solution**: Check that the search values match existing hyperlinks in the PDF.

#### Polling Timeout
```
Timeout: Hyperlinks annotation update did not complete after multiple retries
```
**Solution**: Increase maxRetries or retryDelay for large documents.

#### File Access Errors
```
Folder not found: PDF4ME input
```
**Solution**: Verify folder names and file locations in Google Drive.

### Debug Steps
1. **Check API Key**: Verify PDF4me API key is valid
2. **Verify Search Values**: Ensure search patterns match existing hyperlinks
3. **Check File Permissions**: Confirm Google Drive access permissions
4. **Review Logs**: Check execution logs for detailed error information
5. **Test Connectivity**: Verify internet connection and API accessibility

## Version History

### Version 1.0.0
- **Initial Release**: Basic hyperlink annotation update functionality
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

**Ready to update hyperlinks in your PDF documents?** Set up your API key and hyperlink configuration, then run the script to start updating hyperlink annotations with seamless Google Drive integration. 