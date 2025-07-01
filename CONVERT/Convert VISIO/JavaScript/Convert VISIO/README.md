# Visio to PDF Converter

Convert Microsoft Visio files (.vsdx, .vsd, .vsdm) to PDF documents using the PDF4Me API. This tool supports both synchronous and asynchronous processing with automatic retry logic.

## Features

- **Multiple Input Formats**: Supports .vsdx, .vsd, and .vsdm Visio file formats
- **Multiple Output Formats**: Convert to PDF, JPG, PNG, or TIFF
- **Asynchronous Processing**: Handles large files with polling and retry logic
- **Quality Control**: Configurable resolution, compression, and image quality settings
- **Page Management**: Convert specific pages or ranges with hidden page support
- **Error Handling**: Comprehensive error handling with detailed logging

## Prerequisites

- Node.js version 18.0.0 or higher
- PDF4Me API key
- Valid Visio file (.vsdx, .vsd, or .vsdm)

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Convert/Convert VISIO/JavaScript/Convert VISIO"
   ```

2. Install dependencies (if any):
   ```bash
   npm install
   ```

3. Place your Visio file in the project directory (default: `E-Commerce.vsdx`)

## Configuration

### API Configuration
The script uses the following API configuration:
- **API Key**: `get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/`
- **Base URL**: `https://api.pdf4me.com/`
- **Endpoint**: `/api/v2/ConvertVisio?schemaVal=PDF`

### File Configuration
Edit the following variables in `app.js`:
```javascript
const INPUT_VISIO_PATH = "E-Commerce.vsdx";           // Your Visio file
const OUTPUT_PDF_PATH = "VISIO_to_PDF_output.pdf";    // Output file name
```

### Retry Configuration
```javascript
const MAX_RETRIES = 10;        // Maximum polling attempts
const RETRY_DELAY = 10000;     // Delay between attempts (10 seconds)
```

## Usage

### Basic Usage
Run the converter with default settings:
```bash
npm start
```

Or directly with Node.js:
```bash
node app.js
```

### Output Formats

#### PDF Output (Default)
```javascript
const payload = {
    docContent: visioBase64,
    docName: "output",
    OutputFormat: "PDF",
    IsPdfCompliant: true,
    PageIndex: 0,
    PageCount: 5,
    IncludeHiddenPages: true,
    SaveForegroundPage: true,
    SaveToolBar: true,
    AutoFit: true,
    async: true
};
```

#### JPG Output
```javascript
const payload = {
    docContent: visioBase64,
    docName: "output",
    OutputFormat: "JPG",
    PageIndex: 0,
    PageCount: 5,
    JpegQuality: 80,                   // 0-100
    ImageBrightness: 1.0,              // Brightness adjustment
    ImageContrast: 1.0,                // Contrast adjustment
    ImageColorMode: "RGB",             // RGB or Grayscale
    Resolution: 300,                   // DPI
    Scale: 1.0,                        // Scaling factor
    async: true
};
```

#### PNG Output
```javascript
const payload = {
    docContent: visioBase64,
    docName: "output",
    OutputFormat: "PNG",
    PageIndex: 0,
    PageCount: 5,
    ImageColorMode: "RGBA",            // Supports transparency
    Resolution: 300,
    Scale: 1.0,
    async: true
};
```

#### TIFF Output
```javascript
const payload = {
    docContent: visioBase64,
    docName: "output",
    OutputFormat: "TIFF",
    PageIndex: 0,
    PageCount: 5,
    ImageColorMode: "Grayscale",       // Grayscale or RGB
    TiffCompression: "LZW",            // LZW, None, or CCITT4
    Resolution: 300,
    Scale: 1.0,
    async: true
};
```

## API Response Handling

### Status Codes
- **200**: Success - Conversion completed immediately
- **202**: Accepted - Processing asynchronously (polling required)
- **Other**: Error - Check response text for details

### Response Processing
The script handles multiple response formats:
1. Direct binary PDF data
2. Base64 encoded PDF in JSON response
3. Error responses with detailed messages

## Error Handling

The converter includes comprehensive error handling:
- Input file validation
- API request failures
- Polling timeout handling
- Response format validation
- File system errors

## Logging

The script provides detailed logging:
- Conversion progress
- API response status
- Polling attempts
- File operations
- Error details

## Examples

### Convert Specific Pages
```javascript
const payload = {
    // ... other options
    PageIndex: 2,      // Start from page 3 (0-indexed)
    PageCount: 3,      // Convert 3 pages
    // ... rest of options
};
```

### High-Quality Image Output
```javascript
const payload = {
    // ... other options
    OutputFormat: "JPG",
    JpegQuality: 95,                   // High quality
    Resolution: 600,                   // High resolution
    CompositingQuality: "HighQuality",
    InterpolationMode: "High",
    SmoothingMode: "HighQuality",
    // ... rest of options
};
```

### Compressed TIFF for Archival
```javascript
const payload = {
    // ... other options
    OutputFormat: "TIFF",
    TiffCompression: "LZW",            // Lossless compression
    ImageColorMode: "Grayscale",       // Smaller file size
    Resolution: 300,                   // Standard resolution
    // ... rest of options
};
```

## Troubleshooting

### Common Issues

1. **File Not Found**
   - Ensure the Visio file exists in the project directory
   - Check the file path in `INPUT_VISIO_PATH`

2. **API Authentication Error**
   - Verify the API key is correct
   - Check network connectivity

3. **Conversion Timeout**
   - Large files may take longer to process
   - Increase `MAX_RETRIES` or `RETRY_DELAY`

4. **Invalid Output File**
   - Check API response for error messages
   - Verify the payload configuration

### Debug Information
The script logs detailed information including:
- API response status codes
- Response content length
- First 100 bytes of response (for debugging)
- Full error messages

## API Reference

For detailed API documentation, visit the PDF4Me API documentation.

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, contact PDF4Me support team. 