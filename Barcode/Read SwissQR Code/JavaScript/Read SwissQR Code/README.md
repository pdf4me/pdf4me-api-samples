# Read SwissQR Code - JavaScript

A specialized JavaScript client for extracting and reading Swiss QR codes from PDF documents using the PDF4me API. This project demonstrates how to programmatically scan PDF files for Swiss QR codes (Swiss payment slips) and extract their structured payment information.

## Features

- **Swiss QR Code Support**: Specialized reader for Swiss QR payment codes
- **Structured Data Extraction**: Parse payment information into organized format
- **JSON Output**: Structured data output with Swiss QR payment details
- **Robust Error Handling**: Built-in retry logic and comprehensive error management
- **Asynchronous Processing**: Support for both synchronous and asynchronous API processing
- **No Dependencies**: Pure JavaScript implementation with no external dependencies

## About Swiss QR Codes

Swiss QR codes are standardized QR codes used in Switzerland for payment slips. They contain structured payment information including:

- **Account Information**: IBAN and account details
- **Payment Details**: Amount, currency, and payment purpose
- **Debtor Information**: Name and address of the payer
- **Creditor Information**: Name and address of the payee
- **Reference**: Payment reference numbers

## Prerequisites

- Node.js (version 14 or higher)
- PDF4me API key (get one from [https://dev.pdf4me.com/dashboard/#/api-keys](https://dev.pdf4me.com/dashboard/#/api-keys))

## Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd "Read SwissQR Code"
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
   const OUTPUT_FILE = 'read_swissqr_code_output.json'; // Your output file name
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

#### Processing Mode
```javascript
async: true // Enable asynchronous processing for better performance
```

#### Document Information
```javascript
docName: path.basename(INPUT_FILE) // PDF file name for processing
```

## Input Files

- **sample.pdf**: The input PDF file containing Swiss QR codes
- Place your PDF file in the project directory and update the `INPUT_FILE` constant if needed
- The PDF should contain Swiss QR codes (typically Swiss payment slips)

## Output Files

- **read_swissqr_code_output.json**: The extracted Swiss QR code data in JSON format
- The output file contains structured payment information

### Example JSON Output
```json
{
  "iban": "CH9300762011623852957",
  "creditor": {
    "name": "Test Company AG",
    "address": "Test Street 1",
    "city": "Test City",
    "zip": "8000",
    "country": "CH"
  },
  "debtor": {
    "name": "John Doe",
    "address": "Sample Street 1",
    "city": "Sample City",
    "zip": "8000",
    "country": "CH"
  },
  "amount": 100.00,
  "currency": "CHF",
  "reference": "123456789",
  "message": "Payment for services",
  "qrType": "swissQR"
}
```

## API Endpoint

This project uses the PDF4me API endpoint:
- **URL**: `https://api.pdf4me.com/api/v2/ReadSwissQR`
- **Method**: POST
- **Authentication**: Basic Auth with API key

## Error Handling

The application includes comprehensive error handling:

- **File Validation**: Checks if input files exist
- **Network Retry Logic**: Automatically retries failed requests (up to 20 attempts)
- **API Error Handling**: Handles various HTTP status codes and error responses
- **Async Processing**: Supports both immediate and asynchronous processing modes
- **JSON Parsing**: Robust handling of API response data

## Example Output

When successful, the application will:
1. Read the input PDF file
2. Send the Swiss QR reading request to PDF4me API
3. Process the response (immediate or async)
4. Save the Swiss QR data to JSON file
5. Display extracted payment information in console

### Console Output Example
```
Reading Swiss QR code from PDF...
Attempt 1/10 - Reading Swiss QR code from PDF...
PDF file read successfully: 206400 bytes
Sending Swiss QR reading request to PDF4me API...
Response status: 200
Buffer size: 456 bytes
✓ Success! Swiss QR reading completed!
Swiss QR data saved: read_swissqr_code_output.json
Swiss QR Code Data:
  iban: CH9300762011623852957
  creditor.name: Test Company AG
  creditor.address: Test Street 1
  creditor.city: Test City
  creditor.zip: 8000
  creditor.country: CH
  amount: 100.00
  currency: CHF
  reference: 123456789
  message: Payment for services
```

## Swiss QR Code Structure

Swiss QR codes contain the following structured information:

### Account Information
- **IBAN**: International Bank Account Number
- **Account Type**: Type of account (usually "S" for Swiss QR)

### Creditor Information (Payee)
- **Name**: Company or individual name
- **Address**: Street address
- **City**: City name
- **ZIP**: Postal code
- **Country**: Country code (CH for Switzerland)

### Debtor Information (Payer)
- **Name**: Payer's name
- **Address**: Payer's address
- **City**: Payer's city
- **ZIP**: Payer's postal code
- **Country**: Payer's country

### Payment Details
- **Amount**: Payment amount in decimal format
- **Currency**: Currency code (usually CHF)
- **Reference**: Payment reference number
- **Message**: Additional payment message

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your API key is correctly set in the `API_KEY` constant
2. **File Not Found**: Verify that `sample.pdf` exists in the project directory
3. **Network Issues**: The application will automatically retry on network failures
4. **Large Files**: For large PDF files, processing may take longer and use async mode
5. **No Swiss QR Found**: Check if the PDF actually contains Swiss QR codes
6. **Invalid Swiss QR**: Ensure the QR code follows Swiss QR standard format

### Debug Information

The application provides detailed console output including:
- File read operations and sizes
- API request status
- Processing attempts and retries
- Success/failure messages
- Swiss QR detection results
- File save confirmations

### Error Messages

Common error scenarios and solutions:

- **401 Unauthorized**: Check your API key
- **400 Bad Request**: Verify PDF file format and content
- **404 Not Found**: Ensure input file exists
- **Network Timeout**: The app will retry automatically
- **JSON Parse Error**: Check API response format
- **Invalid Swiss QR**: QR code doesn't follow Swiss standard

## Performance Considerations

- **Small PDFs**: Process quickly with immediate response
- **Large PDFs**: May use async processing for better performance
- **Multiple Swiss QR Codes**: All codes are extracted in a single request
- **Extended Polling**: Uses up to 20 retries for complex processing

## Use Cases

This Swiss QR reader is useful for:

- **Banking Applications**: Process Swiss payment slips
- **Invoice Processing**: Extract payment information from invoices
- **Financial Services**: Automate payment data extraction
- **Compliance**: Verify Swiss QR code compliance
- **Payment Automation**: Integrate with payment systems
- **Document Management**: Organize payment documents

## Swiss QR Code Standards

Swiss QR codes follow specific standards:

- **ISO 20022**: International standard for financial messaging
- **Swiss QR-Bill**: Swiss-specific implementation
- **QR Code Format**: Standard QR code with Swiss QR data structure
- **Character Encoding**: UTF-8 encoding for text fields

## Data Validation

The extracted data includes validation for:

- **IBAN Format**: Validates Swiss IBAN structure
- **Amount Format**: Ensures proper decimal formatting
- **Currency Codes**: Validates supported currencies
- **Reference Numbers**: Checks reference format compliance
- **Address Format**: Validates Swiss address structure

## License

This project is licensed under the MIT License.

## Support

For issues related to:
- **PDF4me API**: Contact PDF4me support
- **This JavaScript Client**: Check the console output for detailed error messages
- **Swiss QR Standards**: Refer to Swiss QR-Bill documentation

## Related Projects

- [Add Barcode To PDF](../Add%20Barcode%20To%20PDF/) - Add barcodes to existing PDF documents
- [Create Barcode](../Create%20Barcode/) - Generate standalone barcode images
- [Read Barcode From PDF](../Read%20Barcode%20From%20PDF/) - Extract general barcode data from PDFs 