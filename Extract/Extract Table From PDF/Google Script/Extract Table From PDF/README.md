# Extract Table From PDF - Google Apps Script

## Overview

This Google Apps Script enables you to **extract table structures and data from PDF documents** using the PDF4me API. Perfect for data extraction, spreadsheet processing, and document analysis workflows.

## 🚀 Key Features

- **Extract Table Data**: Retrieve structured table data from PDF documents
- **Multiple Output Formats**: JSON data, CSV files, and individual table exports
- **Asynchronous Processing**: Handle large PDF files efficiently with background processing
- **Google Drive Integration**: Seamlessly work with files stored in Google Drive
- **Smart Table Detection**: Automatically detects and processes various table formats

## 📋 Prerequisites

- **PDF4me API Key**: Get your API key from [PDF4me Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
- **Google Apps Script Access**: Basic knowledge of Google Apps Script
- **Google Drive Setup**: PDF files with tables stored in Google Drive

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

- **File Format**: PDF documents containing tables
- **Table Types**: Structured tables, data grids, financial reports, and spreadsheets
- **File Size**: Supports large PDF files (asynchronous processing)
- **Location**: Google Drive folders or direct file ID

## 📤 Output Files

### Primary Output
- `extracted_tables.json` - Complete table data in structured JSON format
- `table_1.json`, `table_2.json` - Individual table data files
- `table_1.csv`, `table_2.csv` - CSV format for spreadsheet import

### Summary Files
- `table_extraction_summary.txt` - Processing summary and statistics
- `extraction_error.txt` - Error details (if processing fails)

## 🔧 Usage Examples

### Basic Usage
```javascript
function extractTables() {
  extractTableFromPdf();
}
```

### Custom Configuration
```javascript
// Modify these variables in the script
var folderName = 'My Reports';
var fileName = 'financial_report.pdf';
var outputFolderName = 'Table Data';
```

## 📊 Processing Details

### Supported Table Types
- **Structured Tables**: Well-defined rows and columns
- **Data Grids**: Tabular data with headers
- **Financial Reports**: Tables with numerical data
- **Spreadsheets**: Excel-like table structures
- **Complex Tables**: Multi-level headers and merged cells

### Table Data Structure
```json
{
  "tables": [
    {
      "rows": [
        ["Header1", "Header2", "Header3"],
        ["Data1", "Data2", "Data3"],
        ["Data4", "Data5", "Data6"]
      ]
    }
  ]
}
```

### Processing Modes
- **Synchronous**: Immediate processing for small files
- **Asynchronous**: Background processing for large files (recommended)

## 🔍 Error Handling

The script includes comprehensive error handling:
- **File Not Found**: Clear error messages for missing files
- **API Errors**: Detailed error reporting for API issues
- **Table Detection**: Handles PDFs without tables gracefully
- **Timeout Handling**: Automatic retry logic for long-running operations

## 📈 Performance Optimization

- **Asynchronous Processing**: Reduces server load for large files
- **Enhanced Polling**: 15 retries with 12-second delays for table extraction
- **Memory Management**: Optimized for Google Apps Script limitations
- **Batch Processing**: Handle multiple tables efficiently

## 🔒 Security Features

- **API Key Protection**: Secure authentication with PDF4me API
- **Google Drive Permissions**: Uses existing Google Drive access controls
- **Data Privacy**: No table data stored outside Google Drive
- **Error Logging**: Secure error reporting without sensitive data exposure

## 📝 Logging and Monitoring

### Console Output
- Processing status updates
- Table count and row statistics
- Extraction progress tracking
- Error details and debugging information

### File Logs
- Detailed table extraction summaries
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

3. **No Tables Found**
   - Verify PDF contains structured tables
   - Check table format and clarity

4. **Processing Timeout**
   - Increase retry limits for large files
   - Check network connectivity

### Debug Mode
Enable detailed logging by checking console output for:
- API response codes
- Table detection status
- Error stack traces

## 🔄 Version History

- **v1.0**: Initial release with basic table extraction
- **v1.1**: Added asynchronous processing support
- **v1.2**: Enhanced table detection and CSV export
- **v1.3**: Improved error handling and logging

## 📞 Support

For technical support and questions:
- **PDF4me Documentation**: [API Reference](https://dev.pdf4me.com/docs/)
- **Google Apps Script**: [Official Documentation](https://developers.google.com/apps-script)
- **GitHub Issues**: Report bugs and feature requests

## 📄 License

This script is provided as-is for educational and commercial use. Please ensure compliance with PDF4me API terms of service.

---

**Keywords**: PDF table extraction, Google Apps Script, PDF4me API, table processing, data extraction, PDF tables, Google Drive automation, document workflow, table data extraction, PDF analysis, spreadsheet processing 