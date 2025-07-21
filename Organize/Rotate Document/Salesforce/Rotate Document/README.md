# Rotate Document - Salesforce Implementation

This project demonstrates how to rotate an entire PDF document using the PDF4Me API with Salesforce Apex.

## ✅ Features

- Rotate entire PDF documents
- Support for multiple rotation options (Clockwise, CounterClockwise, UpsideDown)
- Configurable rotation settings
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
Rotate Document/
├── classes/
│   ├── RotateDocumentController.cls         # Main Apex controller
│   ├── RotateDocumentController.cls-meta.xml
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
RotateDocumentController controller = new RotateDocumentController();

// Set the PDF content (Base64 encoded)
controller.setPdfContent('base64-encoded-pdf-content');

// Set rotation type
controller.setRotationType('Clockwise');

// Execute the rotation
String result = controller.rotateDocument();
```

### 2. Visualforce Page Integration
```apex
// In your Visualforce page controller
public class MyController {
    public void processPDF() {
        RotateDocumentController controller = new RotateDocumentController();
        // ... implementation
    }
}
```

### 3. Lightning Component Integration
```javascript
// In your Lightning component
import rotateDocument from '@salesforce/apex/RotateDocumentController.rotateDocument';

// Call the method
rotateDocument({ pdfContent: base64Content, rotationType: 'Clockwise' })
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
POST /api/RotatePage/RotatePage
```

## Specific Settings

### rotationType
- **Type**: `String`
- **Description**: Specifies the rotation direction
- **Options**:
  - `'Clockwise'`: Rotate 90 degrees clockwise
  - `'CounterClockwise'`: Rotate 90 degrees counter-clockwise
  - `'UpsideDown'`: Rotate 180 degrees

### pageNumbers
- **Type**: `List<Integer>`
- **Description**: List of page numbers to rotate (empty for entire document)
- **Example**: `new List<Integer>{}` - rotates all pages in the document

## Implementation Details

### Key Components

1. **PDF4MeAPI Class**: Handles HTTP communication with PDF4Me API
2. **RotateDocumentController**: Main business logic for document rotation
3. **PDF4MeResponse Class**: Wrapper for API responses
4. **Error Handling**: Comprehensive exception handling and logging

### Error Handling

- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format
- **Salesforce Limits**: Respects governor limits

## API Endpoints

### Rotate Document
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/RotatePage/RotatePage`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {API_KEY}`

## Request Payload

```json
{
  "document": {
    "docData": "base64-encoded-pdf-content"
  },
  "rotatePageAction": {
    "rotationType": "Clockwise",
    "pageNumbers": []
  }
}
```

## Response Handling

### Success Response (200 OK)
```json
{
  "document": {
    "docData": "base64-encoded-rotated-pdf"
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

4. **Invalid Rotation Type**
   - Ensure rotation type is one of: "Clockwise", "CounterClockwise", "UpsideDown"
   - Check for typos in rotation type string

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
- **output.pdf**: Generated PDF after rotation

## Expected Workflow

1. **Input**: PDF file with multiple pages (Base64 encoded)
2. **Processing**: Rotate entire document (e.g., 90 degrees clockwise)
3. **Output**: PDF file with all pages rotated

## Next Steps

- Implement batch processing for multiple files
- Add support for selective page rotation
- Integrate with Lightning Web Components
- Add progress tracking for large files

## Future Enhancements

- **Lightning Web Component**: Create modern UI components
- **Batch Processing**: Handle multiple PDF files simultaneously
- **Preview Feature**: Show PDF thumbnails before rotation
- **File Storage**: Integrate with Salesforce Files
- **Advanced Options**: Rotate based on content analysis
- **Mobile Support**: Optimize for mobile devices

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Salesforce Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 