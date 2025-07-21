# Create SwissQR Bill - Salesforce Implementation

This project demonstrates how to create Swiss QR Bills from PDF documents using the PDF4Me API with Salesforce Apex.

## ✅ Features

- Create Swiss QR Bills from existing PDF documents
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Configurable Swiss QR Bill parameters
- Automatic polling for async operations
- Base64 encoding for file handling
- Salesforce integration ready

## Prerequisites

- Salesforce Org (Developer, Enterprise, or Unlimited Edition)
- PDF4Me API key
- Internet connection for API access
- Salesforce CLI (optional, for deployment)

## Project Structure

```
Create SwissQR Bill/
├── classes/
│   ├── GenerateCreateSwissQrBill.cls         # Main Apex controller
│   ├── GenerateCreateSwissQrBill.cls-meta.xml
│   ├── GenerateCreateSwissQrBillTest.cls     # Test class
│   └── GenerateCreateSwissQrBillTest.cls-meta.xml
├── README.md                                  # This documentation
├── Executable_Anonymous_code_GenerateCreateSwissQrBill.txt
└── sample-data/
    ├── sample.pdf                             # Sample input PDF file
    └── sample.swissqr.pdf                     # Generated Swiss QR Bill PDF file
```

## Setup

1. **Clone or download this project**
2. **Deploy to Salesforce**:
   ```bash
   sfdx force:source:deploy -p ./
   ```
   Or use Salesforce CLI:
   ```bash
   sfdx project deploy start
   ```
3. **Configure your API key** in Custom Settings or Named Credentials:
   - Go to Setup → Custom Settings
   - Create a new Custom Setting for PDF4Me configuration
   - Add your API key as a field

## Usage

The application can be used in several ways:

### 1. Apex Code Execution
```apex
// Create an instance of the controller
GenerateCreateSwissQrBill controller = new GenerateCreateSwissQrBill();

// Set the PDF content (Base64 encoded)
controller.setPdfContent('base64-encoded-pdf-content');

// Execute the Swiss QR Bill creation
String result = controller.createSwissQrBill();
```

### 2. Visualforce Page Integration
```apex
// In your Visualforce page controller
public class MyController {
    public void processPDF() {
        GenerateCreateSwissQrBill controller = new GenerateCreateSwissQrBill();
        // ... implementation
    }
}
```

### 3. Lightning Component Integration
```javascript
// In your Lightning component
import createSwissQrBill from '@salesforce/apex/GenerateCreateSwissQrBill.createSwissQrBill';

// Call the method
createSwissQrBill({ pdfContent: base64Content })
    .then(result => {
        // Handle success
    })
    .catch(error => {
        // Handle error
    });
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/v2/CreateSwissQrBill
```

## Specific Settings

### Swiss QR Bill Parameters
- **IBAN**: `"CH0200700110003765824"` - Swiss IBAN for the creditor
- **Creditor Name**: `"Test AG"` - Name of the creditor
- **Creditor Address**: Structured address with street, postal code, city
- **Amount**: `"1000"` - Payment amount in CHF
- **Currency**: `"CHF"` - Swiss Franc
- **Debtor Information**: Complete debtor details
- **Reference Type**: `"NON"` - No reference
- **Language**: `"English"` - Language for the QR bill
- **Separator Line**: `"LineWithScissor"` - Separator line style

## Implementation Details

### Key Components

1. **GenerateCreateSwissQrBill Class**: Main business logic for Swiss QR Bill creation
2. **HTTP Communication**: Handles API requests and responses
3. **Error Handling**: Comprehensive exception handling and logging
4. **Base64 Operations**: Encoding/decoding utilities

### Error Handling

- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format
- **Salesforce Limits**: Respects governor limits

## API Endpoints

### Create Swiss QR Bill
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/CreateSwissQrBill`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload

```json
{
  "docContent": "base64-encoded-pdf-content",
  "docName": "test.pdf",
  "iban": "CH0200700110003765824",
  "crName": "Test AG",
  "crAddressType": "S",
  "crStreetOrAddressLine1": "Test Strasse",
  "crStreetOrAddressLine2": "1",
  "crPostalCode": "8000",
  "crCity": "Zurich",
  "amount": "1000",
  "currency": "CHF",
  "udName": "Test Debt AG",
  "udAddressType": "S",
  "udStreetOrAddressLine1": "Test Deb Strasse",
  "udStreetOrAddressLine2": "2",
  "udPostalCode": "8000",
  "udCity": "Zurich",
  "referenceType": "NON",
  "languageType": "English",
  "seperatorLine": "LineWithScissor",
  "async": true
}
```

## Response Handling

### Success Response (200 OK)
```json
{
  "document": {
    "docData": "base64-encoded-swiss-qr-bill-pdf"
  }
}
```

### Asynchronous Response (202 Accepted)
```json
{
  "jobId": "job-12345",
  "status": "Accepted"
}
```

## Error Handling

The application includes comprehensive error handling for:

- **API Communication**: Network errors, timeouts
- **Response Processing**: Invalid JSON, unexpected status codes
- **Base64 Operations**: Encoding/decoding errors
- **Salesforce Limits**: Governor limit exceptions

## Dependencies

### Salesforce Features
- **Callouts**: HTTP callouts to external APIs
- **JSON**: JSON parsing and serialization
- **Base64**: Encoding/decoding utilities
- **Custom Settings**: API configuration storage

### External Dependencies
- **PDF4Me API**: External PDF processing service

## Security Considerations

- **API Key Protection**: Store API keys in Custom Settings or Named Credentials
- **File Validation**: Validate input files before processing
- **Error Information**: Avoid exposing sensitive information in error messages
- **HTTPS**: All API communications use HTTPS
- **Salesforce Security**: Respect field-level security and sharing rules

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify your API key is correct in Custom Settings
   - Check if the key has necessary permissions

2. **Callout Limits**
   - Salesforce has limits on callouts per transaction
   - Monitor callout usage in debug logs

3. **Network Errors**
   - Verify internet connection
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid PDF Format**
   - Ensure input file is a valid PDF document
   - Check if PDF is corrupted or password-protected

5. **Governor Limits**
   - Monitor heap size for large PDF files
   - Check CPU time limits
   - Respect callout limits

### Debug Mode

Enable detailed logging by setting:
```apex
private static final Boolean DEBUG_MODE = true;
```

## Sample Files

- **sample.pdf**: Sample PDF file for testing
- **sample.swissqr.pdf**: Generated Swiss QR Bill PDF

## Expected Workflow

1. **Input**: PDF file with invoice or document content (Base64 encoded)
2. **Processing**: Add Swiss QR code with payment information
3. **Output**: PDF file with embedded Swiss QR Bill

## Next Steps

- Implement batch processing for multiple files
- Add support for custom Swiss QR Bill templates
- Integrate with Lightning Web Components
- Add progress tracking for large files

## Future Enhancements

- **Lightning Web Component**: Create modern UI components
- **Batch Processing**: Handle multiple PDF files simultaneously
- **Preview Feature**: Show QR code preview before generation
- **File Storage**: Integrate with Salesforce Files
- **Advanced Options**: Dynamic payment amount calculation
- **Mobile Support**: Optimize for mobile devices

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Salesforce Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 