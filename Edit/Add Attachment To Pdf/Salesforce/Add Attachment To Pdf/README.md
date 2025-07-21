# Add Attachment to PDF - Salesforce Apex

Add file attachments to PDF documents using the PDF4me API from Salesforce Apex. This tool allows you to attach various file types (like .txt, .doc, .jpg, .png, etc.) to PDF documents for enhanced document management.

## Features

- Add any file type as an attachment to PDF documents
- Support for multiple attachment formats (TXT, DOC, XLS, images, etc.)
- Configurable attachment properties (name, description)
- Handles both synchronous and asynchronous API responses
- Asynchronous processing with retry logic
- Comprehensive error handling and logging
- Saves PDF with attachment as Salesforce File (ContentVersion)

## Prerequisites

- **Salesforce org** with API access
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **Remote site settings** configured for `https://api.pdf4me.com/`
- **A PDF file** and **an attachment file** uploaded to Salesforce Files

## Project Structure

```
Add Attachment To Pdf/Salesforce/Add Attachment To Pdf/
├── AddAttachmentToPDF.cls                        # Apex class for adding attachments
├── AddAttachmentToPDFTest.cls                    # Apex test class
├── Executable_Anonymous _code_AddAttachmentToPDF.txt # Example anonymous Apex execution
└── README.md                                     # This file
```

## Quick Start

1. **Add Remote Site Setting:**
   - Go to Setup → Security → Remote Site Settings
   - Add `https://api.pdf4me.com/` as an allowed remote site
2. **Deploy Apex Classes:**
   - Deploy `AddAttachmentToPDF.cls` and `AddAttachmentToPDFTest.cls` to your org
3. **Configure your API key:**
   - Set your PDF4me API key in the class (as a custom setting, custom metadata, or directly in code for testing)
4. **Upload your PDF and attachment files** to Salesforce Files
5. **Run the conversion:**
   - Use Anonymous Apex (see below) or call the class from your code

## Configuration

Edit the constants or parameters in `AddAttachmentToPDF.cls` to set your API key and file paths.

## Usage Example (Anonymous Apex)

See `Executable_Anonymous _code_AddAttachmentToPDF.txt` for a full example. Basic steps:

```apex
String pdfFileId = 'YOUR_PDF_CONTENT_VERSION_ID'; // ContentVersion Id of the PDF file
String attachmentFileId = 'YOUR_ATTACHMENT_CONTENT_VERSION_ID'; // ContentVersion Id of the attachment file
String outputFileName = 'AttachmentPDF_Result';
Object result = AddAttachmentToPDF.addAttachmentAndSave(pdfFileId, attachmentFileId, outputFileName);
System.debug('Attachment Result: ' + result);
```

## Output

The PDF with the attachment will be saved as a Salesforce File (ContentVersion).

## Error Handling

- File validation for input PDF and attachment
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