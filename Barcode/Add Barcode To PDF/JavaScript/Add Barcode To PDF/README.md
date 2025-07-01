# Add Barcode To PDF - JavaScript

A simple JavaScript client for adding barcodes to PDF documents using the PDF4me API. This project demonstrates how to programmatically add various types of barcodes (QR codes, Code128, DataMatrix, etc.) to PDF files with customizable positioning and styling options.

## Features

- **Multiple Barcode Types**: Support for QR codes, Code128, DataMatrix, Aztec, HanXin, PDF417, and more
- **Flexible Positioning**: Control horizontal and vertical alignment, margins, and page selection
- **Customizable Styling**: Adjust size, opacity, text display, and appearance
- **Robust Error Handling**: Built-in retry logic and comprehensive error management
- **Asynchronous Processing**: Support for both synchronous and asynchronous API processing
- **No Dependencies**: Pure JavaScript implementation with no external dependencies

## Prerequisites

- Node.js (version 14 or higher)
- PDF4me API key (get one from [https://dev.pdf4me.com/dashboard/#/api-keys](https://dev.pdf4me.com/dashboard/#/api-keys))

## Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd "Add Barcode To PDF"
   ```
3. Install dependencies (none required, but you can run):
   ```bash
   npm install
   ```

## Configuration

1. Open `app.js` in your preferred text editor
2. Replace the `API_KEY` constant with your actual PDF4me API key:
   ```javascript
   const API_KEY = "your-actual-api-key-here";
   ```
3. Optionally, modify the input and output file names:
   ```javascript
   const INPUT_FILE = 'sample.pdf'; // Your input PDF file
   const OUTPUT_FILE = 'Add_barcode_to_PDF_output.pdf'; // Your output file name
   ```

## Usage

### Basic Usage

Run the application:
```bash
npm start
```

Or directly with Node.js:
```bash
node app.js
```

### Customization Options

The application supports various configuration options in the payload object:

#### Barcode Type
```javascript
barcodeType: "qrCode" // Options: qrCode, code128, dataMatrix, aztec, hanXin, pdf417, etc.
```

#### Page Selection
```javascript
pages: "1-3" // Options: "", "1", "1,3,5", "2-5", "1,3,7-10", "2-" (empty = all pages)
```

#### Positioning
```javascript
alignX: "Right",        // Horizontal alignment: "Left", "Center", "Right"
alignY: "Bottom",       // Vertical alignment: "Top", "Middle", "Bottom"
marginXInMM: "20",      // Horizontal margin in millimeters
marginYInMM: "20",      // Vertical margin in millimeters
```

#### Size Control
```javascript
heightInMM: "40",       // Height in millimeters ("0" for auto-detect)
widthInMM: "40",        // Width in millimeters ("0" for auto-detect)
heightInPt: "113",      // Height in points ("0" for auto-detect)
widthInPt: "113",       // Width in points ("0" for auto-detect)
```

#### Appearance
```javascript
opacity: 100,           // Opacity (0-100): 0=transparent, 100=opaque
displayText: "below",   // Text display: "above", "below"
hideText: false,        // Hide barcode text (true/false)
showOnlyInPrint: false, // Show only in print (true/false)
```

## Input Files

- **sample.pdf**: The input PDF file to which barcodes will be added
- Place your PDF file in the project directory and update the `INPUT_FILE` constant if needed

## Output Files

- **Add_barcode_to_PDF_output.pdf**: The generated PDF file with added barcodes
- The output file will be created in the same directory

## API Endpoint

This project uses the PDF4me API endpoint:
- **URL**: `https://api.pdf4me.com/api/v2/addbarcode`
- **Method**: POST
- **Authentication**: Basic Auth with API key

## Error Handling

The application includes comprehensive error handling:

- **File Validation**: Checks if input files exist
- **Network Retry Logic**: Automatically retries failed requests (up to 10 attempts)
- **API Error Handling**: Handles various HTTP status codes and error responses
- **Async Processing**: Supports both immediate and asynchronous processing modes

## Example Output

When successful, the application will:
1. Read the input PDF file
2. Send the barcode addition request to PDF4me API
3. Process the response (immediate or async)
4. Save the output PDF with added barcodes
5. Display success messages and file locations

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your API key is correctly set in the `API_KEY` constant
2. **File Not Found**: Verify that `sample.pdf` exists in the project directory
3. **Network Issues**: The application will automatically retry on network failures
4. **Large Files**: For large PDF files, processing may take longer and use async mode

### Debug Information

The application provides detailed console output including:
- File read operations
- API request status
- Processing attempts and retries
- Success/failure messages
- File save confirmations

## License

This project is licensed under the MIT License.

## Support

For issues related to:
- **PDF4me API**: Contact PDF4me support
- **This JavaScript Client**: Check the console output for detailed error messages

## Related Projects

- [Create Barcode](../Create%20Barcode/) - Generate standalone barcode images
- [Read Barcode From PDF](../Read%20Barcode%20From%20PDF/) - Extract barcode data from PDFs
- [Read SwissQR Code](../Read%20SwissQR%20Code/) - Specialized Swiss QR code reader 