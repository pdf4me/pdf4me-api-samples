# Extract Resources from PDF - Salesforce Apex

Extract text content and embedded images from PDF documents using the PDF4me API from Salesforce Apex. This tool supports both synchronous and asynchronous processing with automatic retry logic.

## Features

- Extract all text content from PDF documents
- Extract embedded images from PDF files
- Asynchronous processing with polling
- Multiple output formats (text, images)
- Comprehensive error handling and logging
- Saves extracted resources as Salesforce Files or Attachments

## Prerequisites

- **Salesforce org** with API access
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **Remote site settings** configured for `https://api.pdf4me.com/`
- **A PDF file** uploaded to Salesforce Files

## Project Structure

```
Extract Resources/Salesforce/Extract Resources/
├── ExtractResources.cls                        # Apex class for extracting resources
├── ExtractResourcesTest.cls                    # Apex test class
├── Executable_Anonymous_code_ExtractResources.txt # Example anonymous Apex execution
└── README.md                                   # This file
```

## Quick Start

1. **Add Remote Site Setting:**
   - Go to Setup → Security → Remote Site Settings
   - Add `https://api.pdf4me.com/` as an allowed remote site
2. **Deploy Apex Classes:**
   - Deploy `ExtractResources.cls` and `ExtractResourcesTest.cls` to your org
3. **Configure your API key:**
   - Set your PDF4me API key in the class (as a custom setting, custom metadata, or directly in code for testing)
4. **Upload your PDF file** to Salesforce Files
5. **Run the extraction:**
   - Use Anonymous Apex (see below) or call the class from your code

## Configuration

Edit the constants or parameters in `ExtractResources.cls` to set your API key and file paths.

## Usage Example (Anonymous Apex)

See `Executable_Anonymous_code_ExtractResources.txt` for a full example. Basic steps:

```apex
String pdfFileId = 'YOUR_CONTENT_VERSION_ID'; // ContentVersion Id of the PDF file
Object result = ExtractResources.extractResourcesAndSave(pdfFileId);
System.debug('Extracted Resources Result: ' + result);
```

## Output

The extracted resources (text, images) will be saved as Salesforce Files or Attachments, or provided as downloadable links.

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