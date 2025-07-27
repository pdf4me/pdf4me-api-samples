# 📝 Add Form Fields to PDF - Google Apps Script

**Automatically add interactive form fields (TextBox, CheckBox) to PDF documents using PDF4me API and Google Apps Script for creating fillable forms and interactive documents**

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![PDF4me API](https://img.shields.io/badge/PDF4me%20API-FF6B6B?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white)](https://dev.pdf4me.com/)
[![Form Fields](https://img.shields.io/badge/Form%20Fields-00D4AA?style=for-the-badge&logo=file-pdf&logoColor=white)](https://dev.pdf4me.com/)

## 🚀 Overview

This Google Apps Script solution enables you to **automatically add interactive form fields to PDF documents** using the powerful PDF4me API. Perfect for converting static PDFs into fillable forms, creating surveys and questionnaires, building interactive documents, and transforming regular PDFs into dynamic, user-friendly forms. Ideal for businesses, educational institutions, government agencies, and organizations that need to create professional, interactive PDF forms for data collection and user engagement.

### ✨ Key Features

- 📝 **Interactive Form Fields**: Add TextBox and CheckBox form fields to PDF documents
- 🎯 **Precise Positioning**: Control exact X/Y coordinates for form field placement
- 📏 **Customizable Sizing**: Adjust form field size and dimensions
- 📄 **Page Targeting**: Add form fields to specific pages or entire documents
- 💬 **Initial Values**: Set default text or values for form fields
- 🏷️ **Field Naming**: Assign unique names to form fields for data processing
- ⚙️ **Asynchronous Processing**: Handle large files efficiently with background processing
- 🔒 **Secure**: Uses industry-standard API authentication
- 📊 **Comprehensive Logging**: Detailed progress tracking and field addition confirmation

## 📋 Prerequisites

Before using this script, ensure you have:

- ✅ **Google Apps Script** access
- ✅ **PDF4me API Key** (Get it from [https://dev.pdf4me.com/dashboard/#/api-keys](https://dev.pdf4me.com/dashboard/#/api-keys))
- ✅ **Google Drive** with input and output folders
- ✅ **PDF file** to add form fields to

## 🛠️ Installation & Setup

### Step 1: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click **"New Project"**
3. Replace the default code with the provided `add_form_fields_to_pdf.gs` script

### Step 2: Configure API Key

```javascript
var apiKey = 'YOUR_PDF4ME_API_KEY_HERE'; // Replace with your actual API key
```

### Step 3: Set Up Google Drive Folders

Create the following folder structure in Google Drive:

```
📁 PDF4ME input/
   └── 📄 sample.pdf (your PDF file to add form fields to)

📁 PDF4ME output/
   └── (PDFs with form fields will be saved here)
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
2. **Configure Form Fields**: Set field type, position, size, and properties
3. **Run Script**: Execute the `addFormFieldsToPdf()` function
4. **Get Results**: Find your interactive PDF in the output folder

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

## 📝 Form Field Configuration Options

### Field Types

#### TextBox Fields
```javascript
var formFieldType = "TextBox";           // Text input field
```
- **Use case**: Name fields, email addresses, phone numbers, addresses
- **Features**: Single-line text input with customizable size
- **Best for**: User information, contact details, short text responses

#### CheckBox Fields
```javascript
var formFieldType = "CheckBox";          // Checkbox field
```
- **Use case**: Yes/No questions, agreement checkboxes, multiple choice
- **Features**: Clickable checkbox with true/false values
- **Best for**: Agreements, confirmations, binary choices

### Positioning & Sizing

#### Basic Positioning
```javascript
var positionX = 300;                     // X coordinate (horizontal position)
var positionY = 300;                     // Y coordinate (vertical position)
var fieldSize = 4;                       // Size of the form field
```

#### Advanced Positioning Examples
```javascript
// Top-left corner positioning
var positionX = 50;                      // 50 pixels from left
var positionY = 750;                     // 750 pixels from bottom

// Center positioning
var positionX = 300;                     // Center horizontally
var positionY = 400;                     // Center vertically

// Bottom-right positioning
var positionX = 500;                     // 500 pixels from left
var positionY = 100;                     // 100 pixels from bottom
```

### Field Properties

#### Initial Values
```javascript
var initialValue = "Enter your name";    // Default text for text fields
var initialValue = "";                   // Empty for checkboxes
```

#### Field Naming
```javascript
var fieldName = "firstName";             // Unique field identifier
var fieldName = "agreeTerms";            // Descriptive field name
```

### Page Targeting

#### Page Selection Options

| Page Sequence | Description | Use Case |
|---------------|-------------|----------|
| `"1"` | Page 1 only | Title page forms |
| `"1, 2, 3"` | Specific pages | Multi-page forms |
| `"1-5"` | Page range | Section forms |
| `""` | All pages | Global forms |

#### Page Targeting Examples
```javascript
// Add field to first page only
var pages = "1";                         // Page 1

// Add field to multiple specific pages
var pages = "1, 3, 5";                   // Pages 1, 3, and 5

// Add field to page range
var pages = "2-4";                       // Pages 2 through 4

// Add field to all pages
var pages = "";                          // All pages
```

## 📊 API Response Handling

The script handles multiple response scenarios:

### ✅ Immediate Success (200)
- Processing completes instantly
- Interactive PDF saved directly
- Form field addition confirmed

### ⏳ Asynchronous Processing (202)
- Large files processed in background
- Automatic polling until completion
- Progress tracking with retry logic

### ❌ Error Handling
- Comprehensive error logging
- File validation checks
- Network timeout protection

## 🔧 Advanced Customization Options

### Form Field Strategies

#### Contact Information Form
```javascript
var payload = {
  formFieldType: "TextBox",              // Text input field
  fieldName: "contactName",              // Field identifier
  initialValue: "Enter your full name",  // Placeholder text
  positionX: 200,                        // Horizontal position
  positionY: 600,                        // Vertical position
  fieldSize: 6,                          // Field size
  pages: "1"                             // First page only
};
```

#### Agreement Checkbox
```javascript
var payload = {
  formFieldType: "CheckBox",             // Checkbox field
  fieldName: "agreeTerms",               // Field identifier
  initialValue: "",                      // Empty for checkbox
  positionX: 100,                        // Horizontal position
  positionY: 500,                        // Vertical position
  fieldSize: 2,                          // Checkbox size
  pages: "1"                             // First page only
};
```

#### Multi-Page Form
```javascript
var payload = {
  formFieldType: "TextBox",              // Text input field
  fieldName: "pageNumber",               // Field identifier
  initialValue: "Page info",             // Placeholder text
  positionX: 300,                        // Horizontal position
  positionY: 400,                        // Vertical position
  fieldSize: 4,                          // Field size
  pages: "1, 2, 3"                      // Multiple pages
};
```

### Use Case Configurations

#### Survey Form Creation
```javascript
// Question 1: Name field
var fieldName = "respondentName";
var initialValue = "Enter your name";
var positionX = 200;
var positionY = 700;

// Question 2: Email field
var fieldName = "respondentEmail";
var initialValue = "Enter your email";
var positionX = 200;
var positionY = 650;
```

#### Application Form Setup
```javascript
// Personal Information Section
var fieldName = "applicantName";
var initialValue = "Full Name";
var positionX = 150;
var positionY = 750;

// Contact Information Section
var fieldName = "phoneNumber";
var initialValue = "Phone Number";
var positionX = 150;
var positionY = 700;
```

#### Contract Form Fields
```javascript
// Signature field
var fieldName = "signature";
var initialValue = "Digital Signature";
var positionX = 200;
var positionY = 300;

// Date field
var fieldName = "signatureDate";
var initialValue = "Date";
var positionX = 400;
var positionY = 300;
```

## 📝 Code Structure

### Main Function: `addFormFieldsToPdf()`

```javascript
function addFormFieldsToPdf() {
  // 1. Configuration setup
  // 2. File retrieval from Google Drive
  // 3. Base64 encoding
  // 4. Form field parameters configuration
  // 5. API request execution
  // 6. Response handling (200/202)
  // 7. File saving to output folder
  // 8. Field addition confirmation logging
}
```

### Key Components

- **File Management**: Google Drive API integration
- **Data Encoding**: Base64 conversion for API transmission
- **HTTP Communication**: UrlFetchApp for API calls
- **Error Handling**: Comprehensive try-catch blocks
- **Logging**: Detailed progress tracking and field addition confirmation

## 🚨 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Folder not found** | Check folder name spelling and permissions |
| **File not found** | Verify PDF exists in specified folder |
| **API key error** | Ensure valid PDF4me API key is configured |
| **Field positioning** | Verify X/Y coordinates are within PDF bounds |
| **Field size issues** | Adjust fieldSize parameter (1-10 recommended) |
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

- **Field Positioning**: Use coordinates within PDF page bounds
- **Field Sizing**: Choose appropriate sizes (1-10 for most cases)
- **Page Targeting**: Specify pages to reduce processing time
- **Batch Processing**: Add multiple fields sequentially
- **Error Recovery**: Implement retry logic for network issues

### Monitoring

```javascript
// Performance metrics logged automatically
Logger.log('PDF file size: ' + pdfBlob.getBytes().length);
Logger.log('Form field configuration: ' + JSON.stringify(payload));
Logger.log('Field type: ' + formFieldType);
Logger.log('Position: (' + positionX + ', ' + positionY + ')');
```

## 🎨 Use Cases

### Business & Corporate

- **Application Forms**: Create job application forms with input fields
- **Survey Forms**: Build customer feedback and satisfaction surveys
- **Registration Forms**: Design user registration and signup forms
- **Contact Forms**: Create contact information collection forms
- **Order Forms**: Build product ordering and purchase forms

### Educational & Academic

- **Student Registration**: Create student enrollment forms
- **Course Evaluation**: Build course feedback and evaluation forms
- **Research Surveys**: Design academic research questionnaires
- **Attendance Forms**: Create attendance tracking forms
- **Assignment Submission**: Build assignment submission forms

### Healthcare & Medical

- **Patient Forms**: Create patient registration and medical history forms
- **Appointment Booking**: Build appointment scheduling forms
- **Medical Surveys**: Design health assessment questionnaires
- **Consent Forms**: Create medical consent and agreement forms
- **Prescription Forms**: Build prescription request forms

### Government & Public Sector

- **License Applications**: Create license and permit application forms
- **Tax Forms**: Build tax filing and declaration forms
- **Voting Registration**: Design voter registration forms
- **Public Surveys**: Create public opinion and feedback forms
- **Service Requests**: Build government service request forms

### Legal & Compliance

- **Contract Forms**: Create legal contract and agreement forms
- **Client Intake**: Build client information collection forms
- **Case Management**: Design case tracking and management forms
- **Compliance Forms**: Create regulatory compliance forms
- **Disclosure Forms**: Build legal disclosure and consent forms

### Real Estate & Property

- **Property Applications**: Create rental and purchase application forms
- **Inspection Forms**: Build property inspection and evaluation forms
- **Maintenance Requests**: Design maintenance request forms
- **Lease Agreements**: Create lease agreement forms
- **Property Surveys**: Build property assessment forms

### Financial & Banking

- **Account Applications**: Create bank account opening forms
- **Loan Applications**: Build loan and credit application forms
- **Investment Forms**: Design investment and portfolio forms
- **Insurance Forms**: Create insurance application forms
- **Financial Surveys**: Build financial planning questionnaires

### Technology & IT

- **Software Registration**: Create software license registration forms
- **Support Requests**: Build technical support request forms
- **Bug Reports**: Design bug reporting and feedback forms
- **Feature Requests**: Create feature request and enhancement forms
- **User Onboarding**: Build user onboarding and setup forms

## 🔗 Related Resources

- [📚 PDF4me API Documentation](https://dev.pdf4me.com/docs/)
- [🔧 Google Apps Script Guide](https://developers.google.com/apps-script)
- [📁 Google Drive API Reference](https://developers.google.com/drive/api)
- [📝 Form Field Guide](https://en.wikipedia.org/wiki/Form_(HTML))
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

*Transform static PDFs into interactive, fillable forms with precise control over field positioning, sizing, and properties for enhanced user engagement and data collection* 