# PDF Signer - JavaScript

Add signatures to PDF documents using PDF4Me API with JavaScript/Node.js.

## Overview

This project demonstrates how to add signature images to PDF documents using the PDF4Me API. It supports both synchronous and asynchronous processing with comprehensive error handling and retry logic.

## Features

- **Signature Positioning**: Control horizontal and vertical alignment
- **Size Control**: Set signature dimensions in millimeters or pixels
- **Page Selection**: Apply signatures to specific pages or page ranges
- **Opacity Control**: Adjust signature transparency (0-100%)
- **Margin Control**: Set precise positioning with margins
- **Async Processing**: Handles both immediate and asynchronous API responses
- **Retry Logic**: Automatic retry mechanism for long-running operations
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Prerequisites

- Node.js 18.0.0 or higher
- npm (comes with Node.js)

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Edit/Sign PDF/JavaScript/Sign PDF"
   ```

2. Install dependencies (none required for this project):
   ```bash
   npm install
   ```

## Usage

### Quick Start

1. Ensure you have the required files:
   - `sample.pdf` - Input PDF document
   - `dev.jpg` - Signature image file

2. Run the application:
   ```bash
   npm start
   ```

   Or directly with Node.js:
   ```bash
   node app.js
   ```

3. The signed PDF will be saved as `Add_sign_to_PDF_output.pdf`

### Configuration

Edit the configuration variables in `app.js`:

```javascript
// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";           // Path to the main PDF file
const SIGNATURE_IMAGE_PATH = "dev.jpg";        // Path to the signature image file
const OUTPUT_PDF_PATH = "Add_sign_to_PDF_output.pdf"; // Output PDF file name

// API Configuration
const API_KEY = "your-api-key-here";
```

### Signature Options

The application supports various signature positioning and styling options:

```javascript
const payload = {
    // Page selection
    pages: "1-3",                    // "1", "1,3,5", "2-5", "1,3,7-10", "2-"
    
    // Alignment
    alignX: "right",                 // "Left", "Center", "Right"
    alignY: "bottom",                // "Top", "Middle", "Bottom"
    
    // Size (millimeters)
    widthInMM: "50",                 // 10-200
    heightInMM: "25",                // 10-200
    
    // Size (pixels)
    widthInPx: "142",                // 20-600
    heightInPx: "71",                // 20-600
    
    // Margins (millimeters)
    marginXInMM: "20",               // 0-100
    marginYInMM: "20",               // 0-100
    
    // Margins (pixels)
    marginXInPx: "57",               // 0-300
    marginYInPx: "57",               // 0-300
    
    // Appearance
    opacity: "100",                  // 0-100 (0=invisible, 100=fully opaque)
    showOnlyInPrint: true,           // Show in view and print
    isBackground: false,             // Background/foreground placement
    async: true                      // Enable async processing
};
```

## API Response Handling

The application handles different API response scenarios:

### 200 - Success
- Immediate completion
- PDF data returned directly
- File saved immediately

### 202 - Accepted
- Asynchronous processing
- Polling mechanism with retry logic
- Automatic status checking every 10 seconds
- Maximum 10 retry attempts

### Error Responses
- Detailed error messages with status codes
- Graceful error handling and exit

## File Structure

```
Sign PDF/
├── app.js              # Main application file
├── package.json        # Project configuration
├── README.md          # This documentation
├── sample.pdf         # Input PDF file
├── dev.jpg            # Signature image file
└── Add_sign_to_PDF_output.pdf  # Output file (generated)
```

## Error Handling

The application includes comprehensive error handling:

- **File Validation**: Checks for required input files
- **API Errors**: Handles various HTTP status codes
- **Network Issues**: Retry logic for connection problems
- **Processing Timeouts**: Maximum retry limits
- **Invalid Responses**: Fallback handling for unexpected data

## Troubleshooting

### Common Issues

1. **"Input PDF file not found"**
   - Ensure `sample.pdf` exists in the project directory

2. **"Signature image file not found"**
   - Ensure `dev.jpg` exists in the project directory

3. **"API request failed"**
   - Check your API key configuration
   - Verify internet connectivity
   - Ensure the PDF4Me service is available

4. **"Processing did not complete"**
   - The operation may take longer than expected
   - Check the API service status
   - Try with a smaller PDF file

### Debug Mode

To see detailed API responses, you can modify the error handling in `app.js` to log the full response:

```javascript
} else {
    // Error response
    const errorText = await response.text();
    console.log("Full error response:", errorText);
    throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
}
```

## API Documentation

For more information about the PDF4Me API and available options, visit:
- [PDF4Me API Documentation](https://api.pdf4me.com/)
- [SignPdf Endpoint Reference](https://api.pdf4me.com/api/v2/SignPdf)

## License

MIT License - see package.json for details.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **This Application**: Check the troubleshooting section above
- **Node.js/JavaScript**: Refer to official Node.js documentation 