# 🔍 Convert PDF to Editable PDF using OCR - Google Apps Script

**Automatically convert scanned PDFs and image-based PDFs to editable, searchable text using OCR technology with PDF4me API and Google Apps Script**

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![PDF4me API](https://img.shields.io/badge/PDF4me%20API-FF6B6B?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white)](https://dev.pdf4me.com/)
[![OCR Technology](https://img.shields.io/badge/OCR%20Technology-00D4AA?style=for-the-badge&logo=file-pdf&logoColor=white)](https://dev.pdf4me.com/)

## 🚀 Overview

This Google Apps Script solution enables you to **automatically convert scanned PDFs and image-based PDFs to editable, searchable text documents** using advanced Optical Character Recognition (OCR) technology via the powerful PDF4me API. Perfect for digitizing paper documents, making scanned forms searchable, converting image-based PDFs to editable formats, and transforming historical documents into modern digital assets.

### ✨ Key Features

- 🔍 **Advanced OCR Technology**: Converts scanned PDFs to editable, searchable text
- 🌍 **Multi-Language Support**: Supports English, Spanish, French, German, and more
- ⚡ **Quality Options**: Draft (1 API call) or High quality (2 API calls per page)
- 🧠 **Smart Processing**: OCR only when needed or always perform OCR
- 📄 **Sheet Management**: Merge all sheets or keep them separate
- ⚙️ **Asynchronous Processing**: Handles large files efficiently with background processing
- 🔒 **Secure**: Uses industry-standard API authentication
- 📊 **Comprehensive Logging**: Detailed progress tracking and error reporting

## 📋 Prerequisites

Before using this script, ensure you have:

- ✅ **Google Apps Script** access
- ✅ **PDF4me API Key** (Get it from [https://dev.pdf4me.com/dashboard/#/api-keys](https://dev.pdf4me.com/dashboard/#/api-keys))
- ✅ **Google Drive** with input and output folders
- ✅ **PDF file** to convert (scanned, image-based, or mixed content)

## 🛠️ Installation & Setup

### Step 1: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click **"New Project"**
3. Replace the default code with the provided `convert_pdf_to_editable_pdf_using_ocr.gs` script

### Step 2: Configure API Key

```javascript
var apiKey = 'YOUR_PDF4ME_API_KEY_HERE'; // Replace with your actual API key
```

### Step 3: Set Up Google Drive Folders

Create the following folder structure in Google Drive:

```
📁 PDF4ME input/
   └── 📄 sample.pdf (your scanned or image-based PDF file)

📁 PDF4ME output/
   └── (editable PDFs will be saved here)
```

### Step 4: Configure File Names

Update these variables in the script:

```javascript
var folderName = 'PDF4ME input';           // Your input folder name
var fileName = 'sample.pdf';               // Your PDF file name
var outputFolderName = 'PDF4ME output';    // Your output folder name
```

## 🎯 Usage

### Basic Usage

1. **Upload PDF**: Place your scanned or image-based PDF in the input folder
2. **Customize Settings**: Modify OCR quality and language parameters
3. **Run Script**: Execute the `convertPdfToEditablePdfUsingOcr()` function
4. **Get Results**: Find your editable PDF in the output folder

### Advanced Configuration

#### Using File IDs (Alternative Method)

Instead of folder-based file lookup, you can use direct file IDs:

```javascript
// Uncomment and use these lines for file ID-based access
// var pdfFileId = 'YOUR_PDF_FILE_ID';
```

To get file IDs:
1. Right-click the file in Google Drive
2. Select "Get link"
3. Copy the ID from the URL: `https://drive.google.com/file/d/FILE_ID/view`

## 🔍 OCR Configuration Options

### Quality Settings

#### Draft Quality
```javascript
qualityType: "Draft",                         // 1 API call per file
```
- **Best for**: Normal PDFs with existing text
- **Processing**: Fast, cost-effective
- **Use case**: Quick conversions, budget-conscious projects

#### High Quality
```javascript
qualityType: "High",                          // 2 API calls per page
```
- **Best for**: PDFs from images and scanned documents
- **Processing**: Slower, higher accuracy
- **Use case**: Critical documents, maximum accuracy

### Language Support

#### Supported Languages
```javascript
language: "English",                          // Default language
language: "Spanish",                          // Spanish documents
language: "French",                           // French documents
language: "German",                           // German documents
language: "Italian",                          // Italian documents
language: "Portuguese",                       // Portuguese documents
language: "Dutch",                            // Dutch documents
language: "Russian",                          // Russian documents
language: "Chinese",                          // Chinese documents
language: "Japanese",                         // Japanese documents
language: "Korean",                           // Korean documents
```

### OCR Behavior Control

#### Smart OCR (Recommended)
```javascript
ocrWhenNeeded: "true",                        // Skip if text exists
```
- **Behavior**: Only performs OCR when text is not already searchable
- **Benefits**: Faster processing, cost-effective
- **Use case**: Mixed documents with existing and scanned content

#### Always OCR
```javascript
ocrWhenNeeded: "false",                       // Always perform OCR
```
- **Behavior**: Always performs OCR regardless of existing text
- **Benefits**: Maximum accuracy, consistent processing
- **Use case**: Critical documents requiring highest accuracy

### Sheet Management

#### Merge All Sheets
```javascript
mergeAllSheets: true,                         // Merge sheets if applicable
```
- **Result**: Single PDF with all content merged
- **Use case**: Multi-page documents, reports, books

#### Keep Sheets Separate
```javascript
mergeAllSheets: false,                        // Keep sheets separate
```
- **Result**: Individual sheets remain separate
- **Use case**: Presentations, multi-part documents

## 📊 API Response Handling

The script handles multiple response scenarios:

### ✅ Immediate Success (200)
- Processing completes instantly
- Editable PDF saved directly

### ⏳ Asynchronous Processing (202)
- Large files processed in background
- Automatic polling until completion
- Progress tracking with retry logic

### ❌ Error Handling
- Comprehensive error logging
- File validation checks
- Network timeout protection

## 🔧 Advanced Customization Options

### Quality vs. Cost Optimization

#### Budget-Friendly Approach
```javascript
var payload = {
  qualityType: "Draft",                       // 1 API call per file
  ocrWhenNeeded: "true",                      // Smart OCR
  isAsync: true,                              // Background processing
  mergeAllSheets: true                        // Merge for efficiency
};
```

#### High-Accuracy Approach
```javascript
var payload = {
  qualityType: "High",                        // 2 API calls per page
  ocrWhenNeeded: "false",                     // Always OCR
  isAsync: true,                              // Background processing
  mergeAllSheets: false                       // Keep sheets separate
};
```

### Language-Specific Configurations

#### Multi-Language Documents
```javascript
language: "English",                          // Primary language
// For documents with mixed languages, use the dominant language
```

#### Specialized Language Support
```javascript
// For Asian languages with complex characters
language: "Chinese",                          // Simplified Chinese
language: "Japanese",                         // Japanese with Kanji
language: "Korean",                           // Korean with Hangul
```

## 📝 Code Structure

### Main Function: `convertPdfToEditablePdfUsingOcr()`

```javascript
function convertPdfToEditablePdfUsingOcr() {
  // 1. Configuration setup
  // 2. File retrieval from Google Drive
  // 3. Base64 encoding
  // 4. OCR parameters configuration
  // 5. API request execution
  // 6. Response handling (200/202)
  // 7. File saving to output folder
}
```

### Key Components

- **File Management**: Google Drive API integration
- **Data Encoding**: Base64 conversion for API transmission
- **HTTP Communication**: UrlFetchApp for API calls
- **Error Handling**: Comprehensive try-catch blocks
- **Logging**: Detailed progress tracking

## 🚨 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Folder not found** | Check folder name spelling and permissions |
| **File not found** | Verify PDF exists in specified folder |
| **API key error** | Ensure valid PDF4me API key is configured |
| **OCR quality too low** | Switch to "High" quality for better results |
| **Language not recognized** | Specify correct language parameter |
| **Timeout errors** | Increase `maxRetries` or `retryDelay` values |
| **Invalid PDF response** | Check if API returned valid PDF data |

### Debug Mode

Enable detailed logging by checking the execution logs:

1. Run the script
2. Click **"View → Execution log"**
3. Review detailed progress information

## 📈 Performance Optimization

### Best Practices

- **Quality Selection**: Use "Draft" for normal PDFs, "High" for scanned documents
- **File Size**: Process files under 50MB for faster results
- **Language Specification**: Always specify the correct language for better accuracy
- **Batch Processing**: Process multiple files sequentially
- **Error Recovery**: Implement retry logic for network issues

### Monitoring

```javascript
// Performance metrics logged automatically
Logger.log('PDF file size: ' + pdfBlob.getBytes().length);
Logger.log('OCR configuration: ' + JSON.stringify(payload));
Logger.log('Processing time: ' + (endTime - startTime) + 'ms');
```

## 🎨 Use Cases

### Document Digitization

- **Scanned Documents**: Convert paper documents to editable PDFs
- **Historical Records**: Digitize old documents and archives
- **Image-Based PDFs**: Make image PDFs searchable and editable
- **Printed Materials**: Convert printed materials to digital format

### Business Applications

- **Form Processing**: Convert scanned forms to editable formats
- **Document Archives**: Make archived documents searchable
- **Contract Digitization**: Convert paper contracts to editable text
- **Report Processing**: Make scanned reports searchable

### Academic & Research

- **Research Papers**: Convert scanned research materials
- **Library Archives**: Make library materials searchable
- **Historical Research**: Digitize historical documents
- **Academic Publications**: Convert printed academic works

### Legal & Compliance

- **Legal Documents**: Convert scanned legal documents
- **Court Records**: Digitize court filings and records
- **Compliance Documents**: Make regulatory documents searchable
- **Contract Archives**: Convert paper contracts to digital

### Healthcare & Medical

- **Medical Records**: Convert scanned medical documents
- **Patient Forms**: Make patient forms searchable
- **Prescriptions**: Digitize prescription documents
- **Medical Reports**: Convert medical reports to editable format

### Government & Public Sector

- **Government Forms**: Convert official government documents
- **Public Records**: Digitize public records and archives
- **Permit Documents**: Convert permit applications to digital
- **Tax Documents**: Make tax documents searchable

### Creative & Media

- **Printed Publications**: Convert printed magazines and books
- **Historical Photos**: Extract text from historical documents
- **Art Catalogs**: Convert art catalogs to searchable format
- **Media Archives**: Digitize media-related documents

## 🔗 Related Resources

- [📚 PDF4me API Documentation](https://dev.pdf4me.com/docs/)
- [🔧 Google Apps Script Guide](https://developers.google.com/apps-script)
- [📁 Google Drive API Reference](https://developers.google.com/drive/api)
- [🔍 OCR Technology Guide](https://en.wikipedia.org/wiki/Optical_character_recognition)
- [🛠️ PDF4me Dashboard](https://dev.pdf4me.com/dashboard/)

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

Need help? Here are your options:

- 📧 **Email**: support@pdf4me.com
- 💬 **Community**: [PDF4me Community Forum](https://community.pdf4me.com/)
- 📖 **Documentation**: [API Documentation](https://dev.pdf4me.com/docs/)
- 🐛 **Issues**: Report bugs via GitHub Issues

---

**Made with ❤️ by PDF4me Team**

*Transform your scanned documents into editable, searchable digital assets with advanced OCR technology for enhanced productivity and accessibility* 