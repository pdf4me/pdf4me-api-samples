# Generate Documents Multiple - Salesforce Implementation

This project demonstrates how to generate multiple documents using the PDF4Me API with Salesforce Apex. It combines template files with JSON data to create customized documents in various formats.

## ✅ Features

- Generate documents from Word, HTML, and PDF templates
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- Multiple output formats (PDF, DOCX, HTML, Excel)
- Dynamic data integration with JSON
- Document signature validation
- Salesforce integration ready

## Prerequisites

- Salesforce Org (Developer, Enterprise, or Unlimited Edition)
- PDF4Me API key
- Internet connection for API access
- Salesforce CLI (optional, for deployment)

## Project Structure

```
Generate Documents Multiple/
├── classes/
│   ├── GenerateDocumentsMultiple.cls         # Main Apex controller
│   ├── GenerateDocumentsMultiple.cls-meta.xml
│   ├── GenerateDocumentsMultipleTest.cls     # Test class
│   └── GenerateDocumentsMultipleTest.cls-meta.xml
├── README.md                                  # This documentation
├── Executable_Anonymous_code_GenerateDocumentsMulitiple.txt
└── sample-data/
    ├── sample.docx                            # Sample Word template file
    ├── sample.json                            # Sample JSON data file
    └── invoice_sample.html                    # Alternative HTML template
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
GenerateDocumentsMultiple controller = new GenerateDocumentsMultiple();

// Set the template content (Base64 encoded)
controller.setTemplateContent('base64-encoded-template');

// Set the JSON data
controller.setJsonData('{"key": "value"}');

// Set the output type
controller.setOutputType('Docx');

// Execute the document generation
String result = controller.generateDocument();
```

### 2. Visualforce Page Integration
```apex
// In your Visualforce page controller
public class MyController {
    public void generateDocument() {
        GenerateDocumentsMultiple controller = new GenerateDocumentsMultiple();
        // ... implementation
    }
}
```

### 3. Lightning Component Integration
```javascript
// In your Lightning component
import generateDocument from '@salesforce/apex/GenerateDocumentsMultiple.generateDocument';

// Call the method
generateDocument({ templateContent: base64Template, jsonData: jsonString, outputType: 'Docx' })
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
POST /api/v2/GenerateDocumentMultiple
```

## Specific Settings

### Template Types
- **Word**: `"Docx"` - Microsoft Word documents (.docx, .doc)
- **HTML**: `"HTML"` - HTML template files (.html, .htm)
- **PDF**: `"PDF"` - PDF template files (.pdf)

### Output Types
- **PDF**: `"PDF"` - Portable Document Format
- **Word**: `"Docx"` - Microsoft Word document
- **HTML**: `"HTML"` - HyperText Markup Language
- **Excel**: `"Excel"` - Microsoft Excel spreadsheet

### Data Types
- **JSON**: `"Json"` - JSON data format
- **XML**: `"XML"` - XML data format

## Implementation Details

### Key Components

1. **GenerateDocumentsMultiple Class**: Main business logic for document generation
2. **HTTP Communication**: Handles API requests and responses
3. **Error Handling**: Comprehensive exception handling and logging
4. **Base64 Operations**: Encoding/decoding utilities
5. **Document Validation**: Signature verification

### Error Handling

- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format
- **Salesforce Limits**: Respects governor limits
- **Document Validation**: Checks document signatures

## API Endpoints

### Generate Documents Multiple
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/GenerateDocumentMultiple`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload

```json
{
  "templateFileType": "Docx",
  "templateFileName": "sample.docx",
  "templateFileData": "base64-encoded-template-content",
  "documentDataType": "Json",
  "outputType": "Docx",
  "documentDataText": "json-data-content",
  "metaDataJson": "{}"
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
- **Document Validation**: Signature verification

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
   - Ensure template file is in correct format (Word, HTML, PDF)
   - Check if template contains valid placeholders

5. **Invalid JSON Data**
   - Validate JSON data format
   - Ensure JSON matches template placeholders

6. **Document Signature Invalid**
   - Check if generated document is corrupted
   - Verify API response format

7. **Governor Limits**
   - Monitor heap size for large templates
   - Check CPU time limits
   - Respect callout limits

### Debug Mode

Enable detailed logging by setting:
```apex
private static final Boolean DEBUG_MODE = true;
```

## Sample Files

- **sample.docx**: Word template with placeholders
- **sample.json**: Sample JSON data for template
- **invoice_sample.html**: Alternative HTML template

## Expected Workflow

1. **Input**: Template file (Word/HTML/PDF, Base64 encoded) + JSON data
2. **Processing**: Merge template with data using PDF4Me API
3. **Output**: Generated document in specified output format

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
- **Output Format Conversion**: Convert between different output formats
- **Mobile Support**: Optimize for mobile devices

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Salesforce Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 