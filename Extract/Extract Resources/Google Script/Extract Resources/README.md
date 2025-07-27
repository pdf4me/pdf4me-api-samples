# Extract Resources From PDF - Google Apps Script

## Overview

This Google Apps Script allows you to **extract text content and embedded images from PDF documents** using the PDF4me API. Perfect for content analysis, data extraction, and document processing workflows.

## 🚀 Key Features

- **Extract Text Content**: Retrieve all text from PDF documents with proper formatting
- **Extract Images**: Save embedded images in various formats (PNG, JPEG, etc.)
- **Multiple Output Formats**: JSON metadata, text files, and individual image files
- **Asynchronous Processing**: Handle large PDF files efficiently with background processing
- **Google Drive Integration**: Seamlessly work with files stored in Google Drive
- **Smart Image Detection**: Automatically detects and processes various image formats

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

- **File Format**: PDF documents with text content and/or embedded images
- **File Size**: Supports large PDF files (asynchronous processing)
- **Content Types**: Text, images, graphics, charts, and other embedded resources
- **Location**: Google Drive folders or direct file ID

## 📤 Output Files

### Primary Output
- `extracted_resources.json` - Complete resource metadata in JSON format
- `extracted_text.txt` - All extracted text content from the PDF

### Image Files
- `extracted_image_1.png` - Individual extracted images
- `extracted_image_2.png` - Multiple images from the same PDF
- `extracted_image_X.png` - Additional images as needed

### Summary Files
- `resource_extraction_summary.txt` - Processing summary and statistics
- `extraction_error.txt` - Error details (if processing fails)

## 🔧 Usage Examples

### Basic Usage
```javascript
function extractResources() {
  extractResources();
}
```

### Custom Configuration
```javascript
// Modify these variables in the script
var folderName = 'My PDFs';
var fileName = 'document_with_images.pdf';
var outputFolderName = 'Extracted Resources';
```

## 📊 Processing Details

### Supported Content Types
- **Text Content**: All text from PDF pages with formatting
- **Images**: JPEG, PNG, TIFF, GIF, BMP embedded images
- **Graphics**: Charts, diagrams, logos, and other visual elements
- **Vector Graphics**: Scalable graphics and illustrations

### Image Processing Features
- **Automatic Detection**: Finds images in various field names and formats
- **Multiple Formats**: Handles different image encoding methods
- **Base64 Decoding**: Processes base64 encoded image data
- **File Naming**: Automatic naming with sequential numbering

### Processing Modes
- **Synchronous**: Immediate processing for small files
- **Asynchronous**: Background processing for large files (recommended)

## 🔍 Error Handling

The script includes comprehensive error handling:
- **File Not Found**: Clear error messages for missing files
- **API Errors**: Detailed error reporting for API issues
- **Image Processing Errors**: Graceful handling of corrupted or unsupported images
- **Timeout Handling**: Automatic retry logic for long-running operations

## 📈 Performance Optimization

- **Asynchronous Processing**: Reduces server load for large files
- **Enhanced Polling**: 20 retries with 15-second delays for resource extraction
- **Memory Management**: Optimized for Google Apps Script limitations
- **Batch Processing**: Handle multiple resources efficiently

## 🔒 Security Features

- **API Key Protection**: Secure authentication with PDF4me API
- **Google Drive Permissions**: Uses existing Google Drive access controls
- **Data Privacy**: No content stored outside Google Drive
- **Error Logging**: Secure error reporting without sensitive data exposure

## 📝 Logging and Monitoring

### Console Output
- Processing status updates
- Text and image extraction progress
- Resource count and types
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

3. **No Images Found**
   - Verify PDF contains embedded images
   - Check image format compatibility

4. **Processing Timeout**
   - Increase retry limits for large files
   - Check network connectivity

### Debug Mode
Enable detailed logging by checking console output for:
- API response codes
- Resource detection status
- Image processing details
- Error stack traces

## 🔄 Version History

- **v1.0**: Initial release with basic text and image extraction
- **v1.1**: Added asynchronous processing support
- **v1.2**: Enhanced image detection and processing
- **v1.3**: Improved error handling and logging

## 📞 Support

For technical support and questions:
- **PDF4me Documentation**: [API Reference](https://dev.pdf4me.com/docs/)
- **Google Apps Script**: [Official Documentation](https://developers.google.com/apps-script)
- **GitHub Issues**: Report bugs and feature requests

## 📄 License

This script is provided as-is for educational and commercial use. Please ensure compliance with PDF4me API terms of service.

---

**Keywords**: PDF resource extraction, Google Apps Script, PDF4me API, text extraction, image extraction, PDF analysis, Google Drive automation, document workflow, content extraction, PDF processing, image processing 