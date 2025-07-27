# Extract Attachment From PDF - Google Apps Script

## Overview

This Google Apps Script allows you to **extract file attachments from PDF documents** using the PDF4me API. Perfect for document analysis, content extraction, and file recovery workflows.

## 🚀 Key Features

- **Extract All Attachments**: Retrieve embedded files, documents, images, and other attachments from PDFs
- **Multiple Output Formats**: Save attachments as text files, binary files, or ZIP archives
- **Asynchronous Processing**: Handle large PDF files efficiently with background processing
- **Google Drive Integration**: Seamlessly work with files stored in Google Drive
- **Comprehensive Logging**: Detailed progress tracking and error reporting

## 📋 Prerequisites

- **PDF4me API Key**: Get your API key from [PDF4me Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
- **Google Apps Script Access**: Basic knowledge of Google Apps Script
- **Google Drive Setup**: PDF files stored in Google Drive folders

## 🛠️ Setup Instructions

### 1. API Configuration
```javascript
var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/';
```

### 2. File Configuration
```javascript
var folderName = 'PDF4ME input'; // Your input folder name
var fileName = 'sample.pdf';     // Your PDF file name
var outputFolderName = 'PDF4ME output'; // Your output folder name
```

### 3. Alternative: File ID Input
```javascript
// Uncomment and use file ID instead of folder structure
// var pdfFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q';
```

## 📁 Input Requirements

- **File Format**: PDF documents with embedded attachments
- **File Size**: Supports large PDF files (asynchronous processing)
- **Location**: Google Drive folders or direct file ID

## 📤 Output Files

### Primary Output
- `extracted_attachments.zip` - ZIP file containing all extracted attachments
- `extracted_attachments.json` - Metadata about extracted attachments

### Individual Files
- `attachment_X_extracted.txt` - Extracted text content from attachments
- `attachment_X_barcode.txt` - Barcode data from attachments
- `attachment_X_doctext.txt` - Document text from attachments

### Summary Files
- `extraction_info.txt` - Processing summary and statistics
- `extraction_error.txt` - Error details (if processing fails)

## 🔧 Usage Examples

### Basic Usage
```javascript
function extractAttachments() {
  extractAttachmentFromPdf();
}
```

### Custom Configuration
```javascript
// Modify these variables in the script
var folderName = 'My PDFs';
var fileName = 'document_with_attachments.pdf';
var outputFolderName = 'Extracted Files';
```

## 📊 Processing Details

### Supported Attachment Types
- **Documents**: Word, Excel, PowerPoint, PDF files
- **Images**: JPEG, PNG, GIF, TIFF files
- **Text Files**: TXT, CSV, JSON files
- **Archives**: ZIP, RAR files
- **Other**: Any file type embedded in PDF

### Processing Modes
- **Synchronous**: Immediate processing for small files
- **Asynchronous**: Background processing for large files (recommended)

## 🔍 Error Handling

The script includes comprehensive error handling:
- **File Not Found**: Clear error messages for missing files
- **API Errors**: Detailed error reporting for API issues
- **Processing Errors**: Fallback mechanisms for failed extractions
- **Timeout Handling**: Automatic retry logic for long-running operations

## 📈 Performance Optimization

- **Asynchronous Processing**: Reduces server load for large files
- **Polling Mechanism**: Efficient status checking with configurable delays
- **Memory Management**: Optimized for Google Apps Script limitations
- **Batch Processing**: Handle multiple files efficiently

## 🔒 Security Features

- **API Key Protection**: Secure authentication with PDF4me API
- **Google Drive Permissions**: Uses existing Google Drive access controls
- **Data Privacy**: No data stored outside Google Drive
- **Error Logging**: Secure error reporting without sensitive data exposure

## 📝 Logging and Monitoring

### Console Output
- Processing status updates
- File size and encoding information
- Extraction progress tracking
- Error details and debugging information

### File Logs
- Detailed extraction summaries
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

3. **Processing Timeout**
   - Increase retry limits for large files
   - Check network connectivity

4. **No Attachments Found**
   - Verify PDF contains embedded attachments
   - Check PDF file integrity

### Debug Mode
Enable detailed logging by checking console output for:
- API response codes
- File processing status
- Error stack traces

## 🔄 Version History

- **v1.0**: Initial release with basic attachment extraction
- **v1.1**: Added asynchronous processing support
- **v1.2**: Enhanced error handling and logging
- **v1.3**: Improved file format detection and processing

## 📞 Support

For technical support and questions:
- **PDF4me Documentation**: [API Reference](https://dev.pdf4me.com/docs/)
- **Google Apps Script**: [Official Documentation](https://developers.google.com/apps-script)
- **GitHub Issues**: Report bugs and feature requests

## 📄 License

This script is provided as-is for educational and commercial use. Please ensure compliance with PDF4me API terms of service.

---

**Keywords**: PDF attachment extraction, Google Apps Script, PDF4me API, document processing, file recovery, PDF analysis, Google Drive automation, document workflow, content extraction, file management 