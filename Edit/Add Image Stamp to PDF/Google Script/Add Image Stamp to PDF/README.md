# 🖼️ Add Image Stamp to PDF - Google Apps Script

**Automatically add image watermarks and stamps to PDF documents using PDF4me API with Google Apps Script**

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![PDF4me API](https://img.shields.io/badge/PDF4me%20API-FF6B6B?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white)](https://dev.pdf4me.com/)
[![Image Processing](https://img.shields.io/badge/Image%20Processing-00D4AA?style=for-the-badge&logo=image&logoColor=white)](https://dev.pdf4me.com/)

## 🚀 Overview

This Google Apps Script solution enables you to **automatically add image watermarks and stamps to PDF documents** using the powerful PDF4me API. Perfect for branding, copyright protection, document authentication, and creating professional-looking PDF documents with custom image overlays.

### ✨ Key Features

- 🖼️ **Multiple Image Formats**: Support for PNG, JPG, JPEG, GIF, BMP, and more
- 📍 **Precise Positioning**: Exact control over horizontal and vertical alignment
- 📏 **Flexible Sizing**: Both millimeter and pixel-based dimension control
- 🎨 **Opacity Control**: Adjustable transparency from 0-100%
- 📄 **Page Selection**: Apply to all pages, specific pages, or page ranges
- 🔄 **Background/Foreground**: Choose stamp placement layer
- ⚡ **Asynchronous Processing**: Handles large files efficiently
- 🔒 **Secure**: Uses industry-standard API authentication
- 📊 **Comprehensive Logging**: Detailed progress tracking and error reporting

## 📋 Prerequisites

Before using this script, ensure you have:

- ✅ **Google Apps Script** access
- ✅ **PDF4me API Key** (Get it from [https://dev.pdf4me.com/dashboard/#/api-keys](https://dev.pdf4me.com/dashboard/#/api-keys))
- ✅ **Google Drive** with input and output folders
- ✅ **PDF file** to add image stamps to
- ✅ **Image file** (PNG, JPG, JPEG, GIF, BMP supported)

## 🛠️ Installation & Setup

### Step 1: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click **"New Project"**
3. Replace the default code with the provided `add_image_stamp_to_pdf.gs` script

### Step 2: Configure API Key

```javascript
var apiKey = 'YOUR_PDF4ME_API_KEY_HERE'; // Replace with your actual API key
```

### Step 3: Set Up Google Drive Folders

Create the following folder structure in Google Drive:

```
📁 PDF4ME input/
   ├── 📄 sample.pdf (your main PDF file)
   └── 🖼️ pdf4me.png (your stamp image file)

📁 PDF4ME output/
   └── (processed files will be saved here)
```

### Step 4: Configure File Names

Update these variables in the script:

```javascript
var folderName = 'PDF4ME input';           // Your input folder name
var pdfFileName = 'sample.pdf';            // Your PDF file name
var imageFileName = 'pdf4me.png';          // Your image file name
var outputFolderName = 'PDF4ME output';    // Your output folder name
```

## 🎯 Usage

### Basic Usage

1. **Upload Files**: Place your PDF and image files in the input folder
2. **Customize Settings**: Modify stamp parameters in the script
3. **Run Script**: Execute the `addImageStampToPdf()` function
4. **Get Results**: Find your processed PDF in the output folder

### Advanced Configuration

#### Using File IDs (Alternative Method)

Instead of folder-based file lookup, you can use direct file IDs:

```javascript
// Uncomment and use these lines for file ID-based access
// var pdfFileId = 'YOUR_PDF_FILE_ID';
// var imageFileId = 'YOUR_IMAGE_FILE_ID';
```

To get file IDs:
1. Right-click the file in Google Drive
2. Select "Get link"
3. Copy the ID from the URL: `https://drive.google.com/file/d/FILE_ID/view`

## 🎨 Image Stamp Customization

### Positioning Options

#### Horizontal Alignment
- **Left**: `"Left"` - Aligns stamp to the left side
- **Center**: `"Center"` - Centers the stamp horizontally
- **Right**: `"Right"` - Aligns stamp to the right side

#### Vertical Alignment
- **Top**: `"Top"` - Aligns stamp to the top
- **Middle**: `"Middle"` - Centers the stamp vertically
- **Bottom**: `"Bottom"` - Aligns stamp to the bottom

### Size Control

#### Millimeter-based Sizing
```javascript
heightInMM: "30",    // Height in millimeters (10-200)
widthInMM: "30",     // Width in millimeters (10-200)
```

#### Pixel-based Sizing
```javascript
heightInPx: "85",    // Height in pixels (20-600)
widthInPx: "85",     // Width in pixels (20-600)
```

### Margin Control

#### Millimeter Margins
```javascript
marginXInMM: "10",   // Horizontal margin in millimeters (0-100)
marginYInMM: "10",   // Vertical margin in millimeters (0-100)
```

#### Pixel Margins
```javascript
marginXInPx: "28",   // Horizontal margin in pixels (0-300)
marginYInPx: "28",   // Vertical margin in pixels (0-300)
```

### Advanced Settings

```javascript
var payload = {
  opacity: 50,                              // Opacity (0-100): 0=invisible, 100=fully opaque
  isBackground: true,                       // Place stamp in background/foreground
  showOnlyInPrint: false,                   // Show in view and print
  pages: "",                                // Page selection (empty = all pages)
  async: true                               // Enable async processing
};
```

## 📊 API Response Handling

The script handles multiple response scenarios:

### ✅ Immediate Success (200)
- Processing completes instantly
- PDF with image stamp saved directly

### ⏳ Asynchronous Processing (202)
- Large files processed in background
- Automatic polling until completion
- Progress tracking with retry logic

### ❌ Error Handling
- Comprehensive error logging
- File validation checks
- Network timeout protection

## 🔧 Customization Options

### Page Selection

- **All Pages**: `""` (empty string)
- **Specific Pages**: `"1,3,5"` (comma-separated)
- **Page Range**: `"2-5"` (hyphen-separated)
- **Mixed**: `"1,3,7-10"` (combination)

### Opacity Settings

- **0**: Completely invisible
- **25**: Very transparent
- **50**: Semi-transparent (default)
- **75**: Mostly opaque
- **100**: Fully opaque

### Placement Options

- **Background**: `isBackground: true` - Stamp appears behind content
- **Foreground**: `isBackground: false` - Stamp appears over content
- **Print Only**: `showOnlyInPrint: true` - Visible only when printing

## 📝 Code Structure

### Main Function: `addImageStampToPdf()`

```javascript
function addImageStampToPdf() {
  // 1. Configuration setup
  // 2. File retrieval from Google Drive
  // 3. Base64 encoding for both PDF and image
  // 4. Image stamp parameters configuration
  // 5. API request execution
  // 6. Response handling (200/202)
  // 7. File saving to output folder
}
```

### Key Components

- **File Management**: Google Drive API integration for PDF and image files
- **Image Processing**: Support for multiple image formats
- **Data Encoding**: Base64 conversion for API transmission
- **HTTP Communication**: UrlFetchApp for API calls
- **Error Handling**: Comprehensive try-catch blocks
- **Logging**: Detailed progress tracking

## 🚨 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Folder not found** | Check folder name spelling and permissions |
| **PDF file not found** | Verify PDF exists in specified folder |
| **Image file not found** | Verify image exists in specified folder |
| **API key error** | Ensure valid PDF4me API key is configured |
| **Image not displaying** | Check image format and size limits |
| **Timeout errors** | Increase `maxRetries` or `retryDelay` values |
| **Invalid PDF response** | Check if API returned valid PDF data |

### Debug Mode

Enable detailed logging by checking the execution logs:

1. Run the script
2. Click **"View → Execution log"**
3. Review detailed progress information

## 📈 Performance Optimization

### Best Practices

- **Image Size**: Keep images under 5MB for optimal performance
- **Image Format**: Use PNG for transparency, JPG for photos
- **Resolution**: Optimize image resolution for intended stamp size
- **Batch Processing**: Process multiple files sequentially

### Monitoring

```javascript
// Performance metrics logged automatically
Logger.log('PDF file size: ' + pdfBlob.getBytes().length);
Logger.log('Image file size: ' + imageBlob.getBytes().length);
Logger.log('Processing time: ' + (endTime - startTime) + 'ms');
```

## 🎨 Use Cases

### Business Applications

- **Company Branding**: Add logos and company watermarks
- **Document Authentication**: Include security stamps and seals
- **Copyright Protection**: Add copyright notices and watermarks
- **Confidentiality**: Mark documents as confidential or internal

### Legal & Professional Services

- **Legal Documents**: Add notary stamps and signatures
- **Certificates**: Include official seals and stamps
- **Contracts**: Add approval stamps and signatures
- **Reports**: Include department or division stamps

### Educational & Creative

- **Course Materials**: Add institutional watermarks
- **Digital Art**: Include artist signatures and watermarks
- **Photography**: Add photographer credits and copyright
- **Presentations**: Include company branding

## 🔗 Related Resources

- [📚 PDF4me API Documentation](https://dev.pdf4me.com/docs/)
- [🔧 Google Apps Script Guide](https://developers.google.com/apps-script)
- [📁 Google Drive API Reference](https://developers.google.com/drive/api)
- [🖼️ Image Format Guide](https://developer.mozilla.org/en-US/docs/Web/Media/Formats)
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

*Transform your PDF documents with professional image stamps and watermarks* 