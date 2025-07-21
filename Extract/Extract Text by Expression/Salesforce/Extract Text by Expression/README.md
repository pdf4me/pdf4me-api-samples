# Extract Text by Expression - Salesforce Apex

Extract specific text from PDF documents using regular expressions with the PDF4me API from Salesforce Apex. This tool supports both synchronous and asynchronous processing with automatic retry logic.

## Features

- Extract text matching specific patterns/expressions from PDF documents
- Support for page range selection
- Asynchronous processing with polling
- Multiple output formats (JSON, TXT, CSV)
- Comprehensive error handling and logging
- Saves extracted text as Salesforce Files or Attachments

## Prerequisites

- **Salesforce org** with API access
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **Remote site settings** configured for `https://api.pdf4me.com/`
- **A PDF file** uploaded to Salesforce Files

## Project Structure

```
Extract Text by Expression/Salesforce/Extract Text by Expression/
├── ExtractTextByExpression.cls                        # Apex class for extracting text by expression
├── ExtractTextByExpressionTest.cls                    # Apex test class
├── Executable_Anonymous_code_ExtractTextByExpression.txt # Example anonymous Apex execution
└── README.md                                          # This file
```

## Quick Start

1. **Add Remote Site Setting:**
   - Go to Setup → Security → Remote Site Settings
   - Add `https://api.pdf4me.com/` as an allowed remote site
2. **Deploy Apex Classes:**
   - Deploy `ExtractTextByExpression.cls` and `ExtractTextByExpressionTest.cls` to your org
3. **Configure your API key:**
   - Set your PDF4me API key in the class (as a custom setting, custom metadata, or directly in code for testing)
4. **Upload your PDF file** to Salesforce Files
5. **Run the extraction:**
   - Use Anonymous Apex (see below) or call the class from your code

## Configuration

Edit the constants or parameters in `ExtractTextByExpression.cls` to set your API key, expression pattern, and page range.

## Usage Example (Anonymous Apex)

See `Executable_Anonymous_code_ExtractTextByExpression.txt` for a full example. Basic steps:

```apex
String pdfFileId = 'YOUR_CONTENT_VERSION_ID'; // ContentVersion Id of the PDF file
String expression = '%'; // Regular expression pattern to search for
String pageSequence = '1-3'; // Page range to process
Object result = ExtractTextByExpression.extractTextByExpression(pdfFileId, expression, pageSequence);
System.debug('Extracted Text Result: ' + result);
```

## Output

The extracted text (JSON, TXT, CSV) will be saved as Salesforce Files or Attachments, or provided as downloadable links.

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
- **No matches found**: The PDF may not contain text matching your expression
- **Processing timeout**: Large files may take longer to process

## License

MIT License - see project root for details 