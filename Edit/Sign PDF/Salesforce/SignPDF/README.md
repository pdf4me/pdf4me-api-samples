# PDF Signer - Salesforce Apex

Digitally sign PDF documents with an image using the PDF4me API from Salesforce Apex.

## Features
- Add a signature image to a PDF at a specified position
- Configurable alignment, margins, opacity, and page selection
- Handles both synchronous and asynchronous API responses
- Automatic polling for async operations
- Comprehensive error handling and logging
- Saves signed PDF as Salesforce File (ContentVersion)

## Prerequisites
- Salesforce org with API access
- PDF4me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- Remote site settings configured for `https://api.pdf4me.com/`
- `sample.pdf` (input PDF) and `dev.jpg` (signature image) uploaded to Salesforce Files

## Project Structure
```
Sign PDF/Salesforce/SignPDF/
├── SignPDF.cls                        # Apex class for PDF signing
├── SignPDFTest.cls                    # Apex test class
├── Executable_Anonymous_code_SignPDF.txt # Example anonymous Apex execution
└── README.md                          # This file
```

## Quick Start
1. **Add Remote Site Setting:**
   - Go to Setup → Security → Remote Site Settings
   - Add `https://api.pdf4me.com/` as an allowed remote site
2. **Deploy Apex Classes:**
   - Deploy `SignPDF.cls` and `SignPDFTest.cls` to your org
3. **Configure your API key:**
   - Set your PDF4me API key in the class (as a custom setting, custom metadata, or directly in code for testing)
4. **Upload your PDF and signature image** to Salesforce Files
5. **Run the conversion:**
   - Use Anonymous Apex (see below) or call the class from your code

## Configuration
Edit the constants or parameters in `SignPDF.cls` to set your API key and signature options.

## Usage Example (Anonymous Apex)
See `Executable_Anonymous_code_SignPDF.txt` for a full example. Basic steps:
```apex
String pdfFileId = 'YOUR_CONTENT_VERSION_ID'; // ContentVersion Id of the PDF file
String imageFileId = 'YOUR_IMAGE_CONTENT_VERSION_ID'; // ContentVersion Id of the image file
String outputFileName = 'SignedPDF_Result';
Object result = SignPDF.signPDFAndSave(pdfFileId, imageFileId, outputFileName);
System.debug('PDF Signing Result: ' + result);
```

## Output
The signed PDF will be saved as a Salesforce File (ContentVersion).

## Error Handling
- File validation for input PDF and signature image
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses
- Salesforce callout and governor limits

## Troubleshooting
- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure files are uploaded to Salesforce
- **API request failed**: Check internet connection and API status

## License
MIT License - see project root for details 