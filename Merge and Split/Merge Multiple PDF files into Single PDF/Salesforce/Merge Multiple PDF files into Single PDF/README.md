# Merge Multiple PDF Files into Single PDF - Salesforce Implementation

This project demonstrates how to merge multiple PDF files into a single PDF using the PDF4Me API with Salesforce Apex.

## ✅ Features

- Merge multiple PDF files into a single PDF
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- Configurable merge order and settings
- Salesforce integration ready

## Prerequisites

- Salesforce org with API access
- PDF4Me API key
- Internet connection for API access
- Apex development environment (Developer Console, VS Code, etc.)

## Project Structure

```
Merge Multiple PDF files into Single PDF/
├── MergeMultiplePDFs.cls           # Main Apex class
├── MergeMultiplePDFsTest.cls       # Test class
├── Executable_Anonymous_code_MergeMultiplePDF's.txt  # Anonymous Apex example
├── README.md                       # This documentation
├── sample1.pdf                     # Sample input PDF 1
└── sample2.pdf                     # Sample input PDF 2
```

## Setup

1. **Deploy the Apex classes** to your Salesforce org:
   - `MergeMultiplePDFs.cls`
   - `MergeMultiplePDFsTest.cls`

2. **Configure your API key** in the Apex class:
   ```apex
   private static final String API_KEY = 'your-api-key-here';
   ```

3. **Upload your input PDF files** as Static Resources or use Document records:
   - Multiple PDF files to merge

4. **Execute the code** using the anonymous Apex example or call the methods from your application

## Usage

### Method 1: Anonymous Apex Execution

1. Open Developer Console in Salesforce
2. Go to Debug → Open Execute Anonymous Window
3. Copy and paste the content from `Executable_Anonymous_code_MergeMultiplePDF's.txt`
4. Update the API key and file paths as needed
5. Execute the code

### Method 2: Apex Class Integration

```apex
// Create an instance of the class
MergeMultiplePDFs merger = new MergeMultiplePDFs();

// Call the method with your PDF files
String result = merger.mergeMultiplePdfs(new List<String>{'pdf1-id', 'pdf2-id'});
```

### Expected Output

```
=== Merging Multiple PDF Files into Single PDF ===
This merges multiple PDF files into a single PDF document
Returns merged PDF with all pages combined
------------------------------------------------------------
Input PDF files: ['sample1.pdf', 'sample2.pdf']
Output PDF file: merged_output.pdf
Merging PDF files...
Reading and encoding PDF files...
PDF file 1 read successfully: 12345 bytes
PDF file 2 read successfully: 6789 bytes
Sending merge PDF request...
Status code: 202
Request accepted. Processing asynchronously...
Polling URL: https://api.pdf4me.com/api/v2/MergeMultiplePdfs/...
Polling attempt 1/10...
PDF merge completed successfully!
Merged PDF saved to: merged_output.pdf
Merge operation completed successfully!
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/v2/MergeMultiplePdfs
```

## Specific Settings

### Merge Parameters
- **pdfContents**: Array of Base64 encoded PDF contents
- **pdfNames**: Array of input PDF names
- **async**: `true` for asynchronous processing (recommended for large files)

## Implementation Details

### Key Components

1. **File Reading**: Reads all input PDF files from Salesforce and converts them to Base64
2. **Request Building**: Constructs JSON payload with all PDF contents
3. **API Communication**: Sends HTTP POST request to PDF4Me API using HttpCallout
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Processing**: Saves the merged PDF

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format
- **Salesforce Limits**: Respects callout limits and governor limits

## API Endpoints

### Merge Multiple PDFs
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/MergeMultiplePdfs`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload

```json
{
  "pdfContents": [
    "base64-encoded-pdf-1",
    "base64-encoded-pdf-2"
  ],
  "pdfNames": [
    "sample1.pdf",
    "sample2.pdf"
  ],
  "async": true
}
```

## Response Handling

### Success Response (200 OK)
- Returns the merged PDF as binary data

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
   - Ensure all PDF files exist in your Salesforce org
   - Check file permissions and sharing settings

3. **Network Errors**
   - Verify remote site settings are configured correctly
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid PDF Format**
   - Ensure all files are valid PDF documents
   - Check if PDF files are corrupted or password-protected

5. **Large File Size**
   - Consider using asynchronous processing for large files
   - Monitor memory usage when processing multiple large PDFs

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

- **sample1.pdf**: Sample input PDF 1
- **sample2.pdf**: Sample input PDF 2
- **merged_output.pdf**: Generated merged PDF

## Expected Workflow

1. **Input**: Multiple PDF files
2. **Processing**: Merge all PDFs into a single document
3. **Output**: Single PDF with all pages combined

## Testing

Run the test class to verify functionality:

```apex
Test.startTest();
MergeMultiplePDFsTest.runTests();
Test.stopTest();
```

## Next Steps

- Implement batch processing for multiple merge operations
- Add support for different PDF formats
- Integrate with Lightning components
- Add progress tracking for large files

## Future Enhancements

- **Lightning Component**: Create a user-friendly interface
- **Batch Processing**: Handle multiple merge operations simultaneously
- **Preview Feature**: Show merge preview before processing
- **Custom Options**: Configure page order and selection
- **Advanced Options**: Support for page ranges and custom ordering
- **Platform Events**: Notify users when processing is complete

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Salesforce Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 