# Get PDF Metadata - Google Apps Script

## Overview

This Google Apps Script enables you to **extract comprehensive metadata from PDF documents** using the PDF4me API. Perfect for document analysis, content cataloging, and metadata management workflows.

## 🚀 Key Features

- **PDF Metadata Extraction**: Retrieve comprehensive document properties and technical details
- **Multiple Metadata Fields**: Extract title, author, creation date, page count, and more
- **Asynchronous Processing**: Handle large PDF files efficiently with background processing
- **Google Drive Integration**: Seamlessly work with files stored in Google Drive
- **Smart Field Detection**: Automatically identify and display common PDF metadata fields
- **JSON Output**: Structured metadata output for easy integration and analysis

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

- **File Format**: PDF documents (.pdf)
- **File Size**: Supports large PDF files (asynchronous processing)
- **Content Types**: Any PDF document with embedded metadata
- **Location**: Google Drive folders or direct file ID

## 📤 Output Files

### Primary Output
- `filename.metadata.json` - Complete PDF metadata in structured JSON format
- `metadata_summary.txt` - Human-readable summary of extracted metadata

### Info Files (Only Created When Needed)
- `metadata_info.txt` - Information when no metadata is found
- `metadata_error.txt` - Error details if processing fails
- `raw_response.txt` - Raw API response (fallback)

## 🔧 Usage Examples

### Basic Usage
```javascript
function getPdfMetadata() {
  getPdfMetadata();
}
```

### Custom Configuration
```javascript
// Modify these variables in the script
var folderName = 'My Documents';
var fileName = 'report.pdf';
var outputFolderName = 'Metadata Output';
```

## 📊 Processing Details

### Extracted Metadata Fields

#### Document Properties
- **Title**: Document title and name
- **Author**: Document author or creator
- **Subject**: Document subject or description
- **Creator**: Software that created the document
- **Producer**: Software that produced the PDF

#### Technical Information
- **CreationDate**: When the document was created
- **ModDate**: When the document was last modified
- **Pages**: Total number of pages in the document
- **FileSize**: Size of the PDF file in bytes
- **PDFVersion**: PDF specification version

#### Additional Metadata
- **Keywords**: Document keywords and tags
- **Language**: Document language settings
- **Security**: Security and encryption information
- **Custom Fields**: Any custom metadata embedded in the PDF

### Processing Modes
- **Synchronous**: Immediate processing for small files
- **Asynchronous**: Background processing for large files (recommended)

## 🔍 Error Handling

The script includes comprehensive error handling:
- **File Not Found**: Clear error messages for missing files
- **API Errors**: Detailed error reporting for API issues
- **Metadata Processing**: Handles PDFs without metadata gracefully
- **Timeout Handling**: Automatic retry logic for long-running operations

## 📈 Performance Optimization

- **Asynchronous Processing**: Reduces server load for large files
- **Enhanced Polling**: 10 retries with 10-second delays for metadata extraction
- **Memory Management**: Optimized for Google Apps Script limitations
- **Smart Field Detection**: Processes only relevant metadata fields

## 🔒 Security Features

- **API Key Protection**: Secure authentication with PDF4me API
- **Google Drive Permissions**: Uses existing Google Drive access controls
- **Data Privacy**: No PDF content stored outside Google Drive
- **Error Logging**: Secure error reporting without sensitive data exposure

## 📝 Logging and Monitoring

### Console Output
- Processing status updates
- Metadata field detection and display
- Extraction progress tracking
- Error details and debugging information

### File Logs
- Detailed metadata summaries
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

3. **No Metadata Found**
   - Verify PDF contains embedded metadata
   - Check PDF file format and accessibility

4. **Processing Timeout**
   - Increase retry limits for large files
   - Check network connectivity

### Debug Mode
Enable detailed logging by checking console output for:
- API response codes
- Metadata extraction status
- Error stack traces

## 🔄 Version History

- **v1.0**: Initial release with basic metadata extraction
- **v1.1**: Added asynchronous processing support
- **v1.2**: Enhanced field detection and JSON output
- **v1.3**: Improved error handling and logging

## 📞 Support

For technical support and questions:
- **PDF4me Documentation**: [API Reference](https://dev.pdf4me.com/docs/)
- **Google Apps Script**: [Official Documentation](https://developers.google.com/apps-script)
- **GitHub Issues**: Report bugs and feature requests

## 📄 License

This script is provided as-is for educational and commercial use. Please ensure compliance with PDF4me API terms of service.

---

**Keywords**: PDF metadata extraction, Google Apps Script, PDF4me API, document properties, metadata analysis, Google Drive automation, document workflow, PDF analysis, content cataloging, metadata management, document information extraction 