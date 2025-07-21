# Add HTML Header Footer to PDF - Salesforce Apex

Add custom HTML headers and footers to PDF documents using the PDF4me API from Salesforce Apex. This tool allows you to add styled HTML content as headers, footers, or both, with support for dynamic content and page selection.

## Features

- Add HTML content as headers, footers, or both to PDF documents
- Support for dynamic content (page numbers, dates)
- Configurable page selection and margins
- Asynchronous processing with retry logic
- Comprehensive error handling and logging
- Handles both synchronous and asynchronous API responses
- Saves PDF with HTML header/footer as Salesforce File (ContentVersion)

## Prerequisites

- **Salesforce org** with API access
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **Remote site settings** configured for `https://api.pdf4me.com/`
- **A PDF file** uploaded to Salesforce Files

## Project Structure

```
Add HTML Header Footer to PDF/Salesforce/Add HTML Header Footer to PDF/
├── AddHtmlHeaderFooterToPDF.cls                        # Apex class for adding HTML header/footer
├── AddHtmlHeaderFooterToPDFTest.cls                    # Apex test class
├── Executable_Anonymous _code_AddHtmlHeaderFooterToPDF.txt # Example anonymous Apex execution
└── README.md                                           # This file
```

## Quick Start

1. **Add Remote Site Setting:**
   - Go to Setup → Security → Remote Site Settings
   - Add `https://api.pdf4me.com/` as an allowed remote site
2. **Deploy Apex Classes:**
   - Deploy `AddHtmlHeaderFooterToPDF.cls` and `AddHtmlHeaderFooterToPDFTest.cls` to your org
3. **Configure your API key:**
   - Set your PDF4me API key in the class (as a custom setting, custom metadata, or directly in code for testing)
4. **Upload your PDF file** to Salesforce Files
5. **Run the conversion:**
   - Use Anonymous Apex (see below) or call the class from your code

## Configuration

Edit the constants or parameters in `AddHtmlHeaderFooterToPDF.cls` to set your API key and HTML content.

## Usage Example (Anonymous Apex)

See `Executable_Anonymous _code_AddHtmlHeaderFooterToPDF.txt` for a full example. Basic steps:

```apex
String pdfFileId = 'YOUR_CONTENT_VERSION_ID'; // ContentVersion Id of the PDF file
String outputFileName = 'HtmlHeaderFooterPDF_Result';
Object result = AddHtmlHeaderFooterToPDF.addHtmlHeaderFooterAndSave(pdfFileId, outputFileName);
System.debug('HTML Header/Footer Result: ' + result);
```

## Output

The PDF with HTML header/footer will be saved as a Salesforce File (ContentVersion).

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
- **HTML rendering issues**: Check HTML syntax and CSS
- **Processing timeout**: Large files may take longer to process

## License

MIT License - see project root for details 