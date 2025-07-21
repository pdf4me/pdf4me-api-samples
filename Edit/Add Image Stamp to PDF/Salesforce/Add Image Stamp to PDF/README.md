# Add Image Stamp to PDF - Salesforce Apex

Add image stamps/watermarks to PDF documents using the PDF4me API from Salesforce Apex. This tool allows you to overlay images onto PDF documents with configurable positioning and sizing.

## Features

- Add image stamps to PDF documents
- Support for various image formats (PNG, JPG, etc.)
- Configurable stamp positioning and sizing
- Page range support (all pages or specific pages)
- Asynchronous processing with retry logic
- Comprehensive error handling and logging
- Handles both synchronous and asynchronous API responses
- Saves PDF with image stamp as Salesforce File (ContentVersion)

## Prerequisites

- **Salesforce org** with API access
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **Remote site settings** configured for `https://api.pdf4me.com/`
- **A PDF file** and **an image file** uploaded to Salesforce Files

## Project Structure

```
Add Image Stamp to PDF/Salesforce/Add Image Stamp to PDF/
├── AddImageStampToPDF.cls                        # Apex class for adding image stamps
├── AddImageStampToPDFTest.cls                    # Apex test class
├── Executable_Anonymous_code_AddImageStampToPDF.txt # Example anonymous Apex execution
└── README.md                                     # This file
```

## Quick Start

1. **Add Remote Site Setting:**
   - Go to Setup → Security → Remote Site Settings
   - Add `https://api.pdf4me.com/` as an allowed remote site
2. **Deploy Apex Classes:**
   - Deploy `AddImageStampToPDF.cls` and `AddImageStampToPDFTest.cls` to your org
3. **Configure your API key:**
   - Set your PDF4me API key in the class (as a custom setting, custom metadata, or directly in code for testing)
4. **Upload your PDF and image files** to Salesforce Files
5. **Run the conversion:**
   - Use Anonymous Apex (see below) or call the class from your code

## Configuration

Edit the constants or parameters in `AddImageStampToPDF.cls` to set your API key and stamp properties.

## Usage Example (Anonymous Apex)

See `Executable_Anonymous_code_AddImageStampToPDF.txt` for a full example. Basic steps:

```apex
String pdfFileId = 'YOUR_PDF_CONTENT_VERSION_ID'; // ContentVersion Id of the PDF file
String imageFileId = 'YOUR_IMAGE_CONTENT_VERSION_ID'; // ContentVersion Id of the image file
String outputFileName = 'ImageStampedPDF_Result';
Object result = AddImageStampToPDF.addImageStampAndSave(pdfFileId, imageFileId, outputFileName);
System.debug('Image Stamp Result: ' + result);
```

## Output

The PDF with the image stamp will be saved as a Salesforce File (ContentVersion).

## Error Handling

- File validation for input PDF and image
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