# PDF Form Data Extractor

A Node.js application that extracts form field data and values from PDF documents using the PDF4Me API. This tool can extract all types of form fields including text fields, checkboxes, radio buttons, dropdowns, and more.

## Features

- **Complete Form Data Extraction**: Extracts all form fields and their values from PDF documents
- **Multiple Field Types**: Supports text fields, checkboxes, radio buttons, dropdowns, signature fields, and more
- **Asynchronous Processing**: Handles both synchronous and asynchronous API responses with retry logic
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **No Dependencies**: Uses only built-in Node.js modules (no npm install required)
- **Professional Output**: Saves extracted data in structured JSON format

## Prerequisites

- Node.js version 18.0.0 or higher
- A PDF document containing fillable forms
- PDF4Me API key (included in the code)

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Extract Form Data From PDF/JavaScript/Extract Form Data From PDF"
   ```

2. No additional dependencies required - the application uses only built-in Node.js modules.

## Usage

### Basic Usage

1. Place your PDF file in the project directory and name it `sample.pdf`
2. Run the application:
   ```bash
   node app.js
   ```
   or
   ```bash
   npm start
   ```

3. The extracted form data will be saved as `Extract_form_data_output.json`

### Custom Configuration

You can modify the following constants in `app.js` to customize the behavior:

```javascript
// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                    // Path to input PDF file
const OUTPUT_JSON_PATH = "Extract_form_data_output.json"; // Output form data file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds
```

## API Configuration

The application uses the PDF4Me API with the following configuration:

- **API Key**: Pre-configured in the code
- **Base URL**: `https://api.pdf4me.com/`
- **Endpoint**: `/api/v2/ExtractPdfFormData`
- **Authentication**: Basic authentication with API key

## Output Format

The extracted form data is saved in JSON format with the following structure:

```json
{
  "formFields": [
    {
      "name": "field_name",
      "value": "field_value",
      "type": "field_type",
      "page": 1,
      "rect": [x, y, width, height]
    }
  ]
}
```

### Field Types Supported

- **Text Fields**: Single-line and multi-line text input
- **Checkboxes**: Boolean true/false values
- **Radio Buttons**: Single selection from a group
- **Dropdown Lists**: Selection from predefined options
- **Signature Fields**: Digital signature data
- **Button Fields**: Form submission buttons
- **Choice Fields**: List boxes and combo boxes

## Response Handling

The application handles different API response scenarios:

### 200 - Success
- Form data extraction completed immediately
- Data is processed and saved to JSON file
- Summary of extracted fields is displayed

### 202 - Accepted
- Request is being processed asynchronously
- Application polls the API until completion
- Retry logic with configurable attempts and delays

### Error Responses
- Detailed error messages with status codes
- Graceful error handling and user feedback

## Error Handling

The application includes comprehensive error handling for:

- **File Not Found**: Validates input PDF file existence
- **API Errors**: Handles various HTTP status codes
- **Network Issues**: Retry logic for connection problems
- **Processing Timeouts**: Configurable timeout limits
- **Invalid Responses**: Fallback handling for unexpected data

## Examples

### Example Output

```
Starting PDF Form Data Extraction Process...
This extracts all form field data and values from PDF documents
Supports text fields, checkboxes, radio buttons, dropdowns, and more
------------------------------------------------------------
Extracting form data from: sample.pdf → Extract_form_data_output.json
Reading and encoding PDF file...
PDF file successfully encoded to base64: 24576 bytes
Sending form data extraction request to PDF4Me API...
Status code: 200
Form data extraction completed immediately!
Form data saved: Extract_form_data_output.json

Extracted Form Data:
Found 5 form fields:
  1. FirstName (text): John
  2. LastName (text): Doe
  3. Email (text): john.doe@example.com
  4. AgreeToTerms (checkbox): true
  5. Country (choice): United States
```

### Sample JSON Output

```json
{
  "formFields": [
    {
      "name": "FirstName",
      "value": "John",
      "type": "text",
      "page": 1,
      "rect": [100, 200, 150, 20]
    },
    {
      "name": "LastName",
      "value": "Doe",
      "type": "text",
      "page": 1,
      "rect": [300, 200, 150, 20]
    },
    {
      "name": "AgreeToTerms",
      "value": true,
      "type": "checkbox",
      "page": 1,
      "rect": [100, 300, 15, 15]
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **"Input PDF file not found"**
   - Ensure `sample.pdf` exists in the project directory
   - Check file permissions

2. **"API request failed"**
   - Verify internet connection
   - Check if PDF4Me API is accessible
   - Ensure PDF file is not corrupted

3. **"Timeout: Form data extraction did not complete"**
   - Large PDF files may take longer to process
   - Increase `MAX_RETRIES` or `RETRY_DELAY` values
   - Check PDF file size and complexity

4. **"Failed to parse JSON response"**
   - API may return binary data instead of JSON
   - Check the generated `_raw.bin` file for raw response

### Performance Tips

- Use smaller PDF files for faster processing
- Ensure PDF files are not password-protected
- Close other applications to free up system resources

## Technical Details

### Architecture

- **Modular Design**: Separate functions for different responsibilities
- **Async/Await**: Modern JavaScript async handling
- **Error Boundaries**: Comprehensive error catching and reporting
- **Memory Efficient**: Streams large files without loading entirely into memory

### API Integration

- **RESTful API**: Uses standard HTTP methods
- **Base64 Encoding**: Converts PDF to base64 for API transmission
- **Polling Mechanism**: Handles asynchronous processing
- **Authentication**: Basic auth with API key

### File Handling

- **Binary Processing**: Handles PDF files as binary data
- **JSON Output**: Structured data output for easy parsing
- **Fallback Handling**: Multiple output formats for different response types

## License

MIT License - see package.json for details

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Application Logic**: Check the troubleshooting section above
- **Node.js Issues**: Ensure you're using Node.js 18.0.0 or higher

## Version History

- **v1.0.0**: Initial release with basic form data extraction functionality 