# Compress PDF - Google Apps Script

## Overview

This Google Apps Script enables you to **compress and optimize PDF documents** using the PDF4me API. Perfect for reducing file sizes, improving web performance, and optimizing document storage.

## 🚀 Key Features

- **PDF Compression**: Reduce PDF file sizes while maintaining quality
- **Multiple Optimization Profiles**: Web, Print, and Screen optimization options
- **Asynchronous Processing**: Handle large PDF files efficiently with background processing
- **Google Drive Integration**: Seamlessly work with files stored in Google Drive
- **Smart File Naming**: Automatic output naming with compression profile suffix
- **Quality Preservation**: Maintain document quality while reducing file size

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

### 3. Optimization Profile
```javascript
var optimizeProfile = 'Web'; // Options: 'Web', 'Print', 'Screen'
```

### 4. Alternative: File ID Input
```javascript
// Uncomment and use file ID instead of folder structure
// var pdfFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q';
```

## 📁 Input Requirements

- **File Format**: PDF documents (.pdf)
- **File Size**: Supports large PDF files (asynchronous processing)
- **Content Types**: Text, images, graphics, and mixed content
- **Location**: Google Drive folders or direct file ID

## 📤 Output Files

### Primary Output
- `filename_compressed_web.pdf` - Compressed PDF with profile suffix
- `filename_compressed_print.pdf` - Print-optimized version
- `filename_compressed_screen.pdf` - Screen-optimized version

### Error Files (Only Created on Errors)
- `compression_error.txt` - Error details if processing fails
- `raw_response.txt` - Raw API response (fallback)

## 🔧 Usage Examples

### Basic Usage
```javascript
function compressPdf() {
  compressPdf();
}
```

### Custom Configuration
```javascript
// Modify these variables in the script
var folderName = 'My PDFs';
var fileName = 'large_document.pdf';
var outputFolderName = 'Compressed PDFs';
var optimizeProfile = 'Print'; // For print optimization
```

## 📊 Processing Details

### Optimization Profiles

#### Web Profile
- **Purpose**: Optimized for web viewing and sharing
- **Features**: Reduced file size, fast loading, web compatibility
- **Best For**: Email attachments, web uploads, online sharing

#### Print Profile
- **Purpose**: Optimized for high-quality printing
- **Features**: Maintains print quality, color accuracy, resolution
- **Best For**: Professional printing, publications, presentations

#### Screen Profile
- **Purpose**: Optimized for screen viewing
- **Features**: Balanced quality and size, smooth scrolling
- **Best For**: Digital displays, tablets, mobile devices

### Compression Features
- **Image Optimization**: Compresses embedded images while maintaining quality
- **Font Optimization**: Optimizes font embedding and subsetting
- **Metadata Cleanup**: Removes unnecessary metadata
- **Structure Optimization**: Optimizes PDF internal structure

### Processing Modes
- **Synchronous**: Immediate processing for small files
- **Asynchronous**: Background processing for large files (recommended)

## 🔍 Error Handling

The script includes comprehensive error handling:
- **File Not Found**: Clear error messages for missing files
- **API Errors**: Detailed error reporting for API issues
- **Processing Errors**: Graceful handling of compression failures
- **Timeout Handling**: Automatic retry logic for long-running operations

## 📈 Performance Optimization

- **Asynchronous Processing**: Reduces server load for large files
- **Enhanced Polling**: 10 retries with 10-second delays for compression
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
- Compression progress tracking
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

3. **Compression Failed**
   - Verify PDF file is not corrupted
   - Check file format and accessibility

4. **Processing Timeout**
   - Increase retry limits for large files
   - Check network connectivity

### Debug Mode
Enable detailed logging by checking console output for:
- API response codes
- Compression status and progress
- Error stack traces

## 🔄 Version History

- **v1.0**: Initial release with basic PDF compression
- **v1.1**: Added asynchronous processing support
- **v1.2**: Enhanced optimization profiles and error handling
- **v1.3**: Improved file naming and logging

## 📞 Support

For technical support and questions:
- **PDF4me Documentation**: [API Reference](https://dev.pdf4me.com/docs/)
- **Google Apps Script**: [Official Documentation](https://developers.google.com/apps-script)
- **GitHub Issues**: Report bugs and feature requests

## 📄 License

This script is provided as-is for educational and commercial use. Please ensure compliance with PDF4me API terms of service.

---

**Keywords**: PDF compression, Google Apps Script, PDF4me API, PDF optimization, file size reduction, Google Drive automation, document workflow, PDF processing, web optimization, print optimization, screen optimization 