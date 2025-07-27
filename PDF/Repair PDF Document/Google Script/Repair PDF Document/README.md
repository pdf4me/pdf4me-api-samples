# Repair PDF Document - Google Apps Script

## Overview

This Google Apps Script enables you to **repair corrupted or damaged PDF documents** using the PDF4me API. Perfect for file recovery, document restoration, and fixing PDF integrity issues.

## 🚀 Key Features

- **PDF Document Repair**: Fix corrupted or damaged PDF files automatically
- **File Integrity Restoration**: Repair structural issues and file integrity problems
- **Content Recovery**: Recover content from partially damaged PDFs
- **Asynchronous Processing**: Handle large PDF files efficiently with background processing
- **Google Drive Integration**: Seamlessly work with files stored in Google Drive
- **Smart File Naming**: Automatic output naming with repair suffix

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

- **File Format**: PDF documents (.pdf) - corrupted or damaged
- **File Size**: Supports large PDF files (asynchronous processing)
- **Content Types**: Any PDF document that needs repair
- **Location**: Google Drive folders or direct file ID

## 📤 Output Files

### Primary Output
- `filename.repaired.pdf` - Repaired PDF file with integrity restored

### Error Files (Only Created on Errors)
- `repair_error.txt` - Error details if processing fails
- `raw_response.txt` - Raw API response (fallback)

## 🔧 Usage Examples

### Basic Usage
```javascript
function repairPdfDocument() {
  repairPdfDocument();
}
```

### Custom Configuration
```javascript
// Modify these variables in the script
var folderName = 'Damaged PDFs';
var fileName = 'corrupted_document.pdf';
var outputFolderName = 'Repaired PDFs';
```

## 📊 Processing Details

### PDF Repair Capabilities

#### File Structure Repair
- **Corrupted Headers**: Fix damaged PDF file headers
- **Broken Cross-References**: Repair internal file references
- **Invalid Objects**: Fix corrupted PDF objects and streams
- **File Structure**: Restore proper PDF document structure

#### Content Recovery
- **Text Content**: Recover readable text from damaged areas
- **Images**: Restore embedded images and graphics
- **Fonts**: Fix font embedding and display issues
- **Metadata**: Preserve document metadata and properties

#### Integrity Restoration
- **File Validation**: Ensure PDF meets specification standards
- **Accessibility**: Restore document accessibility features
- **Compatibility**: Improve compatibility with PDF readers
- **Performance**: Optimize file for better loading performance

### Processing Modes
- **Synchronous**: Immediate processing for small files
- **Asynchronous**: Background processing for large files (recommended)

## 🔍 Error Handling

The script includes comprehensive error handling:
- **File Not Found**: Clear error messages for missing files
- **API Errors**: Detailed error reporting for API issues
- **Repair Failures**: Handles irreparable PDFs gracefully
- **Timeout Handling**: Automatic retry logic for long-running operations

## 📈 Performance Optimization

- **Asynchronous Processing**: Reduces server load for large files
- **Enhanced Polling**: 10 retries with 10-second delays for repair operations
- **Memory Management**: Optimized for Google Apps Script limitations
- **Batch Processing**: Handle multiple files efficiently

## 🔒 Security Features

- **API Key Protection**: Secure authentication with PDF4me API
- **Google Drive Permissions**: Uses existing Google Drive access controls
- **Data Privacy**: No PDF content stored outside Google Drive
- **Error Logging**: Secure error reporting without sensitive data exposure

## 📝 Logging and Monitoring

### Console Output
- Processing status updates
- File size information
- Repair progress tracking
- Error details and debugging information

### File Logs
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

3. **Repair Failed**
   - Verify PDF file is actually corrupted
   - Check if file is severely damaged beyond repair

4. **Processing Timeout**
   - Increase retry limits for large files
   - Check network connectivity

### Debug Mode
Enable detailed logging by checking console output for:
- API response codes
- Repair status and progress
- Error stack traces

## 🔄 Version History

- **v1.0**: Initial release with basic PDF repair functionality
- **v1.1**: Added asynchronous processing support
- **v1.2**: Enhanced error handling and file validation
- **v1.3**: Improved repair algorithms and logging

## 📞 Support

For technical support and questions:
- **PDF4me Documentation**: [API Reference](https://dev.pdf4me.com/docs/)
- **Google Apps Script**: [Official Documentation](https://developers.google.com/apps-script)
- **GitHub Issues**: Report bugs and feature requests

## 📄 License

This script is provided as-is for educational and commercial use. Please ensure compliance with PDF4me API terms of service.

---

**Keywords**: PDF repair, Google Apps Script, PDF4me API, document repair, file recovery, PDF corruption fix, Google Drive automation, document workflow, PDF restoration, file integrity repair, damaged PDF recovery 