# Extract Attachment From PDF (Salesforce)

A Salesforce Apex sample project for extracting file attachments from PDF documents using the PDF4Me API.

## Project Structure

```
Extract Attachment From PDF/
├── ExtractAttachmentFromPDF.cls                    # Main Apex class for attachment extraction
├── ExtractAttachmentFromPDFTest.cls                # Test class for the main functionality
├── Executable_Anonymous_code_ExtractAttachmentFromPDF.txt # Anonymous Apex code for execution
└── README.md                                       # This file
```

## Features

- ✅ Extract all file attachments from PDF documents
- ✅ Handles both synchronous and asynchronous API responses
- ✅ Comprehensive error handling and logging
- ✅ Base64 encoding for secure document transmission
- ✅ Multiple output formats (ZIP, individual files, metadata)
- ✅ Automatic ZIP file extraction
- ✅ Metadata preservation for extracted files
- ✅ Full Salesforce integration with Apex classes
- ✅ Test coverage with comprehensive test class

## Prerequisites

- Salesforce org with API access
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- Internet connection (for PDF4Me API access)
- Apex development environment (Salesforce CLI, Developer Console, or IDE)

## Setup

1. **Deploy the Apex classes:**
   - Deploy `ExtractAttachmentFromPDF.cls` to your Salesforce org
   - Deploy `ExtractAttachmentFromPDFTest.cls` for testing

2. **Configure your API key:**
   - Open `ExtractAttachmentFromPDF.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Prepare your document:**
   - Ensure you have a PDF file available in your Salesforce org
   - Update the document reference in the code if needed

## Usage

### Method 1: Using the Main Class

```apex
// Create an instance of the extractor
ExtractAttachmentFromPDF extractor = new ExtractAttachmentFromPDF();

// Extract attachments from a document (replace with your document ID)
String documentId = 'your_document_id_here';
String result = extractor.extractAttachmentFromPdf(documentId);

// Process the result
System.debug('Extraction Result: ' + result);
```

### Method 2: Using Anonymous Apex

1. **Open Developer Console or Salesforce CLI**
2. **Execute the code from `Executable_Anonymous_code_ExtractAttachmentFromPDF.txt`**
3. **Check the debug logs for results**

### Input and Output

- **Input:** Salesforce Document ID or base64 encoded PDF content
- **Output:** JSON string with extraction results and file metadata

## Configuration

- **API Key:** Set in `ExtractAttachmentFromPDF.cls`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ExtractAttachmentFromPdf`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF document content
  - `docName`: Source PDF file name with .pdf extension
  - `async`: true/false (async recommended for large documents)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ExtractAttachmentFromPdf`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Extracted attachments (ZIP file or JSON metadata)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Response Format

The extraction result can be:

### Binary Response (ZIP file)
- Contains all extracted attachments in a ZIP archive
- Can be processed to extract individual files

### JSON Response (Metadata)
- Contains metadata about extracted attachments
- Includes file names, sizes, and content information
- Individual files can be extracted and saved separately

## Extracted File Types

The API can extract various file types including:
- Text files (.txt)
- Images (.jpg, .png, .gif, etc.)
- Documents (.doc, .docx, .pdf, etc.)
- Spreadsheets (.xls, .xlsx, etc.)
- Any other file type embedded in the PDF

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
ExtractAttachmentFromPDFTest.testExtractAttachmentFromPdf();
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

4. **"No attachments found"**
   - The PDF may not contain any embedded attachments
   - Check if the PDF actually has file attachments

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
- **File Storage:** Consider where extracted files will be stored in Salesforce

## Output Structure

After successful extraction, you'll receive:
- JSON metadata about all extracted files
- Information about file names, sizes, and content
- Base64 encoded content for individual files (if applicable)

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer Documentation](https://developer.salesforce.com/docs/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 