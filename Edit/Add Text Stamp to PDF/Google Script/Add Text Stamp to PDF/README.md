# 🏷️ Add Text Stamp to PDF - Google Apps Script

**Automatically add customizable text watermarks and stamps to PDF documents using PDF4me API with Google Apps Script**

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![PDF4me API](https://img.shields.io/badge/PDF4me%20API-FF6B6B?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white)](https://dev.pdf4me.com/)
[![PDF Watermark](https://img.shields.io/badge/PDF%20Watermark-00D4AA?style=for-the-badge&logo=file-pdf&logoColor=white)](https://dev.pdf4me.com/)

## 🚀 Overview

This Google Apps Script solution enables you to **automatically add customizable text watermarks and stamps to PDF documents** using the powerful PDF4me API. Perfect for document security, branding, confidentiality notices, copyright protection, and professional document identification with advanced formatting and positioning options.

### ✨ Key Features

- 🏷️ **Custom Text Watermarks**: Add any text as a watermark or stamp
- 📍 **Precise Positioning**: Control horizontal and vertical alignment with millimeter/pixel precision
- 🎨 **Advanced Styling**: Font customization, colors, bold, italic, underline effects
- 🌊 **Opacity Control**: Adjust transparency from 0% (invisible) to 100% (fully opaque)
- 🔄 **Rotation Options**: 0° (horizontal), 45° (diagonal), 90° (vertical), -45° (reverse diagonal)
- 📄 **Page Targeting**: Apply to all pages or specific page ranges
- ⚙️ **Layer Control**: Place stamps in background or foreground
- ⚡ **Asynchronous Processing**: Handles large files efficiently with background processing
- 🔒 **Secure**: Uses industry-standard API authentication
- 📊 **Comprehensive Logging**: Detailed progress tracking and error reporting

## 📋 Prerequisites

Before using this script, ensure you have:

- ✅ **Google Apps Script** access
- ✅ **PDF4me API Key** (Get it from [https://dev.pdf4me.com/dashboard/#/api-keys](https://dev.pdf4me.com/dashboard/#/api-keys))
- ✅ **Google Drive** with input and output folders
- ✅ **PDF file** to add text stamps to

## 🛠️ Installation & Setup

### Step 1: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click **"New Project"**
3. Replace the default code with the provided `add_text_stamp_to_pdf.gs` script

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
2. **Customize Text**: Modify the watermark text and styling parameters
3. **Run Script**: Execute the `addTextStampToPdf()` function
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

## 🏷️ Text Stamp Customization

### Text Content Options

#### Standard Watermark Text
```javascript
text: "CONFIDENTIAL - PDF4me Watermark",      // Default watermark text
text: "DRAFT - For Review Only",               // Draft watermark
text: "© 2024 Company Name",                   // Copyright notice
text: "CONFIDENTIAL - Internal Use Only",      // Confidentiality notice
text: "APPROVED - Final Version",              // Approval stamp
```

### Positioning Options

#### Horizontal Alignment
- **Left**: `"left"` - Aligns text stamp to the left
- **Center**: `"center"` - Centers text stamp horizontally
- **Right**: `"right"` - Aligns text stamp to the right

#### Vertical Alignment
- **Top**: `"top"` - Places text stamp at the top
- **Middle**: `"middle"` - Centers text stamp vertically
- **Bottom**: `"bottom"` - Places text stamp at the bottom

### Font Styling Options

```javascript
var payload = {
  fontName: "Arial",                            // Font family options
  fontSize: 24,                                 // Font size (8-72 points)
  fontColor: "#FF0000",                         // Font color (hex code)
  isBold: true,                                 // Bold text (true/false)
  isItalics: false,                             // Italic text (true/false)
  underline: false,                             // Underline text (true/false)
  opacity: "30",                                // Opacity (0-100%)
  rotate: 45,                                   // Rotation angle (degrees)
};
```

### Available Fonts

- **Arial**: Clean, modern sans-serif font
- **Times New Roman**: Traditional serif font
- **Helvetica**: Professional sans-serif font
- **Courier New**: Monospace font for technical documents

### Color Options

```javascript
fontColor: "#000000",                          // Black
fontColor: "#FF0000",                          // Red
fontColor: "#0000FF",                          // Blue
fontColor: "#808080",                          // Gray
fontColor: "#00FF00",                          // Green
fontColor: "#FFA500",                          // Orange
fontColor: "#800080",                          // Purple
```

### Common Configurations

#### Confidentiality Watermark
```javascript
text: "CONFIDENTIAL - Internal Use Only",      // Confidentiality text
alignX: "center",                               // Center alignment
alignY: "middle",                               // Middle placement
fontSize: 36,                                   // Large, prominent font
fontColor: "#FF0000",                          // Red color for emphasis
opacity: "25",                                  // Subtle opacity
rotate: 45,                                     // Diagonal placement
isBackground: true,                             // Background placement
```

#### Copyright Notice
```javascript
text: "© 2024 Company Name. All rights reserved.", // Copyright text
alignX: "right",                                // Right alignment
alignY: "bottom",                               // Bottom placement
fontSize: 12,                                   // Small, unobtrusive font
fontColor: "#808080",                          // Gray color
opacity: "15",                                  // Very subtle opacity
rotate: 0,                                      // Horizontal placement
isBackground: true,                             // Background placement
```

#### Draft Stamp
```javascript
text: "DRAFT - For Review Only",               // Draft text
alignX: "center",                               // Center alignment
alignY: "middle",                               // Middle placement
fontSize: 48,                                   // Large, prominent font
fontColor: "#FFA500",                          // Orange color
opacity: "40",                                  // Medium opacity
rotate: 45,                                     // Diagonal placement
isBold: true,                                   // Bold for emphasis
isBackground: true,                             // Background placement
```

## 📄 Page Targeting Options

### Page Selection

```javascript
pages: "all",                                   // Apply to all pages
pages: "1",                                     // Apply to page 1 only
pages: "1,3,5",                                 // Apply to pages 1, 3, and 5
pages: "2-5",                                   // Apply to pages 2 through 5
pages: "1,3,7-10",                              // Apply to pages 1, 3, and 7-10
pages: "2-",                                    // Apply from page 2 onwards
```

## 📊 API Response Handling

The script handles multiple response scenarios:

### ✅ Immediate Success (200)
- Processing completes instantly
- PDF with text stamp saved directly

### ⏳ Asynchronous Processing (202)
- Large files processed in background
- Automatic polling until completion
- Progress tracking with retry logic

### ❌ Error Handling
- Comprehensive error logging
- File validation checks
- Network timeout protection

## 🔧 Advanced Customization Options

### Opacity Control

- **0%**: Completely invisible (useful for testing)
- **10-20%**: Very subtle watermark
- **25-40%**: Standard watermark visibility
- **50-70%**: Prominent watermark
- **80-100%**: Very prominent or stamp-like

### Rotation Angles

- **0°**: Horizontal text (standard)
- **45°**: Diagonal watermark (most common)
- **90°**: Vertical text
- **-45°**: Reverse diagonal
- **Custom**: Any angle between -360° and 360°

### Margin Control

#### Millimeter Margins
```javascript
marginXInMM: "50",                             // 50mm from left edge
marginYInMM: "50",                             // 50mm from top edge
```

#### Pixel Margins
```javascript
marginXInPx: "150",                            // 150 pixels from left edge
marginYInPx: "150",                            // 150 pixels from top edge
```

### Layer Placement

```javascript
isBackground: true,                             // Place behind content
isBackground: false,                            // Place in front of content
```

### Print Options

```javascript
showOnlyInPrint: false,                        // Show in view and print
showOnlyInPrint: true,                         // Show only when printing
```

## 📝 Code Structure

### Main Function: `addTextStampToPdf()`

```javascript
function addTextStampToPdf() {
  // 1. Configuration setup
  // 2. File retrieval from Google Drive
  // 3. Base64 encoding
  // 4. Text stamp parameters configuration
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
| **Opacity too high** | Reduce opacity value (max 100%) |
| **Rotation angle invalid** | Use angles between -360° and 360° |
| **Timeout errors** | Increase `maxRetries` or `retryDelay` values |
| **Invalid PDF response** | Check if API returned valid PDF data |

### Debug Mode

Enable detailed logging by checking the execution logs:

1. Run the script
2. Click **"View → Execution log"**
3. Review detailed progress information

## 📈 Performance Optimization

### Best Practices

- **Font Size**: Keep font size under 50 points for optimal performance
- **File Size**: Process files under 50MB for faster results
- **Opacity**: Use 10-40% opacity for best balance of visibility and performance
- **Batch Processing**: Process multiple files sequentially
- **Error Recovery**: Implement retry logic for network issues

### Monitoring

```javascript
// Performance metrics logged automatically
Logger.log('PDF file size: ' + pdfBlob.getBytes().length);
Logger.log('Text stamp configuration: ' + JSON.stringify(payload));
Logger.log('Processing time: ' + (endTime - startTime) + 'ms');
```

## 🎨 Use Cases

### Document Security

- **Confidentiality Watermarks**: Add "CONFIDENTIAL" stamps to sensitive documents
- **Copyright Protection**: Include copyright notices on intellectual property
- **Access Control**: Add user-specific watermarks for tracking
- **Version Control**: Stamp documents with version numbers and dates

### Business Applications

- **Company Branding**: Add company logos and names to documents
- **Approval Stamps**: Include "APPROVED" or "REVIEWED" stamps
- **Draft Notifications**: Mark documents as "DRAFT" or "FOR REVIEW"
- **Client Presentations**: Add client-specific watermarks

### Legal & Compliance

- **Legal Documents**: Add "LEGAL COPY" or "OFFICIAL DOCUMENT" stamps
- **Compliance Notices**: Include regulatory compliance watermarks
- **Contract Protection**: Add terms and conditions watermarks
- **Evidence Marking**: Stamp documents with case numbers

### Academic & Publishing

- **Research Papers**: Add institutional watermarks
- **Theses**: Include university branding
- **Publications**: Add publisher watermarks
- **Course Materials**: Include educational institution branding

### Creative & Media

- **Photography**: Add photographer watermarks
- **Design Work**: Include designer credits
- **Digital Art**: Add artist signatures
- **Video Frames**: Add production company watermarks

## 🔗 Related Resources

- [📚 PDF4me API Documentation](https://dev.pdf4me.com/docs/)
- [🔧 Google Apps Script Guide](https://developers.google.com/apps-script)
- [📁 Google Drive API Reference](https://developers.google.com/drive/api)
- [🏷️ PDF Watermarking Best Practices](https://www.adobe.com/acrobat/online/add-watermark-pdf.html)
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

*Secure and brand your PDF documents with professional text watermarks and stamps for enhanced document protection and identification* 