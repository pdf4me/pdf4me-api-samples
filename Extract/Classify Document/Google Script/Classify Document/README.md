# Classify Document - Google Apps Script

## Overview

This Google Apps Script enables you to **automatically classify and categorize documents** using the PDF4me API. Perfect for document management, content organization, and automated filing workflows.

## 🚀 Key Features

- **Document Classification**: Automatically categorize documents by type and content
- **Multiple Document Formats**: Support for PDF, Word, Excel, and other document types
- **Intelligent Categorization**: AI-powered classification based on document content
- **Asynchronous Processing**: Handle large documents efficiently with background processing
- **Google Drive Integration**: Seamlessly work with files stored in Google Drive
- **Detailed Classification Results**: Comprehensive metadata and confidence scores

## 📋 Prerequisites

- **PDF4me API Key**: Get your API key from [PDF4me Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
- **Google Apps Script Access**: Basic knowledge of Google Apps Script
- **Google Drive Setup**: Documents stored in Google Drive folders

## 🛠️ Setup Instructions

### 1. API Configuration
```javascript
var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/';
```

### 2. File Configuration
```javascript
var folderName = 'PDF4ME input'; // Your input folder name
var fileName = 'sample.pdf';     // Your document file name
var outputFolderName = 'PDF4ME output'; // Your output folder name
```

### 3. Alternative: File ID Input
```javascript
// Uncomment and use file ID instead of folder structure
// var documentFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q';
```

## 📁 Input Requirements

- **File Format**: PDF, Word, Excel, PowerPoint, and other document types
- **Content Types**: Text-based documents with readable content
- **File Size**: Supports large documents (asynchronous processing)
- **Location**: Google Drive folders or direct file ID

## 📤 Output Files

### Primary Output
- `classified_document.json` - Complete classification results in JSON format
- `classification_summary.txt` - Human-readable summary of document classification

### Summary Information
- `classification_info.txt` - Processing summary and metadata
- `classification_error.txt` - Error details (if processing fails)

## 🔧 Usage Examples

### Basic Usage
```javascript
function classifyDocument() {
  classifyDocument();
}
```

### Custom Configuration
```javascript
// Modify these variables in the script
var folderName = 'My Documents';
var fileName = 'contract.pdf';
var outputFolderName = 'Classified Documents';
```

## 📊 Processing Details

### Supported Document Types
- **Invoices**: Financial documents and billing statements
- **Contracts**: Legal documents and agreements
- **Reports**: Business reports and analytics
- **Forms**: Application forms and surveys
- **Letters**: Correspondence and communications
- **Receipts**: Purchase receipts and transactions
- **Resumes**: Job applications and CVs
- **Manuals**: Technical documentation and guides

### Classification Features
- **Content Analysis**: AI-powered text analysis for categorization
- **Confidence Scoring**: Probability scores for classification accuracy
- **Metadata Extraction**: Document properties and characteristics
- **Multi-Label Classification**: Multiple categories per document

### Processing Modes
- **Synchronous**: Immediate processing for small documents
- **Asynchronous**: Background processing for large documents (recommended)

## 🔍 Error Handling

The script includes comprehensive error handling:
- **File Not Found**: Clear error messages for missing files
- **API Errors**: Detailed error reporting for API issues
- **Classification Errors**: Handles unsupported document types gracefully
- **Timeout Handling**: Automatic retry logic for long-running operations

## 📈 Performance Optimization

- **Asynchronous Processing**: Reduces server load for large documents
- **Enhanced Polling**: 20 retries with 10-second delays for classification
- **Memory Management**: Optimized for Google Apps Script limitations
- **Batch Processing**: Handle multiple documents efficiently

## 🔒 Security Features

- **API Key Protection**: Secure authentication with PDF4me API
- **Google Drive Permissions**: Uses existing Google Drive access controls
- **Data Privacy**: No document content stored outside Google Drive
- **Error Logging**: Secure error reporting without sensitive data exposure

## 📝 Logging and Monitoring

### Console Output
- Processing status updates
- Classification results and confidence scores
- Document type detection
- Error details and debugging information

### File Logs
- Detailed classification summaries
- Error reports with timestamps
- Processing statistics and metrics

## 🚨 Troubleshooting

### Common Issues

1. **API Key Error**
   - Verify your PDF4me API key is correct
   - Check API key permissions and quotas

2. **File Not Found**
   - Ensure folder and file names match exactly
   - Check Google Drive permissions

3. **Classification Failed**
   - Verify document contains readable text content
   - Check document format and accessibility

4. **Processing Timeout**
   - Increase retry limits for large documents
   - Check network connectivity

### Debug Mode
Enable detailed logging by checking console output for:
- API response codes
- Classification status and results
- Error stack traces

## 🔄 Version History

- **v1.0**: Initial release with basic document classification
- **v1.1**: Added asynchronous processing support
- **v1.2**: Enhanced classification accuracy and confidence scoring
- **v1.3**: Improved error handling and logging

## 📞 Support

For technical support and questions:
- **PDF4me Documentation**: [API Reference](https://dev.pdf4me.com/docs/)
- **Google Apps Script**: [Official Documentation](https://developers.google.com/apps-script)
- **GitHub Issues**: Report bugs and feature requests

## 📄 License

This script is provided as-is for educational and commercial use. Please ensure compliance with PDF4me API terms of service.

---

**Keywords**: document classification, Google Apps Script, PDF4me API, AI classification, document management, content categorization, Google Drive automation, document workflow, automated filing, document analysis, content organization 