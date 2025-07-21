# Get Tracking Changes In Word - Salesforce Implementation

This project demonstrates how to extract tracking changes, revisions, and comments from Word documents using the PDF4Me API with Salesforce Apex.

## ✅ Features

- Extract tracking changes from Word documents
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- JSON output with detailed change information
- Salesforce integration ready

## Prerequisites

- Salesforce org with API access
- PDF4Me API key
- Internet connection for API access
- Apex development environment (Developer Console, VS Code, etc.)

## Project Structure

```
Get Tracking Changes In Word/
├── GenerateGetTrackingChangesInWord.cls           # Main Apex class
├── GenerateGetTrackingChangesInWordTest.cls       # Test class
├── Executable_Anonymous_code_GetTrackingChangesInWord.txt  # Anonymous Apex example
├── README.md                                      # This documentation
└── sample.docx                                    # Sample input Word document
```

## Setup

1. **Deploy the Apex classes** to your Salesforce org:
   - `GenerateGetTrackingChangesInWord.cls`
   - `GenerateGetTrackingChangesInWordTest.cls`

2. **Configure your API key** in the Apex class:
   ```apex
   private static final String API_KEY = 'your-api-key-here';
   ```

3. **Upload your input Word document** as a Static Resource or use a Document record

4. **Execute the code** using the anonymous Apex example or call the methods from your application

## Usage

### Method 1: Anonymous Apex Execution

1. Open Developer Console in Salesforce
2. Go to Debug → Open Execute Anonymous Window
3. Copy and paste the content from `Executable_Anonymous_code_GetTrackingChangesInWord.txt`
4. Update the API key and file path as needed
5. Execute the code

### Method 2: Apex Class Integration

```apex
// Create an instance of the class
GenerateGetTrackingChangesInWord tracker = new GenerateGetTrackingChangesInWord();

// Call the method with your document
String result = tracker.getTrackingChangesInWord('your-document-id');
```

### Expected Output

```
=== Getting Tracking Changes from Word Document ===
This extracts all tracking changes, revisions, and comments from Word documents
Returns detailed JSON with all change information
------------------------------------------------------------
Input Word file: sample.docx
Output JSON file: sample.tracking_changes.json
Extracting tracking changes information...
Reading and encoding Word document file...
Word document file read successfully: 12345 bytes
Sending get tracking changes request...
Status code: 202
Request accepted. Processing asynchronously...
Polling URL: https://api.pdf4me.com/api/v2/GetTrackingChangesInWord/...
Polling attempt 1/10...
Getting tracking changes completed successfully!
Tracking changes JSON saved to: sample.tracking_changes.json
Tracking changes data structure:
- Document contains tracking changes information
- JSON file size: 5678 characters
- Number of revisions: 5
- Number of comments: 3
- Number of changes: 12
Get tracking changes operation completed successfully!
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/v2/GetTrackingChangesInWord
```

## Specific Settings

### Tracking Changes Parameters
- **docContent**: Base64 encoded Word document content
- **docName**: Input document name
- **async**: `true` for asynchronous processing (recommended for large files)

## Implementation Details

### Key Components

1. **File Reading**: Reads Word document from Salesforce and converts to Base64
2. **Request Building**: Constructs JSON payload with document content
3. **API Communication**: Sends HTTP POST request to PDF4Me API using HttpCallout
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **JSON Processing**: Parses and saves tracking changes information

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format
- **Salesforce Limits**: Respects callout limits and governor limits

## API Endpoints

### Get Tracking Changes
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/GetTrackingChangesInWord`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload

```json
{
  "docContent": "base64-encoded-word-document",
  "docName": "sample.docx",
  "async": true
}
```

## Response Handling

### Success Response (200 OK)
```json
{
  "revisions": [
    {
      "author": "John Doe",
      "date": "2024-01-15T10:30:00Z",
      "changes": [
        {
          "type": "insertion",
          "text": "new content",
          "position": 123
        }
      ]
    }
  ],
  "comments": [
    {
      "author": "Jane Smith",
      "text": "Please review this section",
      "position": 456
    }
  ],
  "metadata": {
    "documentName": "sample.docx",
    "totalRevisions": 5,
    "totalComments": 3
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

- **File Operations**: Missing files, permission issues
- **API Communication**: Network errors, timeouts
- **Response Processing**: Invalid JSON, unexpected status codes
- **Base64 Operations**: Encoding/decoding errors
- **Salesforce Limits**: Callout limits, governor limits

## Dependencies

### Salesforce Requirements
- API access enabled
- Remote site settings for `api.pdf4me.com`
- Appropriate permissions for file access

### Setup Remote Site Settings

1. Go to Setup → Security → Remote Site Settings
2. Add new remote site:
   - Remote Site Name: `PDF4MeAPI`
   - Remote Site URL: `https://api.pdf4me.com`
   - Active: `true`
   - Disable Protocol Security: `false`

## Security Considerations

- **API Key Protection**: Store API keys securely in Custom Settings or Named Credentials
- **File Validation**: Validate input files before processing
- **Error Information**: Avoid exposing sensitive information in error messages
- **HTTPS**: All API communications use HTTPS
- **Salesforce Security**: Respect org security settings and sharing rules

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify your API key is correct
   - Check if the key has necessary permissions

2. **File Not Found**
   - Ensure the document exists in your Salesforce org
   - Check file permissions and sharing settings

3. **Network Errors**
   - Verify remote site settings are configured correctly
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid Word Document Format**
   - Ensure input file is a valid .docx document
   - Check if document is corrupted or password-protected

5. **No Tracking Changes Found**
   - Ensure the Word document has tracking changes enabled
   - Check if the document contains revisions or comments

6. **Salesforce Limits**
   - Check callout limits (100 per transaction)
   - Monitor governor limits for CPU time and heap size
   - Consider using Queueable jobs for large files

### Debug Mode

Enable detailed logging by setting:
```apex
private static final Boolean DEBUG_MODE = true;
```

## Sample Files

- **sample.docx**: Sample Word document with tracking changes
- **sample.tracking_changes.json**: Generated JSON with tracking changes information

## Expected Workflow

1. **Input**: Word document (.docx format) with tracking changes
2. **Processing**: Extract all tracking changes, revisions, and comments
3. **Output**: JSON file with detailed change information

## Testing

Run the test class to verify functionality:

```apex
Test.startTest();
GenerateGetTrackingChangesInWordTest.runTests();
Test.stopTest();
```

## Next Steps

- Implement batch processing for multiple files
- Add support for different Word document formats
- Integrate with Lightning components
- Add progress tracking for large files

## Future Enhancements

- **Lightning Component**: Create a user-friendly interface
- **Batch Processing**: Handle multiple Word documents simultaneously
- **Preview Feature**: Show tracking changes summary before extraction
- **Custom Filters**: Filter changes by author, date, or type
- **Advanced Options**: Export to different formats (XML, CSV)
- **Platform Events**: Notify users when processing is complete

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Salesforce Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 