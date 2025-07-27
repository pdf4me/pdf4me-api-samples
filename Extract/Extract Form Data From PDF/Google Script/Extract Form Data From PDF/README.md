# Extract Form Data From PDF - Google Apps Script

## Overview

This Google Apps Script enables you to **extract form field data and values from PDF documents** containing fillable forms using the PDF4me API. Ideal for form processing, data extraction, and document analysis workflows.

## 🚀 Key Features

- **Extract Form Fields**: Retrieve all form field names, types, and values from PDF forms
- **Structured Data Output**: Get organized JSON data with field metadata
- **Asynchronous Processing**: Handle large PDF forms efficiently with background processing
- **Google Drive Integration**: Work seamlessly with PDF files stored in Google Drive
- **Multiple Output Formats**: JSON data and human-readable summaries

## 📋 Prerequisites

- **PDF4me API Key**: Get your API key from [PDF4me Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
- **Google Apps Script Access**: Basic knowledge of Google Apps Script
- **Google Drive Setup**: PDF files with fillable forms stored in Google Drive

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

- **File Format**: PDF documents with fillable form fields
- **Form Types**: AcroForms, XFA forms, and other PDF form formats
- **File Size**: Supports large PDF files (asynchronous processing)
- **Location**: Google Drive folders or direct file ID

## 📤 Output Files

### Primary Output
- `extracted_form_data.json` - Complete form data in structured JSON format
- `form_data_summary.txt` - Human-readable summary of extracted form fields

### Summary Information
- `extraction_info.txt` - Processing summary (if no form data found)
- `extraction_error.txt` - Error details (if processing fails)

## 🔧 Usage Examples

### Basic Usage
```javascript
function extractFormData() {
  extractFormDataFromPdf();
}
```

### Custom Configuration
```javascript
// Modify these variables in the script
var folderName = 'My Forms';
var fileName = 'application_form.pdf';
var outputFolderName = 'Form Data';
```

## 📊 Processing Details

### Supported Form Field Types
- **Text Fields**: Single-line and multi-line text inputs
- **Checkboxes**: Boolean true/false values
- **Radio Buttons**: Single selection from multiple options
- **Dropdown Lists**: Selection from predefined options
- **Signature Fields**: Digital signature data
- **Date Fields**: Date and time inputs
- **Number Fields**: Numeric inputs with validation

### Extracted Data Structure
```json
{
  "formFields": [
    {
      "name": "field_name",
      "type": "field_type",
      "value": "field_value",
      "required": true,
      "page": 1
    }
  ]
}
```

### Processing Modes
- **Synchronous**: Immediate processing for small forms
- **Asynchronous**: Background processing for large forms (recommended)

## 🔍 Error Handling

The script includes comprehensive error handling:
- **File Not Found**: Clear error messages for missing files
- **API Errors**: Detailed error reporting for API issues
- **Form Detection**: Handles PDFs without form fields gracefully
- **Timeout Handling**: Automatic retry logic for long-running operations

## 📈 Performance Optimization

- **Asynchronous Processing**: Reduces server load for large forms
- **Polling Mechanism**: Efficient status checking with configurable delays
- **Memory Management**: Optimized for Google Apps Script limitations
- **Data Filtering**: Processes only relevant form field data

## 🔒 Security Features

- **API Key Protection**: Secure authentication with PDF4me API
- **Google Drive Permissions**: Uses existing Google Drive access controls
- **Data Privacy**: No form data stored outside Google Drive
- **Error Logging**: Secure error reporting without sensitive data exposure

## 📝 Logging and Monitoring

### Console Output
- Processing status updates
- Form field count and types
- Extraction progress tracking
- Error details and debugging information

### File Logs
- Detailed form field summaries
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

3. **No Form Fields Found**
   - Verify PDF contains fillable form fields
   - Check if form fields are properly embedded

4. **Processing Timeout**
   - Increase retry limits for large forms
   - Check network connectivity

### Debug Mode
Enable detailed logging by checking console output for:
- API response codes
- Form field detection status
- Error stack traces

## 🔄 Version History

- **v1.0**: Initial release with basic form field extraction
- **v1.1**: Added asynchronous processing support
- **v1.2**: Enhanced error handling and logging
- **v1.3**: Improved form field type detection

## 📞 Support

For technical support and questions:
- **PDF4me Documentation**: [API Reference](https://dev.pdf4me.com/docs/)
- **Google Apps Script**: [Official Documentation](https://developers.google.com/apps-script)
- **GitHub Issues**: Report bugs and feature requests

## 📄 License

This script is provided as-is for educational and commercial use. Please ensure compliance with PDF4me API terms of service.

---

**Keywords**: PDF form extraction, Google Apps Script, PDF4me API, form processing, data extraction, PDF forms, Google Drive automation, document workflow, form field extraction, PDF analysis, form data management 