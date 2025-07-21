# Extract Text from Word (Salesforce)

A Salesforce Apex sample project for extracting text content from Word documents using the PDF4Me API.

## Project Structure

```
Extract Text from word/
├── ExtractTextFromWord.cls                    # Main Apex class for text extraction
├── ExtractTextFromWordTest.cls                # Test class for the main functionality
├── Executable_Anonymous_code_ExtractTextFromWord.txt # Anonymous Apex code for execution
└── README.md                                  # This file
```

## Features

- ✅ Extract text content from Word documents (.docx, .doc)
- ✅ Configurable page range extraction
- ✅ Remove comments, headers, and footers
- ✅ Accept or reject tracked changes
- ✅ Handles both synchronous and asynchronous API responses
- ✅ Comprehensive error handling and logging
- ✅ Base64 encoding for secure document transmission
- ✅ Multiple output formats (TXT, JSON metadata)
- ✅ Full Salesforce integration with Apex classes
- ✅ Test coverage with comprehensive test class

## Prerequisites

- Salesforce org with API access
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- Internet connection (for PDF4Me API access)
- Apex development environment (Salesforce CLI, Developer Console, or IDE)

## Setup

1. **Deploy the Apex classes:**
   - Deploy `ExtractTextFromWord.cls` to your Salesforce org
   - Deploy `ExtractTextFromWordTest.cls` for testing

2. **Configure your API key:**
   - Open `ExtractTextFromWord.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Prepare your document:**
   - Ensure you have a Word file available in your Salesforce org
   - Update the document reference in the code if needed

## Usage

### Method 1: Using the Main Class

```apex
// Create an instance of the extractor
ExtractTextFromWord extractor = new ExtractTextFromWord();

// Extract text from a document (replace with your document ID)
String documentId = 'your_document_id_here';
String result = extractor.extractTextFromWord(documentId);

// Process the result
System.debug('Extraction Result: ' + result);
```

### Method 2: Using Anonymous Apex

1. **Open Developer Console or Salesforce CLI**
2. **Execute the code from `Executable_Anonymous_code_ExtractTextFromWord.txt`**
3. **Check the debug logs for results**

### Input and Output

- **Input:** Salesforce Document ID or base64 encoded Word content
- **Output:** JSON string with extracted text and metadata

## Configuration

- **API Key:** Set in `ExtractTextFromWord.cls`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ExtractTextFromWord`
- **Payload Options:**
  - `docContent`: Base64 encoded Word document content
  - `docName`: Name of the input Word file
  - `StartPageNumber`: Starting page number for extraction
  - `EndPageNumber`: Ending page number for extraction
  - `RemoveComments`: true/false (remove comments from text)
  - `RemoveHeaderFooter`: true/false (remove headers and footers)
  - `AcceptChanges`: true/false (accept tracked changes)
  - `async`: true/false (async recommended for large documents)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ExtractTextFromWord`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Extracted text content (JSON or text file)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Response Format

The extraction result can be:

### JSON Response (Structured Data)
- Contains extracted text with page information
- Includes metadata about the extraction process
- Preserves document structure and formatting information

### Text Response (Plain Text)
- Contains extracted text content in plain text format
- Suitable for further processing or analysis

## Extraction Options

### Page Range
- Specify start and end page numbers
- Extract text from specific sections of the document
- Useful for large documents where you only need certain pages

### Content Filtering
- **Remove Comments:** Exclude comment text from extraction
- **Remove Headers/Footers:** Exclude header and footer content
- **Accept Changes:** Include or exclude tracked changes

### Processing Options
- **Synchronous vs Asynchronous:** Choose based on document size
- **Error Handling:** Comprehensive error detection and reporting

## Error Handling

- Missing or invalid Word file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- Invalid page range specifications
- Salesforce callout limits and restrictions

## Testing

Run the test class to verify functionality:

```apex
// Execute test methods
Test.startTest();
ExtractTextFromWordTest.testExtractTextFromWord();
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
   - Ensure the Word file is valid and accessible

3. **"Callout timeout"**
   - Large/complex documents may take longer
   - Check Salesforce callout timeout settings

4. **"Invalid page range"**
   - Ensure start page is less than or equal to end page
   - Check that page numbers are within document bounds

5. **"No text extracted"**
   - The document may be empty or contain only images
   - Check if the document has actual text content

### Debugging

- Use Salesforce debug logs to trace execution
- Check exception messages in the logs
- Verify API responses in the debug output

## Salesforce Considerations

- **Callout Limits:** Be aware of Salesforce callout limits (100 per transaction)
- **Timeout:** Default callout timeout is 10 seconds
- **Base64 Encoding:** Large files may require chunking
- **Governor Limits:** Monitor CPU time and heap size usage
- **File Storage:** Consider where extracted text will be stored in Salesforce

## Output Structure

After successful extraction, you'll receive:
- JSON metadata about the extraction process
- Extracted text content
- Page information and formatting details

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer Documentation](https://developer.salesforce.com/docs/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 