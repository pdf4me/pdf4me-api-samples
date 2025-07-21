# Compress PDF - Salesforce Implementation

Compress and optimize PDF documents using the PDF4Me API. This Salesforce project reduces PDF file sizes while maintaining document quality and readability through Apex classes.

## Features

- ✅ Compress PDF documents with configurable quality settings
- ✅ Control over compression settings and optimization profiles
- ✅ Support for both synchronous and asynchronous processing
- ✅ Comprehensive error handling and logging
- ✅ Base64 encoding/decoding for file handling
- ✅ HTTP callout implementation using Salesforce HTTP classes
- ✅ Preserves document quality and readability
- ✅ Multiple optimization profiles (Web, Print, Screen)
- ✅ Test coverage with unit tests

## Prerequisites

- **Salesforce Org** (Developer, Enterprise, or Unlimited Edition)
- **API Enabled** permission for your user
- **Internet connection** for API access
- **Valid PDF4Me API key** (get from https://dev.pdf4me.com/dashboard/#/api-keys/)
- **PDF file** stored as a Salesforce Document or Attachment

## Project Structure

```
Compress PDF/
├── CompressPDF.cls                               # Main Apex class for PDF compression
├── CompressPDFTest.cls                           # Unit test class
├── Executable_Anonymous_code_CompressPDF.txt     # Anonymous Apex example
└── README.md                                     # This file
```

## Setup

### 1. Get API Key
First, you need to get a valid API key from PDF4me:
1. Visit https://dev.pdf4me.com/dashboard/#/api-keys/
2. Create an account and generate an API key
3. Store the API key securely in your Salesforce org (Custom Setting, Named Credential, or Custom Metadata)

### 2. Deploy to Salesforce

1. **Using Salesforce CLI:**
   ```bash
   sfdx force:source:deploy -p "Optimize Compress/Compress PDF/Salesforce/Compress PDF"
   ```

2. **Using Developer Console:**
   - Open Developer Console in your Salesforce org
   - Create new Apex classes and copy the code from the respective files
   - Deploy the classes

3. **Using Metadata API:**
   - Package the classes and deploy via Metadata API

### 3. Configure API Key

Store your API key in a Custom Setting or Named Credential:

**Option 1: Custom Setting**
```apex
// Create a Custom Setting called 'PDF4Me_Settings__c'
// Add a field 'API_Key__c' (Text, 255)
PDF4Me_Settings__c settings = PDF4Me_Settings__c.getInstance();
String apiKey = settings.API_Key__c;
```

**Option 2: Named Credential**
```apex
// Create a Named Credential called 'PDF4Me_API'
// Set the endpoint to: https://api.pdf4me.com
// Set authentication to 'Password' and provide your API key
```

## Usage

### Running the Compression

1. **Using Anonymous Apex:**
   ```apex
   // Execute the code from Executable_Anonymous_code_CompressPDF.txt
   // This will compress a sample PDF and save the result
   ```

2. **Using Apex Class:**
   ```apex
   // Create an instance and call the compression method
   CompressPDF compressor = new CompressPDF();
   String result = compressor.compressPdf(base64Content, 'sample.pdf', 'Web');
   ```

3. **From Lightning Component or Visualforce:**
   ```apex
   // Call the static method from your UI
   String compressedPdf = CompressPDF.compressPdfFromUI(pdfContent, 'Web');
   ```

### Expected Output

```
=== Compressing PDF Document ===
PDF compression initiated successfully
Compressed document saved to: sample.optimized.pdf
```

### Input and Output

- **Input:** 
  - Base64 encoded PDF content
  - Document name (e.g., 'sample.pdf')
  - Optimization profile (e.g., 'Web', 'Print', 'Screen')
- **Output:** Base64 encoded compressed PDF content

## API Configuration

The application uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/Optimize`
- **Authentication:** Basic authentication with API key
- **Features:** PDF compression, optimization

## Compression Settings

The implementation supports these settings:
- **Optimization Profile:** "Web" (configurable - Web, Print, Screen)
- **Async Processing:** true (recommended for large files)
- **Document Name:** "output.pdf"

### Optimization Profiles

- **Web:** Optimized for web viewing and fast loading
- **Print:** Optimized for high-quality printing
- **Screen:** Balanced optimization for screen viewing

## Implementation Details

### Main Components

1. **CompressPDF Class:**
   - `compressPdf()`: Main method for PDF compression
   - `makeHttpCallout()`: HTTP requests and API integration
   - `handleAsyncResponse()`: Async processing with polling
   - Base64 encoding/decoding utilities

2. **CompressPDFTest Class:**
   - Unit tests for all methods
   - Mock HTTP responses
   - Error scenario testing

### Key Features

- **Async Processing:** Handles both sync and async API responses
- **Retry Logic:** Implements polling with configurable retry attempts
- **Error Handling:** Comprehensive exception handling and logging
- **HTTP Callouts:** Uses Salesforce HTTP classes for API communication
- **Test Coverage:** Comprehensive unit tests included

## API Endpoints

- **POST** `/api/v2/Optimize` - Compresses and optimizes a PDF document

## Request Payload

```json
{
  "docName": "output.pdf",
  "docContent": "base64-encoded-pdf-content",
  "optimizeProfile": "Web",
  "async": true
}
```

## Response Handling

The application handles two types of responses:

1. **200 OK**: Immediate success, returns the compressed PDF
2. **202 Accepted**: Asynchronous processing, polls for completion

## Error Handling

The application handles various error scenarios:
- **401 Unauthorized:** Invalid or missing API key
- **404 Not Found:** Input file not found
- **202 Accepted:** Async processing (handled with polling)
- **500 Server Error:** API server issues
- **Timeout:** Long-running operations that exceed retry limits

## Dependencies

This project uses only Salesforce standard libraries:
- `Http` - HTTP client for API communication
- `HttpRequest` - HTTP request objects
- `HttpResponse` - HTTP response objects
- `Blob` - Binary data handling
- `EncodingUtil` - Base64 encoding/decoding

## Security Considerations

- API keys should be stored securely in Custom Settings or Named Credentials
- Use HTTPS for all API communications
- Validate input files before processing
- Implement proper error handling for sensitive operations
- Consider using Named Credentials for better security

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error:**
   - Ensure you have set a valid API key in your Custom Setting or Named Credential
   - Check that your API key is active and has sufficient credits

2. **Callout Exception:**
   - Verify internet connectivity
   - Check firewall settings
   - Ensure the PDF4me API is accessible from your Salesforce org

3. **Test Failures:**
   - Run tests with `sfdx force:apex:test:run`
   - Check that all test methods are properly mocked
   - Ensure API key is configured in test context

4. **Deployment Issues:**
   - Check API permissions for your user
   - Ensure all dependencies are deployed
   - Verify code coverage meets requirements

### Performance Tips

- **Small files (< 5MB):** Usually processed synchronously (200 response)
- **Large files (> 5MB):** Processed asynchronously (202 response) with polling
- **Complex documents:** May take longer to process

## Sample Files

### CompressPDF.cls
Main Apex class containing the PDF compression logic.

### CompressPDFTest.cls
Unit test class with comprehensive test coverage.

### Executable_Anonymous_code_CompressPDF.txt
Anonymous Apex example showing how to use the compression functionality.

## Expected Workflow

1. Load the PDF document ✅
2. Validate the document format ✅
3. Prepare compression parameters ✅
4. Call the PDF4me API to compress the PDF ✅
5. Handle the response (sync/async) ✅
6. Return the resulting compressed PDF ✅
7. Provide status feedback to the user ✅

## Next Steps

To complete the testing:
1. Get a valid API key from https://dev.pdf4me.com/dashboard/#/api-keys/
2. Configure the API key in your Salesforce org
3. Deploy the classes to your org
4. Ensure you have a PDF file for testing
5. Run the anonymous Apex example to test actual PDF compression
6. Verify the output is a compressed PDF with reduced file size

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch processing multiple files
- [ ] Lightning Web Component UI
- [ ] Progress reporting for long-running operations
- [ ] Support for different compression algorithms
- [ ] Integration with Salesforce Files

## License

This project is part of the PDF4ME API samples collection.

## Support

For API-related issues, contact PDF4ME support.
For implementation questions, refer to the PDF4ME documentation. 