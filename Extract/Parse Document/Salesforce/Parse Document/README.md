# Parse Document (Salesforce)

A Salesforce Apex sample project for parsing and analyzing documents using the PDF4Me API.

## Project Structure

```
Parse Document/
├── ParseDocument.cls                        # Main Apex class for document parsing
├── ParseDocumentTest.cls                    # Test class for the main functionality
├── ParseDocument.txt                        # Anonymous Apex code for execution
└── README.md                                # This file
```

## Features

- ✅ Parse documents with template-based analysis
- ✅ Extract document type and metadata
- ✅ Handles both synchronous and asynchronous API responses
- ✅ Comprehensive error handling and logging
- ✅ Base64 encoding for secure document transmission
- ✅ Multiple output formats (TXT, JSON metadata)
- ✅ Document type detection and classification
- ✅ Full Salesforce integration with Apex classes
- ✅ Test coverage with comprehensive test class

## Prerequisites

- Salesforce org with API access
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- Internet connection (for PDF4Me API access)
- Apex development environment (Salesforce CLI, Developer Console, or IDE)

## Setup

1. **Deploy the Apex classes:**
   - Deploy `ParseDocument.cls` to your Salesforce org
   - Deploy `ParseDocumentTest.cls` for testing

2. **Configure your API key:**
   - Open `ParseDocument.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Prepare your document:**
   - Ensure you have a PDF file available in your Salesforce org
   - Update the document reference in the code if needed

## Usage

### Method 1: Using the Main Class

```apex
// Create an instance of the parser
ParseDocument parser = new ParseDocument();

// Parse a document (replace with your document ID)
String documentId = 'your_document_id_here';
String result = parser.parseDocument(documentId);

// Process the result
System.debug('Parsing Result: ' + result);
```

### Method 2: Using Anonymous Apex

1. **Open Developer Console or Salesforce CLI**
2. **Execute the code from `ParseDocument.txt`**
3. **Check the debug logs for results**

### Input and Output

- **Input:** Salesforce Document ID or base64 encoded PDF content
- **Output:** JSON string with parsing results and metadata

## Configuration

- **API Key:** Set in `ParseDocument.cls`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ParseDocument`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF document content
  - `docName`: Source PDF file name with .pdf extension
  - `async`: true/false (async recommended for large documents)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ParseDocument`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Parsing results (JSON)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Response Format

The parsing result includes:
- `documentType`: Type/category of the document
- `pageCount`: Number of pages in the document
- `parsedData`: Structured data extracted from the document
- `confidence`: Confidence score for the parsing results
- `templateId`: Template identifier used for parsing
- Additional metadata and extracted fields

## Parsing Capabilities

### Document Type Detection
- Automatically identifies document types
- Classifies documents based on content and structure
- Supports various document categories

### Data Extraction
- Extracts structured data from documents
- Identifies key fields and values
- Preserves document hierarchy and relationships

### Template-Based Parsing
- Uses predefined templates for consistent extraction
- Supports custom template configurations
- Provides confidence scores for extracted data

## Error Handling

- Missing or invalid PDF file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- Invalid parsing response detection
- Salesforce callout limits and restrictions

## Testing

Run the test class to verify functionality:

```apex
// Execute test methods
Test.startTest();
ParseDocumentTest.testParseDocument();
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

4. **"No parsing data found"**
   - The document may not be recognized by any template
   - Check if the document format is supported

5. **"Low confidence parsing"**
   - The document may not match expected templates well
   - Consider using different parsing options

### Debugging

- Use Salesforce debug logs to trace execution
- Check exception messages in the logs
- Verify API responses in the debug output

## Salesforce Considerations

- **Callout Limits:** Be aware of Salesforce callout limits (100 per transaction)
- **Timeout:** Default callout timeout is 10 seconds
- **Base64 Encoding:** Large files may require chunking
- **Governor Limits:** Monitor CPU time and heap size usage
- **Data Storage:** Consider where parsed data will be stored in Salesforce

## Use Cases

### Document Processing
- Invoice and receipt processing
- Form data extraction
- Contract analysis
- Report generation

### Data Extraction
- Key-value pair extraction
- Table data extraction
- Header and footer analysis
- Metadata extraction

### Document Classification
- Document type identification
- Content categorization
- Template matching
- Quality assessment

## Output Structure

After successful parsing, you'll receive:
- JSON metadata about the parsing process
- Structured data extracted from the document
- Document type and confidence information

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer Documentation](https://developer.salesforce.com/docs/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 