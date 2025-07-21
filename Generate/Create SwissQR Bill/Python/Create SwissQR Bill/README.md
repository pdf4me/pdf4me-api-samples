# Create SwissQR Bill - Python Implementation

This project demonstrates how to create Swiss QR Bills from PDF documents using the PDF4Me API with Python.

## ✅ Features

- Create Swiss QR Bills from existing PDF documents
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Configurable Swiss QR Bill parameters
- Automatic polling for async operations
- Base64 encoding for file handling

## Prerequisites

- Python 3.7 or higher
- PDF4Me API key
- Internet connection for API access
- Required Python packages (see Dependencies section)

## Project Structure

```
Create SwissQR Bill/
├── create_swissqr_bill.py      # Main application logic
├── README.md                   # This documentation
├── sample.pdf                  # Sample input PDF file
└── sample.swissqr.pdf          # Generated Swiss QR Bill PDF file
```

## Setup

1. **Clone or download this project**
2. **Install dependencies**:
   ```bash
   pip install requests
   ```
3. **Configure your API key** in `create_swissqr_bill.py`:
   ```python
   API_KEY = "your-api-key-here"
   ```
4. **Place your input PDF** as `sample.pdf` in the project directory
5. **Run the application**:
   ```bash
   python create_swissqr_bill.py
   ```

## Usage

The application will:
1. Read the input PDF file
2. Convert it to Base64
3. Send a request to create a Swiss QR Bill
4. Handle the response (synchronous or asynchronous)
5. Save the Swiss QR Bill as `sample.swissqr.pdf`

### Expected Output

```
=== Creating Swiss QR Bill ===
Swiss QR Bill saved to: sample.swissqr.pdf
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

1. **File Reading**: Reads PDF file and converts to Base64
2. **Request Building**: Constructs JSON payload with Swiss QR Bill parameters
3. **API Communication**: Sends HTTP POST request to PDF4Me API
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Download**: Downloads Swiss QR Bill PDF and saves to local file system

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format

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

- **File Operations**: Missing files, permission issues
- **API Communication**: Network errors, timeouts
- **Response Processing**: Invalid JSON, unexpected status codes
- **Base64 Operations**: Encoding/decoding errors

## Dependencies

### Required Packages
```
requests>=2.25.1
```

### Installation
```bash
pip install requests
```

Or install from requirements.txt:
```bash
pip install -r requirements.txt
```

## Security Considerations

- **API Key Protection**: Store API keys securely, not in source code
- **File Validation**: Validate input files before processing
- **Error Information**: Avoid exposing sensitive information in error messages
- **HTTPS**: All API communications use HTTPS

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify your API key is correct
   - Check if the key has necessary permissions

2. **File Not Found**
   - Ensure `sample.pdf` exists in the project directory
   - Check file permissions

3. **Network Errors**
   - Verify internet connection
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid PDF Format**
   - Ensure input file is a valid PDF document
   - Check if PDF is corrupted or password-protected

5. **Python Version Issues**
   - Ensure Python 3.7+ is installed
   - Check if virtual environment is activated

### Debug Mode

Enable detailed logging by setting:
```python
DEBUG_MODE = True
```

## Sample Files

- **sample.pdf**: Sample PDF file for testing
- **sample.swissqr.pdf**: Generated Swiss QR Bill PDF

## Expected Workflow

1. **Input**: PDF file with invoice or document content
2. **Processing**: Add Swiss QR code with payment information
3. **Output**: PDF file with embedded Swiss QR Bill

## Next Steps

- Implement batch processing for multiple files
- Add support for custom Swiss QR Bill templates
- Integrate with web interface
- Add progress tracking for large files

## Future Enhancements

- **GUI Interface**: Create tkinter or PyQt application
- **Batch Processing**: Handle multiple PDF files simultaneously
- **Preview Feature**: Show QR code preview before generation
- **Custom Templates**: Support for different Swiss QR Bill layouts
- **Advanced Options**: Dynamic payment amount calculation
- **Web Interface**: Create Flask/Django web application

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Python Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 