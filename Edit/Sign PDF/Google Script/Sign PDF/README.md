# ✍️ Sign PDF - Google Apps Script

**Automatically add digital signatures and signature images to PDF documents using PDF4me API with Google Apps Script**

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![PDF4me API](https://img.shields.io/badge/PDF4me%20API-FF6B6B?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white)](https://dev.pdf4me.com/)
[![Digital Signature](https://img.shields.io/badge/Digital%20Signature-00D4AA?style=for-the-badge&logo=file-pdf&logoColor=white)](https://dev.pdf4me.com/)

## 🚀 Overview

This Google Apps Script solution enables you to **automatically add digital signatures and signature images to PDF documents** using the powerful PDF4me API. Perfect for document authentication, legal compliance, approval workflows, contract signing, and professional document processing with precise signature positioning and customization options.

### ✨ Key Features

- ✍️ **Digital Signature Support**: Add signature images to PDF documents
- 📍 **Precise Positioning**: Control horizontal and vertical alignment with millimeter/pixel precision
- 📏 **Size Control**: Adjustable signature width and height in millimeters and pixels
- 🎨 **Visual Customization**: Opacity control and layer placement options
- 📄 **Page Targeting**: Apply signatures to specific pages or page ranges
- ⚙️ **Layer Control**: Place signatures in background or foreground
- 🖨️ **Print Options**: Show signatures in view/print or print-only mode
- ⚡ **Asynchronous Processing**: Handles large files efficiently with background processing
- 🔒 **Secure**: Uses industry-standard API authentication
- 📊 **Comprehensive Logging**: Detailed progress tracking and error reporting

## 📋 Prerequisites

Before using this script, ensure you have:

- ✅ **Google Apps Script** access
- ✅ **PDF4me API Key** (Get it from [https://dev.pdf4me.com/dashboard/#/api-keys](https://dev.pdf4me.com/dashboard/#/api-keys))
- ✅ **Google Drive** with input and output folders
- ✅ **PDF file** to add signatures to
- ✅ **Signature image file** (JPG, PNG, or other image formats)

## 🛠️ Installation & Setup

### Step 1: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click **"New Project"**
3. Replace the default code with the provided `sign_pdf.gs` script

### Step 2: Configure API Key

```javascript
var apiKey = 'YOUR_PDF4ME_API_KEY_HERE'; // Replace with your actual API key
```

### Step 3: Set Up Google Drive Folders

Create the following folder structure in Google Drive:

```
📁 PDF4ME input/
   ├── 📄 sample.pdf (your main PDF file)
   └── 🖼️ dev.jpg (your signature image file)

📁 PDF4ME output/
   └── (signed PDFs will be saved here)
```

### Step 4: Configure File Names

Update these variables in the script:

```javascript
var folderName = 'PDF4ME input';           // Your input folder name
var pdfFileName = 'sample.pdf';            // Your PDF file name
var signatureFileName = 'dev.jpg';         // Your signature image file name
var outputFolderName = 'PDF4ME output';    // Your output folder name
```

## 🎯 Usage

### Basic Usage

1. **Upload Files**: Place your PDF and signature image in the input folder
2. **Customize Settings**: Modify signature positioning and styling parameters
3. **Run Script**: Execute the `signPdf()` function
4. **Get Results**: Find your signed PDF in the output folder

### Advanced Configuration

#### Using File IDs (Alternative Method)

Instead of folder-based file lookup, you can use direct file IDs:

```javascript
// Uncomment and use these lines for file ID-based access
// var pdfFileId = 'YOUR_PDF_FILE_ID';
// var signatureFileId = 'YOUR_SIGNATURE_FILE_ID';
```

To get file IDs:
1. Right-click the file in Google Drive
2. Select "Get link"
3. Copy the ID from the URL: `https://drive.google.com/file/d/FILE_ID/view`

## ✍️ Signature Customization

### Signature Image Requirements

#### Supported Formats
- **JPG/JPEG**: Most common signature format
- **PNG**: High-quality signature with transparency support
- **GIF**: Animated signatures (static frame used)
- **BMP**: Basic bitmap format
- **TIFF**: High-resolution signature format

#### Image Quality Guidelines
- **Resolution**: 300 DPI or higher for crisp signatures
- **Background**: Transparent or white background recommended
- **Size**: Original image should be larger than intended signature size
- **Format**: PNG with transparency for best results

### Positioning Options

#### Horizontal Alignment
- **Left**: `"left"` - Aligns signature to the left
- **Center**: `"center"` - Centers signature horizontally
- **Right**: `"right"` - Aligns signature to the right

#### Vertical Alignment
- **Top**: `"top"` - Places signature at the top
- **Middle**: `"middle"` - Centers signature vertically
- **Bottom**: `"bottom"` - Places signature at the bottom

### Size Control Options

```javascript
var payload = {
  widthInMM: "50",                              // Width in millimeters (10-200)
  heightInMM: "25",                             // Height in millimeters (10-200)
  widthInPx: "142",                             // Width in pixels (20-600)
  heightInPx: "71",                             // Height in pixels (20-600)
  marginXInMM: "20",                            // Horizontal margin in millimeters (0-100)
  marginYInMM: "20",                            // Vertical margin in millimeters (0-100)
  marginXInPx: "57",                            // Horizontal margin in pixels (0-300)
  marginYInPx: "57",                            // Vertical margin in pixels (0-300)
  opacity: "100",                               // Opacity (0-100%)
  showOnlyInPrint: true,                        // Show in view/print or print-only
  isBackground: false,                          // Background/foreground placement
};
```

### Common Configurations

#### Legal Document Signature
```javascript
pages: "1",                                     // Sign only first page
alignX: "right",                                // Right alignment
alignY: "bottom",                               // Bottom placement
widthInMM: "60",                                // 60mm width
heightInMM: "30",                               // 30mm height
marginXInMM: "25",                              // 25mm from right edge
marginYInMM: "25",                              // 25mm from bottom edge
opacity: "100",                                 // Fully opaque
showOnlyInPrint: false,                         // Show in view and print
isBackground: false,                            // Foreground placement
```

#### Contract Signature
```javascript
pages: "all",                                   // Sign all pages
alignX: "center",                               // Center alignment
alignY: "bottom",                               // Bottom placement
widthInMM: "50",                                // 50mm width
heightInMM: "25",                               // 25mm height
marginYInMM: "30",                              // 30mm from bottom edge
opacity: "100",                                 // Fully opaque
showOnlyInPrint: true,                          // Print-only visibility
isBackground: false,                            // Foreground placement
```

#### Approval Stamp Style
```javascript
pages: "1",                                     // Sign only first page
alignX: "right",                                // Right alignment
alignY: "top",                                  // Top placement
widthInMM: "40",                                // 40mm width
heightInMM: "20",                               // 20mm height
marginXInMM: "20",                              // 20mm from right edge
marginYInMM: "20",                              // 20mm from top edge
opacity: "80",                                  // 80% opacity
showOnlyInPrint: false,                         // Show in view and print
isBackground: true,                             // Background placement
```

## 📄 Page Targeting Options

### Page Selection

```javascript
pages: "1",                                     // Apply to page 1 only
pages: "1-3",                                   // Apply to pages 1 through 3
pages: "1,3,5",                                 // Apply to pages 1, 3, and 5
pages: "2-5",                                   // Apply to pages 2 through 5
pages: "1,3,7-10",                              // Apply to pages 1, 3, and 7-10
pages: "2-",                                    // Apply from page 2 onwards
pages: "all",                                   // Apply to all pages
```

## 📊 API Response Handling

The script handles multiple response scenarios:

### ✅ Immediate Success (200)
- Processing completes instantly
- Signed PDF saved directly

### ⏳ Asynchronous Processing (202)
- Large files processed in background
- Automatic polling until completion
- Progress tracking with retry logic

### ❌ Error Handling
- Comprehensive error logging
- File validation checks
- Network timeout protection

## 🔧 Advanced Customization Options

### Size Control

#### Millimeter Sizing
- **Width Range**: 10-200mm
- **Height Range**: 10-200mm
- **Precision**: Millimeter-level control
- **Use Cases**: Print-ready documents, legal requirements

#### Pixel Sizing
- **Width Range**: 20-600 pixels
- **Height Range**: 20-600 pixels
- **Precision**: Pixel-level control
- **Use Cases**: Digital documents, screen viewing

### Margin Control

#### Millimeter Margins
```javascript
marginXInMM: "20",                             // 20mm from left/right edge
marginYInMM: "20",                             // 20mm from top/bottom edge
```

#### Pixel Margins
```javascript
marginXInPx: "57",                             // 57 pixels from left/right edge
marginYInPx: "57",                             // 57 pixels from top/bottom edge
```

### Opacity Control

- **0%**: Completely invisible (useful for testing)
- **25-50%**: Subtle signature appearance
- **75-90%**: Standard signature visibility
- **100%**: Fully opaque signature (default)

### Layer Placement

```javascript
isBackground: false,                            // Place in front of content
isBackground: true,                             // Place behind content
```

### Print Options

```javascript
showOnlyInPrint: false,                        // Show in view and print
showOnlyInPrint: true,                         // Show only when printing
```

## 📝 Code Structure

### Main Function: `signPdf()`

```javascript
function signPdf() {
  // 1. Configuration setup
  // 2. File retrieval from Google Drive (PDF + signature)
  // 3. Base64 encoding for both files
  // 4. Signature parameters configuration
  // 5. API request execution
  // 6. Response handling (200/202)
  // 7. File saving to output folder
}
```

### Key Components

- **Dual File Management**: Google Drive API integration for PDF and signature
- **Data Encoding**: Base64 conversion for both files
- **HTTP Communication**: UrlFetchApp for API calls
- **Error Handling**: Comprehensive try-catch blocks
- **Logging**: Detailed progress tracking

## 🚨 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Folder not found** | Check folder name spelling and permissions |
| **PDF file not found** | Verify PDF exists in specified folder |
| **Signature file not found** | Verify signature image exists in specified folder |
| **API key error** | Ensure valid PDF4me API key is configured |
| **Signature too large** | Reduce widthInMM/heightInMM values (max 200mm) |
| **Signature too small** | Increase widthInMM/heightInMM values (min 10mm) |
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

- **Signature Size**: Keep signature dimensions under 100x50mm for optimal performance
- **File Size**: Process files under 50MB for faster results
- **Image Format**: Use PNG or JPG for best compatibility
- **Batch Processing**: Process multiple files sequentially
- **Error Recovery**: Implement retry logic for network issues

### Monitoring

```javascript
// Performance metrics logged automatically
Logger.log('PDF file size: ' + pdfBlob.getBytes().length);
Logger.log('Signature file size: ' + signatureBlob.getBytes().length);
Logger.log('Signature configuration: ' + JSON.stringify(payload));
Logger.log('Processing time: ' + (endTime - startTime) + 'ms');
```

## 🎨 Use Cases

### Legal & Compliance

- **Legal Documents**: Add signatures to contracts and legal agreements
- **Court Documents**: Sign legal filings and court submissions
- **Compliance Reports**: Add approval signatures to regulatory documents
- **Notarized Documents**: Include notary signatures on official documents

### Business Applications

- **Contract Signing**: Add signatures to business contracts and agreements
- **Approval Workflows**: Include approval signatures on documents
- **Purchase Orders**: Sign purchase orders and invoices
- **Employment Documents**: Add signatures to employment contracts

### Financial Services

- **Loan Documents**: Sign loan agreements and mortgage documents
- **Insurance Forms**: Add signatures to insurance applications
- **Banking Documents**: Sign account opening forms and agreements
- **Investment Documents**: Add signatures to investment agreements

### Healthcare

- **Medical Forms**: Sign patient consent forms and medical records
- **Insurance Claims**: Add signatures to insurance claim forms
- **Prescriptions**: Sign digital prescriptions and medical orders
- **HIPAA Documents**: Sign privacy and consent documents

### Government & Public Sector

- **Government Forms**: Add signatures to official government documents
- **Permits**: Sign building permits and licenses
- **Tax Documents**: Add signatures to tax returns and forms
- **Public Records**: Sign official public records and documents

### Creative & Media

- **Content Licensing**: Sign content licensing agreements
- **Artist Contracts**: Add signatures to artist and performer contracts
- **Publishing Agreements**: Sign book publishing and media contracts
- **Intellectual Property**: Sign IP transfer and licensing documents

## 🔗 Related Resources

- [📚 PDF4me API Documentation](https://dev.pdf4me.com/docs/)
- [🔧 Google Apps Script Guide](https://developers.google.com/apps-script)
- [📁 Google Drive API Reference](https://developers.google.com/drive/api)
- [✍️ Digital Signature Standards](https://www.iso.org/standard/63557.html)
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

*Streamline your document signing workflows with professional digital signatures for enhanced security and legal compliance* 