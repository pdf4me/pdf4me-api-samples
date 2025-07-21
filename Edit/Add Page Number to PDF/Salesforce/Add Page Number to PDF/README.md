# Add Page Number to PDF - Salesforce Apex

Add customizable page numbers to PDF documents using the PDF4me API from Salesforce Apex. This application supports various page number formats, positioning options, and font styling.

## Features

- Add customizable page numbers to PDF documents
- Support for various page number formats and positioning
- Configurable font styling and margins
- Asynchronous processing with retry logic
- Comprehensive error handling and logging
- Handles both synchronous and asynchronous API responses
- Saves numbered PDF as Salesforce File (ContentVersion)

## Prerequisites

- **Salesforce org** with API access
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **Remote site settings** configured for `https://api.pdf4me.com/`
- **A PDF file** uploaded to Salesforce Files

## Project Structure

```
Add Page Number to PDF/Salesforce/Add Page Number to PDF/
├── AddPageNumberToPDF.cls                        # Apex class for adding page numbers
├── AddPageNumberToPDFTest.cls                    # Apex test class
├── Executable_Anonymous_code_AddPageNumberToPDF.txt # Example anonymous Apex execution
└── README.md                                     # This file
```

## Quick Start

1. **Add Remote Site Setting:**
   - Go to Setup → Security → Remote Site Settings
   - Add `https://api.pdf4me.com/` as an allowed remote site
2. **Deploy Apex Classes:**
   - Deploy `AddPageNumberToPDF.cls` and `AddPageNumberToPDFTest.cls` to your org
3. **Configure your API key:**
   - Set your PDF4me API key in the class (as a custom setting, custom metadata, or directly in code for testing)
4. **Upload your PDF file** to Salesforce Files
5. **Run the conversion:**
   - Use Anonymous Apex (see below) or call the class from your code

## Configuration

Edit the constants or parameters in `AddPageNumberToPDF.cls` to set your API key and page number options.

## Usage Example (Anonymous Apex)

See `Executable_Anonymous_code_AddPageNumberToPDF.txt` for a full example. Basic steps:

```apex
String pdfFileId = 'YOUR_CONTENT_VERSION_ID'; // ContentVersion Id of the PDF file
String outputFileName = 'PageNumberedPDF_Result';
Object result = AddPageNumberToPDF.addPageNumbersAndSave(pdfFileId, outputFileName);
System.debug('Page Number Result: ' + result);
```

## Output

The PDF with page numbers will be saved as a Salesforce File (ContentVersion).

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