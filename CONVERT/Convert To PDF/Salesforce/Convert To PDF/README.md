# Convert To PDF (Salesforce)

A Salesforce Apex prototype for converting various document types to PDF using the PDF4Me API.

## Project Structure

```
Convert To PDF/Salesforce/
├── ConvertToPDF.cls                # Main Apex class for document to PDF conversion
├── ConvertToPDFTest.cls            # Apex test class
├── Executable_Anonymous _code_ConvertToPDF.txt # Example usage (anonymous Apex)
└── README.md                       # This file
```

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic is implemented in `ConvertToPDF.cls`.

## Features (Planned)

- Convert various document types (Word, Excel, images, etc.) to PDF using PDF4Me API
- Save converted PDF as Salesforce File
- Return base64 and download URL for PDF
- Make file public and generate public URL
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging

## Requirements

- Salesforce org with API access
- PDF4Me API key
- Document file uploaded to Salesforce Files
- Internet connection (for PDF4Me API access)

## Setup

1. **Deploy Apex classes:**
   - Deploy `ConvertToPDF.cls` and `ConvertToPDFTest.cls` to your Salesforce org

2. **Configure Remote Site Settings:**
   - Add `https://api.pdf4me.com` to Remote Site Settings in Salesforce Setup

3. **Get your PDF4Me API key:**
   - Sign up at [PDF4Me Developer Portal](https://dev.pdf4me.com/dashboard/#/api-keys/)
   - Replace the placeholder API key in the Apex class

## Usage

### Example (Anonymous Apex)

See `Executable_Anonymous _code_ConvertToPDF.txt` for a full example. Basic steps:

1. Find a document file in Salesforce Files:
   ```apex
   List<ContentVersion> cvs = [SELECT Id, VersionData, Title FROM ContentVersion ORDER BY CreatedDate DESC LIMIT 1];
   if (!cvs.isEmpty()) {
       String docBase64 = EncodingUtil.base64Encode(cvs[0].VersionData);
       ConvertToPDF.PDFResult result = ConvertToPDF.createPDFAndSave(docBase64, 'PDF_Converted_Result');
       System.debug(result);
   }
   ```
2. Make the file public (optional):
   ```apex
   String publicUrl = ConvertToPDF.makeFilePublic(contentDocumentId);
   System.debug(publicUrl);
   ```

### Input and Output

- **Input:** Document file in Salesforce Files (ContentVersion)
- **Output:** PDF file saved as Salesforce File, base64 string, and download URL

## TODO List

- [ ] Add advanced error handling and logging
- [ ] Add configuration management
- [ ] Add support for more input formats
- [ ] Add documentation

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ConvertToPdf`
- **Authentication:** Basic authentication with API key
- **Format:** PDF format
- **Features:** Multi-format conversion, async support

## Development Notes

- Main logic is in `ConvertToPDF.cls`
- Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- Polls for completion if async
- Saves output as Salesforce File and provides download/public URL
- Ready to be extended for more features 