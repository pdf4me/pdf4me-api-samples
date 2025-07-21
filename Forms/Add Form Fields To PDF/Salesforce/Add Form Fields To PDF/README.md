# Add Form Fields To PDF (Salesforce)

A Salesforce Apex sample project for adding form fields to PDF documents using the PDF4me API.

## Project Structure

```
Add Form Fields To PDF/
├── AddFormFieldsToPDF.cls                    # Main Apex class for form field addition
├── AddFormFieldsToPDFTest.cls                # Test class for the main functionality
├── Executable_Anonymous_code_AddFormFieldsToPDF.txt # Anonymous Apex code for execution
└── README.md                                 # This file
```

## Features

- ✅ Add form fields to PDF documents using PDF4me API
- ✅ Support for various form field types (text, checkbox, radio button, dropdown)
- ✅ Configurable field properties (position, size, validation, appearance)
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
   - Deploy `AddFormFieldsToPDF.cls` to your Salesforce org
   - Deploy `AddFormFieldsToPDFTest.cls` for testing

2. **Configure your API key:**
   - Open `AddFormFieldsToPDF.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4me API key

3. **Prepare your document:**
   - Ensure you have a PDF file available in your Salesforce org
   - Update the document reference in the code if needed

## Usage

### Method 1: Using the Main Class

```apex
// Create an instance of the form field adder
AddFormFieldsToPDF adder = new AddFormFieldsToPDF();

// Add form fields to a document (replace with your document ID)
String documentId = 'your_document_id_here';
String result = adder.addFormFieldsToPdf(documentId);

// Process the result
System.debug('Form Fields Result: ' + result);
```

### Method 2: Using Anonymous Apex

1. **Open Developer Console or Salesforce CLI**
2. **Execute the code from `Executable_Anonymous_code_AddFormFieldsToPDF.txt`**
3. **Check the debug logs for results**

### Input and Output

- **Input:** Salesforce Document ID or base64 encoded PDF content
- **Output:** JSON string with form field addition results and file metadata

## Configuration

- **API Key:** Set in `AddFormFieldsToPDF.cls`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/AddFormFieldsToPdf`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF content
  - `docName`: Output document name
  - `formFields`: Array of form field configurations
  - `async`: true/false (async recommended for large files)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/AddFormFieldsToPdf`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: PDF file with form fields (as base64)
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
AddFormFieldsToPDFTest.testAddFormFieldsToPdf();
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

4. **"Invalid form field configuration"**
   - Ensure form field data is properly formatted
   - Check the API documentation for correct format

5. **"Form field position out of bounds"**
   - Ensure field coordinates are within PDF page boundaries
   - Check page dimensions and field positioning

### Debugging

- Use Salesforce debug logs to trace execution
- Check exception messages in the logs
- Verify API responses in the debug output

## Salesforce Considerations

- **Callout Limits:** Be aware of Salesforce callout limits (100 per transaction)
- **Timeout:** Default callout timeout is 10 seconds
- **Base64 Encoding:** Large files may require chunking
- **Governor Limits:** Monitor CPU time and heap size usage
- **File Storage:** Consider where updated files will be stored in Salesforce

## Output Structure

After successful processing, you'll receive:
- JSON metadata about the form field addition process
- Base64 encoded PDF file with form fields (if applicable)
- Console/debug output with status and result

## Support

- For PDF4me API issues, refer to [PDF4me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer Documentation](https://developer.salesforce.com/docs/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 