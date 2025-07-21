# PDF Linearizer (Salesforce Apex)

Linearize (optimize for web) PDF documents using the PDF4Me API from Salesforce Apex. Linearized PDFs (also known as "web-optimized" PDFs) allow faster viewing and streaming over the web.

## Features

- ✅ Linearizes PDF files for fast web viewing
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Saves linearized PDF as Salesforce File (ContentVersion)

## Prerequisites

- **Salesforce org** with API access
- **PDF4Me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **Remote site settings** configured for `https://api.pdf4me.com/`
- **A PDF file** uploaded to Salesforce Files

## Project Structure

```
Linearize PDF/Salesforce/Linearize PDF/
├── ConvertLinearizePDF.cls                # Apex class for PDF linearization
├── ConvertLinearizePDFTest.cls            # Apex test class
├── Executable_Anonymous _code_ConvertLinearizePDF.txt # Example anonymous Apex execution
└── README.md                              # This file
```

## Quick Start

1. **Add Remote Site Setting:**
   - Go to Setup → Security → Remote Site Settings
   - Add `https://api.pdf4me.com/` as an allowed remote site
2. **Deploy Apex Classes:**
   - Deploy `ConvertLinearizePDF.cls` and `ConvertLinearizePDFTest.cls` to your org
3. **Configure your API key:**
   - Set your PDF4Me API key in the class (as a custom setting, custom metadata, or directly in code for testing)
4. **Upload your PDF file** to Salesforce Files
5. **Run the conversion:**
   - Use Anonymous Apex (see below) or call the class from your code

## Configuration

Edit the constants or parameters in `ConvertLinearizePDF.cls` to set your API key and conversion options.

## Usage Example (Anonymous Apex)

See `Executable_Anonymous _code_ConvertLinearizePDF.txt` for a full example. Basic steps:

```apex
String pdfFileId = 'YOUR_CONTENT_VERSION_ID'; // Salesforce ContentVersion Id of the PDF file
String outputFileName = 'LinearizedPDF_Result';
Object result = ConvertLinearizePDF.linearizePDFAndSave(pdfFileId, outputFileName);
System.debug('PDF Linearization Result: ' + result);
```

## API Endpoint

- **Endpoint**: `https://api.pdf4me.com/api/v2/LinearizePdf`
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

- ✅ Web-optimized PDF output
- ✅ Fast streaming and viewing

## Use Cases

- **Web publishing**: Optimize PDFs for fast online viewing
- **Document delivery**: Improve user experience for large PDFs

## License

MIT License - see project root for details 