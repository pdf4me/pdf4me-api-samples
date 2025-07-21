# Convert PDF To PowerPoint (Salesforce)

A Salesforce Apex prototype for converting PDF documents to PowerPoint (PPTX) using the PDF4Me API.

## Project Structure

```
Convert To Powerpoint/Salesforce/
├── ConvertPDFToPowerPoint.cls                # Main Apex class for PDF to PowerPoint conversion
├── ConvertPDFToPowerPointTest.cls            # Apex test class
├── Executable_Anonymous _code_PDFToPowerPoint.txt # Example usage (anonymous Apex)
└── README.md                                 # This file
```

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic is implemented in `ConvertPDFToPowerPoint.cls`.

## Features (Planned)

- Convert PDF files to PowerPoint (PPTX) format using PDF4Me API
- Save converted PowerPoint as Salesforce File
- Return base64 and download URL for PowerPoint
- Make file public and generate public URL
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging

## Requirements

- Salesforce org with API access
- PDF4Me API key
- PDF file uploaded to Salesforce Files
- Internet connection (for PDF4Me API access)

## Setup

1. **Deploy Apex classes:**
   - Deploy `ConvertPDFToPowerPoint.cls` and `ConvertPDFToPowerPointTest.cls` to your Salesforce org

2. **Configure Remote Site Settings:**
   - Add `https://api.pdf4me.com` to Remote Site Settings in Salesforce Setup

3. **Get your PDF4Me API key:**
   - Sign up at [PDF4Me Developer Portal](https://dev.pdf4me.com/dashboard/#/api-keys/)
   - Replace the placeholder API key in the Apex class

## Usage

### Example (Anonymous Apex)

See `Executable_Anonymous _code_PDFToPowerPoint.txt` for a full example. Basic steps:

1. Find a PDF file in Salesforce Files:
   ```apex
   List<ContentVersion> cvs = [SELECT Id, VersionData, Title FROM ContentVersion WHERE FileType = 'PDF' ORDER BY CreatedDate DESC LIMIT 1];
   if (!cvs.isEmpty()) {
       String pdfBase64 = EncodingUtil.base64Encode(cvs[0].VersionData);
       ConvertPDFToPowerPoint.PPTXResult result = ConvertPDFToPowerPoint.createPPTXAndSave(pdfBase64, 'PPTX_Converted_Result');
       System.debug(result);
   }
   ```
2. Make the file public (optional):
   ```apex
   String publicUrl = ConvertPDFToPowerPoint.makeFilePublic(contentDocumentId);
   System.debug(publicUrl);
   ```

### Input and Output

- **Input:** PDF file in Salesforce Files (ContentVersion)
- **Output:** PowerPoint file saved as Salesforce File, base64 string, and download URL

## TODO List

- [ ] Add advanced error handling and logging
- [ ] Add configuration management
- [ ] Add support for more PowerPoint features
- [ ] Add documentation

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ConvertPdfToPowerPoint`
- **Authentication:** Basic authentication with API key
- **Format:** PowerPoint (PPTX) format
- **Features:** PDF parsing, PowerPoint formatting, async support

## Development Notes

- Main logic is in `ConvertPDFToPowerPoint.cls`
- Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- Polls for completion if async
- Saves output as Salesforce File and provides download/public URL
- Ready to be extended for more features 