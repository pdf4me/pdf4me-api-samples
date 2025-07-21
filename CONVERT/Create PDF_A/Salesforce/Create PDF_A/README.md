# PDF to PDF/A Converter (Salesforce Apex)

Convert regular PDF files to PDF/A format using the PDF4Me API from Salesforce Apex. PDF/A is an ISO standard for long-term archival and preservation of electronic documents.

## Features

- ✅ PDF/A compliance: Converts PDFs to various PDF/A compliance levels (PdfA1b, PdfA1a, PdfA2b, etc.)
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Saves PDF/A as Salesforce File (ContentVersion)

## Prerequisites

- **Salesforce org** with API access
- **PDF4Me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **Remote site settings** configured for `https://api.pdf4me.com/`
- **A PDF file** uploaded to Salesforce Files

## Project Structure

```
Create PDF_A/Salesforce/Create PDF_A/
├── ConvertCreatePDFA.cls                # Apex class for PDF to PDF/A conversion
├── ConvertCreatePDFATest.cls            # Apex test class
├── Executable_Anonymous _code_ConvertCreatePDFA.txt # Example anonymous Apex execution
└── README.md                            # This file
```

## Quick Start

1. **Add Remote Site Setting:**
   - Go to Setup → Security → Remote Site Settings
   - Add `https://api.pdf4me.com/` as an allowed remote site
2. **Deploy Apex Classes:**
   - Deploy `ConvertCreatePDFA.cls` and `ConvertCreatePDFATest.cls` to your org
3. **Configure your API key:**
   - Set your PDF4Me API key in the class (as a custom setting, custom metadata, or directly in code for testing)
4. **Upload your PDF file** to Salesforce Files
5. **Run the conversion:**
   - Use Anonymous Apex (see below) or call the class from your code

## Configuration

Edit the constants or parameters in `ConvertCreatePDFA.cls` to set your API key and conversion options.

## Usage Example (Anonymous Apex)

See `Executable_Anonymous _code_ConvertCreatePDFA.txt` for a full example. Basic steps:

```apex
String pdfFileId = 'YOUR_CONTENT_VERSION_ID'; // Salesforce ContentVersion Id of the PDF file
String outputFileName = 'PDFtoPDFA_Result';
Object result = ConvertCreatePDFA.convertPDFToPDFAAndSave(pdfFileId, outputFileName);
System.debug('PDF to PDF/A Conversion Result: ' + result);
```

## API Endpoint

- **Endpoint**: `https://api.pdf4me.com/api/v2/PdfA`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: multipart/form-data

## Error Handling

- Invalid file path or unsupported format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- Salesforce callout and governor limits

## Supported Features

- ✅ PDF/A-1, PDF/A-2, PDF/A-3 compliance
- ✅ Long-term archival and preservation

## Use Cases

- **Archiving**: Convert PDFs to PDF/A for legal or regulatory compliance
- **Preservation**: Ensure documents remain accessible for decades

## License

MIT License - see project root for details 