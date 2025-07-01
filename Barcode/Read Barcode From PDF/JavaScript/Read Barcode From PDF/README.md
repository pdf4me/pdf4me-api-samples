# Read Barcode From PDF - JavaScript

A simple JavaScript client for extracting and reading barcodes from PDF documents using the PDF4me API. This project demonstrates how to programmatically scan PDF files for various types of barcodes (QR codes, Code128, DataMatrix, etc.) and extract their encoded data.

## Features

- **Multiple Barcode Types**: Support for QR codes, Code128, DataMatrix, Aztec, HanXin, PDF417, and more
- **Flexible Page Selection**: Read barcodes from specific pages or entire documents
- **JSON Output**: Structured data output with barcode information
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
   cd "Read Barcode From PDF"
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
   const OUTPUT_FILE = 'Read_barcode_output.json'; // Your output file name
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

#### Barcode Type Filtering
```javascript
barcodeType: ["all"] // Options: ["all"], ["qrCode"], ["dataMatrix"], ["code128"], etc.
```

#### Page Selection
```javascript
pages: "all" // Options: "all", "1", "1,3,5", "2-5", "1,3,7-10", "2-"
```

#### Processing Mode
```javascript
async: true // Enable asynchronous processing for better performance
```

## Input Files

- **sample.pdf**: The input PDF file from which barcodes will be extracted
- Place your PDF file in the project directory and update the `INPUT_FILE` constant if needed

## Output Files

- **Read_barcode_output.json**: The extracted barcode data in JSON format
- The output file contains structured information about found barcodes

### Example JSON Output
```json
{
  "barcodes": [
    {
      "type": "qrCode",
      "text": "PDF4me Barcode Sample",
      "page": 1,
      "x": 100,
      "y": 200,
      "width": 40,
      "height": 40
    },
    {
      "type": "code128",
      "text": "123456789",
      "page": 2,
      "x": 150,
      "y": 300,
      "width": 80,
      "height": 30
    }
  ],
  "totalCount": 2,
  "pagesScanned": [1, 2]
}
```

## API Endpoint

This project uses the PDF4me API endpoint:
- **URL**: `https://api.pdf4me.com/api/v2/ReadBarcodes`
- **Method**: POST
- **Authentication**: Basic Auth with API key

## Error Handling

The application includes comprehensive error handling:

- **File Validation**: Checks if input files exist
- **Network Retry Logic**: Automatically retries failed requests (up to 10 attempts)
- **API Error Handling**: Handles various HTTP status codes and error responses
- **Async Processing**: Supports both immediate and asynchronous processing modes
- **JSON Parsing**: Robust handling of API response data

## Example Output

When successful, the application will:
1. Read the input PDF file
2. Send the barcode reading request to PDF4me API
3. Process the response (immediate or async)
4. Save the barcode data to JSON file
5. Display found barcodes in console

### Console Output Example
```
Reading barcodes from PDF...
Attempt 1/10 - Reading barcodes from PDF...
PDF file read successfully: 102400 bytes
Sending barcode reading request to PDF4me API...
Response status: 200
Buffer size: 759 bytes
✓ Success! Barcode reading completed!
Barcode data saved: Read_barcode_output.json
Found 2 barcode(s):
  1. Type: qrCode, Text: PDF4me Barcode Sample
  2. Type: code128, Text: 123456789
```

## Supported Barcode Types

The API can detect and read various barcode formats:

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
2. **File Not Found**: Verify that `sample.pdf` exists in the project directory
3. **Network Issues**: The application will automatically retry on network failures
4. **Large Files**: For large PDF files, processing may take longer and use async mode
5. **No Barcodes Found**: Check if the PDF actually contains readable barcodes

### Debug Information

The application provides detailed console output including:
- File read operations and sizes
- API request status
- Processing attempts and retries
- Success/failure messages
- Barcode detection results
- File save confirmations

### Error Messages

Common error scenarios and solutions:

- **401 Unauthorized**: Check your API key
- **400 Bad Request**: Verify PDF file format and content
- **404 Not Found**: Ensure input file exists
- **Network Timeout**: The app will retry automatically
- **JSON Parse Error**: Check API response format

## Performance Considerations

- **Small PDFs**: Process quickly with immediate response
- **Large PDFs**: May use async processing for better performance
- **Multiple Barcodes**: All barcodes are extracted in a single request
- **Page Selection**: Limit pages to scan for faster processing

## Use Cases

This barcode reader is useful for:

- **Document Processing**: Extract barcode data from scanned documents
- **Inventory Management**: Read product barcodes from PDF catalogs
- **Form Processing**: Extract data from barcoded forms
- **Quality Control**: Verify barcode presence and content
- **Data Extraction**: Automate barcode data collection
- **Compliance**: Ensure documents contain required barcodes

## Data Structure

The extracted barcode data includes:

- **Type**: Barcode format (qrCode, code128, etc.)
- **Text**: Decoded barcode content
- **Page**: Page number where barcode was found
- **Position**: X, Y coordinates of barcode
- **Dimensions**: Width and height of barcode
- **Confidence**: Detection confidence level (if available)

## License

This project is licensed under the MIT License.

## Support

For issues related to:
- **PDF4me API**: Contact PDF4me support
- **This JavaScript Client**: Check the console output for detailed error messages

## Related Projects

- [Add Barcode To PDF](../Add%20Barcode%20To%20PDF/) - Add barcodes to existing PDF documents
- [Create Barcode](../Create%20Barcode/) - Generate standalone barcode images
- [Read SwissQR Code](../Read%20SwissQR%20Code/) - Specialized Swiss QR code reader 