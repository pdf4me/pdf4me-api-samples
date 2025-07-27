# 🔍 Find and Replace Text in PDF - Google Apps Script

**Automatically search for and replace specific text within PDF documents using PDF4me API and Google Apps Script for efficient document editing and batch text modifications**

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![PDF4me API](https://img.shields.io/badge/PDF4me%20API-FF6B6B?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white)](https://dev.pdf4me.com/)
[![Text Processing](https://img.shields.io/badge/Text%20Processing-00D4AA?style=for-the-badge&logo=file-pdf&logoColor=white)](https://dev.pdf4me.com/)

## 🚀 Overview

This Google Apps Script solution enables you to **automatically find and replace specific text within PDF documents** using the powerful PDF4me API. Perfect for updating documents, correcting errors, performing batch text modifications, standardizing terminology, and maintaining document consistency across large collections. Ideal for businesses, legal firms, educational institutions, and organizations that need to efficiently update multiple PDF documents with consistent text changes.

### ✨ Key Features

- 🔍 **Precise Text Search**: Find exact text matches within PDF documents
- 🔄 **Batch Replacement**: Replace text across multiple pages or entire documents
- 📄 **Page-Specific Control**: Target specific pages or page ranges for text replacement
- 🎯 **Format Preservation**: Maintain original document formatting and layout
- ⚙️ **Asynchronous Processing**: Handle large files efficiently with background processing
- 🔒 **Secure**: Uses industry-standard API authentication
- 📊 **Comprehensive Logging**: Detailed progress tracking and replacement confirmation
- 🚀 **High Performance**: Fast processing with intelligent text matching

## 📋 Prerequisites

Before using this script, ensure you have:

- ✅ **Google Apps Script** access
- ✅ **PDF4me API Key** (Get it from [https://dev.pdf4me.com/dashboard/#/api-keys](https://dev.pdf4me.com/dashboard/#/api-keys))
- ✅ **Google Drive** with input and output folders
- ✅ **PDF file** containing text to be replaced

## 🛠️ Installation & Setup

### Step 1: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click **"New Project"**
3. Replace the default code with the provided `find_and_replace_text.gs` script

### Step 2: Configure API Key

```javascript
var apiKey = 'YOUR_PDF4ME_API_KEY_HERE'; // Replace with your actual API key
```

### Step 3: Set Up Google Drive Folders

Create the following folder structure in Google Drive:

```
📁 PDF4ME input/
   └── 📄 sample.pdf (your PDF file with text to replace)

📁 PDF4ME output/
   └── (processed PDFs with replaced text will be saved here)
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
2. **Configure Text**: Set the text to find and replace
3. **Run Script**: Execute the `findAndReplaceText()` function
4. **Get Results**: Find your updated PDF in the output folder

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

## 🔍 Find and Replace Configuration Options

### Text Replacement Parameters

#### Basic Text Replacement
```javascript
var oldText = "This is some";        // Text to be searched and replaced
var newText = "Here is few";         // Text to replace with
var pageSequence = "1";              // Page indices (all pages if not specified)
```

#### Advanced Text Replacement
```javascript
// Replace company name across all pages
var oldText = "Old Company Name";
var newText = "New Company Name";
var pageSequence = "";               // Empty = all pages

// Replace specific text on page 1 only
var oldText = "Draft Version";
var newText = "Final Version";
var pageSequence = "1";              // Page 1 only

// Replace text on multiple specific pages
var oldText = "Confidential";
var newText = "Public";
var pageSequence = "1, 3, 5";        // Pages 1, 3, and 5
```

### Page Sequence Control

#### Page Targeting Options

| Page Sequence | Description | Use Case |
|---------------|-------------|----------|
| `""` | All pages | Global document updates |
| `"1"` | Page 1 only | Header/footer updates |
| `"1, 2, 3"` | Specific pages | Targeted corrections |
| `"1-5"` | Page range | Section updates |
| `"1, 3-7, 10"` | Mixed selection | Complex targeting |

#### Page Sequence Examples

```javascript
// Replace text on all pages
pageSequence = "";                   // All pages

// Replace text on first page only
pageSequence = "1";                  // Page 1

// Replace text on specific pages
pageSequence = "1, 3, 5";           // Pages 1, 3, and 5

// Replace text on page range
pageSequence = "2-5";               // Pages 2 through 5

// Replace text on mixed selection
pageSequence = "1, 3-7, 10";        // Pages 1, 3-7, and 10
```

## 📊 API Response Handling

The script handles multiple response scenarios:

### ✅ Immediate Success (200)
- Processing completes instantly
- Updated PDF saved directly
- Text replacement confirmed

### ⏳ Asynchronous Processing (202)
- Large files processed in background
- Automatic polling until completion
- Progress tracking with retry logic

### ❌ Error Handling
- Comprehensive error logging
- File validation checks
- Network timeout protection

## 🔧 Advanced Customization Options

### Text Replacement Strategies

#### Global Document Updates
```javascript
var payload = {
  oldText: "Old Company Name",       // Replace across entire document
  newText: "New Company Name",       // New company name
  pageSequence: "",                  // All pages
  async: true                        // Background processing
};
```

#### Targeted Page Updates
```javascript
var payload = {
  oldText: "Draft",                  // Replace on specific pages
  newText: "Final",                  // Final version indicator
  pageSequence: "1, 5",              // Title page and summary page
  async: true                        // Background processing
};
```

#### Batch Corrections
```javascript
var payload = {
  oldText: "teh",                    // Common typo
  newText: "the",                    // Corrected spelling
  pageSequence: "",                  // All pages
  async: true                        // Background processing
};
```

### Use Case Configurations

#### Legal Document Updates
```javascript
// Update legal document references
oldText = "Case Number: 2023-001";
newText = "Case Number: 2024-001";
pageSequence = "";                   // Update across entire document
```

#### Business Document Standardization
```javascript
// Standardize company terminology
oldText = "Our Company";
newText = "Acme Corporation";
pageSequence = "";                   // Global replacement
```

#### Academic Document Corrections
```javascript
// Fix academic citations
oldText = "Smith et al. (2020)";
newText = "Smith et al. (2021)";
pageSequence = "2-5";               // References section only
```

## 📝 Code Structure

### Main Function: `findAndReplaceText()`

```javascript
function findAndReplaceText() {
  // 1. Configuration setup
  // 2. File retrieval from Google Drive
  // 3. Base64 encoding
  // 4. Find and replace parameters configuration
  // 5. API request execution
  // 6. Response handling (200/202)
  // 7. File saving to output folder
  // 8. Replacement confirmation logging
}
```

### Key Components

- **File Management**: Google Drive API integration
- **Data Encoding**: Base64 conversion for API transmission
- **HTTP Communication**: UrlFetchApp for API calls
- **Error Handling**: Comprehensive try-catch blocks
- **Logging**: Detailed progress tracking and replacement confirmation

## 🚨 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Folder not found** | Check folder name spelling and permissions |
| **File not found** | Verify PDF exists in specified folder |
| **API key error** | Ensure valid PDF4me API key is configured |
| **Text not found** | Verify exact text spelling and case sensitivity |
| **Page sequence error** | Check page numbering (starts from 1) |
| **Timeout errors** | Increase `maxRetries` or `retryDelay` values |
| **Invalid PDF response** | Check if API returned valid PDF data |

### Debug Mode

Enable detailed logging by checking the execution logs:

1. Run the script
2. Click **"View → Execution log"**
3. Review detailed progress information

## 📈 Performance Optimization

### Best Practices

- **Text Precision**: Use exact text matches for better accuracy
- **Page Targeting**: Specify page ranges to reduce processing time
- **Batch Processing**: Process multiple documents sequentially
- **Error Recovery**: Implement retry logic for network issues
- **File Size**: Process files under 50MB for faster results

### Monitoring

```javascript
// Performance metrics logged automatically
Logger.log('PDF file size: ' + pdfBlob.getBytes().length);
Logger.log('Text replacement: "' + oldText + '" → "' + newText + '"');
Logger.log('Target pages: ' + pageSequence);
Logger.log('Processing time: ' + (endTime - startTime) + 'ms');
```

## 🎨 Use Cases

### Business & Corporate

- **Company Name Updates**: Update company names across all documents
- **Address Changes**: Replace old addresses with new ones
- **Contact Information**: Update phone numbers, emails, and contact details
- **Brand Standardization**: Ensure consistent brand terminology
- **Policy Updates**: Update policy numbers and references

### Legal & Compliance

- **Case Number Updates**: Update legal case references
- **Client Name Changes**: Replace client names across documents
- **Date Corrections**: Fix incorrect dates in legal documents
- **Citation Updates**: Update legal citations and references
- **Contract Amendments**: Modify contract terms and conditions

### Educational & Academic

- **Course Code Updates**: Update course codes across syllabi
- **Instructor Changes**: Replace instructor names and contact info
- **Date Corrections**: Fix academic calendar dates
- **Reference Updates**: Update academic citations and references
- **Grade Scale Changes**: Update grading criteria and scales

### Healthcare & Medical

- **Patient Information**: Update patient names and identifiers
- **Medical Codes**: Update ICD codes and medical terminology
- **Provider Changes**: Replace doctor names and credentials
- **Date Corrections**: Fix medical record dates
- **Protocol Updates**: Update medical protocols and procedures

### Government & Public Sector

- **Form Updates**: Update government form numbers and references
- **Department Changes**: Replace department names and codes
- **Policy Numbers**: Update policy and regulation numbers
- **Contact Updates**: Replace government contact information
- **Date Corrections**: Fix official document dates

### Publishing & Media

- **Author Updates**: Replace author names and affiliations
- **Publication Dates**: Update publication dates and references
- **ISBN Corrections**: Fix ISBN numbers in catalogs
- **Price Updates**: Update pricing information
- **Contact Changes**: Replace publisher contact information

### Real Estate & Property

- **Property Addresses**: Update property addresses and references
- **Agent Information**: Replace real estate agent details
- **Price Updates**: Update property prices and valuations
- **Date Corrections**: Fix listing and closing dates
- **Contact Changes**: Update contact information

### Financial & Banking

- **Account Numbers**: Update account references (with proper security)
- **Interest Rates**: Update interest rate information
- **Fee Structures**: Update fee schedules and charges
- **Date Corrections**: Fix financial document dates
- **Contact Updates**: Replace banking contact information

### Technology & IT

- **Version Numbers**: Update software version references
- **URL Changes**: Replace old URLs with new ones
- **API Endpoints**: Update API endpoint references
- **Date Corrections**: Fix technical document dates
- **Contact Updates**: Replace technical support contacts

## 🔗 Related Resources

- [📚 PDF4me API Documentation](https://dev.pdf4me.com/docs/)
- [🔧 Google Apps Script Guide](https://developers.google.com/apps-script)
- [📁 Google Drive API Reference](https://developers.google.com/drive/api)
- [🔍 Text Processing Guide](https://en.wikipedia.org/wiki/Text_processing)
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

*Efficiently find and replace text across PDF documents with precision and speed for streamlined document management and batch processing workflows* 