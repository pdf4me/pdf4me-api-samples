# 📎 Add Attachment to PDF - Google Apps Script

**Automatically add file attachments to PDF documents using PDF4me API with Google Apps Script**

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![PDF4me API](https://img.shields.io/badge/PDF4me%20API-FF6B6B?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white)](https://dev.pdf4me.com/)
[![PDF Processing](https://img.shields.io/badge/PDF%20Processing-00D4AA?style=for-the-badge&logo=file-pdf&logoColor=white)](https://dev.pdf4me.com/)

## 🚀 Overview

This Google Apps Script solution enables you to **automatically add file attachments to PDF documents** using the powerful PDF4me API. Perfect for document management workflows, automated file processing, and enhancing PDF documents with supplementary materials.

### ✨ Key Features

- 🔗 **Seamless Integration**: Works directly within Google Drive and Google Apps Script
- 📁 **Multiple File Types**: Support for .txt, .doc, .jpg, .png, and various other file formats
- ⚡ **Asynchronous Processing**: Handles large files efficiently with background processing
- 🎯 **Precise Control**: Add attachments to specific pages or entire documents
- 🔒 **Secure**: Uses industry-standard API authentication
- 📊 **Comprehensive Logging**: Detailed progress tracking and error reporting

## 📋 Prerequisites

Before using this script, ensure you have:

- ✅ **Google Apps Script** access
- ✅ **PDF4me API Key** (Get it from [https://dev.pdf4me.com/dashboard/#/api-keys](https://dev.pdf4me.com/dashboard/#/api-keys))
- ✅ **Google Drive** with input and output folders
- ✅ **PDF file** to attach files to
- ✅ **Attachment file** (any supported format)

## 🛠️ Installation & Setup

### Step 1: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click **"New Project"**
3. Replace the default code with the provided `add_attachment_to_pdf.gs` script

### Step 2: Configure API Key

```javascript
var apiKey = 'YOUR_PDF4ME_API_KEY_HERE'; // Replace with your actual API key
```

### Step 3: Set Up Google Drive Folders

Create the following folder structure in Google Drive:

```
📁 PDF4ME input/
   ├── 📄 sample.pdf (your main PDF file)
   └── 📄 sample.txt (your attachment file)

📁 PDF4ME output/
   └── (processed files will be saved here)
```

### Step 4: Configure File Names

Update these variables in the script:

```javascript
var folderName = 'PDF4ME input';           // Your input folder name
var pdfFileName = 'sample.pdf';            // Your PDF file name
var attachmentFileName = 'sample.txt';     // Your attachment file name
var outputFolderName = 'PDF4ME output';    // Your output folder name
```

## 🎯 Usage

### Basic Usage

1. **Upload Files**: Place your PDF and attachment files in the input folder
2. **Run Script**: Execute the `addAttachmentToPdf()` function
3. **Get Results**: Find your processed PDF in the output folder

### Advanced Configuration

#### Using File IDs (Alternative Method)

Instead of folder-based file lookup, you can use direct file IDs:

```javascript
// Uncomment and use these lines for file ID-based access
// var pdfFileId = 'YOUR_PDF_FILE_ID';
// var attachmentFileId = 'YOUR_ATTACHMENT_FILE_ID';
```

To get file IDs:
1. Right-click the file in Google Drive
2. Select "Get link"
3. Copy the ID from the URL: `https://drive.google.com/file/d/FILE_ID/view`

## 📊 API Response Handling

The script handles multiple response scenarios:

### ✅ Immediate Success (200)
- Processing completes instantly
- PDF with attachment saved directly

### ⏳ Asynchronous Processing (202)
- Large files processed in background
- Automatic polling until completion
- Progress tracking with retry logic

### ❌ Error Handling
- Comprehensive error logging
- File validation checks
- Network timeout protection

## 🔧 Customization Options

### Supported Attachment Types

- **Documents**: .txt, .doc, .docx, .pdf
- **Images**: .jpg, .jpeg, .png, .gif, .bmp
- **Spreadsheets**: .xls, .xlsx, .csv
- **Presentations**: .ppt, .pptx
- **And more**: Any file type supported by PDF viewers

### Processing Parameters

```javascript
var payload = {
  docName: 'output.pdf',                    // Output filename
  docContent: pdfBase64,                    // PDF content (auto-generated)
  attachments: [                            // Array of attachments
    {
      docName: attachmentFile.getName(),    // Attachment filename
      docContent: attachmentBase64          // Attachment content (auto-generated)
    }
  ],
  async: true                               // Enable async processing
};
```

## 📝 Code Structure

### Main Function: `addAttachmentToPdf()`

```javascript
function addAttachmentToPdf() {
  // 1. Configuration setup
  // 2. File retrieval from Google Drive
  // 3. Base64 encoding
  // 4. API request preparation
  // 5. HTTP request execution
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
| **File not found** | Verify file exists in specified folder |
| **API key error** | Ensure valid PDF4me API key is configured |
| **Timeout errors** | Increase `maxRetries` or `retryDelay` values |
| **Invalid PDF response** | Check if API returned valid PDF data |

### Debug Mode

Enable detailed logging by checking the execution logs:

1. Run the script
2. Click **"View → Execution log"**
3. Review detailed progress information

## 📈 Performance Optimization

### Best Practices

- **File Size**: Keep individual files under 10MB for optimal performance
- **Batch Processing**: Process multiple files sequentially
- **Error Recovery**: Implement retry logic for network issues
- **Resource Management**: Clean up temporary variables

### Monitoring

```javascript
// Performance metrics logged automatically
Logger.log('PDF file size: ' + pdfBlob.getBytes().length);
Logger.log('Attachment file size: ' + attachmentBlob.getBytes().length);
Logger.log('Processing time: ' + (endTime - startTime) + 'ms');
```

## 🔗 Related Resources

- [📚 PDF4me API Documentation](https://dev.pdf4me.com/docs/)
- [🔧 Google Apps Script Guide](https://developers.google.com/apps-script)
- [📁 Google Drive API Reference](https://developers.google.com/drive/api)
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

*Transform your PDF workflows with powerful automation tools* 