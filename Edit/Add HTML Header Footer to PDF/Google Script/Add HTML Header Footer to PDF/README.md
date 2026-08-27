# 🎨 Add HTML Header Footer to PDF - Google Apps Script

**Automatically add custom HTML headers and footers to PDF documents using PDF4me API with Google Apps Script**

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![PDF4me API](https://img.shields.io/badge/PDF4me%20API-FF6B6B?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white)](https://dev.pdf4me.com/)
[![HTML Processing](https://img.shields.io/badge/HTML%20Processing-00D4AA?style=for-the-badge&logo=html5&logoColor=white)](https://dev.pdf4me.com/)

## 🚀 Overview

This Google Apps Script solution enables you to **automatically add custom HTML headers and footers to PDF documents** using the powerful PDF4me API. Perfect for branding, document customization, adding page numbers, company logos, and creating professional-looking PDF documents with consistent styling.

### ✨ Key Features

- 🎨 **Custom HTML Styling**: Full HTML support with CSS styling, fonts, colors, and layouts
- 📍 **Flexible Positioning**: Add headers, footers, or both with precise margin control
- 📄 **Page Selection**: Apply to all pages, specific pages, or skip the first page
- ⚡ **Asynchronous Processing**: Handles large files efficiently with background processing
- 🔧 **Easy Customization**: Simple HTML content modification for different use cases
- 🔒 **Secure**: Uses industry-standard API authentication
- 📊 **Comprehensive Logging**: Detailed progress tracking and error reporting

## 📋 Prerequisites

Before using this script, ensure you have:

- ✅ **Google Apps Script** access
- ✅ **PDF4me API Key** (Get it from [https://dev.pdf4me.com/dashboard/#/api-keys](https://dev.pdf4me.com/dashboard/#/api-keys))
- ✅ **Google Drive** with input and output folders
- ✅ **PDF file** to add headers/footers to
- ✅ **HTML content** for headers/footers (optional - sample provided)

## 🛠️ Installation & Setup

### Step 1: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click **"New Project"**
3. Replace the default code with the provided `add_html_header_footer_to_pdf.gs` script

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
2. **Customize HTML**: Modify the `htmlContent` in the script
3. **Run Script**: Execute the `addHtmlHeaderFooterToPdf()` function
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

## 🎨 HTML Content Customization

### Sample HTML Templates

#### Company Header
```html
<div style='text-align: center; font-family: Arial; font-size: 14px; color: #333; padding: 10px; border-bottom: 2px solid #007bff;'>
  <strong>Your Company Name</strong><br>
  Professional Document Header
</div>
```

#### Page Number Footer
```html
<div style='text-align: center; font-family: Arial; font-size: 10px; color: #666; padding: 5px;'>
  Page <span style='font-weight: bold;'>[PAGE]</span> of <span style='font-weight: bold;'>[TOTAL_PAGES]</span>
</div>
```

#### Logo Header
```html
<div style='text-align: left; padding: 10px;'>
  <img src='data:image/png;base64,YOUR_LOGO_BASE64' style='height: 40px;'>
  <span style='margin-left: 20px; font-family: Arial; font-size: 16px; color: #333;'>Document Title</span>
</div>
```

### Customization Parameters

```javascript
var payload = {
  htmlContent: "<div style='text-align: center; font-family: Arial; font-size: 12px; color: #FF0000;'>Document Header PDF4me </div>",  // Your HTML content
  location: "Header",                           // "Header", "Footer", or "Both"
  pages: "",                                    // Page selection (empty = all pages)
  skipFirstPage: false,                         // Skip first page (true/false)
  marginLeft: 20.0,                            // Left margin in pixels
  marginRight: 20.0,                           // Right margin in pixels
  marginTop: 50.0,                             // Top margin in pixels
  marginBottom: 50.0,                          // Bottom margin in pixels
  isAsync: true                                  // Enable async processing
};
```

## 📊 API Response Handling

The script handles multiple response scenarios:

### ✅ Immediate Success (200)
- Processing completes instantly
- PDF with HTML header/footer saved directly

### ⏳ Asynchronous Processing (202)
- Large files processed in background
- Automatic polling until completion
- Progress tracking with retry logic

### ❌ Error Handling
- Comprehensive error logging
- File validation checks
- Network timeout protection

## 🔧 Customization Options

### Location Options

- **Header**: Add HTML content to the top of each page
- **Footer**: Add HTML content to the bottom of each page
- **Both**: Add HTML content to both header and footer

### Page Selection

- **All Pages**: `""` (empty string)
- **Specific Pages**: `"1,3,5"` (comma-separated)
- **Page Range**: `"2-5"` (hyphen-separated)
- **Mixed**: `"1,3,7-10"` (combination)

### Margin Control

```javascript
marginLeft: 20.0,      // Left margin in pixels
marginRight: 20.0,     // Right margin in pixels
marginTop: 50.0,       // Top margin in pixels
marginBottom: 50.0,    // Bottom margin in pixels
```

## 📝 Code Structure

### Main Function: `addHtmlHeaderFooterToPdf()`

```javascript
function addHtmlHeaderFooterToPdf() {
  // 1. Configuration setup
  // 2. File retrieval from Google Drive
  // 3. Base64 encoding
  // 4. HTML content preparation
  // 5. API request execution
  // 6. Response handling (200/202)
  // 7. File saving to output folder
}
```

### Key Components

- **File Management**: Google Drive API integration
- **HTML Processing**: Custom HTML content handling
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
| **HTML not displaying** | Check HTML syntax and CSS styling |
| **Timeout errors** | Increase `maxRetries` or `retryDelay` values |
| **Invalid PDF response** | Check if API returned valid PDF data |

### Debug Mode

Enable detailed logging by checking the execution logs:

1. Run the script
2. Click **"View → Execution log"**
3. Review detailed progress information

## 📈 Performance Optimization

### Best Practices

- **HTML Size**: Keep HTML content under 10KB for optimal performance
- **Image Optimization**: Use compressed images in HTML content
- **CSS Efficiency**: Use inline styles for better compatibility
- **Batch Processing**: Process multiple files sequentially

### Monitoring

```javascript
// Performance metrics logged automatically
Logger.log('PDF file size: ' + pdfBlob.getBytes().length);
Logger.log('HTML content length: ' + payload.htmlContent.length);
Logger.log('Processing time: ' + (endTime - startTime) + 'ms');
```

## 🎨 Use Cases

### Business Applications

- **Company Branding**: Add logos and company information
- **Document Classification**: Include document types and categories
- **Page Numbering**: Professional page numbering systems
- **Legal Documents**: Add confidentiality notices and disclaimers

### Educational Applications

- **Course Materials**: Add course codes and instructor information
- **Assignment Headers**: Include student information and due dates
- **Research Papers**: Add institutional headers and page numbers

### Professional Services

- **Invoice Headers**: Add company details and invoice numbers
- **Report Footers**: Include contact information and disclaimers
- **Proposal Headers**: Add project titles and client information

## 🔗 Related Resources

- [📚 PDF4me API Documentation](https://dev.pdf4me.com/docs/)
- [🔧 Google Apps Script Guide](https://developers.google.com/apps-script)
- [📁 Google Drive API Reference](https://developers.google.com/drive/api)
- [🎨 HTML/CSS Reference](https://developer.mozilla.org/en-US/docs/Web/HTML)
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

*Transform your PDF documents with professional HTML headers and footers* 