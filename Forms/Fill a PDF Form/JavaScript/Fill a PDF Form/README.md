# PDF Form Filler - JavaScript

This JavaScript application fills PDF form fields using the PDF4Me API. It supports both synchronous and asynchronous processing with automatic retry logic.

## Features

- **Form Field Filling**: Automatically fills PDF form fields with provided data
- **Async Processing**: Supports both immediate (200) and asynchronous (202) responses
- **Retry Logic**: Automatic polling for async jobs with configurable retry attempts
- **Error Handling**: Comprehensive error handling with detailed logging
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **No Dependencies**: Uses only Node.js built-in modules

## Prerequisites

- Node.js version 18.0.0 or higher
- A PDF file with form fields to fill
- PDF4Me API key

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Forms/Fill a PDF Form/JavaScript/Fill a PDF Form"
   ```

2. Ensure you have the required files:
   - `app.js` - Main application file
   - `package.json` - Project configuration
   - `sample.pdf` - Input PDF file with form fields

## Configuration

### API Configuration

The application uses the following API configuration:

```javascript
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/FillPdfForm`;
```

### File Configuration

```javascript
const INPUT_PDF_PATH = "sample.pdf";                    // Path to the PDF file with form fields
const OUTPUT_PDF_PATH = "fill_PDF_form_output.pdf";     // Output PDF file name
```

### Form Data Configuration

Edit the `formData` object in `app.js` to specify the form fields and their values:

```javascript
const formData = {
    "firstname": "John",                    // First name field value
    "lastname": "Adams",                    // Last name field value
    "gender": "Male",                       // Gender field value
};
```

### Retry Configuration

```javascript
const MAX_RETRIES = 10;        // Maximum number of polling attempts
const RETRY_DELAY = 10000;     // Delay between attempts (10 seconds)
```

## Usage

### Running the Application

1. **Start the application:**
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

2. **Expected output:**
   ```
   Starting PDF Form Filling Process
   This fills PDF form fields with provided data
   ------------------------------------------------------------
   Processing: sample.pdf → fill_PDF_form_output.pdf
   Form data to fill:
     firstname: John
     lastname: Adams
     gender: Male
   Reading and encoding PDF file...
   PDF file read successfully: 123456 bytes
   Sending PDF to PDF4Me API for filling form fields...
   Status code: 200
   Success! PDF form filled successfully!
   Response is a valid PDF file
   Filled PDF form saved successfully: fill_PDF_form_output.pdf
   Output file size: 98765 bytes
   PDF form fields have been filled successfully
   ```

### Programmatic Usage

You can also use the functions programmatically:

```javascript
const { fillPdfForm, processPdfFormFilling } = require('./app.js');

// Fill PDF form with custom data
const customFormData = {
    "firstname": "Jane",
    "lastname": "Doe",
    "email": "jane.doe@example.com"
};

// Process form filling
processPdfFormFilling(customFormData)
    .then(result => {
        console.log("Form filling completed");
    })
    .catch(error => {
        console.error("Error:", error.message);
    });
```

## API Response Handling

### Synchronous Response (200)
- Immediate processing completion
- PDF content returned directly
- File saved immediately

### Asynchronous Response (202)
- Processing started asynchronously
- Location URL provided for polling
- Automatic retry logic with 10-second intervals
- Maximum 10 retry attempts

### Error Responses
- Detailed error messages with status codes
- Response text included for debugging
- Graceful error handling

## File Structure

```
Fill a PDF Form/
├── app.js                 # Main application file
├── package.json           # Project configuration
├── README.md             # This documentation
├── sample.pdf            # Input PDF file with form fields
└── fill_PDF_form_output.pdf  # Output file (generated)
```

## Troubleshooting

### Common Issues

1. **File Not Found Error**
   - Ensure `sample.pdf` exists in the project directory
   - Check file path configuration in `app.js`

2. **API Authentication Error**
   - Verify API key is correct
   - Check network connectivity

3. **Async Processing Timeout**
   - Increase `MAX_RETRIES` for longer processing times
   - Check PDF4Me service status

4. **Invalid PDF Response**
   - Verify input PDF has form fields
   - Check form field names match the data provided

### Debug Information

The application provides detailed logging:
- File reading and encoding status
- API request details
- Response status codes
- File saving confirmation
- Error details with context

## API Endpoint Details

- **Endpoint**: `https://api.pdf4me.com/api/v2/FillPdfForm`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: application/json

### Required Payload Parameters

```javascript
{
    templateDocName: "filename.pdf",        // Template document name
    templateDocContent: "base64_content",   // Base64 PDF content
    dataArray: "json_string",              // JSON data array
    outputType: "pdf",                     // Output type
    inputDataType: "json",                 // Input data type
    InputFormData: [...],                  // Form field objects
    async: true                            // Async processing
}
```

## License

MIT License - See package.json for details.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Application Logic**: Check the troubleshooting section
- **Node.js Issues**: Ensure Node.js version 18+ is installed 