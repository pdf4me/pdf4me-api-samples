# Add Image Stamp to PDF - JavaScript

A simple JavaScript application that adds image stamps/watermarks to PDF documents using the PDF4me API.

## Features

- Add image stamps to PDF documents
- Support for various image formats (PNG, JPG, etc.)
- Configurable stamp positioning and sizing
- Asynchronous processing with retry logic
- No external dependencies required

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Add Image Stamp To PDF"
   ```

2. Install dependencies (none required, but npm init is recommended):
   ```bash
   npm install
   ```

## Usage

1. Place your input files in the project directory:
   - `sample.pdf` - The PDF file to add the image stamp to
   - `pdf4me.png` - The image file to use as a stamp

2. Run the application:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

3. The application will:
   - Read the PDF and image files
   - Convert them to base64 encoding
   - Send the request to PDF4me API
   - Handle both synchronous (200) and asynchronous (202) responses
   - Save the output as `Add_image_stamp_to_PDF_output.pdf`

## Configuration

You can modify the following parameters in `app.js`:

### File Paths
- `INPUT_PDF_FILE` - Path to the input PDF file
- `INPUT_IMAGE_FILE` - Path to the stamp image file
- `OUTPUT_FILE` - Name of the output PDF file

### Stamp Properties
- `alignX` - Horizontal alignment: "Left", "Center", "Right"
- `alignY` - Vertical alignment: "Top", "Middle", "Bottom"
- `heightInMM` / `widthInMM` - Size in millimeters
- `heightInPx` / `widthInPx` - Size in pixels
- `marginXInMM` / `marginYInMM` - Margins in millimeters
- `marginXInPx` / `marginYInPx` - Margins in pixels
- `opacity` - Opacity level (0-100)
- `isBackground` - Place stamp in background (true/false)
- `showOnlyInPrint` - Show only when printing (true/false)
- `pages` - Page selection (empty for all pages, "1,3,5" for specific pages)

### API Configuration
- `API_KEY` - Your PDF4me API key
- `BASE_URL` - PDF4me API base URL

## Error Handling

The application includes comprehensive error handling:
- File existence validation
- Network error retry logic (10 attempts with 10-second delays)
- API response status handling
- Asynchronous processing with polling

## Response Codes

- **200** - Success: Image stamp addition completed immediately
- **202** - Accepted: Processing asynchronously (will poll for completion)
- **Other** - Error: Displays status code and error message

## Output

The application generates:
- `Add_image_stamp_to_PDF_output.pdf` - The PDF with the image stamp added

## Cross-Platform Compatibility

This application works on:
- Windows
- macOS
- Linux

No additional installations required beyond Node.js and npm.

## Troubleshooting

1. **File not found errors**: Ensure `sample.pdf` and `pdf4me.png` exist in the project directory
2. **API errors**: Verify your API key is correct and has proper permissions
3. **Network errors**: The application will automatically retry up to 10 times
4. **Timeout errors**: Increase `max_retries` or `retry_delay` values if needed 