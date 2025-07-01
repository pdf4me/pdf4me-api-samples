# Add Form Fields to PDF - JavaScript

This JavaScript application adds interactive form fields to PDF documents using the PDF4Me API. It supports both text boxes and checkboxes with custom positioning and styling.

## Features

- **Interactive Form Fields**: Add text boxes and checkboxes to PDF documents
- **Custom Positioning**: Specify exact X and Y coordinates for field placement
- **Multiple Page Support**: Add fields to specific pages or page ranges
- **Asynchronous Processing**: Handles both synchronous and asynchronous API responses
- **Retry Logic**: Automatic retry mechanism for long-running operations
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Usually comes with Node.js
- **PDF4Me API Key**: Valid API key for authentication

## Installation

1. **Clone or download** this project to your local machine
2. **Navigate** to the project directory:
   ```bash
   cd "Add Form Fields To PDF"
   ```
3. **Install dependencies** (if any):
   ```bash
   npm install
   ```

## Configuration

### API Configuration

The application uses the following API configuration:

```javascript
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/AddFormField`;
```

### File Configuration

Update the file paths in `app.js`:

```javascript
const INPUT_PDF_PATH = "sample.pdf";                    // Your input PDF file
const OUTPUT_PDF_PATH = "add_form_fields_PDF_output.pdf"; // Output file name
```

### Form Field Configuration

Customize the form field parameters in the `addFormFieldsToPdf()` function:

```javascript
const formFieldConfig = {
    initialValue: "New input text",           // Initial value for the form field
    positionX: 300,                           // X position (pixels from left)
    positionY: 300,                           // Y position (pixels from bottom)
    fieldName: "Input Field Name",            // Unique field name
    size: 4,                                  // Field size (font size for text boxes)
    pages: "1",                               // Page number or range (e.g., "1,3,5-7")
    formFieldType: "TextBox"                  // "TextBox" or "CheckBox"
};
```

## Usage

### Basic Usage

1. **Place your PDF file** in the project directory (default: `sample.pdf`)
2. **Run the application**:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

### Advanced Configuration

You can modify the form field configuration for different use cases:

#### Text Box Example
```javascript
const textBoxConfig = {
    initialValue: "Enter your name here",
    positionX: 200,
    positionY: 400,
    fieldName: "customer_name",
    size: 12,
    pages: "1",
    formFieldType: "TextBox"
};
```

#### Checkbox Example
```javascript
const checkboxConfig = {
    initialValue: "true",  // "true" for checked, "false" for unchecked
    positionX: 150,
    positionY: 250,
    fieldName: "terms_accepted",
    size: 4,
    pages: "1",
    formFieldType: "CheckBox"
};
```

#### Multiple Pages Example
```javascript
const multiPageConfig = {
    initialValue: "Page specific text",
    positionX: 300,
    positionY: 300,
    fieldName: "page_field",
    size: 10,
    pages: "1,3,5",  // Add to pages 1, 3, and 5
    formFieldType: "TextBox"
};
```

## API Response Handling

The application handles different API response scenarios:

### Status 200 - Success
- **Immediate processing**: Form fields added successfully
- **Direct PDF response**: Binary PDF data saved to output file
- **Success message**: Confirmation of completion

### Status 202 - Accepted
- **Asynchronous processing**: Request accepted, processing in background
- **Polling mechanism**: Automatic status checking with retry logic
- **Location header**: Uses provided URL for status polling
- **Retry configuration**: 10 attempts with 10-second delays

### Error Handling
- **Invalid files**: File not found or invalid PDF format
- **API errors**: Network issues, authentication problems, or server errors
- **Timeout handling**: Automatic retry with exponential backoff
- **Detailed logging**: Comprehensive error messages for debugging

## Output

The application generates:

1. **Processed PDF**: `add_form_fields_PDF_output.pdf` with added form fields
2. **Console output**: Detailed processing information and status updates
3. **Error logs**: Comprehensive error reporting for troubleshooting

## Troubleshooting

### Common Issues

1. **"Input PDF file not found"**
   - Ensure `sample.pdf` exists in the project directory
   - Check file path configuration in `app.js`

2. **"API request failed"**
   - Verify API key is valid and active
   - Check internet connection
   - Ensure PDF4Me service is available

3. **"Timeout: Processing did not complete"**
   - Large files may take longer to process
   - Increase `MAX_RETRIES` or `RETRY_DELAY` in configuration
   - Check PDF4Me dashboard for job status

4. **"Response doesn't appear to be a valid PDF"**
   - API may have returned an error message instead of PDF
   - Check console output for detailed error information
   - Verify API endpoint and payload format

### Debug Mode

Enable detailed logging by modifying the console output in `app.js`:

```javascript
// Add more detailed logging
console.log("Payload:", JSON.stringify(payload, null, 2));
console.log("Response headers:", Object.fromEntries(response.headers.entries()));
```

## API Reference

### Endpoint
```
POST https://api.pdf4me.com/api/v2/AddFormField
```

### Required Parameters
- `docContent`: Base64 encoded PDF content
- `docName`: Source PDF filename with .pdf extension
- `initialValue`: Initial value for the form field
- `positionX`: X coordinate for field placement
- `positionY`: Y coordinate for field placement
- `fieldName`: Unique name for the form field
- `Size`: Field size (font size for text boxes)
- `pages`: Page numbers (comma-separated or ranges)
- `formFieldType`: "TextBox" or "CheckBox"
- `async`: true for asynchronous processing

### Response Codes
- **200**: Success - PDF with form fields returned immediately
- **202**: Accepted - Processing started, poll for completion
- **4xx**: Client error - Check request parameters
- **5xx**: Server error - Try again later

## License

This project is licensed under the MIT License.

## Support

For technical support or questions:
- Check the PDF4Me API documentation
- Review console output for error details
- Verify API key and service status 