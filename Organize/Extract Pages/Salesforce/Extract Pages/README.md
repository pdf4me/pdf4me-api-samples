# Extract Pages from PDF - Salesforce Implementation

This project demonstrates how to extract specific pages from a PDF document using the PDF4Me API with Salesforce Apex.

## ✅ Features

- Extract specific pages from PDF documents
- Support for single page numbers and page ranges
- Configurable page extraction options
- Comprehensive error handling
- Asynchronous processing support
- Base64 encoding for file handling
- Salesforce integration ready

## Prerequisites

- Salesforce Org (Developer, Enterprise, or Unlimited Edition)
- PDF4Me API key
- Internet connection for API access
- Salesforce CLI (optional, for deployment)

## Project Structure

```
Extract Pages/
├── classes/
│   ├── ExtractPagesController.cls           # Main Apex controller
│   ├── ExtractPagesController.cls-meta.xml
│   ├── PDF4MeAPI.cls                        # API wrapper class
│   ├── PDF4MeAPI.cls-meta.xml
│   └── PDF4MeResponse.cls                   # Response wrapper class
├── README.md                                # This documentation
├── package.xml                              # Metadata package
└── sample-data/
    ├── input.pdf                            # Sample input PDF file
    └── output.pdf                           # Generated output PDF file
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
ExtractPagesController controller = new ExtractPagesController();

// Set the PDF content (Base64 encoded)
controller.setPdfContent('base64-encoded-pdf-content');

// Set pages to extract
controller.setPageNumbers(new List<Integer>{1, 3, 5});

// Execute the extraction
String result = controller.extractPages();
```

### 2. Visualforce Page Integration
```apex
// In your Visualforce page controller
public class MyController {
    public void processPDF() {
        ExtractPagesController controller = new ExtractPagesController();
        // ... implementation
    }
}
```

### 3. Lightning Component Integration
```javascript
// In your Lightning component
import extractPages from '@salesforce/apex/ExtractPagesController.extractPages';

// Call the method
extractPages({ pdfContent: base64Content, pageNumbers: [1,3,5] })
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
POST /api/ExtractPage/ExtractPage
```

## Specific Settings

### extractPageOption
- **Type**: `String`
- **Description**: Specifies which pages to extract
- **Options**:
  - `'PageNumbers'`: Extract specific page numbers
  - `'PageRanges'`: Extract page ranges

### pageNumbers
- **Type**: `List<Integer>`
- **Description**: List of page numbers to extract (1-based indexing)
- **Example**: `new List<Integer>{1, 3, 5}` - extracts pages 1, 3, and 5

### pageRanges
- **Type**: `List<String>`
- **Description**: List of page ranges to extract
- **Example**: `new List<String>{'1-3', '5-7'}` - extracts pages 1-3 and 5-7

## Implementation Details

### Key Components

1. **PDF4MeAPI Class**: Handles HTTP communication with PDF4Me API
2. **ExtractPagesController**: Main business logic for page extraction
3. **PDF4MeResponse Class**: Wrapper for API responses
4. **Error Handling**: Comprehensive exception handling and logging

### Error Handling

- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format
- **Salesforce Limits**: Respects governor limits

## API Endpoints

### Extract Pages
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/ExtractPage/ExtractPage`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {API_KEY}`

## Request Payload

```json
{
  "document": {
    "docData": "base64-encoded-pdf-content"
  },
  "extractPageAction": {
    "extractPageOption": "PageNumbers",
    "pageNumbers": [1, 3, 5]
  }
}
```

## Response Handling

### Success Response (200 OK)
```json
{
  "document": {
    "docData": "base64-encoded-extracted-pdf"
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

4. **Invalid Page Numbers**
   - Page numbers must be 1-based
   - Ensure page numbers don't exceed PDF page count
   - Check for duplicate page numbers

5. **Governor Limits**
   - Monitor heap size for large PDF files
   - Check CPU time limits
   - Respect callout limits

### Debug Mode

Enable detailed logging by setting:
```apex
private static final Boolean DEBUG_MODE = true;
```

## Sample Files

- **input.pdf**: Sample PDF file for testing
- **output.pdf**: Generated PDF with extracted pages

## Expected Workflow

1. **Input**: PDF file with multiple pages (Base64 encoded)
2. **Processing**: Extract specified pages (e.g., pages 1, 3, 5)
3. **Output**: PDF file containing only the extracted pages

## Next Steps

- Implement batch processing for multiple files
- Add support for more page selection options
- Integrate with Lightning Web Components
- Add progress tracking for large files

## Future Enhancements

- **Lightning Web Component**: Create modern UI components
- **Batch Processing**: Handle multiple PDF files simultaneously
- **Preview Feature**: Show PDF thumbnails before extraction
- **File Storage**: Integrate with Salesforce Files
- **Advanced Options**: Extract pages based on content analysis
- **Mobile Support**: Optimize for mobile devices

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Salesforce Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 