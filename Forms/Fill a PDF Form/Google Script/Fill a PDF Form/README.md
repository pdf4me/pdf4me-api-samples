# 📋 Fill PDF Form - Google Apps Script

**Automatically fill existing form fields in PDF documents with provided data using PDF4me API and Google Apps Script for automated form processing and document generation**

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![PDF4me API](https://img.shields.io/badge/PDF4me%20API-FF6B6B?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white)](https://dev.pdf4me.com/)
[![Form Filling](https://img.shields.io/badge/Form%20Filling-00D4AA?style=for-the-badge&logo=file-pdf&logoColor=white)](https://dev.pdf4me.com/)

## 🚀 Overview

This Google Apps Script solution enables you to **automatically fill existing form fields in PDF documents with provided data** using the powerful PDF4me API. Perfect for automated form processing, batch data entry, document generation, and transforming template PDFs into completed documents. Ideal for businesses, government agencies, educational institutions, and organizations that need to efficiently process large volumes of forms, generate personalized documents, and automate repetitive data entry tasks.

### ✨ Key Features

- 📋 **Form Field Filling**: Automatically fill existing form fields with provided data
- 🔄 **Batch Processing**: Process multiple forms with different data sets
- 📊 **Data Array Support**: Use JSON data arrays for structured form filling
- 🎯 **Field Type Support**: Handle text fields, checkboxes, dropdowns, and more
- 📄 **Template Processing**: Use PDF templates to generate completed documents
- ⚙️ **Asynchronous Processing**: Handle large files efficiently with background processing
- 🔒 **Secure**: Uses industry-standard API authentication
- 📊 **Comprehensive Logging**: Detailed progress tracking and form filling confirmation
- 🚀 **High Performance**: Fast processing with intelligent field matching

## 📋 Prerequisites

Before using this script, ensure you have:

- ✅ **Google Apps Script** access
- ✅ **PDF4me API Key** (Get it from [https://dev.pdf4me.com/dashboard/#/api-keys](https://dev.pdf4me.com/dashboard/#/api-keys))
- ✅ **Google Drive** with input and output folders
- ✅ **PDF form template** with existing form fields
- ✅ **Form field data** to fill the template

## 🛠️ Installation & Setup

### Step 1: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click **"New Project"**
3. Replace the default code with the provided `fill_pdf_form.gs` script

### Step 2: Configure API Key

```javascript
var apiKey = 'YOUR_PDF4ME_API_KEY_HERE'; // Replace with your actual API key
```

### Step 3: Set Up Google Drive Folders

Create the following folder structure in Google Drive:

```
📁 PDF4ME input/
   └── 📄 sample.pdf (your PDF form template with form fields)

📁 PDF4ME output/
   └── (filled PDF forms will be saved here)
```

### Step 4: Configure File Names

Update these variables in the script:

```javascript
var folderName = 'PDF4ME input';           // Your input folder name
var fileName = 'sample.pdf';               // Your PDF form template name
var outputFolderName = 'PDF4ME output';    // Your output folder name
```

## 🎯 Usage

### Basic Usage

1. **Upload PDF Template**: Place your PDF form template in the input folder
2. **Configure Form Data**: Set the data to fill in the form fields
3. **Run Script**: Execute the `fillPdfForm()` function
4. **Get Results**: Find your filled PDF form in the output folder

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

## 📝 Form Data Configuration Options

### Basic Form Data

#### Simple Form Filling
```javascript
var formData = {
  "firstname": "John",                    // First name field value
  "lastname": "Adams",                    // Last name field value
  "gender": "Male",                       // Gender field value
};
```

#### Extended Form Data
```javascript
var formData = {
  "firstname": "John",                    // First name field value
  "lastname": "Adams",                    // Last name field value
  "gender": "Male",                       // Gender field value
  "email": "john.adams@example.com",      // Email field value
  "phone": "+1-555-123-4567",            // Phone field value
  "address": "123 Main Street",           // Address field value
  "city": "New York",                     // City field value
  "zipcode": "10001",                     // Zip code field value
  "country": "USA"                        // Country field value
};
```

### Form Field Types Supported

#### Text Fields
```javascript
// Single-line text input
"firstname": "John",
"email": "john@example.com",
"phone": "+1-555-123-4567"
```

#### Checkbox Fields
```javascript
// Boolean values for checkboxes
"agreeTerms": "true",
"newsletter": "false",
"marketing": "true"
```

#### Dropdown Fields
```javascript
// Selected option values
"country": "USA",
"state": "New York",
"language": "English"
```

#### Date Fields
```javascript
// Date values in various formats
"birthDate": "1990-01-15",
"signatureDate": "2024-01-15",
"expiryDate": "2025-12-31"
```

## 📊 API Response Handling

The script handles multiple response scenarios:

### ✅ Immediate Success (200)
- Processing completes instantly
- Filled PDF form saved directly
- Form field filling confirmed

### ⏳ Asynchronous Processing (202)
- Large files processed in background
- Automatic polling until completion
- Progress tracking with retry logic

### ❌ Error Handling
- Comprehensive error logging
- File validation checks
- Network timeout protection

## 🔧 Advanced Customization Options

### Form Data Strategies

#### Personal Information Forms
```javascript
var formData = {
  "applicantName": "John Adams",
  "applicantEmail": "john.adams@example.com",
  "applicantPhone": "+1-555-123-4567",
  "applicantAddress": "123 Main Street",
  "applicantCity": "New York",
  "applicantZip": "10001",
  "applicantCountry": "USA"
};
```

#### Business Application Forms
```javascript
var formData = {
  "companyName": "Acme Corporation",
  "contactPerson": "Jane Smith",
  "businessEmail": "jane.smith@acme.com",
  "businessPhone": "+1-555-987-6543",
  "businessAddress": "456 Business Ave",
  "industry": "Technology",
  "employeeCount": "100-500"
};
```

#### Survey Response Forms
```javascript
var formData = {
  "respondentName": "John Doe",
  "respondentAge": "35",
  "respondentGender": "Male",
  "satisfactionRating": "5",
  "recommendProduct": "true",
  "additionalComments": "Excellent product and service!"
};
```

### Use Case Configurations

#### Job Application Processing
```javascript
// Fill job application form with candidate data
var formData = {
  "candidateName": "John Adams",
  "candidateEmail": "john.adams@example.com",
  "candidatePhone": "+1-555-123-4567",
  "positionApplied": "Software Engineer",
  "yearsExperience": "5",
  "currentSalary": "75000",
  "expectedSalary": "85000",
  "availableStartDate": "2024-02-01",
  "relocationWilling": "true"
};
```

#### Contract Generation
```javascript
// Fill contract template with client information
var formData = {
  "clientName": "Acme Corporation",
  "clientAddress": "123 Business Street",
  "contractValue": "50000",
  "contractStartDate": "2024-01-15",
  "contractEndDate": "2024-12-31",
  "paymentTerms": "Net 30",
  "serviceDescription": "Software Development Services"
};
```

#### Invoice Generation
```javascript
// Fill invoice template with billing information
var formData = {
  "invoiceNumber": "INV-2024-001",
  "invoiceDate": "2024-01-15",
  "dueDate": "2024-02-14",
  "clientName": "Acme Corporation",
  "clientAddress": "123 Business Street",
  "itemDescription": "Software Development",
  "quantity": "1",
  "unitPrice": "5000",
  "totalAmount": "5000"
};
```

## 📝 Code Structure

### Main Function: `fillPdfForm()`

```javascript
function fillPdfForm() {
  // 1. Configuration setup
  // 2. File retrieval from Google Drive
  // 3. Base64 encoding
  // 4. Form data configuration
  // 5. API request execution
  // 6. Response handling (200/202)
  // 7. File saving to output folder
  // 8. Form filling confirmation logging
}
```

### Key Components

- **File Management**: Google Drive API integration
- **Data Encoding**: Base64 conversion for API transmission
- **HTTP Communication**: UrlFetchApp for API calls
- **Error Handling**: Comprehensive try-catch blocks
- **Logging**: Detailed progress tracking and form filling confirmation

## 🚨 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Folder not found** | Check folder name spelling and permissions |
| **File not found** | Verify PDF form template exists in specified folder |
| **API key error** | Ensure valid PDF4me API key is configured |
| **Form field not found** | Verify field names match exactly in PDF template |
| **Data type mismatch** | Ensure data types match field requirements |
| **Timeout errors** | Increase `maxRetries` or `retryDelay` values |
| **Invalid PDF response** | Check if API returned valid PDF data |

### Debug Mode

Enable detailed logging by checking the execution logs:

1. Run the script
2. Click **"View → Execution log"**
3. Review detailed progress information

## 📈 Performance Optimization

### Best Practices

- **Field Name Matching**: Ensure exact field name matches between data and PDF
- **Data Validation**: Validate data types and formats before processing
- **Batch Processing**: Process multiple forms sequentially
- **Error Recovery**: Implement retry logic for network issues
- **File Size**: Process files under 50MB for faster results

### Monitoring

```javascript
// Performance metrics logged automatically
Logger.log('PDF file size: ' + pdfBlob.getBytes().length);
Logger.log('Form data configuration: ' + JSON.stringify(formData));
Logger.log('Number of fields to fill: ' + Object.keys(formData).length);
Logger.log('Processing time: ' + (endTime - startTime) + 'ms');
```

## 🎨 Use Cases

### Business & Corporate

- **Job Applications**: Automatically fill job application forms with candidate data
- **Contract Generation**: Generate contracts from templates with client information
- **Invoice Creation**: Create invoices from templates with billing data
- **Order Processing**: Fill order forms with customer and product information
- **Survey Processing**: Process survey responses and generate reports

### Government & Public Sector

- **License Applications**: Fill license application forms with applicant data
- **Tax Forms**: Generate tax documents from templates with taxpayer information
- **Permit Applications**: Process permit applications with project details
- **Voter Registration**: Fill voter registration forms with citizen information
- **Service Requests**: Generate service request documents with request details

### Educational & Academic

- **Student Registration**: Fill student registration forms with enrollment data
- **Course Applications**: Process course application forms with student information
- **Transcript Generation**: Generate transcripts from templates with academic records
- **Certificate Creation**: Create certificates from templates with graduate information
- **Research Forms**: Fill research consent forms with participant data

### Healthcare & Medical

- **Patient Forms**: Fill patient registration forms with medical information
- **Appointment Scheduling**: Generate appointment confirmations with patient details
- **Medical Records**: Create medical reports from templates with patient data
- **Insurance Claims**: Fill insurance claim forms with medical procedure details
- **Consent Forms**: Generate consent forms with patient and procedure information

### Legal & Compliance

- **Client Intake**: Fill client intake forms with case information
- **Contract Generation**: Create legal contracts from templates with party details
- **Case Management**: Generate case documents from templates with case data
- **Compliance Forms**: Fill regulatory compliance forms with company information
- **Disclosure Documents**: Create disclosure forms with required information

### Financial & Banking

- **Loan Applications**: Fill loan application forms with financial data
- **Account Opening**: Generate account opening documents with customer information
- **Investment Forms**: Fill investment application forms with investor data
- **Insurance Applications**: Create insurance documents from templates with client data
- **Financial Reports**: Generate financial reports from templates with company data

### Real Estate & Property

- **Rental Applications**: Fill rental application forms with tenant information
- **Purchase Agreements**: Generate purchase agreements from templates with property data
- **Lease Agreements**: Create lease documents from templates with tenant details
- **Property Inspections**: Fill inspection forms with property condition data
- **Maintenance Requests**: Generate maintenance request forms with issue details

### Technology & IT

- **Software Registration**: Fill software license forms with user information
- **Support Tickets**: Generate support ticket forms with technical issue details
- **Bug Reports**: Create bug report forms from templates with error information
- **Feature Requests**: Fill feature request forms with enhancement details
- **User Onboarding**: Generate onboarding documents from templates with user data

## 🔗 Related Resources

- [📚 PDF4me API Documentation](https://dev.pdf4me.com/docs/)
- [🔧 Google Apps Script Guide](https://developers.google.com/apps-script)
- [📁 Google Drive API Reference](https://developers.google.com/drive/api)
- [📋 Form Processing Guide](https://en.wikipedia.org/wiki/Form_processing)
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

*Automate form processing and document generation by efficiently filling PDF form templates with structured data for streamlined business workflows and enhanced productivity* 