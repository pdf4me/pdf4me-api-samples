# Create Barcode - JavaScript

A simple JavaScript client for creating standalone barcode images using the PDF4me API. This project demonstrates how to programmatically generate various types of barcodes (QR codes, Code128, DataMatrix, etc.) as image files with customizable options.

## Features

- **Multiple Barcode Types**: Support for QR codes, Code128, DataMatrix, Aztec, HanXin, PDF417, and more
- **Image Output**: Generate barcodes as PNG image files
- **Customizable Text**: Control barcode text visibility and content
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
   cd "Create Barcode"
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
3. Optionally, modify the output file name:
   ```javascript
   const OUTPUT_FILE = 'Barcode_create_output.png'; // Your output file name
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

#### Text Content
```javascript
text: "PDF4me Create Barcode Sample" // The text to encode in the barcode
```

#### Text Display
```javascript
hideText: false // Hide barcode text: true=hide, false=show text alongside barcode
```

#### Processing Mode
```javascript
async: true // Enable asynchronous processing for better performance
```

## Output Files

- **Barcode_create_output.png**: The generated barcode image file
- The output file will be created in the same directory as a PNG image

## API Endpoint

This project uses the PDF4me API endpoint:
- **URL**: `https://api.pdf4me.com/api/v2/CreateBarcode`
- **Method**: POST
- **Authentication**: Basic Auth with API key

## Error Handling

The application includes comprehensive error handling:

- **Network Retry Logic**: Automatically retries failed requests (up to 10 attempts)
- **API Error Handling**: Handles various HTTP status codes and error responses
- **Async Processing**: Supports both immediate and asynchronous processing modes
- **Buffer Validation**: Ensures proper image data handling

## Example Output

When successful, the application will:
1. Send the barcode creation request to PDF4me API
2. Process the response (immediate or async)
3. Save the barcode as a PNG image file
4. Display success messages and file information

### Console Output Example
```
Creating barcode...
Attempt 1/10 - Creating barcode...
Sending barcode creation request to PDF4me API...
Response status: 200
Buffer size: 1234 bytes
✓ Success! Barcode creation completed!
Buffer size: 1234 bytes
File saved: Barcode_create_output.png
```

## Supported Barcode Types

The API supports various barcode formats:

- **QR Code**: 2D matrix barcode for general use
- **Code128**: Linear barcode for alphanumeric data
- **DataMatrix**: 2D matrix barcode for small data
- **Aztec**: 2D matrix barcode for mobile applications
- **HanXin**: Chinese QR code variant
- **PDF417**: 2D stacked barcode for large data
- **Code39**: Linear barcode for industrial applications
- **EAN-13**: European Article Number for retail
- **UPC-A**: Universal Product Code for retail

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your API key is correctly set in the `API_KEY` constant
2. **Network Issues**: The application will automatically retry on network failures
3. **Invalid Text**: Some barcode types have character limitations
4. **Large Text**: Very long text may not fit in certain barcode types

### Debug Information

The application provides detailed console output including:
- API request status
- Buffer size information
- Processing attempts and retries
- Success/failure messages
- File save confirmations

### Error Messages

Common error scenarios and solutions:

- **401 Unauthorized**: Check your API key
- **400 Bad Request**: Verify barcode type and text content
- **Network Timeout**: The app will retry automatically
- **File Write Error**: Check directory permissions

## Performance Considerations

- **Small Barcodes**: Generate quickly with immediate processing
- **Complex Barcodes**: May use async processing for better performance
- **Multiple Requests**: Consider rate limiting for bulk operations

## Use Cases

This barcode generator is useful for:

- **Inventory Management**: Generate product barcodes
- **Documentation**: Add barcodes to reports and forms
- **Mobile Applications**: Create QR codes for app downloads
- **Event Management**: Generate ticket barcodes
- **Shipping**: Create tracking barcodes
- **Retail**: Generate price and product barcodes

## License

This project is licensed under the MIT License.

## Support

For issues related to:
- **PDF4me API**: Contact PDF4me support
- **This JavaScript Client**: Check the console output for detailed error messages

## Related Projects

- [Add Barcode To PDF](../Add%20Barcode%20To%20PDF/) - Add barcodes to existing PDF documents
- [Read Barcode From PDF](../Read%20Barcode%20From%20PDF/) - Extract barcode data from PDFs
- [Read SwissQR Code](../Read%20SwissQR%20Code/) - Specialized Swiss QR code reader 