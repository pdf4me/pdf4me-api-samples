# Extract Text from Word - Google Apps Script

## Overview

This Google Apps Script enables you to **extract text content from Word documents** using the PDF4me API. Perfect for content extraction, document analysis, and text processing workflows.

## 🚀 Key Features

- **Extract Text Content**: Retrieve all text from Word documents with proper formatting
- **Page Range Selection**: Process specific pages or entire documents
- **Content Filtering**: Remove comments, headers/footers, and accept tracked changes
- **Multiple Output Formats**: JSON data, text files, and structured content
- **Asynchronous Processing**: Handle large Word files efficiently with background processing
- **Google Drive Integration**: Seamlessly work with files stored in Google Drive

## 📋 Prerequisites

- **PDF4me API Key**: Get your API key from [PDF4me Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
- **Google Apps Script Access**: Basic knowledge of Google Apps Script
- **Google Drive Setup**: Word files stored in Google Drive folders

## 🛠️ Setup Instructions

### 1. API Configuration
```javascript
var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/';
```

### 2. File Configuration
```javascript
var folderName = 'PDF4ME input'; // Your input folder name
var fileName = 'sample.docx';    // Your Word file name
var outputFolderName = 'PDF4ME output'; // Your output folder name
```

### 3. Extraction Parameters
```javascript
var startPageNumber = 1;         // Starting page number
var endPageNumber = 3;           // Ending page number
var removeComments = true;       // Remove comments option
var removeHeaderFooter = true;   // Remove header/footer option
var acceptChanges = true;        // Accept tracked changes option
var async = false;               // Processing mode (synchronous)
```

### 4. Alternative: File ID Input
```javascript
// Uncomment and use file ID instead of folder structure
// var wordFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q';
```

## 📁 Input Requirements

- **File Format**: Word documents (.docx, .doc)
- **Content Types**: Text, formatting, tables, and embedded content
- **File Size**: Supports large Word files (asynchronous processing)
- **Location**: Google Drive folders or direct file ID

## 📤 Output Files

### Primary Output
- `extracted_text_from_word.json` - Complete extraction metadata in JSON format
- `extracted_text.txt` - All extracted text content with formatting

### Summary Files
- `text_extraction_summary.txt` - Processing summary and statistics
- `extraction_error.txt` - Error details (if processing fails)

## 🔧 Usage Examples

### Basic Usage
```javascript
function extractTextFromWord() {
  extractTextFromWord();
}
```

### Custom Configuration
```javascript
// Modify these variables in the script
var folderName = 'My Documents';
var fileName = 'report.docx';
var outputFolderName = 'Extracted Text';
var startPageNumber = 1;
var endPageNumber = 10;
var removeComments = false;
var removeHeaderFooter = true;
var acceptChanges = true;
```

## 📊 Processing Details

### Supported Word Features
- **Text Content**: All text with formatting and structure
- **Tables**: Tabular data and structured content
- **Headers/Footers**: Optional removal for clean text extraction
- **Comments**: Optional removal for final content
- **Tracked Changes**: Optional acceptance for final version
- **Page Breaks**: Maintained or removed based on settings

### Content Filtering Options
- **Remove Comments**: Exclude review comments and annotations
- **Remove Headers/Footers**: Extract only main document content
- **Accept Changes**: Include accepted tracked changes in output
- **Page Range**: Process specific pages or entire document

### Processing Modes
- **Synchronous**: Immediate processing for small files
- **Asynchronous**: Background processing for large files (recommended)

## 🔍 Error Handling

The script includes comprehensive error handling:
- **File Not Found**: Clear error messages for missing files
- **API Errors**: Detailed error reporting for API issues
- **Content Processing**: Handles various Word document formats
- **Timeout Handling**: Automatic retry logic for long-running operations

## 📈 Performance Optimization

- **Asynchronous Processing**: Reduces server load for large files
- **Enhanced Polling**: 15 retries with 10-second delays for text extraction
- **Memory Management**: Optimized for Google Apps Script limitations
- **Content Filtering**: Processes only relevant content based on settings

## 🔒 Security Features

- **API Key Protection**: Secure authentication with PDF4me API
- **Google Drive Permissions**: Uses existing Google Drive access controls
- **Data Privacy**: No extracted text stored outside Google Drive
- **Error Logging**: Secure error reporting without sensitive data exposure

## 📝 Logging and Monitoring

### Console Output
- Processing status updates
- Text extraction progress
- Character, word, and line counts
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

3. **No Text Extracted**
   - Verify Word document contains text content
   - Check document format and accessibility

4. **Processing Timeout**
   - Increase retry limits for large files
   - Check network connectivity

### Debug Mode
Enable detailed logging by checking console output for:
- API response codes
- Text extraction status
- Error stack traces

## 🔄 Version History

- **v1.0**: Initial release with basic text extraction
- **v1.1**: Added asynchronous processing support
- **v1.2**: Enhanced content filtering options
- **v1.3**: Improved error handling and logging

## 📞 Support

For technical support and questions:
- **PDF4me Documentation**: [API Reference](https://dev.pdf4me.com/docs/)
- **Google Apps Script**: [Official Documentation](https://developers.google.com/apps-script)
- **GitHub Issues**: Report bugs and feature requests

## 📄 License

This script is provided as-is for educational and commercial use. Please ensure compliance with PDF4me API terms of service.

---

**Keywords**: Word text extraction, Google Apps Script, PDF4me API, document processing, text extraction, Word documents, Google Drive automation, document workflow, content extraction, Word analysis, text processing 