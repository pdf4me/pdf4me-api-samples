# Generate Document Single - Salesforce Implementation

This project demonstrates how to generate single documents using the PDF4Me API with Salesforce Apex. It combines HTML templates with JSON data to create customized documents.

## ✅ Features

- Generate documents from HTML, Word, and PDF templates
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- Multiple output formats (HTML, PDF, DOCX)
- Dynamic data integration with JSON
- Salesforce integration ready

## Prerequisites

- Salesforce Org (Developer, Enterprise, or Unlimited Edition)
- PDF4Me API key
- Internet connection for API access
- Salesforce CLI (optional, for deployment)

## Project Structure

```
Generate Document Single/
├── classes/
│   ├── GenerateDocumentSingle.cls           # Main Apex controller
│   ├── GenerateDocumentSingle.cls-meta.xml
│   ├── GenerateDocumentSingleTest.cls       # Test class
│   └── GenerateDocumentSingleTest.cls-meta.xml
├── README.md                                # This documentation
├── Executable_Anonymous_code_GenerateDocumentSingle.txt
└── sample-data/
    ├── invoice_sample.html                  # Sample HTML template file
    ├── invoice_sample_data.json             # Sample JSON data file
    ├── invoice_sample.docx                  # Sample Word template file
    └── sample_data_word.json                # Sample Word data file
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
GenerateDocumentSingle controller = new GenerateDocumentSingle();

// Set the template content (Base64 encoded)
controller.setTemplateContent('base64-encoded-template');

// Set the JSON data
controller.setJsonData('{"key": "value"}');

// Execute the document generation
String result = controller.generateDocument();
```

### 2. Visualforce Page Integration
```apex
// In your Visualforce page controller
public class MyController {
    public void generateDocument() {
        GenerateDocumentSingle controller = new GenerateDocumentSingle();
        // ... implementation
    }
}
```

### 3. Lightning Component Integration
```javascript
// In your Lightning component
import generateDocument from '@salesforce/apex/GenerateDocumentSingle.generateDocument';

// Call the method
generateDocument({ templateContent: base64Template, jsonData: jsonString })
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
POST /api/v2/GenerateDocumentSingle
```

## Specific Settings

### Template Types
- **HTML**: `"html"` - HTML template files (.html, .htm)
- **Word**: `"Word"` - Microsoft Word documents (.docx, .doc)
- **PDF**: `"PDF"` - PDF template files (.pdf)

### Output Types
- **HTML**: `"html"` - Web page format
- **Word**: `"Word"` - Microsoft Word document
- **PDF**: `"PDF"` - Portable Document Format

### Data Types
- **Text**: `"text"` - JSON or XML data as text
- **File**: `"file"` - Data file (Base64 encoded)

## Implementation Details

### Key Components

1. **GenerateDocumentSingle Class**: Main business logic for document generation
2. **HTTP Communication**: Handles API requests and responses
3. **Error Handling**: Comprehensive exception handling and logging
4. **Base64 Operations**: Encoding/decoding utilities

### Error Handling

- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format
- **Salesforce Limits**: Respects governor limits

## API Endpoints

### Generate Document Single
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/GenerateDocumentSingle`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload

```json
{
  "templateFileType": "html",
  "templateFileName": "invoice_template.html",
  "templateFileData": "base64-encoded-template-content",
  "documentDataType": "text",
  "outputType": "html",
  "documentDataText": "json-data-content",
  "async": true
}
```

## Response Handling

### Success Response (200 OK)
```json
{
  "document": {
    "docData": "base64-encoded-generated-document"
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

4. **Invalid Template Format**
   - Ensure template file is in correct format (HTML, Word, PDF)
   - Check if template contains valid placeholders

5. **Invalid JSON Data**
   - Validate JSON data format
   - Ensure JSON matches template placeholders

6. **Governor Limits**
   - Monitor heap size for large templates
   - Check CPU time limits
   - Respect callout limits

### Debug Mode

Enable detailed logging by setting:
```apex
private static final Boolean DEBUG_MODE = true;
```

## Sample Files

- **invoice_sample.html**: HTML template with placeholders
- **invoice_sample_data.json**: Sample JSON data for HTML template
- **invoice_sample.docx**: Word template alternative
- **sample_data_word.json**: Alternative JSON data format

## Expected Workflow

1. **Input**: Template file (HTML/Word/PDF, Base64 encoded) + JSON data
2. **Processing**: Merge template with data using PDF4Me API
3. **Output**: Generated document in same format as template

## Next Steps

- Implement batch processing for multiple documents
- Add support for more template formats
- Integrate with Lightning Web Components
- Add progress tracking for large files

## Future Enhancements

- **Lightning Web Component**: Create modern UI components
- **Batch Processing**: Handle multiple documents simultaneously
- **Preview Feature**: Show document preview before generation
- **File Storage**: Integrate with Salesforce Files
- **Template Editor**: Built-in template editing capabilities
- **Advanced Options**: Support for complex data structures
- **Mobile Support**: Optimize for mobile devices

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Salesforce Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 