# Visio to PDF Converter (Salesforce Apex)

Convert Microsoft Visio files (.vsdx, .vsd, .vsdm) to PDF documents using the PDF4Me API from Salesforce Apex. This tool supports both synchronous and asynchronous processing with automatic retry logic.

## Features

- ✅ Multiple input formats: .vsdx, .vsd, .vsdm
- ✅ Output to PDF (default), JPG, PNG, or TIFF
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Configurable output options (page range, hidden pages, etc.)
- ✅ Comprehensive error handling and logging
- ✅ Saves PDF as Salesforce File (ContentVersion)

## Prerequisites

- **Salesforce org** with API access
- **PDF4Me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **Remote site settings** configured for `https://api.pdf4me.com/`
- **A Visio file** (.vsdx, .vsd, or .vsdm) uploaded to Salesforce Files

## Project Structure

```
Convert VISIO/Salesforce/Convert VISIO/
├── ConvertVisioToPDF.cls                # Apex class for Visio to PDF conversion
├── ConvertVisioToPDFTest.cls            # Apex test class
├── Executable_Anonymous _code_VisioToPDF.txt # Example anonymous Apex execution
└── README.md                            # This file
```

## Quick Start

1. **Add Remote Site Setting:**
   - Go to Setup → Security → Remote Site Settings
   - Add `https://api.pdf4me.com/` as an allowed remote site
2. **Deploy Apex Classes:**
   - Deploy `ConvertVisioToPDF.cls` and `ConvertVisioToPDFTest.cls` to your org
3. **Configure your API key:**
   - Set your PDF4Me API key in the class (as a custom setting, custom metadata, or directly in code for testing)
4. **Upload your Visio file** to Salesforce Files
5. **Run the conversion:**
   - Use Anonymous Apex (see below) or call the class from your code

## Configuration

Edit the constants or parameters in `ConvertVisioToPDF.cls` to set your API key and conversion options.

## Usage Example (Anonymous Apex)

See `Executable_Anonymous _code_VisioToPDF.txt` for a full example. Basic steps:

```apex
String visioFileId = 'YOUR_CONTENT_VERSION_ID'; // Salesforce ContentVersion Id of the Visio file
String outputFileName = 'VisioToPDF_Result';
Object result = ConvertVisioToPDF.convertVisioToPDFAndSave(visioFileId, outputFileName);
System.debug('Visio to PDF Conversion Result: ' + result);
```

## API Endpoint

- **Endpoint**: `https://api.pdf4me.com/api/v2/ConvertVisio?schemaVal=PDF`
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

- ✅ CSS styling and layout in Visio
- ✅ Images and graphics
- ✅ Multiple output formats
- ✅ Page range and hidden page support

## Use Cases

- **Document archiving**: Convert Visio diagrams to PDF for long-term storage
- **Sharing**: Distribute Visio content as universally accessible PDFs
- **Printing**: Prepare Visio diagrams for print

## License

MIT License - see project root for details 