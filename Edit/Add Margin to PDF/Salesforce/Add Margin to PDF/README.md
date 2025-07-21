# Add Margin to PDF - Salesforce Apex

Add custom margins to PDF documents using the PDF4me API from Salesforce Apex. This tool allows you to modify the margins of any PDF document and automatically adjusts the page size to accommodate the new margins.

## Features

- Add customizable margins to PDF documents (top, bottom, left, right)
- Configurable margin sizes in millimeters
- Asynchronous processing with retry logic
- Comprehensive error handling and logging
- Handles both synchronous and asynchronous API responses
- Saves PDF with margins as Salesforce File (ContentVersion)

## Prerequisites

- **Salesforce org** with API access
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **Remote site settings** configured for `https://api.pdf4me.com/`
- **A PDF file** uploaded to Salesforce Files

## Project Structure

```
Add Margin to PDF/Salesforce/Add Margin to PDF/
├── AddMarginToPDF.cls                        # Apex class for adding margins
├── AddMarginToPDFTest.cls                    # Apex test class
├── Executable_Anonymous_code_AddMarginToPDF.txt # Example anonymous Apex execution
└── README.md                                 # This file
```

## Quick Start

1. **Add Remote Site Setting:**
   - Go to Setup → Security → Remote Site Settings
   - Add `https://api.pdf4me.com/` as an allowed remote site
2. **Deploy Apex Classes:**
   - Deploy `AddMarginToPDF.cls` and `AddMarginToPDFTest.cls` to your org
3. **Configure your API key:**
   - Set your PDF4me API key in the class (as a custom setting, custom metadata, or directly in code for testing)
4. **Upload your PDF file** to Salesforce Files
5. **Run the conversion:**
   - Use Anonymous Apex (see below) or call the class from your code

## Configuration

Edit the constants or parameters in `AddMarginToPDF.cls` to set your API key and margin values.

## Usage Example (Anonymous Apex)

See `Executable_Anonymous_code_AddMarginToPDF.txt` for a full example. Basic steps:

```apex
String pdfFileId = 'YOUR_CONTENT_VERSION_ID'; // ContentVersion Id of the PDF file
String outputFileName = 'MarginPDF_Result';
Object result = AddMarginToPDF.addMarginAndSave(pdfFileId, outputFileName);
System.debug('Margin Result: ' + result);
```

## Output

The PDF with margins will be saved as a Salesforce File (ContentVersion).

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
- **Processing timeout**: Large files may take longer to process

## License

MIT License - see project root for details 