# 📄 Add Page Number to PDF - Google Apps Script

**Automatically add customizable page numbers to PDF documents using PDF4me API with Google Apps Script**

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![PDF4me API](https://img.shields.io/badge/PDF4me%20API-FF6B6B?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white)](https://dev.pdf4me.com/)
[![PDF Navigation](https://img.shields.io/badge/PDF%20Navigation-00D4AA?style=for-the-badge&logo=file-pdf&logoColor=white)](https://dev.pdf4me.com/)

## 🚀 Overview

This Google Apps Script solution enables you to **automatically add customizable page numbers to PDF documents** using the powerful PDF4me API. Perfect for professional document formatting, academic papers, business reports, legal documents, and any PDF that requires proper page navigation with flexible formatting options.

### ✨ Key Features

- 📄 **Multiple Format Options**: Support for various page number formats (Page X of Y, X/Y, etc.)
- 📍 **Precise Positioning**: Control horizontal and vertical alignment with millimeter precision
- 🎨 **Font Customization**: Adjustable font size, bold, and italic styling
- 📏 **Margin Control**: Exact positioning with customizable margins
- ⚙️ **Flexible Configuration**: Skip first page or apply to all pages
- ⚡ **Asynchronous Processing**: Handles large files efficiently with background processing
- 🔒 **Secure**: Uses industry-standard API authentication
- 📊 **Comprehensive Logging**: Detailed progress tracking and error reporting

## 📋 Prerequisites

Before using this script, ensure you have:

- ✅ **Google Apps Script** access
- ✅ **PDF4me API Key** (Get it from [https://dev.pdf4me.com/dashboard/#/api-keys](https://dev.pdf4me.com/dashboard/#/api-keys))
- ✅ **Google Drive** with input and output folders
- ✅ **PDF file** to add page numbers to

## 🛠️ Installation & Setup

### Step 1: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click **"New Project"**
3. Replace the default code with the provided `add_page_number_to_pdf.gs` script

### Step 2: Configure API Key

```javascript
var apiKey = 'YOUR_PDF4ME_API_KEY_HERE'; // Replace with your actual API key
```

### Step 3: Set Up Google Drive Folders

Create the following folder structure in Google Drive:

```
📁 PDF4ME input/
   └── 📄 sample.pdf (your main PDF file)

📁 PDF4ME output/
   └── (processed files will be saved here)
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

1. **Upload PDF**: Place your PDF file in the input folder
2. **Customize Settings**: Modify page number parameters in the script
3. **Run Script**: Execute the `addPageNumberToPdf()` function
4. **Get Results**: Find your processed PDF in the output folder

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

## 📄 Page Number Customization

### Format Options

#### Standard Formats
```javascript
pageNumberFormat: "Page 0 of 1",              // "Page 1 of 10"
pageNumberFormat: "Page {0}",                  // "Page 1"
pageNumberFormat: "{0} of {1}",                // "1 of 10"
pageNumberFormat: "- {0} -",                   // "- 1 -"
pageNumberFormat: "[{0}/{1}]",                 // "[1/10]"
pageNumberFormat: "({0})",                     // "(1)"
pageNumberFormat: "{0}",                       // "1"
```

### Positioning Options

#### Horizontal Alignment
- **Left**: `"left"` - Aligns page numbers to the left
- **Center**: `"center"` - Centers page numbers horizontally
- **Right**: `"right"` - Aligns page numbers to the right

#### Vertical Alignment
- **Top**: `"top"` - Places page numbers at the top
- **Middle**: `"middle"` - Centers page numbers vertically
- **Bottom**: `"bottom"` - Places page numbers at the bottom

### Font Styling

```javascript
var payload = {
  fontSize: 12,                                 // Font size (8-72 points)
  isBold: true,                                 // Bold text (true/false)
  isItalic: false,                              // Italic text (true/false)
  marginXinMM: 10,                              // Horizontal margin (0-100mm)
  marginYinMM: 10,                              // Vertical margin (0-100mm)
  skipFirstPage: false,                         // Skip first page (true/false)
};
```

### Common Configurations

#### Professional Report Style
```javascript
pageNumberFormat: "Page {0} of {1}",           // "Page 1 of 10"
alignX: "center",                               // Center alignment
alignY: "bottom",                               // Bottom placement
fontSize: 10,                                   // Small, professional font
isBold: false,                                  // Regular weight
marginYinMM: 15,                                // 15mm from bottom
```

#### Academic Paper Style
```javascript
pageNumberFormat: "{0}",                        // Simple "1"
alignX: "right",                                // Right alignment
alignY: "bottom",                               // Bottom placement
fontSize: 12,                                   // Standard size
isBold: true,                                   // Bold for emphasis
skipFirstPage: true,                            // Skip title page
```

#### Legal Document Style
```javascript
pageNumberFormat: "Page {0} of {1}",           // "Page 1 of 5"
alignX: "center",                               // Center alignment
alignY: "bottom",                               // Bottom placement
fontSize: 11,                                   // Legal document size
isBold: false,                                  // Regular weight
marginYinMM: 20,                                // Generous bottom margin
```

## 📊 API Response Handling

The script handles multiple response scenarios:

### ✅ Immediate Success (200)
- Processing completes instantly
- PDF with page numbers saved directly

### ⏳ Asynchronous Processing (202)
- Large files processed in background
- Automatic polling until completion
- Progress tracking with retry logic

### ❌ Error Handling
- Comprehensive error logging
- File validation checks
- Network timeout protection

## 🔧 Customization Options

### Page Number Formats

- **Simple**: `"{0}"` - Just the page number
- **With Total**: `"{0} of {1}"` - Page and total pages
- **With "Page"**: `"Page {0}"` - Page with label
- **Full Format**: `"Page {0} of {1}"` - Complete format
- **Bracketed**: `"[{0}/{1}]"` - Bracket style
- **Parentheses**: `"({0})"` - Parentheses style
- **Dashed**: `"- {0} -"` - Dashed style

### Font Size Range

- **Minimum**: 8 points (very small)
- **Standard**: 10-12 points (recommended)
- **Large**: 14-16 points (emphasis)
- **Maximum**: 72 points (very large)

### Margin Control

- **Horizontal**: 0-100mm from page edge
- **Vertical**: 0-100mm from page edge
- **Precision**: Millimeter-level control
- **Flexibility**: Independent X and Y margins

## 📝 Code Structure

### Main Function: `addPageNumberToPdf()`

```javascript
function addPageNumberToPdf() {
  // 1. Configuration setup
  // 2. File retrieval from Google Drive
  // 3. Base64 encoding
  // 4. Page number parameters configuration
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
| **Font size too large** | Reduce fontSize (max 72 points) |
| **Margin too large** | Reduce margin values (max 100mm) |
| **Timeout errors** | Increase `maxRetries` or `retryDelay` values |
| **Invalid PDF response** | Check if API returned valid PDF data |

### Debug Mode

Enable detailed logging by checking the execution logs:

1. Run the script
2. Click **"View → Execution log"**
3. Review detailed progress information

## 📈 Performance Optimization

### Best Practices

- **Font Size**: Keep font size under 20 points for optimal performance
- **File Size**: Process files under 50MB for faster results
- **Batch Processing**: Process multiple files sequentially
- **Error Recovery**: Implement retry logic for network issues

### Monitoring

```javascript
// Performance metrics logged automatically
Logger.log('PDF file size: ' + pdfBlob.getBytes().length);
Logger.log('Page number configuration: ' + JSON.stringify(payload));
Logger.log('Processing time: ' + (endTime - startTime) + 'ms');
```

## 🎨 Use Cases

### Academic Applications

- **Research Papers**: Add page numbers for citations and references
- **Theses and Dissertations**: Include page numbers for academic requirements
- **Course Materials**: Add navigation to educational documents
- **Conference Papers**: Professional formatting for academic submissions

### Business Applications

- **Business Reports**: Professional page numbering for corporate documents
- **Proposals**: Add page numbers for client presentations
- **Manuals**: Include navigation for technical documentation
- **Presentations**: Convert presentations to numbered PDFs

### Legal & Professional Services

- **Legal Documents**: Add page numbers for court submissions
- **Contracts**: Include page numbers for legal document navigation
- **Certificates**: Professional formatting for official documents
- **Compliance Reports**: Add navigation to regulatory documents

### Creative & Publishing

- **Books and eBooks**: Add page numbers for publication
- **Magazines**: Include page numbers for editorial content
- **Portfolios**: Professional formatting for creative work
- **Catalogs**: Add navigation to product catalogs

## 🔗 Related Resources

- [📚 PDF4me API Documentation](https://dev.pdf4me.com/docs/)
- [🔧 Google Apps Script Guide](https://developers.google.com/apps-script)
- [📁 Google Drive API Reference](https://developers.google.com/drive/api)
- [📄 Academic Writing Standards](https://owl.purdue.edu/owl/purdue_owl.html)
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

*Transform your PDF documents with professional page numbering for better navigation and organization* 