# HTML to PDF Converter

Convert HTML files to PDF documents using the PDF4Me API. This project preserves styling, layout, images, and formatting from HTML content.

## Features

- ✅ Convert HTML files to PDF with preserved styling
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling
- ✅ No external dependencies (uses Node.js built-in modules)
- ✅ Detailed logging and progress tracking
- ✅ Configurable page settings (size, orientation, margins)

## Prerequisites

- **Node.js 18.0.0 or higher** (required for built-in `fetch` API)
- **Internet connection** for API access
- **Valid PDF4Me API key**

## Quick Start

1. **Download the project folder**
2. **Place your HTML file** in the project directory (rename to `sample.html` or update the path in `app.js`)
3. **Run the conversion**:
   ```bash
   node app.js
   ```

The converted PDF will be saved as `HTML_to_PDF_output.pdf` in the same directory.

## Project Structure

```
Convert HTML To PDF/
├── app.js              # Main application file
├── package.json        # Project configuration
├── README.md          # This file
└── sample.html        # Sample HTML file (your input)
```

## Configuration

### File Paths
Edit the constants in `app.js` to customize file paths:

```javascript
const INPUT_HTML_PATH = "sample.html";           // Your HTML file
const OUTPUT_PDF_PATH = "HTML_to_PDF_output.pdf"; // Output PDF name
```

### API Settings
The API key and endpoint are pre-configured:

```javascript
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
```

### Conversion Options
Customize the conversion settings in the payload:

```javascript
const payload = {
    layout: "Portrait",               // Portrait or Landscape
    format: "A4",                     // A4, Letter, A5, A6, etc.
    scale: 0.8,                       // 0.1 to 2.0
    topMargin: "40px",                // Top margin
    bottomMargin: "40px",             // Bottom margin
    leftMargin: "40px",               // Left margin
    rightMargin: "40px",              // Right margin
    printBackground: true,            // Include backgrounds
    displayHeaderFooter: true,        // Show headers/footers
    async: true                       // Enable async processing
};
```

## Usage Examples

### Basic Conversion
```bash
# Simple conversion with default settings
node app.js
```

### Custom File Paths
Edit `app.js` to use different files:
```javascript
const INPUT_HTML_PATH = "my-document.html";
const OUTPUT_PDF_PATH = "converted-document.pdf";
```

### Different Page Settings
Modify the payload for different layouts:
```javascript
// Landscape A3 format
layout: "Landscape",
format: "A3",
scale: 1.0

// Letter size with no margins
format: "Letter",
topMargin: "0px",
bottomMargin: "0px",
leftMargin: "0px",
rightMargin: "0px"
```

## API Response Handling

The application handles different API responses:

- **200 (Success)**: Direct PDF response, saved immediately
- **202 (Accepted)**: Async processing, polls for completion
- **Other codes**: Error with detailed message

## Error Handling

The application includes comprehensive error handling:

- ✅ Input file validation
- ✅ API request errors
- ✅ Network connectivity issues
- ✅ Invalid responses
- ✅ File system errors
- ✅ Timeout handling for async operations

## Troubleshooting

### Common Issues

1. **"Input HTML file not found"**
   - Ensure your HTML file exists in the project directory
   - Check the file path in `INPUT_HTML_PATH`

2. **"API request failed"**
   - Verify internet connection
   - Check API key validity
   - Ensure HTML file is valid

3. **"Polling failed"**
   - Large files may take longer to process
   - Increase `MAX_RETRIES` or `RETRY_DELAY` in the code

4. **"Node.js version too old"**
   - Upgrade to Node.js 18.0.0 or higher
   - Check version with: `node --version`

### Performance Tips

- **Small files (< 1MB)**: Usually process synchronously (200 response)
- **Large files (> 1MB)**: Process asynchronously (202 response) with polling
- **Complex HTML**: May take longer to render and convert

## API Documentation

This project uses the PDF4Me ConvertHtmlToPdf API v2:

- **Endpoint**: `https://api.pdf4me.com/api/v2/ConvertHtmlToPdf`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: application/json

### Supported HTML Features

- ✅ CSS styling and layouts
- ✅ Images and graphics
- ✅ Tables and forms
- ✅ Fonts and typography
- ✅ Background colors and images
- ✅ Headers and footers
- ✅ Page breaks and layout control

## License

MIT License - feel free to use and modify as needed.

## Support

For issues with the PDF4Me API, refer to the official documentation or contact support. 