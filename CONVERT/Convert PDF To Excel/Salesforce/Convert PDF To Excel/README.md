# Convert PDF To Excel (Salesforce)

A Salesforce Apex prototype for converting PDF documents to Excel (XLSX) using the PDF4Me API.

## Project Structure

```
Convert PDF To Excel/Salesforce/
├── ConvertPDFToExcel.cls                # Main Apex class for PDF to Excel conversion
├── ConvertPDFToExcelTest.cls            # Apex test class
├── Executable_Anonymous _code_PDFToExcel.txt # Example usage (anonymous Apex)
└── README.md                            # This file
```

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic is implemented in `ConvertPDFToExcel.cls`.

## Features (Planned)

- Convert PDF files to Excel (XLSX) format using PDF4Me API
- Save converted Excel as Salesforce File
- Return base64 and download URL for Excel
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
   - Deploy `ConvertPDFToExcel.cls` and `ConvertPDFToExcelTest.cls` to your Salesforce org

2. **Configure Remote Site Settings:**
   - Add `https://api.pdf4me.com` to Remote Site Settings in Salesforce Setup

3. **Get your PDF4Me API key:**
   - Sign up at [PDF4Me Developer Portal](https://dev.pdf4me.com/dashboard/#/api-keys/)
   - Replace the placeholder API key in the Apex class

## Usage

### Example (Anonymous Apex)

See `Executable_Anonymous _code_PDFToExcel.txt` for a full example. Basic steps:

1. Find a PDF file in Salesforce Files:
   ```apex
   List<ContentVersion> cvs = [SELECT Id, VersionData, Title FROM ContentVersion WHERE FileType = 'PDF' ORDER BY CreatedDate DESC LIMIT 1];
   if (!cvs.isEmpty()) {
       String pdfBase64 = EncodingUtil.base64Encode(cvs[0].VersionData);
       ConvertPDFToExcel.ExcelResult result = ConvertPDFToExcel.createExcelAndSave(pdfBase64, 'Excel_Converted_Result');
       System.debug(result);
   }
   ```
2. Make the file public (optional):
   ```apex
   String publicUrl = ConvertPDFToExcel.makeFilePublic(contentDocumentId);
   System.debug(publicUrl);
   ```

### Input and Output

- **Input:** PDF file in Salesforce Files (ContentVersion)
- **Output:** Excel file saved as Salesforce File, base64 string, and download URL

## TODO List

- [ ] Add advanced error handling and logging
- [ ] Add configuration management
- [ ] Add support for more Excel features
- [ ] Add documentation

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ConvertPdfToExcel`
- **Authentication:** Basic authentication with API key
- **Format:** Excel (XLSX) format
- **Features:** PDF parsing, Excel formatting, async support

## Development Notes

- Main logic is in `ConvertPDFToExcel.cls`
- Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- Polls for completion if async
- Saves output as Salesforce File and provides download/public URL
- Ready to be extended for more features 