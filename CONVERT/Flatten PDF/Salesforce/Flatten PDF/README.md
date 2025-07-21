# PDF Flattener (Salesforce Apex)

Flatten PDF documents using the PDF4Me API from Salesforce Apex. Flattening a PDF merges all layers and annotations into a single layer, making the document easier to view and print.

## Features

- ✅ Flattens PDF files, merging all layers and annotations
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Saves flattened PDF as Salesforce File (ContentVersion)

## Prerequisites

- **Salesforce org** with API access
- **PDF4Me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **Remote site settings** configured for `https://api.pdf4me.com/`
- **A PDF file** uploaded to Salesforce Files

## Project Structure

```
Flatten PDF/Salesforce/Flatten PDF/
├── ConvertFlattenPDF.cls                # Apex class for PDF flattening
├── ConvertFlattenPDFTest.cls            # Apex test class
├── Executable_Anonymous _code_ConvertFlattenPDF.txt # Example anonymous Apex execution
└── README.md                            # This file
```

## Quick Start

1. **Add Remote Site Setting:**
   - Go to Setup → Security → Remote Site Settings
   - Add `https://api.pdf4me.com/` as an allowed remote site
2. **Deploy Apex Classes:**
   - Deploy `ConvertFlattenPDF.cls` and `ConvertFlattenPDFTest.cls` to your org
3. **Configure your API key:**
   - Set your PDF4Me API key in the class (as a custom setting, custom metadata, or directly in code for testing)
4. **Upload your PDF file** to Salesforce Files
5. **Run the conversion:**
   - Use Anonymous Apex (see below) or call the class from your code

## Configuration

Edit the constants or parameters in `ConvertFlattenPDF.cls` to set your API key and conversion options.

## Usage Example (Anonymous Apex)

See `Executable_Anonymous _code_ConvertFlattenPDF.txt` for a full example. Basic steps:

```apex
String pdfFileId = 'YOUR_CONTENT_VERSION_ID'; // Salesforce ContentVersion Id of the PDF file
String outputFileName = 'FlattenedPDF_Result';
Object result = ConvertFlattenPDF.flattenPDFAndSave(pdfFileId, outputFileName);
System.debug('PDF Flattening Result: ' + result);
```

## API Endpoint

- **Endpoint**: `https://api.pdf4me.com/api/v2/FlattenPdf`
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

- ✅ Flattens all layers and annotations
- ✅ Output is a single-layer PDF

## Use Cases

- **Archiving**: Prepare PDFs for long-term storage
- **Printing**: Ensure all content is visible and printable
- **Sharing**: Distribute PDFs with all content merged

## License

MIT License - see project root for details 