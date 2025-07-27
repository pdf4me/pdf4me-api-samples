# 📏 Add Margin to PDF - Google Apps Script

**Automatically add custom margins to PDF documents using PDF4me API with Google Apps Script**

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![PDF4me API](https://img.shields.io/badge/PDF4me%20API-FF6B6B?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white)](https://dev.pdf4me.com/)
[![PDF Formatting](https://img.shields.io/badge/PDF%20Formatting-00D4AA?style=for-the-badge&logo=file-pdf&logoColor=white)](https://dev.pdf4me.com/)

## 🚀 Overview

This Google Apps Script solution enables you to **automatically add custom margins to PDF documents** using the powerful PDF4me API. Perfect for print preparation, document binding, professional formatting, and ensuring your PDFs meet specific layout requirements with precise margin control.

### ✨ Key Features

- 📏 **Precise Margin Control**: Add margins to any side (left, right, top, bottom) with millimeter precision
- 📄 **Page Size Adjustment**: Automatically adjusts page size to accommodate new margins
- 🎯 **All Pages Support**: Applies margins consistently across all pages in the document
- ⚡ **Asynchronous Processing**: Handles large files efficiently with background processing
- 🔧 **Easy Customization**: Simple parameter adjustment for different margin requirements
- 🔒 **Secure**: Uses industry-standard API authentication
- 📊 **Comprehensive Logging**: Detailed progress tracking and error reporting

## 📋 Prerequisites

Before using this script, ensure you have:

- ✅ **Google Apps Script** access
- ✅ **PDF4me API Key** (Get it from [https://dev.pdf4me.com/dashboard/#/api-keys](https://dev.pdf4me.com/dashboard/#/api-keys))
- ✅ **Google Drive** with input and output folders
- ✅ **PDF file** to add margins to

## 🛠️ Installation & Setup

### Step 1: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click **"New Project"**
3. Replace the default code with the provided `add_margin_to_pdf.gs` script

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
2. **Customize Margins**: Modify margin values in the script
3. **Run Script**: Execute the `addMarginToPdf()` function
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

## 📏 Margin Customization

### Margin Parameters

```javascript
var payload = {
  marginLeft: 20,                               // Left margin in millimeters (0-100)
  marginRight: 20,                              // Right margin in millimeters (0-100)
  marginTop: 25,                                // Top margin in millimeters (0-100)
  marginBottom: 25,                             // Bottom margin in millimeters (0-100)
};
```

### Common Margin Configurations

#### Standard Print Margins
```javascript
marginLeft: 20,      // 20mm left margin
marginRight: 20,     // 20mm right margin
marginTop: 25,       // 25mm top margin
marginBottom: 25,    // 25mm bottom margin
```

#### Binding Margins
```javascript
marginLeft: 30,      // Extra left margin for binding
marginRight: 15,     // Standard right margin
marginTop: 20,       // Standard top margin
marginBottom: 20,    // Standard bottom margin
```

#### Minimal Margins
```javascript
marginLeft: 10,      // Minimal left margin
marginRight: 10,     // Minimal right margin
marginTop: 15,       // Minimal top margin
marginBottom: 15,    // Minimal bottom margin
```

#### Asymmetric Margins
```javascript
marginLeft: 25,      // Larger left margin
marginRight: 15,     // Smaller right margin
marginTop: 30,       // Larger top margin
marginBottom: 20,    // Standard bottom margin
```

## 📊 API Response Handling

The script handles multiple response scenarios:

### ✅ Immediate Success (200)
- Processing completes instantly
- PDF with margins saved directly

### ⏳ Asynchronous Processing (202)
- Large files processed in background
- Automatic polling until completion
- Progress tracking with retry logic

### ❌ Error Handling
- Comprehensive error logging
- File validation checks
- Network timeout protection

## 🔧 Customization Options

### Margin Range

- **Minimum**: 0mm (no margin)
- **Maximum**: 100mm per side
- **Precision**: Millimeter-level control
- **Flexibility**: Independent control for each side

### Page Size Impact

- **Automatic Adjustment**: Page size increases to accommodate margins
- **Content Preservation**: Original content remains unchanged
- **Proportional Scaling**: Maintains aspect ratio
- **Print Ready**: Optimized for printing and binding

## 📝 Code Structure

### Main Function: `addMarginToPdf()`

```javascript
function addMarginToPdf() {
  // 1. Configuration setup
  // 2. File retrieval from Google Drive
  // 3. Base64 encoding
  // 4. Margin parameters configuration
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
| **Margin too large** | Reduce margin values (max 100mm per side) |
| **Timeout errors** | Increase `maxRetries` or `retryDelay` values |
| **Invalid PDF response** | Check if API returned valid PDF data |

### Debug Mode

Enable detailed logging by checking the execution logs:

1. Run the script
2. Click **"View → Execution log"**
3. Review detailed progress information

## 📈 Performance Optimization

### Best Practices

- **Margin Size**: Keep margins under 50mm for optimal performance
- **File Size**: Process files under 50MB for faster results
- **Batch Processing**: Process multiple files sequentially
- **Error Recovery**: Implement retry logic for network issues

### Monitoring

```javascript
// Performance metrics logged automatically
Logger.log('PDF file size: ' + pdfBlob.getBytes().length);
Logger.log('Margin configuration: ' + JSON.stringify(payload));
Logger.log('Processing time: ' + (endTime - startTime) + 'ms');
```

## 🎨 Use Cases

### Print Preparation

- **Standard Printing**: Add standard margins for professional printing
- **Custom Print Jobs**: Adjust margins for specific printer requirements
- **Large Format**: Prepare documents for large format printing
- **Photo Printing**: Optimize margins for photo printing services

### Document Binding

- **Book Binding**: Add extra left margins for binding
- **Spiral Binding**: Adjust margins for spiral binding requirements
- **Staple Binding**: Optimize margins for stapled documents
- **Ring Binding**: Prepare documents for ring binder systems

### Professional Services

- **Legal Documents**: Standardize margins for legal document formatting
- **Business Reports**: Ensure consistent margins across company documents
- **Academic Papers**: Meet institutional margin requirements
- **Technical Manuals**: Optimize margins for technical documentation

### Creative Applications

- **Portfolio Preparation**: Add margins for professional portfolio presentation
- **Artwork Printing**: Prepare artwork for gallery printing
- **Photography**: Optimize margins for photo book creation
- **Design Projects**: Ensure proper margins for design deliverables

## 🔗 Related Resources

- [📚 PDF4me API Documentation](https://dev.pdf4me.com/docs/)
- [🔧 Google Apps Script Guide](https://developers.google.com/apps-script)
- [📁 Google Drive API Reference](https://developers.google.com/drive/api)
- [🖨️ Print Standards Guide](https://www.iso.org/standard/63539.html)
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

*Transform your PDF documents with precise margin control for professional printing and binding* 