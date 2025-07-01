# URL to PDF Converter

Convert web URLs to PDF documents using the PDF4Me API. This project captures web pages with all styling, images, and layout preserved in the PDF output.

## Features

- ✅ Convert web URLs to PDF with preserved styling and layout
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling
- ✅ No external dependencies (uses Node.js built-in modules)
- ✅ Detailed logging and progress tracking
- ✅ Configurable page settings (size, orientation, margins)
- ✅ Background printing and header/footer options
- ✅ Customizable scaling and margins

## Prerequisites

- **Node.js 18.0.0 or higher** (required for built-in `fetch` API)
- **Internet connection** for API access and web page fetching
- **Valid PDF4Me API key**

## Quick Start

1. **Download the project folder**
2. **Configure the target URL** in `app.js` (or use the default Wikipedia page)
3. **Run the conversion**:
   ```bash
   node app.js
   ```

The converted PDF will be saved as `URL_to_PDF_output.pdf` in the same directory.

## Project Structure

```
Convert URL To PDF/
├── app.js              # Main application file
├── package.json        # Project configuration
├── README.md          # This file
└── URL_to_PDF_output.pdf # Generated PDF (after running)
```

## Configuration

### Target URL
Edit the constant in `app.js` to convert different web pages:

```javascript
const TARGET_URL = "https://en.wikipedia.org/wiki/Microsoft_Power_Automate";  // Your target URL
const OUTPUT_PDF_PATH = "URL_to_PDF_output.pdf";  // Output PDF name
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
    webUrl: TARGET_URL,              // Target web page URL
    authType: "NoAuth",              // Authentication type (NoAuth, Basic, etc.)
    layout: "portrait",              // portrait or landscape
    format: "A4",                    // A4, Letter, A5, A6, etc.
    scale: 1.0,                      // 0.1 to 2.0 scaling factor
    topMargin: "20px",               // Top margin
    leftMargin: "20px",              // Left margin
    rightMargin: "20px",             // Right margin
    bottomMargin: "20px",            // Bottom margin
    printBackground: true,           // Include backgrounds
    displayHeaderFooter: false,      // Show headers/footers
    async: true                      // Enable async processing
};
```

## Usage Examples

### Basic Conversion
```bash
# Convert the default Wikipedia page
node app.js
```

### Custom URLs
Edit `app.js` to convert different web pages:
```javascript
const TARGET_URL = "https://example.com";
const OUTPUT_PDF_PATH = "my-website.pdf";
```

### Different Page Settings
Modify the payload for different layouts:
```javascript
// Landscape A3 format with custom margins
layout: "landscape",
format: "A3",
scale: 0.8,
topMargin: "40px",
bottomMargin: "40px",
leftMargin: "30px",
rightMargin: "30px"

// Letter size with background printing disabled
format: "Letter",
printBackground: false,
displayHeaderFooter: true
```

## API Response Handling

The application handles different API responses:

- **200 (Success)**: Direct PDF response, saved immediately
- **202 (Accepted)**: Async processing, polls for completion
- **Other codes**: Error with detailed message

## Error Handling

The application includes comprehensive error handling:

- ✅ URL validation and accessibility
- ✅ API request errors
- ✅ Network connectivity issues
- ✅ Invalid responses
- ✅ File system errors
- ✅ Timeout handling for async operations
- ✅ PDF validation and format checking

## Troubleshooting

### Common Issues

1. **"URL not accessible"**
   - Ensure the URL is valid and publicly accessible
   - Check if the website requires authentication
   - Verify internet connection

2. **"API request failed"**
   - Verify internet connection
   - Check API key validity
   - Ensure URL is properly formatted

3. **"Polling failed"**
   - Large/complex web pages may take longer to process
   - Increase `MAX_RETRIES` or `RETRY_DELAY` in the code
   - Check if the target website is slow to load

4. **"Node.js version too old"**
   - Upgrade to Node.js 18.0.0 or higher
   - Check version with: `node --version`

5. **"Invalid PDF response"**
   - The web page might be too complex or have security restrictions
   - Try a simpler URL or different website
   - Check if the website blocks automated access

### Performance Tips

- **Simple web pages**: Usually process synchronously (200 response)
- **Complex web pages**: Process asynchronously (202 response) with polling
- **Large websites**: May take longer to render and convert
- **JavaScript-heavy sites**: May require longer processing time

## API Documentation

This project uses the PDF4Me ConvertUrlToPdf API v2:

- **Endpoint**: `https://api.pdf4me.com/api/v2/ConvertUrlToPdf`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: application/json

### Supported Web Page Features

- ✅ CSS styling and layouts
- ✅ Images and graphics
- ✅ Tables and forms
- ✅ Fonts and typography
- ✅ Background colors and images
- ✅ JavaScript-rendered content
- ✅ Responsive design elements
- ✅ Interactive elements (preserved as static)
- ✅ Custom fonts and styling

### Authentication Options

The API supports different authentication methods for protected websites:

```javascript
// No authentication (public websites)
authType: "NoAuth",
username: "",
password: ""

// Basic authentication
authType: "Basic",
username: "your_username",
password: "your_password"
```

## Use Cases

This URL to PDF converter is perfect for:

- **Web archiving**: Save important web pages for offline access
- **Documentation**: Convert web-based documentation to PDF
- **Reports**: Generate PDF reports from web dashboards
- **Content backup**: Preserve web content in a stable format
- **Print preparation**: Convert web pages for printing
- **Legal documentation**: Capture web evidence in PDF format

## License

MIT License - feel free to use and modify as needed.

## Support

For issues with the PDF4Me API, refer to the official documentation or contact support. 