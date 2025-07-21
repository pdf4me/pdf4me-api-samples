# Enable Tracking Changes in Word - Salesforce Implementation

This project demonstrates how to enable tracking changes in Word documents using the PDF4Me API with Salesforce Apex.

## ✅ Features

- Enable tracking changes in Word documents
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- Salesforce integration ready

## Prerequisites

- Salesforce Org (Developer, Enterprise, or Unlimited Edition)
- PDF4Me API key
- Internet connection for API access
- Salesforce CLI (optional, for deployment)

## Project Structure

```
Enable Tracking changes in word/
├── classes/
│   ├── GenerateEnableTrackingChangesInWord.cls    # Main Apex controller
│   ├── GenerateEnableTrackingChangesInWord.cls-meta.xml
│   ├── GenerateEnableTrackingChangesInWordTest.cls # Test class
│   └── GenerateEnableTrackingChangesInWordTest.cls-meta.xml
├── README.md                                       # This documentation
├── Executable_Anonymous_code_GenerateEnableTrackingChangesInWord.txt
└── sample-data/
    ├── sample.docx                                 # Sample input Word document
    └── sample_tracking_output.docx                 # Generated Word document with tracking enabled
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
GenerateEnableTrackingChangesInWord controller = new GenerateEnableTrackingChangesInWord();

// Set the Word document content (Base64 encoded)
controller.setWordContent('base64-encoded-word-document');

// Execute the tracking changes enablement
String result = controller.enableTrackingChanges();
```

### 2. Visualforce Page Integration
```apex
// In your Visualforce page controller
public class MyController {
    public void processWordDocument() {
        GenerateEnableTrackingChangesInWord controller = new GenerateEnableTrackingChangesInWord();
        // ... implementation
    }
}
```

### 3. Lightning Component Integration
```javascript
// In your Lightning component
import enableTrackingChanges from '@salesforce/apex/GenerateEnableTrackingChangesInWord.enableTrackingChanges';

// Call the method
enableTrackingChanges({ wordContent: base64Content })
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
POST /api/v2/EnableTrackingChangesInWord
```

## Specific Settings

### Tracking Changes Parameters
- **docContent**: Base64 encoded Word document content
- **docName**: Output document name
- **async**: `true` for asynchronous processing (recommended for large files)

## Implementation Details

### Key Components

1. **GenerateEnableTrackingChangesInWord Class**: Main business logic for enabling tracking changes
2. **HTTP Communication**: Handles API requests and responses
3. **Error Handling**: Comprehensive exception handling and logging
4. **Base64 Operations**: Encoding/decoding utilities

### Error Handling

- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format
- **Salesforce Limits**: Respects governor limits

## API Endpoints

### Enable Tracking Changes
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/EnableTrackingChangesInWord`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload

```json
{
  "docContent": "base64-encoded-word-document",
  "docName": "output.docx",
  "async": true
}
```

## Response Handling

### Success Response (200 OK)
```json
{
  "document": {
    "docData": "base64-encoded-word-document-with-tracking"
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

4. **Invalid Word Document Format**
   - Ensure input file is a valid .docx document
   - Check if document is corrupted or password-protected

5. **Governor Limits**
   - Monitor heap size for large Word documents
   - Check CPU time limits
   - Respect callout limits

### Debug Mode

Enable detailed logging by setting:
```apex
private static final Boolean DEBUG_MODE = true;
```

## Sample Files

- **sample.docx**: Sample Word document for testing
- **sample_tracking_output.docx**: Generated Word document with tracking enabled

## Expected Workflow

1. **Input**: Word document (.docx format, Base64 encoded)
2. **Processing**: Enable tracking changes functionality
3. **Output**: Word document with tracking changes enabled

## Next Steps

- Implement batch processing for multiple files
- Add support for different Word document formats
- Integrate with Lightning Web Components
- Add progress tracking for large files

## Future Enhancements

- **Lightning Web Component**: Create modern UI components
- **Batch Processing**: Handle multiple Word documents simultaneously
- **Preview Feature**: Show document preview before processing
- **File Storage**: Integrate with Salesforce Files
- **Advanced Options**: Configure specific tracking change parameters
- **Mobile Support**: Optimize for mobile devices

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Salesforce Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 