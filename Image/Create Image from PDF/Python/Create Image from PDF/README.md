# Create Image from PDF (Python)

A Python sample project for converting PDF pages to images using the PDF4Me API.

## Project Structure

```
Create Image from PDF/
├── create_image_from_pdf.py           # Main script for PDF to image conversion
├── sample.pdf                         # Sample input PDF
├── PDF_to_Images_outputs/             # Output directory for converted images
│   ├── sample_1.jpeg                 # First page as image
│   ├── sample_2.jpeg                 # Second page as image
│   └── raw_response.json             # Raw API response (for debugging)
└── README.md                          # This file
```

## Features

- ✅ Convert PDF pages to images with customizable settings
- ✅ Support for multiple output formats (JPEG, PNG, BMP, GIF, TIFF, etc.)
- ✅ Configurable image dimensions and quality
- ✅ Page selection (specific pages or ranges)
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Batch processing of multiple pages
- ✅ Raw response logging for debugging

## Prerequisites

- Python 3.6+
- `requests` library (install with `pip install requests`)
- Internet connection (for PDF4Me API access)
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))

## Setup

1. **Install dependencies:**
   ```bash
   pip install requests
   ```

2. **Configure your API key:**
   - Open `create_image_from_pdf.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4Me API key

3. **Prepare your PDF:**
   - Place your input PDF in the project directory
   - Update the `pdf_file_path` variable in the script if needed

## Usage

1. **Set the input PDF and output settings (optional):**
   - Edit the `pdf_file_path` and image settings in `create_image_from_pdf.py` if needed

2. **Run the script:**
   ```bash
   python create_image_from_pdf.py
   ```

### Input and Output

- **Input:** PDF file (default: `sample.pdf`)
- **Output:** Image files in `PDF_to_Images_outputs/` directory

## Configuration

- **API Key:** Set in `create_image_from_pdf.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/CreateImages`
- **Supported Output Formats:** jpg, jpeg, bmp, gif, jb2, jp2, jpf, jpx, png, tif, tiff
- **Payload Options:**
  - `docContent`: Base64 encoded PDF content
  - `docname`: Input PDF filename
  - `imageAction`: Image conversion settings
    - `WidthPixel`: Output image width in pixels
    - `ImageExtension`: Output format (jpeg, png, etc.)
    - `PageSelection`: Page selection settings
  - `pageNrs`: Page range as string (e.g., "1-2", "1,3,5")
  - `async`: true/false (async recommended for large PDFs)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/CreateImages`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)
- **Response:**
  - 200: Array of converted images (JSON)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Page Selection Options

### Method 1: Page Numbers Array
```python
"PageSelection": {
    "PageNrs": [1, 2, 3]  # Convert pages 1, 2, and 3
}
```

### Method 2: Page Range String
```python
"pageNrs": "1-2"          # Convert pages 1 and 2
"pageNrs": "1,3,5"        # Convert pages 1, 3, and 5
"pageNrs": "2-"           # Convert from page 2 to end
```

## Error Handling

- Invalid PDF file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- File I/O errors
- JSON parsing errors
- Directory creation failures

## Troubleshooting

### Common Issues

1. **"PDF file not found"**
   - Ensure the input PDF file exists in the project directory
   - Check the file path in the script

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the PDF is valid and accessible

3. **"Polling timeout"**
   - Large PDFs may take longer to process
   - Increase timeout values in the code if needed

4. **"No images found in response"**
   - Check the raw response in `raw_response.json`
   - Verify page numbers are valid for the PDF
   - Ensure output format is supported

5. **"Directory creation failed"**
   - Check file permissions
   - Ensure sufficient disk space

### Debugging

- Check the `raw_response.json` file for detailed API responses
- Add print statements in `create_image_from_pdf.py` for additional output
- Verify PDF file integrity and page count

## Code Structure

The script follows a clear workflow:
1. **File Validation:** Check if input PDF exists
2. **Directory Setup:** Create output directory if needed
3. **Encoding:** Convert PDF to base64 for API transmission
4. **API Request:** Send conversion request to PDF4Me
5. **Response Handling:** Process immediate (200) or async (202) responses
6. **Polling:** For async operations, poll until completion
7. **Image Extraction:** Parse JSON response and extract image data
8. **File Saving:** Save each converted image to disk

## Output Format

Each converted image is saved with the naming pattern:
- `{original_filename}_{page_number}.{extension}`
- Example: `sample_1.jpeg`, `sample_2.jpeg`

## Performance Considerations

- **Large PDFs:** Use async processing for PDFs with many pages
- **Image Quality:** Higher resolution images require more processing time
- **Page Selection:** Converting fewer pages is faster
- **Network:** Stable internet connection improves reliability

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 