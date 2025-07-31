# Create Image from PDF - Google Apps Script

This Google Apps Script converts PDF pages to images using the PDF4Me API. It can extract specific pages from a PDF document and convert them to various image formats.

## Prerequisites

- Google Apps Script access
- PDF4Me API key
- Google Drive with Input and Output folders
- A PDF file in the Input folder

## Setup

1. **Create Google Apps Script Project:**
   - Go to [Google Apps Script](https://script.google.com/)
   - Create a new project
   - Copy the code from `create_image_from_pdf.gs`

2. **Configure API Key:**
   ```javascript
   // Set your PDF4Me API key
   var apiKey = 'YOUR_API_KEY_HERE';
   ```

3. **Set up Google Drive Folders:**
   - Create a folder named "Input" in your Google Drive
   - Create a folder named "Output" in your Google Drive
   - Place your PDF file in the Input folder

4. **Configure File Names:**
   ```javascript
   var inputFileName = 'input.pdf';
   var outputFileName = 'output.jpg';
   ```

## Usage

1. **Prepare your PDF file:**
   - Place your PDF file in the Input folder
   - Update the `inputFileName` variable to match your file name

2. **Configure conversion settings:**
   ```javascript
   var pageNumber = 1; // Page number to convert (1-based)
   var imageFormat = 'jpg'; // Output format: jpg, png, gif, bmp, tiff
   var quality = 90; // Image quality (1-100)
   var maxWidth = 1920; // Maximum width in pixels
   var maxHeight = 1080; // Maximum height in pixels
   ```

3. **Run the script:**
   - Save the script
   - Click the "Run" button
   - Grant necessary permissions when prompted

4. **Check results:**
   - The converted image will be saved in the Output folder
   - Check the execution logs for status information

## API Endpoint

- **URL:** `https://api.pdf4me.com/api/v2/CreateImageFromPdf`
- **Method:** POST
- **Authentication:** Bearer token

## Request Payload

```json
{
  "imageName": "output.jpg",
  "pdfContent": "base64_encoded_pdf_content",
  "pageNumber": 1,
  "imageFormat": "jpg",
  "quality": 90,
  "maxWidth": 1920,
  "maxHeight": 1080,
  "async": true
}
```

## Configuration Options

### Page Selection
- **pageNumber:** Specify which page to convert (1-based indexing)
- Use 1 for the first page, 2 for the second page, etc.

### Output Format
- **imageFormat:** Choose from:
  - `jpg` - JPEG format (lossy compression)
  - `png` - PNG format (lossless compression)
  - `gif` - GIF format (supports animation)
  - `bmp` - BMP format (uncompressed)
  - `tiff` - TIFF format (high quality)

### Quality Settings
- **quality:** Image quality for lossy formats (1-100)
  - Higher values = better quality, larger file size
  - Lower values = smaller file size, reduced quality
  - Only applies to JPG format

### Size Constraints
- **maxWidth:** Maximum width in pixels
- **maxHeight:** Maximum height in pixels
- The image will be scaled down if it exceeds these dimensions
- Aspect ratio is maintained

## Supported Input Formats

- PDF documents

## Supported Output Formats

- JPG (JPEG)
- PNG
- GIF
- BMP
- TIFF

## Error Handling

The script includes comprehensive error handling:

- **File not found:** Checks if input file exists
- **API errors:** Handles HTTP error responses
- **Authentication errors:** Validates API key
- **Processing errors:** Monitors async job status
- **Timeout handling:** Prevents infinite polling

## Troubleshooting

### Common Issues

1. **"File not found" error:**
   - Ensure the input file exists in the Input folder
   - Check the `inputFileName` variable matches your file name

2. **"API key invalid" error:**
   - Verify your PDF4Me API key is correct
   - Ensure the API key has sufficient permissions

3. **"Processing failed" error:**
   - Check if the PDF file is corrupted
   - Verify the page number is valid
   - Ensure the PDF is not password-protected

4. **"Timeout" error:**
   - Large PDFs may take longer to process
   - Increase the `maxAttempts` value if needed

### Performance Tips

- Use appropriate quality settings for your needs
- Set reasonable size constraints to reduce processing time
- Consider using PNG for documents with text or graphics
- Use JPG for photographs or when file size is a concern

## Security Considerations

- Store your API key securely
- Don't share your script with API keys exposed
- Use environment variables or secure storage for production
- Regularly rotate your API keys

## Performance Notes

- Processing time depends on PDF size and complexity
- Large PDFs may require async processing
- Image quality and size settings affect processing time
- Network latency may impact response times

## Best Practices

1. **File naming:** Use descriptive names for input and output files
2. **Quality settings:** Balance quality vs file size based on your needs
3. **Page selection:** Verify page numbers before processing
4. **Error monitoring:** Check logs regularly for issues
5. **Backup:** Keep original PDF files as backup

## Support

For issues related to:
- **PDF4Me API:** Contact PDF4Me support
- **Google Apps Script:** Check Google Apps Script documentation
- **Google Drive:** Refer to Google Drive help

## Example Use Cases

- **Document preview:** Convert PDF pages to images for web display
- **Thumbnail generation:** Create small preview images
- **Content extraction:** Extract images from PDF documents
- **Format conversion:** Convert PDF content to image formats
- **Archive purposes:** Create image copies of PDF documents 