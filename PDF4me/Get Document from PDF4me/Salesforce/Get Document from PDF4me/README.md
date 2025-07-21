# Get Document from PDF4me (Salesforce)

A Salesforce Apex sample project for splitting PDF documents by Swiss QR barcode using the PDF4me API.

## Project Structure

```
Get Document from PDF4me/
├── GetDocumentFromPDF4me.cls                    # Main Apex class for barcode splitting
├── GetDocumentFromPDF4meTest.cls                # Test class for the main functionality
├── Executable_Anonymous_code_GetDocumentFromPDF4me.txt # Anonymous Apex code for execution
└── README.md                                    # This file
```

## Features

- ✅ Split PDF by Swiss QR barcode using PDF4me API
- ✅ Support for various barcode types (QR Code, Code128, Code39)
- ✅ Configurable barcode filtering options
- ✅ Handles both synchronous and asynchronous API responses
- ✅ Comprehensive error handling and logging
- ✅ Base64 encoding for secure document transmission
- ✅ Full Salesforce integration with Apex classes
- ✅ Test coverage with comprehensive test class

## Prerequisites

- Salesforce org with API access
- PDF4me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- Internet connection (for PDF4me API access)
- Apex development environment (Salesforce CLI, Developer Console, or IDE)

## Setup

1. **Deploy the Apex classes:**
   - Deploy `GetDocumentFromPDF4me.cls` to your Salesforce org
   - Deploy `GetDocumentFromPDF4meTest.cls` for testing

2. **Configure your API key:**
   - Open `GetDocumentFromPDF4me.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4me API key

3. **Prepare your document:**
   - Ensure you have a PDF file available in your Salesforce org
   - Update the document reference in the code if needed

## Usage

### Method 1: Using the Main Class

```apex
// Create an instance of the splitter
GetDocumentFromPDF4me splitter = new GetDocumentFromPDF4me();

// Split a document by barcode (replace with your document ID)
String documentId = 'your_document_id_here';
String result = splitter.splitPdfByBarcode(documentId);

// Process the result
System.debug('Splitting Result: ' + result);
```

### Method 2: Using Anonymous Apex

1. **Open Developer Console or Salesforce CLI**
2. **Execute the code from `Executable_Anonymous_code_GetDocumentFromPDF4me.txt`**
3. **Check the debug logs for results**

### Input and Output

- **Input:** Salesforce Document ID or base64 encoded PDF content
- **Output:** JSON string with splitting results and file metadata

## Configuration

- **API Key:** Set in `GetDocumentFromPDF4me.cls`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/SplitPdfByBarcode_old`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF content
  - `docName`: Output document name
  - `barcodeString`: Text to search for in barcodes
  - `barcodeFilter`: "startsWith", "contains", "equals"
  - `barcodeType`: "qrcode", "code128", "code39"
  - `splitBarcodePage`: "before" or "after"
  - `combinePagesWithSameConsecutiveBarcodes`: true/false
  - `pdfRenderDpi`: DPI for PDF rendering
  - `async`: true/false (async recommended for large files)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/SplitPdfByBarcode_old`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: ZIP archive with split PDFs (as base64)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Error Handling

- Missing or invalid PDF file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- Invalid ZIP file detection
- Salesforce callout limits and restrictions

## Testing

Run the test class to verify functionality:

```apex
// Execute test methods
Test.startTest();
GetDocumentFromPDF4meTest.testSplitPdfByBarcode();
Test.stopTest();
```

## Troubleshooting

### Common Issues

1. **"Document not found"**
   - Ensure the document ID is valid
   - Check document permissions in Salesforce

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the PDF file is valid and accessible

3. **"Callout timeout"**
   - Large/complex documents may take longer
   - Check Salesforce callout timeout settings

4. **"No barcodes found"**
   - The PDF may not contain any barcodes
   - Check if the PDF actually has barcodes

5. **"ZIP extraction failed"**
   - The response may not be a valid ZIP file
   - Check the response content type and format

### Debugging

- Use Salesforce debug logs to trace execution
- Check exception messages in the logs
- Verify API responses in the debug output

## Salesforce Considerations

- **Callout Limits:** Be aware of Salesforce callout limits (100 per transaction)
- **Timeout:** Default callout timeout is 10 seconds
- **Base64 Encoding:** Large files may require chunking
- **Governor Limits:** Monitor CPU time and heap size usage
- **File Storage:** Consider where split files will be stored in Salesforce

## Output Structure

After successful splitting, you'll receive:
- JSON metadata about the splitting process
- Base64 encoded ZIP file with split PDFs (if applicable)
- Console/debug output with status and result

## Support

- For PDF4me API issues, refer to [PDF4me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer Documentation](https://developer.salesforce.com/docs/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 