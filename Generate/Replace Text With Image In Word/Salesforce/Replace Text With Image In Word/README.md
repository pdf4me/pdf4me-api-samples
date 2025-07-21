# Replace Text With Image In Word - Salesforce Implementation

This project demonstrates how to replace text with images in Word documents using the PDF4Me API with Salesforce Apex.

## ✅ Features

- Replace text with images in Word documents
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- Multiple image format support (PNG, JPG, GIF, etc.)
- Salesforce integration ready

## Prerequisites

- Salesforce org with API access
- PDF4Me API key
- Internet connection for API access
- Apex development environment (Developer Console, VS Code, etc.)

## Project Structure

```
Replace Text With Image In Word/
├── GenerateReplaceTextWithImageInWord.cls           # Main Apex class
├── GenerateReplaceTextWithImageInWordTest.cls       # Test class
├── Executable_Anonymous_code_GenerateReplaceTextWithImageInWord.txt  # Anonymous Apex example
├── README.md                                        # This documentation
├── sample.docx                                      # Sample input Word document
└── sample.png                                       # Sample input image file
```

## Setup

1. **Deploy the Apex classes** to your Salesforce org:
   - `GenerateReplaceTextWithImageInWord.cls`
   - `GenerateReplaceTextWithImageInWordTest.cls`

2. **Configure your API key** in the Apex class:
   ```apex
   private static final String API_KEY = 'your-api-key-here';
   ```

3. **Upload your input files** as Static Resources or use Document records:
   - Word document (.docx format)
   - Image file (PNG, JPG, GIF, etc.)

4. **Execute the code** using the anonymous Apex example or call the methods from your application

## Usage

### Method 1: Anonymous Apex Execution

1. Open Developer Console in Salesforce
2. Go to Debug → Open Execute Anonymous Window
3. Copy and paste the content from `Executable_Anonymous_code_GenerateReplaceTextWithImageInWord.txt`
4. Update the API key and file paths as needed
5. Execute the code

### Method 2: Apex Class Integration

```apex
// Create an instance of the class
GenerateReplaceTextWithImageInWord replacer = new GenerateReplaceTextWithImageInWord();

// Call the method with your document and image
String result = replacer.replaceTextWithImageInWord('your-document-id', 'your-image-id');
```

### Expected Output

```
=== Replacing Text with Image in Word Document ===
This replaces specified text with images in Word documents
Returns modified Word document with image replacement
------------------------------------------------------------
Input Word file: sample.docx
Input image file: sample.png
Output Word file: sample.modified.docx
Replacing text with image...
Reading and encoding Word document file...
Word document file read successfully: 12345 bytes
Reading and encoding image file...
Image file read successfully: 6789 bytes
Sending replace text with image request...
Status code: 202
Request accepted. Processing asynchronously...
Polling URL: https://api.pdf4me.com/api/v2/ReplaceTextWithImageInWord/...
Polling attempt 1/10...
Text replacement completed successfully!
Modified Word document saved to: sample.modified.docx
Text replacement operation completed successfully!
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/v2/ReplaceTextWithImageInWord
```

## Specific Settings

### Text Replacement Parameters
- **docContent**: Base64 encoded Word document content
- **imageContent**: Base64 encoded image content
- **docName**: Input document name
- **imageName**: Input image name
- **textToReplace**: Text to be replaced with image
- **async**: `true` for asynchronous processing (recommended for large files)

## Implementation Details

### Key Components

1. **File Reading**: Reads Word document and image from Salesforce, converts both to Base64
2. **Request Building**: Constructs JSON payload with document and image content
3. **API Communication**: Sends HTTP POST request to PDF4Me API using HttpCallout
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Processing**: Saves the modified Word document

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format
- **Salesforce Limits**: Respects callout limits and governor limits

## API Endpoints

### Replace Text With Image
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/ReplaceTextWithImageInWord`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload

```json
{
  "docContent": "base64-encoded-word-document",
  "imageContent": "base64-encoded-image",
  "docName": "sample.docx",
  "imageName": "sample.png",
  "textToReplace": "REPLACE_ME",
  "async": true
}
```

## Response Handling

### Success Response (200 OK)
- Returns the modified Word document as binary data

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
- **Response Processing**: Invalid responses, unexpected status codes
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
   - Ensure the documents exist in your Salesforce org
   - Check file permissions and sharing settings

3. **Network Errors**
   - Verify remote site settings are configured correctly
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid Word Document Format**
   - Ensure input file is a valid .docx document
   - Check if document is corrupted or password-protected

5. **Invalid Image Format**
   - Ensure image file is in a supported format (PNG, JPG, GIF, etc.)
   - Check if image file is corrupted

6. **Text Not Found**
   - Ensure the text to replace exists in the Word document
   - Check for exact text matching (case-sensitive)

7. **Salesforce Limits**
   - Check callout limits (100 per transaction)
   - Monitor governor limits for CPU time and heap size
   - Consider using Queueable jobs for large files

### Debug Mode

Enable detailed logging by setting:
```apex
private static final Boolean DEBUG_MODE = true;
```

## Sample Files

- **sample.docx**: Sample Word document with placeholder text
- **sample.png**: Sample image file for replacement
- **sample.modified.docx**: Generated modified Word document

## Expected Workflow

1. **Input**: Word document (.docx format) and image file
2. **Processing**: Replace specified text with the image
3. **Output**: Modified Word document with image replacement

## Testing

Run the test class to verify functionality:

```apex
Test.startTest();
GenerateReplaceTextWithImageInWordTest.runTests();
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
- **Preview Feature**: Show text replacement preview before processing
- **Custom Options**: Configure image size, position, and formatting
- **Advanced Options**: Support for multiple text replacements in one document
- **Platform Events**: Notify users when processing is complete

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Salesforce Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 