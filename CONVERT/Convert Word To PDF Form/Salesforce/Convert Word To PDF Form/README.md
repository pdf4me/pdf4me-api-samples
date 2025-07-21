# Word to PDF Form Converter (Salesforce Apex)

Convert Word documents (.docx) to interactive PDF forms using the PDF4Me API from Salesforce Apex. This tool transforms Word documents containing form fields into PDF forms with fillable fields for data collection, surveys, and interactive documents.

## Features

- ✅ Convert Word documents (.docx) to PDF forms with fillable fields
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Preserves form fields and document layout
- ✅ Comprehensive error handling and logging
- ✅ Saves PDF as Salesforce File (ContentVersion)

## Prerequisites

- **Salesforce org** with API access
- **PDF4Me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **Remote site settings** configured for `https://api.pdf4me.com/`
- **A Word file** (.docx) uploaded to Salesforce Files

## Project Structure

```
Convert Word To PDF Form/Salesforce/Convert Word To PDF Form/
├── ConvertWordToPDFForm.cls                # Apex class for Word to PDF Form conversion
├── ConvertWordToPDFFormTest.cls            # Apex test class
├── Executable_Anonymous _code_WordToPDFForm.txt # Example anonymous Apex execution
└── README.md                               # This file
```

## Quick Start

1. **Add Remote Site Setting:**
   - Go to Setup → Security → Remote Site Settings
   - Add `https://api.pdf4me.com/` as an allowed remote site
2. **Deploy Apex Classes:**
   - Deploy `ConvertWordToPDFForm.cls` and `ConvertWordToPDFFormTest.cls` to your org
3. **Configure your API key:**
   - Set your PDF4Me API key in the class (as a custom setting, custom metadata, or directly in code for testing)
4. **Upload your Word file** to Salesforce Files
5. **Run the conversion:**
   - Use Anonymous Apex (see below) or call the class from your code

## Configuration

Edit the constants or parameters in `ConvertWordToPDFForm.cls` to set your API key and conversion options.

## Usage Example (Anonymous Apex)

See `Executable_Anonymous _code_WordToPDFForm.txt` for a full example. Basic steps:

```apex
String wordFileId = 'YOUR_CONTENT_VERSION_ID'; // Salesforce ContentVersion Id of the Word file
String outputFileName = 'WordToPDFForm_Result';
Object result = ConvertWordToPDFForm.convertWordToPDFFormAndSave(wordFileId, outputFileName);
System.debug('Word to PDF Form Conversion Result: ' + result);
```

## API Endpoint

- **Endpoint**: `https://api.pdf4me.com/api/v2/ConvertWordToPdfForm`
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

- ✅ Preserves form fields and document layout
- ✅ Fillable PDF output

## Use Cases

- **Data collection**: Create fillable PDF forms from Word templates
- **Surveys**: Distribute interactive forms for feedback
- **Document automation**: Generate forms for contracts, HR, and more

## License

MIT License - see project root for details 