# Extract Text by Expression - Google Apps Script

## Overview

This Google Apps Script allows you to **extract specific text patterns from PDF documents using regular expressions** with the PDF4me API. Perfect for data extraction, pattern matching, and content analysis workflows.

## 🚀 Key Features

- **Pattern-Based Extraction**: Use regular expressions to find specific text patterns
- **Flexible Search**: Support for various patterns like emails, phone numbers, percentages, and custom expressions
- **Page Range Selection**: Process specific pages or entire documents
- **Multiple Output Formats**: JSON data, text files, and CSV exports
- **Asynchronous Processing**: Handle large PDF files efficiently with background processing
- **Google Drive Integration**: Seamlessly work with files stored in Google Drive

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

### 3. Expression Configuration
```javascript
var expression = "%"; // Regular expression pattern to search for
var pageSequence = "1-3"; // Page range: "1-" for all pages, "1,2,3" for specific pages
```

### 4. Alternative: File ID Input
```javascript
// Uncomment and use file ID instead of folder structure
// var pdfFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q';
```

## 📁 Input Requirements

- **File Format**: PDF documents with text content
- **Expression Patterns**: Regular expressions for text matching
- **Page Ranges**: Specific pages or entire documents
- **File Size**: Supports large PDF files (asynchronous processing)
- **Location**: Google Drive folders or direct file ID

## 📤 Output Files

### Primary Output
- `extracted_text_by_expression.json` - Complete extraction data in JSON format
- `extracted_matches.txt` - All matching text in readable format
- `extracted_matches.csv` - CSV format for spreadsheet analysis

### Summary Files
- `text_extraction_summary.txt` - Processing summary and statistics
- `extraction_error.txt` - Error details (if processing fails)

## 🔧 Usage Examples

### Basic Usage
```javascript
function extractTextByExpression() {
  extractTextByExpression();
}
```

### Custom Configuration
```javascript
// Modify these variables in the script
var folderName = 'My Documents';
var fileName = 'report.pdf';
var outputFolderName = 'Extracted Data';
var expression = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"; // Email pattern
var pageSequence = "1-5"; // Pages 1-5
```

## 📊 Processing Details

### Common Expression Patterns

#### Email Addresses
```javascript
var expression = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}";
```

#### Phone Numbers
```javascript
var expression = "\\d{3}-\\d{3}-\\d{4}"; // US format
var expression = "\\+?[1-9]\\d{1,14}"; // International format
```

#### Percentages
```javascript
var expression = "\\d+%"; // Simple percentages
var expression = "\\d+\\.\\d+%"; // Decimal percentages
```

#### Currency Amounts
```javascript
var expression = "\\$\\d+(\\.\\d{2})?"; // Dollar amounts
var expression = "\\d+(\\.\\d{2})?\\s*(USD|EUR|GBP)"; // Multiple currencies
```

#### Custom Patterns
```javascript
var expression = "Invoice\\s+#\\d+"; // Invoice numbers
var expression = "\\b[A-Z]{2}\\d{2}\\s?\\d{4}\\s?\\d{4}\\s?\\d{4}\\s?\\d{4}\\b"; // IBAN
```

### Page Range Options
- **All Pages**: `"1-"` or `"all"`
- **Specific Pages**: `"1,3,5"` (pages 1, 3, and 5)
- **Page Range**: `"1-5"` (pages 1 through 5)
- **Single Page**: `"3"` (page 3 only)

### Processing Modes
- **Synchronous**: Immediate processing for small files
- **Asynchronous**: Background processing for large files (recommended)

## 🔍 Error Handling

The script includes comprehensive error handling:
- **File Not Found**: Clear error messages for missing files
- **API Errors**: Detailed error reporting for API issues
- **Expression Errors**: Validation of regular expression patterns
- **Timeout Handling**: Automatic retry logic for long-running operations

## 📈 Performance Optimization

- **Asynchronous Processing**: Reduces server load for large files
- **Enhanced Polling**: 15 retries with 8-second delays for text extraction
- **Memory Management**: Optimized for Google Apps Script limitations
- **Pattern Optimization**: Efficient regular expression processing

## 🔒 Security Features

- **API Key Protection**: Secure authentication with PDF4me API
- **Google Drive Permissions**: Uses existing Google Drive access controls
- **Data Privacy**: No extracted text stored outside Google Drive
- **Error Logging**: Secure error reporting without sensitive data exposure

## 📝 Logging and Monitoring

### Console Output
- Processing status updates
- Pattern matching results
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

3. **No Matches Found**
   - Verify regular expression pattern is correct
   - Check if pattern exists in the specified pages
   - Test expression with sample text

4. **Processing Timeout**
   - Increase retry limits for large files
   - Check network connectivity

### Debug Mode
Enable detailed logging by checking console output for:
- API response codes
- Pattern matching status
- Error stack traces

## 🔄 Version History

- **v1.0**: Initial release with basic text extraction
- **v1.1**: Added asynchronous processing support
- **v1.2**: Enhanced pattern matching and CSV export
- **v1.3**: Improved error handling and logging

## 📞 Support

For technical support and questions:
- **PDF4me Documentation**: [API Reference](https://dev.pdf4me.com/docs/)
- **Google Apps Script**: [Official Documentation](https://developers.google.com/apps-script)
- **GitHub Issues**: Report bugs and feature requests

## 📄 License

This script is provided as-is for educational and commercial use. Please ensure compliance with PDF4me API terms of service.

---

**Keywords**: PDF text extraction, Google Apps Script, PDF4me API, regular expressions, pattern matching, text processing, Google Drive automation, document workflow, data extraction, PDF analysis, regex processing 