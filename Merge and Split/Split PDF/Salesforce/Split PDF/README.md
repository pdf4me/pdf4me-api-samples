# Split PDF - Salesforce Implementation

This project demonstrates how to split PDF files using the PDF4Me API with Salesforce Apex.

## ✅ Features

- Split PDF files by various criteria (page numbers, ranges, recurring patterns)
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- Multiple split methods (after page, recurring, sequence, ranges)
- Salesforce integration ready

## Prerequisites

- Salesforce org with API access
- PDF4Me API key
- Internet connection for API access
- Apex development environment (Developer Console, VS Code, etc.)

## Project Structure

```
Split PDF/
├── SplitPDF.cls                    # Main Apex class
├── SplitPDFTest.cls                # Test class
├── Executable_Anonymous_code_SplitPDF.txt  # Anonymous Apex example
├── README.md                       # This documentation
└── sample.pdf                      # Sample input PDF
```

## Setup

1. **Deploy the Apex classes** to your Salesforce org:
   - `SplitPDF.cls`
   - `SplitPDFTest.cls`

2. **Configure your API key** in the Apex class:
   ```apex
   private static final String API_KEY = 'your-api-key-here';
   ```

3. **Upload your input PDF** as a Static Resource or use a Document record:
   - PDF file to split

4. **Execute the code** using the anonymous Apex example or call the methods from your application

## Usage

### Method 1: Anonymous Apex Execution

1. Open Developer Console in Salesforce
2. Go to Debug → Open Execute Anonymous Window
3. Copy and paste the content from `Executable_Anonymous_code_SplitPDF.txt`
4. Update the API key and file path as needed
5. Execute the code

### Method 2: Apex Class Integration

```apex
// Create an instance of the class
SplitPDF splitter = new SplitPDF();

// Call the method with your PDF and split criteria
String result = splitter.splitAfterPage('your-pdf-id', 5);
```

### Expected Output

```
=== Splitting PDF ===
This splits PDF files by various criteria
Returns split PDF files in ZIP format
------------------------------------------------------------
Input PDF file: sample.pdf
Output directory: split_output/
Splitting PDF...
Reading and encoding PDF file...
PDF file read successfully: 12345 bytes
Sending split PDF request...
Status code: 202
Request accepted. Processing asynchronously...
Polling URL: https://api.pdf4me.com/api/v2/SplitPdf/...
Polling attempt 1/10...
PDF split completed successfully!
Split PDF files saved to: split_output/split_after_page_result.zip
Split operation completed successfully!
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/v2/SplitPdf
```

## Specific Settings

### Split Parameters
- **pdfContent**: Base64 encoded PDF content
- **pdfName**: Input PDF name
- **splitAfterPage**: Split after specific page number
- **splitRecurringAfterPage**: Split recurring after specific page number
- **splitSequence**: Array of page numbers to split at
- **splitRanges**: String of page ranges (e.g., "1-3,5-7,9-10")
- **async**: `true` for asynchronous processing (recommended for large files)

## Implementation Details

### Key Components

1. **File Reading**: Reads input PDF from Salesforce and converts to Base64
2. **Request Building**: Constructs JSON payload with PDF content and split settings
3. **API Communication**: Sends HTTP POST request to PDF4Me API using HttpCallout
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Processing**: Saves the split PDF files as ZIP archive

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format
- **Salesforce Limits**: Respects callout limits and governor limits

## API Endpoints

### Split PDF
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/SplitPdf`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload Examples

### Split After Page
```json
{
  "pdfContent": "base64-encoded-pdf",
  "pdfName": "sample.pdf",
  "splitAfterPage": 5,
  "async": true
}
```

### Recurring Split
```json
{
  "pdfContent": "base64-encoded-pdf",
  "pdfName": "sample.pdf",
  "splitRecurringAfterPage": 3,
  "async": true
}
```

### Split Sequence
```json
{
  "pdfContent": "base64-encoded-pdf",
  "pdfName": "sample.pdf",
  "splitSequence": [2, 5, 8],
  "async": true
}
```

### Split Ranges
```json
{
  "pdfContent": "base64-encoded-pdf",
  "pdfName": "sample.pdf",
  "splitRanges": "1-3,5-7,9-10",
  "async": true
}
```

## Response Handling

### Success Response (200 OK)
- Returns the split PDF files as a ZIP archive

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
   - Ensure the PDF exists in your Salesforce org
   - Check file permissions and sharing settings

3. **Network Errors**
   - Verify remote site settings are configured correctly
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid PDF Format**
   - Ensure input file is a valid PDF document
   - Check if PDF file is corrupted or password-protected

5. **Invalid Split Parameters**
   - Ensure page numbers are within the PDF's page range
   - Check split range format for range-based splitting

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

- **sample.pdf**: Sample input PDF
- **split_output/**: Directory containing split PDF ZIP files

## Expected Workflow

1. **Input**: PDF file and split criteria
2. **Processing**: Split PDF according to specified method
3. **Output**: ZIP archive containing split PDF files

## Testing

Run the test class to verify functionality:

```apex
Test.startTest();
SplitPDFTest.runTests();
Test.stopTest();
```

## Next Steps

- Implement batch processing for multiple PDFs
- Add support for different PDF formats
- Integrate with Lightning components
- Add progress tracking for large files

## Future Enhancements

- **Lightning Component**: Create a user-friendly interface
- **Batch Processing**: Handle multiple PDFs simultaneously
- **Preview Feature**: Show split preview before processing
- **Custom Options**: Configure output file naming and organization
- **Advanced Options**: Support for custom split patterns and criteria
- **Platform Events**: Notify users when processing is complete

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Salesforce Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 