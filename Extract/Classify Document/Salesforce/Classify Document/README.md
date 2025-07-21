# Classify Document (Salesforce)

A Salesforce Apex sample project for classifying and identifying document types using the PDF4Me API.

## Project Structure

```
Classify Document/
├── ClassifyDocument.cls                    # Main Apex class for document classification
├── ClassifyDocumentTest.cls                # Test class for the main functionality
├── Executable_Anonymous_code_ClassifyDocument.txt # Anonymous Apex code for execution
└── README.md                               # This file
```

## Features

- ✅ Classify documents based on content analysis
- ✅ Identify document types and categories automatically
- ✅ Handles both synchronous and asynchronous API responses
- ✅ Comprehensive error handling and logging
- ✅ Base64 encoding for secure document transmission
- ✅ JSON output with detailed classification results
- ✅ Full Salesforce integration with Apex classes
- ✅ Test coverage with comprehensive test class

## Prerequisites

- Salesforce org with API access
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- Internet connection (for PDF4Me API access)
- Apex development environment (Salesforce CLI, Developer Console, or IDE)

## Setup

1. **Deploy the Apex classes:**
   - Deploy `ClassifyDocument.cls` to your Salesforce org
   - Deploy `ClassifyDocumentTest.cls` for testing

2. **Configure your API key:**
   - Open `ClassifyDocument.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Prepare your document:**
   - Ensure you have a PDF file available in your Salesforce org
   - Update the document reference in the code if needed

## Usage

### Method 1: Using the Main Class

```apex
// Create an instance of the classifier
ClassifyDocument classifier = new ClassifyDocument();

// Classify a document (replace with your document ID)
String documentId = 'your_document_id_here';
String result = classifier.classifyDocument(documentId);

// Process the result
System.debug('Classification Result: ' + result);
```

### Method 2: Using Anonymous Apex

1. **Open Developer Console or Salesforce CLI**
2. **Execute the code from `Executable_Anonymous_code_ClassifyDocument.txt`**
3. **Check the debug logs for results**

### Input and Output

- **Input:** Salesforce Document ID or base64 encoded PDF content
- **Output:** JSON string with classification results

## Configuration

- **API Key:** Set in `ClassifyDocument.cls`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ClassifyDocument`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF document content
  - `docName`: Source PDF file name with .pdf extension
  - `async`: true/false (async recommended for large documents)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ClassifyDocument`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Classification results (JSON)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Response Format

The classification result includes:
- `templateId`: Unique identifier for the document template
- `templateName`: Name of the identified template
- `className`: Document class/category
- `traceId`: Request tracking identifier
- `jobId`: Job identifier (if applicable)
- `statusUrl`: Status polling URL (if applicable)
- `subscriptionUsage`: API usage information

## Error Handling

- Missing or invalid PDF file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- Invalid JSON response detection
- Salesforce callout limits and restrictions

## Testing

Run the test class to verify functionality:

```apex
// Execute test methods
Test.startTest();
ClassifyDocumentTest.testClassifyDocument();
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

4. **"No classification data found"**
   - API may have returned an error message
   - Check the full response for details

### Debugging

- Use Salesforce debug logs to trace execution
- Check exception messages in the logs
- Verify API responses in the debug output

## Salesforce Considerations

- **Callout Limits:** Be aware of Salesforce callout limits (100 per transaction)
- **Timeout:** Default callout timeout is 10 seconds
- **Base64 Encoding:** Large files may require chunking
- **Governor Limits:** Monitor CPU time and heap size usage

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer Documentation](https://developer.salesforce.com/docs/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 