# Delete Blank Pages from PDF - Salesforce Implementation

Delete blank pages from PDF documents using the PDF4Me API. This Salesforce project removes pages that contain no text or images based on configurable detection criteria through Apex classes.

## Features

- ✅ Delete blank pages from PDF documents based on specified criteria
- ✅ Support for different blank page detection options:
  - NoTextNoImages: Pages with no text and no images
  - NoText: Pages with no text content
  - NoImages: Pages with no images
- ✅ Configurable blank page detection settings
- ✅ Handle both single and multiple blank pages
- ✅ Support for both synchronous and asynchronous processing
- ✅ Comprehensive error handling and logging
- ✅ Base64 encoding/decoding for file handling
- ✅ HTTP callout implementation using Salesforce HTTP classes
- ✅ Page validation and processing status tracking
- ✅ Export cleaned PDF in original format
- ✅ Test coverage with unit tests

## Prerequisites

- **Salesforce Org** (Developer, Enterprise, or Unlimited Edition)
- **API Enabled** permission for your user
- **Internet connection** for API access
- **Valid PDF4Me API key** (get from https://dev.pdf4me.com/dashboard/#/api-keys/)
- **PDF file** stored as a Salesforce Document or Attachment

## Project Structure

```
Delete Blank Pages from PDF/
├── DeleteBlankPagesFromPDF.cls                   # Main Apex class for blank page deletion
├── DeleteBlankPagesFromPDFTest.cls               # Unit test class
├── Executable_Anonymous_code_DeleteBlankPagesFromPDF.txt  # Anonymous Apex example
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
   sfdx force:source:deploy -p "Organize/Delete Blank Pages from PDF/Salesforce/Delete Blank Pages from PDF"
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

### Running the Deletion Process

1. **Using Anonymous Apex:**
   ```apex
   // Execute the code from Executable_Anonymous_code_DeleteBlankPagesFromPDF.txt
   // This will delete blank pages from a sample PDF and save the result
   ```

2. **Using Apex Class:**
   ```apex
   // Create an instance and call the blank page deletion method
   DeleteBlankPagesFromPDF processor = new DeleteBlankPagesFromPDF();
   String result = processor.deleteBlankPages(base64Content, 'sample.pdf', 'NoTextNoImages');
   ```

3. **From Lightning Component or Visualforce:**
   ```apex
   // Call the static method from your UI
   String processedPdf = DeleteBlankPagesFromPDF.deleteBlankPagesFromUI(pdfContent, 'NoTextNoImages');
   ```

### Expected Output

```
=== Deleting Blank Pages from PDF ===
Blank page deletion initiated successfully
Processed document saved to: sample.no_blank_pages.pdf
```

### Input and Output

- **Input:** 
  - Base64 encoded PDF content
  - Document name (e.g., 'sample.pdf')
  - Delete page option (e.g., 'NoTextNoImages', 'NoText', 'NoImages')
- **Output:** Base64 encoded processed PDF content with blank pages removed

## API Configuration

The application uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/DeleteBlankPages`
- **Authentication:** Basic authentication with API key
- **Features:** Blank page detection, page removal, metadata handling

## Blank Page Detection Settings

The implementation supports these settings:
- **Delete Page Option:** "NoTextNoImages" (configurable - NoTextNoImages, NoText, NoImages)
- **Async Processing:** true (recommended for large files)
- **Document Name:** "output.pdf"

### Supported Detection Options

- **NoTextNoImages:** Removes pages that contain neither text nor images
- **NoText:** Removes pages that contain no text content (may keep pages with images)
- **NoImages:** Removes pages that contain no images (may keep pages with text)

## Implementation Details

### Main Components

1. **DeleteBlankPagesFromPDF Class:**
   - `deleteBlankPages()`: Main method for blank page deletion
   - `makeHttpCallout()`: HTTP requests and API integration
   - `handleAsyncResponse()`: Async processing with polling
   - Base64 encoding/decoding utilities

2. **DeleteBlankPagesFromPDFTest Class:**
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

- **POST** `/api/v2/DeleteBlankPages` - Deletes blank pages from a PDF document

## Request Payload

```json
{
  "docContent": "base64-encoded-pdf-content",
  "docName": "output.pdf",
  "deletePageOption": "NoTextNoImages",
  "async": true
}
```

## Response Handling

The application handles two types of responses:

1. **200 OK**: Immediate success, returns the processed PDF
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

### DeleteBlankPagesFromPDF.cls
Main Apex class containing the blank page deletion logic.

### DeleteBlankPagesFromPDFTest.cls
Unit test class with comprehensive test coverage.

### Executable_Anonymous_code_DeleteBlankPagesFromPDF.txt
Anonymous Apex example showing how to use the blank page deletion functionality.

## Expected Workflow

1. Load the PDF document ✅
2. Analyze each page for blank content based on selected criteria ✅
3. Prepare the API request payload with page analysis data ✅
4. Call the PDF4me API to delete blank pages ✅
5. Handle the response (sync/async) ✅
6. Return the resulting PDF without blank pages ✅
7. Provide status feedback to the user ✅

## Next Steps

To complete the testing:
1. Get a valid API key from https://dev.pdf4me.com/dashboard/#/api-keys/
2. Configure the API key in your Salesforce org
3. Deploy the classes to your org
4. Ensure you have a PDF file for testing
5. Run the anonymous Apex example to test actual blank page deletion
6. Verify the output is a PDF with blank pages removed

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch processing multiple files
- [ ] Lightning Web Component UI
- [ ] Progress reporting for long-running operations
- [ ] Support for different blank page detection algorithms
- [ ] Integration with Salesforce Files

## License

This project is part of the PDF4ME API samples collection.

## Support

For API-related issues, contact PDF4ME support.
For implementation questions, refer to the PDF4ME documentation. 