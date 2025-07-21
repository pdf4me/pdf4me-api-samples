# Convert URL To PDF (Salesforce)

A Salesforce (Apex) sample for converting web URLs to PDF documents using the PDF4Me API.

## Project Structure

```
Convert URL To PDF/
├── ConvertUrlToPDF.cls                # Apex class for URL to PDF conversion
├── ConvertUrlToPDFTest.cls            # Apex test class
├── Executable_Anonymous _code_UrlToPDF.txt # Example anonymous Apex execution
└── README.md                          # This file
```

## Features

- ✅ Convert web URLs to PDF with preserved styling and layout
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Configurable page settings (size, orientation, margins, background, headers/footers)
- ✅ Native Salesforce Apex implementation

## Prerequisites

- Salesforce org with API access
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- Remote site settings configured for `https://api.pdf4me.com/`

## Setup

1. **Add Remote Site Setting:**
   - Go to Setup → Security → Remote Site Settings
   - Add `https://api.pdf4me.com/` as an allowed remote site

2. **Deploy Apex Classes:**
   - Deploy `ConvertUrlToPDF.cls` and `ConvertUrlToPDFTest.cls` to your org
   - Use Developer Console, VS Code with Salesforce Extensions, or Setup UI

3. **Configure your API key:**
   - Set your PDF4Me API key in the class (as a custom setting, custom metadata, or directly in code for testing)

## Usage

### Running the Conversion

- **Anonymous Apex:**
  - Use the code in `Executable_Anonymous _code_UrlToPDF.txt` to run a conversion from the Developer Console
- **Apex Class:**
  - Call the `ConvertUrlToPDF.convertUrlToPdf()` method with the desired parameters

### Input and Output

- **Input:** Web URL (provided as a parameter)
- **Output:** PDF file (as a Blob, can be saved as Attachment, ContentVersion, etc.)

## Configuration

- **API Key:** Set in Apex class or via custom setting/metadata
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ConvertUrlToPdf`
- **Payload Options:**
  - `webUrl`: Target web page URL
  - `authType`: Authentication type (NoAuth, Basic, etc.)
  - `layout`: "portrait" or "landscape"
  - `format`: "A4", "Letter", etc.
  - `scale`: 0.1–2.0 (scaling factor)
  - `topMargin`, `leftMargin`, `rightMargin`, `bottomMargin`: Margins (e.g., "20px")
  - `printBackground`: true/false
  - `displayHeaderFooter`: true/false
  - `async`: true/false (async recommended for large/complex pages)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ConvertUrlToPdf`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: PDF file (binary, as Blob)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Error Handling

- Invalid URL or inaccessible web page
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Invalid PDF response detection
- Network connectivity issues
- Salesforce callout limits and governor limits

## Troubleshooting

### Common Issues

1. **"Callout not allowed"**
   - Ensure Remote Site Setting is configured for `https://api.pdf4me.com/`

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection from Salesforce
   - Ensure the target URL is valid and accessible

3. **"Polling timeout"**
   - Large/complex web pages may take longer
   - Increase retry count or delay in code if needed

4. **"No PDF data found in response"**
   - API may have returned an error message
   - Check the full response for details

5. **Governor Limit Errors**
   - Ensure callout and heap size limits are not exceeded
   - For large files, consider using asynchronous Apex

### Debugging

- Use `System.debug` statements in Apex for additional output
- Check exception messages for details

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce Apex issues, consult [Salesforce Apex Docs](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 