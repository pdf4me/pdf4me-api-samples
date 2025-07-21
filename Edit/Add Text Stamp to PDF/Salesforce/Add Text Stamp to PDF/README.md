# PDF Text Stamp - Salesforce Apex

Add text stamps/watermarks to PDF documents using the PDF4me API from Salesforce Apex. This application allows you to add customizable text watermarks to PDF documents for authorization and piracy prevention.

## Features

- Add text stamps/watermarks to PDF documents
- Customizable text content, font, size, color, and positioning
- Support for rotation and opacity settings
- Background/foreground placement options
- Handles both synchronous and asynchronous API responses
- Automatic polling for async operations
- Comprehensive error handling and logging
- Saves stamped PDF as Salesforce File (ContentVersion)

## Prerequisites

- **Salesforce org** with API access
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **Remote site settings** configured for `https://api.pdf4me.com/`
- **A PDF file** uploaded to Salesforce Files

## Project Structure

```
Add Text Stamp to PDF/Salesforce/Add Text Stamp to PDF/
├── AddTextStampToPDF.cls                        # Apex class for adding text stamps
├── AddTextStampToPDFTest.cls                    # Apex test class
├── Executable_Anonymous_code_TextStampToPDF.txt # Example anonymous Apex execution
└── README.md                                    # This file
```

## Quick Start

1. **Add Remote Site Setting:**
   - Go to Setup → Security → Remote Site Settings
   - Add `https://api.pdf4me.com/` as an allowed remote site
2. **Deploy Apex Classes:**
   - Deploy `AddTextStampToPDF.cls` and `AddTextStampToPDFTest.cls` to your org
3. **Configure your API key:**
   - Set your PDF4me API key in the class (as a custom setting, custom metadata, or directly in code for testing)
4. **Upload your PDF file** to Salesforce Files
5. **Run the conversion:**
   - Use Anonymous Apex (see below) or call the class from your code

## Configuration

Edit the constants or parameters in `AddTextStampToPDF.cls` to set your API key and text stamp options.

## Usage Example (Anonymous Apex)

See `Executable_Anonymous_code_TextStampToPDF.txt` for a full example. Basic steps:

```apex
String pdfFileId = 'YOUR_CONTENT_VERSION_ID'; // ContentVersion Id of the PDF file
String outputFileName = 'TextStampedPDF_Result';
Object result = AddTextStampToPDF.addTextStampAndSave(pdfFileId, outputFileName);
System.debug('Text Stamp Result: ' + result);
```

## Output

The PDF with text stamp will be saved as a Salesforce File (ContentVersion).

## Error Handling

- File validation for input PDF
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses
- Salesforce callout and governor limits

## Troubleshooting

- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure files are uploaded to Salesforce
- **API request failed**: Check internet connection and API status

## License

MIT License - see project root for details 