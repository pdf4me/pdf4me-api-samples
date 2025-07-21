# Convert PDF to Editable PDF using OCR (Salesforce)

A Salesforce Apex sample project for converting PDF documents to editable PDFs using OCR (Optical Character Recognition) via the PDF4me API.

## Project Structure

```
Convert PDF to editable PDF using OCR/
├── ConvertPdfToEditablePdfUsingOcr.cls                    # Main Apex class for OCR conversion
├── ConvertPdfToEditablePdfUsingOcrTest.cls                # Test class for the main functionality
├── Executable_Anonymous_code_ConvertPdfToEditablePdfUsingOcr.txt # Anonymous Apex code for execution
└── README.md                                              # This file
```

## Features

- ✅ Convert PDF to editable PDF using OCR technology via PDF4me API
- ✅ Handles both synchronous and asynchronous API responses
- ✅ Comprehensive error handling and logging
- ✅ Base64 encoding for secure document transmission
- ✅ Full Salesforce integration with Apex classes
- ✅ Test coverage with comprehensive test class
- ✅ OCR text recognition and conversion

## Prerequisites

- Salesforce org with API access
- PDF4me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- Internet connection (for PDF4me API access)
- Apex development environment (Salesforce CLI, Developer Console, or IDE)

## Setup

1. **Deploy the Apex classes:**
   - Deploy `ConvertPdfToEditablePdfUsingOcr.cls` to your Salesforce org
   - Deploy `ConvertPdfToEditablePdfUsingOcrTest.cls` for testing

2. **Configure your API key:**
   - Open `ConvertPdfToEditablePdfUsingOcr.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4me API key

3. **Prepare your document:**
   - Ensure you have a PDF file available in your Salesforce org
   - Update the document reference in the code if needed

## Usage

### Method 1: Using the Main Class

```apex
// Create an instance of the OCR converter
ConvertPdfToEditablePdfUsingOcr converter = new ConvertPdfToEditablePdfUsingOcr();

// Convert a document using OCR (replace with your document ID)
String documentId = 'your_document_id_here';
String result = converter.convertPdfToEditablePdfUsingOcr(documentId);

// Process the result
System.debug('OCR Conversion Result: ' + result);
```

### Method 2: Using Anonymous Apex

1. **Open Developer Console or Salesforce CLI**
2. **Execute the code from `Executable_Anonymous_code_ConvertPdfToEditablePdfUsingOcr.txt`**
3. **Check the debug logs for results**

### Input and Output

- **Input:** Salesforce Document ID or base64 encoded PDF content
- **Output:** JSON string with OCR conversion results and file metadata

## Configuration

- **API Key:** Set in `ConvertPdfToEditablePdfUsingOcr.cls`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ConvertPdfToEditablePdfUsingOcr`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF content
  - `docName`: Output document name
  - `async`: true/false (async recommended for large files)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ConvertPdfToEditablePdfUsingOcr`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Editable PDF file (as base64)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Error Handling

- Missing or invalid PDF file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- Invalid PDF response detection
- Salesforce callout limits and restrictions

## Testing

Run the test class to verify functionality:

```apex
// Execute test methods
Test.startTest();
ConvertPdfToEditablePdfUsingOcrTest.testConvertPdfToEditablePdfUsingOcr();
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

4. **"OCR processing failed"**
   - The PDF may not contain recognizable text
   - Check if the PDF has clear, readable text

5. **"No text found"**
   - The PDF may be image-based without text
   - Ensure the PDF contains text that can be recognized

### Debugging

- Use Salesforce debug logs to trace execution
- Check exception messages in the logs
- Verify API responses in the debug output

## Salesforce Considerations

- **Callout Limits:** Be aware of Salesforce callout limits (100 per transaction)
- **Timeout:** Default callout timeout is 10 seconds
- **Base64 Encoding:** Large files may require chunking
- **Governor Limits:** Monitor CPU time and heap size usage
- **File Storage:** Consider where converted files will be stored in Salesforce

## Output Structure

After successful conversion, you'll receive:
- JSON metadata about the OCR conversion process
- Base64 encoded editable PDF file (if applicable)
- Console/debug output with status and result

## Support

- For PDF4me API issues, refer to [PDF4me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer Documentation](https://developer.salesforce.com/docs/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 