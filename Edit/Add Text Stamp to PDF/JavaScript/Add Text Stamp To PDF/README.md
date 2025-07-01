# PDF Text Stamp API Client

A simple JavaScript client for adding text stamps/watermarks to PDF documents using the PDF4me API. This application allows you to add customizable text watermarks to PDF documents for authorization and piracy prevention.

## Features

- Add text stamps/watermarks to PDF documents
- Customizable text content, font, size, color, and positioning
- Support for rotation and opacity settings
- Background/foreground placement options
- Cross-platform compatibility (Windows, Mac, Linux)
- No external dependencies required
- Asynchronous processing with retry logic

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Add Text Stamp To PDF"
   ```

2. Install dependencies (none required, but npm install is good practice):
   ```bash
   npm install
   ```

## Configuration

### API Configuration
The application uses the following configuration:

```javascript
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_URL = `${BASE_URL}api/v2/Stamp`;
const INPUT_PDF_FILE = 'sample.pdf'; // Path to the main PDF file
const OUTPUT_FILE = 'Add_text_stamp_to_PDF_output.pdf'; // Output PDF file name
```

### Text Stamp Configuration
You can customize the text stamp by modifying the payload in `app.js`:

```javascript
const payload = {
    docContent: pdfBase64,                        // Base64 encoded PDF document content
    docName: "output.pdf",                        // Output PDF file name
    pages: "all",                                 // Page options: "all", "1", "1,3,5", "2-5", "1,3,7-10", "2-"
    text: "CONFIDENTIAL - PDF4me Watermark",      // Text to be stamped as watermark
    alignX: "center",                             // Horizontal alignment: "left", "center", "right"
    alignY: "middle",                             // Vertical alignment: "top", "middle", "bottom"
    marginXInMM: "50",                            // Horizontal margin from left edge in millimeters
    marginYInMM: "50",                            // Vertical margin from top edge in millimeters
    marginXInPx: "150",                           // Horizontal margin from left edge in pixels
    marginYInPx: "150",                           // Vertical margin from top edge in pixels
    opacity: "30",                                // Opacity (0-100): 0=invisible, 100=fully opaque
    fontName: "Arial",                            // Font options: "Arial", "Times New Roman", "Helvetica", "Courier New"
    fontSize: 24,                                 // Font size (8-72)
    fontColor: "#FF0000",                         // Font color in hex: #000000 (black), #FF0000 (red), #0000FF (blue), #808080 (gray)
    isBold: true,                                 // Make text bold (true/false)
    isItalics: false,                             // Make text italic (true/false)
    underline: false,                             // Underline the text (true/false)
    rotate: 45,                                   // Rotation angle: 0 (horizontal), 45 (diagonal), 90 (vertical), -45 (reverse diagonal)
    isBackground: true,                           // Place stamp in background/foreground (true/false)
    showOnlyInPrint: false,                       // Show stamp in view and print (true/false)
    transverse: false,                            // Transverse positioning (true/false)
    fitTextOverPage: false,                       // Fit text over entire page (true/false)
    async: true                                   // Enable asynchronous processing
};
```

## Usage

### Running the Application

1. Ensure you have a `sample.pdf` file in the project directory
2. Run the application:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

### Expected Output

The application will:
1. Read the input PDF file (`sample.pdf`)
2. Convert it to base64 encoding
3. Send a request to the PDF4me API to add the text stamp
4. Handle the response:
   - **200 Success**: Text stamp addition completed immediately
   - **202 Accepted**: Asynchronous processing with polling
   - **Other codes**: Error message with status code and response text
5. Save the output PDF file (`Add_text_stamp_to_PDF_output.pdf`)

### Console Output Example

```
Starting text stamp addition to PDF...
Attempt 1/10 - Adding text stamp to PDF...
PDF file read successfully: 102400 bytes
Sending text stamp request to PDF4me API...
202 - Request accepted. Processing asynchronously...
Checking status... (Attempt 1/10)
✓ Success! Text stamp addition completed!
File saved: Add_text_stamp_to_PDF_output.pdf
```

## Error Handling

The application includes comprehensive error handling:

- **File not found**: Checks if input PDF exists
- **Network errors**: Retries up to 10 times with 10-second delays
- **API errors**: Displays status code and error message
- **Timeout**: Handles cases where processing takes too long

## Retry Logic

- **Max retries**: 10 attempts
- **Retry delay**: 10 seconds between attempts
- **Polling**: For async processing, polls every 10 seconds up to 10 times

## Cross-Platform Compatibility

This application works on:
- **Windows**: Tested on Windows 10/11
- **macOS**: Compatible with all recent versions
- **Linux**: Works on all major distributions

No additional software installation is required beyond Node.js and npm.

## API Endpoints

- **Base URL**: `https://api.pdf4me.com/`
- **Text Stamp Endpoint**: `/api/v2/Stamp`
- **Authentication**: Basic Auth with API key

## Troubleshooting

### Common Issues

1. **"PDF file sample.pdf not found"**
   - Ensure `sample.pdf` exists in the project directory

2. **"Error making API request"**
   - Check your internet connection
   - Verify the API key is correct
   - Ensure the PDF4me service is available

3. **"Timeout: Processing did not complete"**
   - The API may be experiencing high load
   - Try running the application again
   - Check if the PDF file is too large

### Debug Mode

To see more detailed error information, you can modify the error handling in `app.js` to log additional details.

## License

MIT License - see package.json for details.

## Support

For issues related to:
- **PDF4me API**: Contact PDF4me support
- **Application functionality**: Check the error messages and troubleshooting section
- **Node.js issues**: Refer to Node.js documentation 