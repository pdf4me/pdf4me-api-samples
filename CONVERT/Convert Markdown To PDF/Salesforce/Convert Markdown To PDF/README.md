# Convert Markdown To PDF (Salesforce)

A Salesforce Apex prototype for converting Markdown documents to PDF using the PDF4Me API.

## Project Structure

```
Convert Markdown To PDF/Salesforce/
├── ConvertMarkdownToPDF.cls                # Main Apex class for Markdown to PDF conversion
├── ConvertMarkdownToPDFTest.cls            # Apex test class
├── Executable_Anonymous _code_MarkdownToPDF.txt # Example usage (anonymous Apex)
└── README.md                               # This file
```

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic is implemented in `ConvertMarkdownToPDF.cls`.

## Features (Planned)

- Convert Markdown files to PDF format using PDF4Me API
- Save converted PDF as Salesforce File
- Return base64 and download URL for PDF
- Make file public and generate public URL
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging

## Requirements

- Salesforce org with API access
- PDF4Me API key
- Markdown file uploaded to Salesforce Files
- Internet connection (for PDF4Me API access)

## Setup

1. **Deploy Apex classes:**
   - Deploy `ConvertMarkdownToPDF.cls` and `ConvertMarkdownToPDFTest.cls` to your Salesforce org

2. **Configure Remote Site Settings:**
   - Add `https://api.pdf4me.com` to Remote Site Settings in Salesforce Setup

3. **Get your PDF4Me API key:**
   - Sign up at [PDF4Me Developer Portal](https://dev.pdf4me.com/dashboard/#/api-keys/)
   - Replace the placeholder API key in the Apex class

## Usage

### Example (Anonymous Apex)

See `Executable_Anonymous _code_MarkdownToPDF.txt` for a full example. Basic steps:

1. Find a Markdown file in Salesforce Files:
   ```apex
   List<ContentVersion> cvs = [SELECT Id, VersionData, Title FROM ContentVersion WHERE FileType = 'MD' ORDER BY CreatedDate DESC LIMIT 1];
   if (!cvs.isEmpty()) {
       String mdBase64 = EncodingUtil.base64Encode(cvs[0].VersionData);
       ConvertMarkdownToPDF.PDFResult result = ConvertMarkdownToPDF.createPDFAndSave(mdBase64, 'Markdown_Converted_Result');
       System.debug(result);
   }
   ```
2. Make the file public (optional):
   ```apex
   String publicUrl = ConvertMarkdownToPDF.makeFilePublic(contentDocumentId);
   System.debug(publicUrl);
   ```

### Input and Output

- **Input:** Markdown file in Salesforce Files (ContentVersion)
- **Output:** PDF file saved as Salesforce File, base64 string, and download URL

## TODO List

- [ ] Add advanced error handling and logging
- [ ] Add configuration management
- [ ] Add support for more Markdown features
- [ ] Add documentation

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ConvertMdToPdf`
- **Authentication:** Basic authentication with API key
- **Format:** PDF format
- **Features:** Markdown rendering, async support

## Development Notes

- Main logic is in `ConvertMarkdownToPDF.cls`
- Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- Polls for completion if async
- Saves output as Salesforce File and provides download/public URL
- Ready to be extended for more features 