# Word to PDF Form Converter

A Node.js application that converts Word documents to interactive PDF forms using the PDF4Me API. This tool transforms Word documents containing form fields into PDF forms with fillable fields that can be used for data collection, surveys, and interactive documents.

## Features

- **Word to PDF Form Conversion**: Converts Word documents (.docx, .doc) to PDF forms
- **Interactive Forms**: Creates PDF forms with fillable fields for data collection
- **Asynchronous Processing**: Handles both synchronous and asynchronous API responses
- **Retry Logic**: Robust polling mechanism for long-running conversions
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **No Dependencies**: Uses only built-in Node.js modules

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Usually comes with Node.js
- **Internet Connection**: Required for API communication

## Installation

1. **Clone or download** this project to your local machine
2. **Navigate** to the project directory:
   ```bash
   cd "Convert Word To PDF Form"
   ```
3. **Install dependencies** (if any):
   ```bash
   npm install
   ```

## Usage

### Basic Usage

1. **Place your Word document** in the project directory with the name `sample.docx`
2. **Run the conversion**:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

### Configuration

You can modify the following settings in `app.js`:

```javascript
// File paths configuration
const INPUT_WORD_PATH = "sample.docx";              // Path to input Word document
const OUTPUT_PDF_PATH = "Word_to_PDF_Form_output.pdf"; // Output PDF form file name

// Retry configuration for async processing
const MAX_RETRIES = 10;  // Maximum number of polling attempts before timeout
const RETRY_DELAY = 10000; // 10 seconds in milliseconds
```

### API Configuration

The application uses the PDF4Me API with the following configuration:

```javascript
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ConvertWordToPdfForm`;
```

## How It Works

### Conversion Process

1. **File Validation**: Checks if the input Word file exists
2. **Base64 Encoding**: Converts the Word document to base64 format for API transmission
3. **API Request**: Sends the encoded document to PDF4Me API
4. **Response Handling**: 
   - **200 Status**: Immediate conversion completion
   - **202 Status**: Asynchronous processing with polling
5. **File Saving**: Saves the resulting PDF form to the specified output path

### Payload Structure

```javascript
const payload = {
    docContent: wordBase64,    // Base64 encoded Word document content
    docName: "output.pdf",     // Name for the output PDF file
    async: true                // Enable asynchronous processing
};
```

### Response Handling

- **200 - Success**: Direct PDF response, immediately saved
- **202 - Accepted**: Asynchronous processing, polls for completion
- **Other Codes**: Error handling with detailed messages

## Output

The application generates:
- `Word_to_PDF_Form_output.pdf`: The converted PDF form with fillable fields

## Error Handling

The application includes comprehensive error handling for:
- Missing input files
- Network connectivity issues
- API authentication errors
- Conversion timeouts
- Invalid response formats

## Troubleshooting

### Common Issues

1. **"Input Word file not found"**
   - Ensure `sample.docx` exists in the project directory
   - Check file permissions

2. **"API request failed"**
   - Verify internet connection
   - Check API key validity
   - Ensure the Word file is not corrupted

3. **"Conversion timeout"**
   - Large or complex documents may take longer
   - Try again after a few minutes
   - Check if the Word file contains valid form fields

4. **"Response doesn't appear to be a valid PDF"**
   - The API may have returned an error message instead of PDF
   - Check the console output for detailed error information

### Debug Information

The application provides detailed logging including:
- File encoding status
- API request/response details
- Polling progress
- File validation results

## API Documentation

This application uses the PDF4Me API endpoint:
- **Endpoint**: `https://api.pdf4me.com/api/v2/ConvertWordToPdfForm`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: application/json

## Supported Formats

### Input Formats
- Microsoft Word (.docx)
- Microsoft Word (.doc)
- OpenDocument Text (.odt)

### Output Format
- PDF Form (.pdf) with fillable fields

## Use Cases

- **Form Creation**: Convert Word-based forms to PDF forms
- **Data Collection**: Create interactive surveys and questionnaires
- **Document Automation**: Transform Word templates into fillable PDFs
- **Business Processes**: Streamline form-based workflows

## License

MIT License - see package.json for details

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Application Logic**: Check the troubleshooting section above
- **Node.js Issues**: Ensure you're using Node.js 18.0.0 or higher 