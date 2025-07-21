# Fill a PDF Form (Salesforce)

A Salesforce Apex sample project for filling PDF forms with data using the PDF4me API.

## Project Structure

```
Fill a PDF Form/
├── FillPDFForm.cls                          # Main Apex class for form filling
├── FillPDFFormTest.cls                      # Test class for the main functionality
├── Executable_Anonymous_code_FillPDFForm.txt # Anonymous Apex code for execution
└── README.md                                # This file
```

## Features

- ✅ Fill PDF forms with data using PDF4me API
- ✅ Support for various form field types (text, checkbox, radio button, dropdown)
- ✅ Configurable form data mapping and validation
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
   - Deploy `FillPDFForm.cls` to your Salesforce org
   - Deploy `FillPDFFormTest.cls` for testing

2. **Configure your API key:**
   - Open `FillPDFForm.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4me API key

3. **Prepare your document:**
   - Ensure you have a PDF form file available in your Salesforce org
   - Update the document reference in the code if needed

## Usage

### Method 1: Using the Main Class

```apex
// Create an instance of the form filler
FillPDFForm filler = new FillPDFForm();

// Fill a form with data (replace with your document ID)
String documentId = 'your_document_id_here';
String result = filler.fillPdfForm(documentId);

// Process the result
System.debug('Form Filling Result: ' + result);
```

### Method 2: Using Anonymous Apex

1. **Open Developer Console or Salesforce CLI**
2. **Execute the code from `Executable_Anonymous_code_FillPDFForm.txt`**
3. **Check the debug logs for results**

### Input and Output

- **Input:** Salesforce Document ID or base64 encoded PDF content
- **Output:** JSON string with form filling results and file metadata

## Configuration

- **API Key:** Set in `FillPDFForm.cls`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/FillPdfForm`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF content
  - `docName`: Output document name
  - `formData`: Object containing form field values
  - `async`: true/false (async recommended for large files)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/FillPdfForm`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Filled PDF form (as base64)
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
FillPDFFormTest.testFillPdfForm();
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

4. **"Form field not found"**
   - The PDF may not contain the specified form fields
   - Check if the PDF actually has form fields

5. **"Invalid form data"**
   - Ensure form data is properly formatted
   - Check the API documentation for correct format

### Debugging

- Use Salesforce debug logs to trace execution
- Check exception messages in the logs
- Verify API responses in the debug output

## Salesforce Considerations

- **Callout Limits:** Be aware of Salesforce callout limits (100 per transaction)
- **Timeout:** Default callout timeout is 10 seconds
- **Base64 Encoding:** Large files may require chunking
- **Governor Limits:** Monitor CPU time and heap size usage
- **File Storage:** Consider where filled forms will be stored in Salesforce

## Output Structure

After successful form filling, you'll receive:
- JSON metadata about the form filling process
- Base64 encoded filled PDF form (if applicable)
- Console/debug output with status and result

## Support

- For PDF4me API issues, refer to [PDF4me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer Documentation](https://developer.salesforce.com/docs/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 