# PDF to PowerPoint Converter

A Node.js application that converts PDF documents to PowerPoint presentations using the PDF4Me API. This tool transforms PDF pages into editable presentation slides with support for both text-based and scanned PDFs using OCR technology.

## Features

- **PDF to PowerPoint Conversion**: Transforms PDF pages into editable PowerPoint presentation slides
- **OCR Support**: Handles scanned PDFs and image-based text using Optical Character Recognition
- **Quality Options**: Choose between Draft (faster) and Quality (more accurate) conversion modes
- **Asynchronous Processing**: Handles large files with background processing and polling
- **Automatic Retry Logic**: Implements robust retry mechanism for reliable conversions
- **Error Handling**: Comprehensive error handling with detailed logging
- **Modern JavaScript**: Uses ES6+ features and async/await patterns
- **No Dependencies**: Pure Node.js implementation with no external dependencies

## Prerequisites

- Node.js version 18.0.0 or higher
- PDF4Me API key
- Input PDF file

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Convert/Convert To Powerpoint/JavaScript/Convert To Powerpoint"
   ```

2. Install dependencies (none required, but you can run):
   ```bash
   npm install
   ```

## Configuration

### API Configuration

The application uses the following configuration:

```javascript
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ConvertPdfToPowerPoint`;
```

### File Configuration

Update the file paths in `app.js`:

```javascript
const INPUT_PDF_PATH = "sample.pdf";                    // Path to input PDF file
const OUTPUT_PPT_PATH = "PDF_to_Powerpoint_output.pptx"; // Output PowerPoint file name
```

### Retry Configuration

```javascript
const MAX_RETRIES = 10;        // Maximum number of polling attempts
const RETRY_DELAY = 10000;     // Delay between retries (10 seconds)
```

## Usage

### Basic Usage

1. Place your input PDF file in the project directory
2. Update the `INPUT_PDF_PATH` in `app.js` to match your file name
3. Run the conversion:

```bash
npm start
```

Or directly with Node.js:

```bash
node app.js
```

### Conversion Options

The application supports various conversion options:

```javascript
const payload = {
    docContent: pdfBase64,        // Base64 encoded PDF content
    docName: "output.pdf",        // Source PDF filename
    qualityType: "Draft",         // "Draft" (faster) or "Quality" (better accuracy)
    language: "English",          // OCR language for text recognition
    ocrWhenNeeded: true,          // Enable OCR for scanned PDFs
    outputFormat: true,           // Preserve original formatting
    mergeAllSheets: true,         // Organize content for presentation format
    async: true                   // Enable asynchronous processing
};
```

### Quality Settings

- **Draft Mode**: Faster conversion, suitable for simple PDFs with clear text content
- **Quality Mode**: Slower but more accurate, better for complex layouts and scanned documents

### OCR Features

- **Text Recognition**: Converts scanned PDFs and image-based text to editable content
- **Language Support**: Improves accuracy for non-English text recognition
- **Format Preservation**: Maintains original fonts, colors, and layout structure

## API Response Handling

The application handles different API response scenarios:

### 200 - Success (Synchronous)
- Immediate conversion completion
- PowerPoint data returned directly
- File saved immediately

### 202 - Accepted (Asynchronous)
- Request accepted for background processing
- Implements polling mechanism with retry logic
- Monitors conversion progress
- Downloads result when complete

### Error Responses
- Detailed error logging with status codes
- Response text included for debugging
- Graceful error handling

## Output

The converted PowerPoint file will be saved as `PDF_to_Powerpoint_output.pptx` (or your configured output path) in the project directory.

### Supported Output Formats

- **.pptx**: Modern PowerPoint format (recommended)
- **.ppt**: Legacy PowerPoint format (if supported by API)

## Logging

The application provides detailed logging throughout the conversion process:

- File validation and encoding
- API request details and payload options
- Response status and headers
- Polling progress for async operations
- Quality settings and OCR configuration
- Success/failure messages
- Error details for troubleshooting

## Error Handling

Comprehensive error handling includes:

- **File Validation**: Checks if input PDF file exists
- **API Errors**: Handles various HTTP status codes
- **Network Issues**: Retry logic for connection problems
- **Processing Timeouts**: Maximum retry limits with informative messages
- **Invalid Responses**: Graceful handling of unexpected data
- **PowerPoint Validation**: Checks for valid PowerPoint file signatures

## Code Structure

### Main Functions

- `convertPdfToPowerpoint()`: Main orchestration function
- `processPdfToPowerpointConversion()`: Core API interaction logic
- `handleConversionResult()`: Result processing and file saving
- `pollForCompletion()`: Async polling with retry logic
- `validatePowerPointFile()`: PowerPoint file signature validation

### Key Features

- **Base64 Encoding**: Automatic encoding of input PDF files
- **Fetch API**: Modern HTTP requests using native fetch
- **Buffer Handling**: Proper binary data processing
- **PowerPoint Validation**: Checks for valid PowerPoint file signatures (.pptx/.ppt)
- **JSON Parsing**: Handles various response formats
- **OCR Configuration**: Advanced text recognition settings

## Troubleshooting

### Common Issues

1. **File Not Found**: Ensure input PDF file path is correct
2. **API Key Issues**: Verify API key is valid and has proper permissions
3. **Network Problems**: Check internet connection and API endpoint accessibility
4. **Timeout Errors**: Large or complex PDFs may require longer processing times
5. **OCR Issues**: For scanned PDFs, ensure `ocrWhenNeeded` is enabled

### Debug Information

The application logs detailed information including:
- Request/response headers
- Status codes and response content
- Quality settings and OCR configuration
- File sizes and encoding progress
- PowerPoint file validation results

### Performance Tips

- **Draft Mode**: Use for simple PDFs with clear text for faster conversion
- **Quality Mode**: Use for complex layouts or scanned documents for better accuracy
- **File Size**: Larger PDFs may take longer to process
- **Content Complexity**: PDFs with images, tables, or complex formatting may require more processing time

## API Documentation

For more information about the PDF4Me API, visit:
- [PDF4Me API Documentation](https://api.pdf4me.com/)
- [Convert PDF to PowerPoint Endpoint](https://api.pdf4me.com/api/v2/ConvertPdfToPowerPoint)

## Supported Applications

The generated PowerPoint files can be opened in:
- **Microsoft PowerPoint** (Windows, macOS, Web)
- **LibreOffice Impress** (Cross-platform)
- **Google Slides** (Web-based)
- **Apple Keynote** (macOS, iOS)
- **Other presentation software** that supports .pptx format

## License

MIT License - see package.json for details.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Application Code**: Check error logs and configuration
- **PDF Format Issues**: Verify input file is a valid PDF
- **Conversion Quality**: Adjust quality settings and OCR options 