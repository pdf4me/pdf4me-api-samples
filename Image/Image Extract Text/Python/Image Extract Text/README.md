# Image Extract Text (Python)

A Python sample project for extracting text from images using OCR (Optical Character Recognition) via the PDF4Me API.

## Project Structure

```
Image Extract Text/
├── image_extract_text.py            # Main script for text extraction from images
├── sample_1.jpg                     # Sample input image with text
├── sample.png                       # Sample input image
├── Image_text_extract_output.json   # Output JSON file with extracted text (generated)
└── README.md                        # This file
```

## Features

- ✅ Extract text from images using advanced OCR technology
- ✅ Support for multiple image formats (JPG, PNG, BMP, TIFF)
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Simple, dependency-light Python implementation
- ✅ Base64 encoding for secure image transmission
- ✅ JSON output format with structured text data
- ✅ Detailed response logging for debugging

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
   - Open `image_extract_text.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4Me API key

3. **Prepare your image:**
   - Place your input image in the project directory
   - Update the `image_file_path` variable in the script if needed

## Usage

1. **Set the input image (optional):**
   - Edit the `image_file_path` in `image_extract_text.py` if needed

2. **Run the script:**
   ```bash
   python image_extract_text.py
   ```

### Input and Output

- **Input:** Image file containing text (default: `sample_1.jpg`)
- **Output:** JSON file with extracted text (default: `Image_text_extract_output.json`)

## Configuration

- **API Key:** Set in `image_extract_text.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ImageExtractText`
- **Supported Formats:** JPG, PNG, BMP, TIFF
- **Timeout:** 300 seconds (5 minutes) for large images

## OCR Capabilities

The API provides advanced OCR functionality including:

### Text Recognition
- **Printed Text:** Clear, typed text in various fonts
- **Handwritten Text:** Cursive and printed handwriting
- **Mixed Content:** Documents with both text and images
- **Multi-language Support:** Various languages and scripts

### Layout Analysis
- **Text Positioning:** Maintains spatial relationships
- **Line Detection:** Identifies text lines and paragraphs
- **Column Recognition:** Handles multi-column layouts
- **Table Detection:** Recognizes tabular data

### Output Format
- **Structured JSON:** Organized text with positioning data
- **Confidence Scores:** Accuracy indicators for each text element
- **Bounding Boxes:** Precise location information
- **Text Hierarchy:** Headers, body text, captions

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ImageExtractText`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)
- **Response:**
  - 200: Extracted text JSON
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `docName`: Input image filename
- `docContent`: Base64 encoded image content
- `async`: true/false (async recommended for large images)

## Error Handling

- Invalid image file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- File I/O errors
- JSON parsing errors
- OCR processing failures

## Troubleshooting

### Common Issues

1. **"Image file not found"**
   - Ensure the input image file exists in the project directory
   - Check the file path in the script

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the image format is supported

3. **"Polling timeout"**
   - Large images may take longer to process
   - Increase `max_retries` or `retry_delay` in the code if needed

4. **"No text found"**
   - Ensure the image contains readable text
   - Check image quality and resolution
   - Verify text is not too small or blurry

5. **"Poor OCR results"**
   - Use high-resolution images
   - Ensure good contrast between text and background
   - Avoid heavily stylized fonts

### Debugging

- Check the `Image_text_extract_output.json` file for detailed results
- Add print statements in `image_extract_text.py` for additional output
- Verify image quality and text clarity
- Examine response headers for processing information

## Code Structure

The script follows a clear workflow:
1. **File Validation:** Check if input image exists
2. **Encoding:** Convert image to base64 for API transmission
3. **API Request:** Send OCR request to PDF4Me
4. **Response Handling:** Process immediate (200) or async (202) responses
5. **Polling:** For async operations, poll until completion
6. **File Saving:** Save the extracted text JSON to disk

## Output Examples

### Basic Text Extraction
```json
{
  "text": "This is sample text extracted from the image.",
  "confidence": 0.95,
  "regions": [
    {
      "text": "Sample text",
      "bbox": [100, 200, 300, 250],
      "confidence": 0.98
    }
  ]
}
```

### Structured Document
```json
{
  "pages": [
    {
      "pageNumber": 1,
      "textBlocks": [
        {
          "text": "Document Title",
          "type": "header",
          "bbox": [50, 50, 500, 80]
        },
        {
          "text": "This is the main content...",
          "type": "body",
          "bbox": [50, 100, 500, 400]
        }
      ]
    }
  ]
}
```

## Use Cases

### Document Digitization
- Convert scanned documents to searchable text
- Extract text from historical documents
- Process forms and applications

### Data Extraction
- Extract information from receipts and invoices
- Process business cards and contact information
- Analyze charts and graphs

### Content Analysis
- Extract text from screenshots
- Process handwritten notes
- Analyze printed materials

## Performance Considerations

- **Image Quality:** Higher resolution images provide better OCR results
- **Text Clarity:** Clear, high-contrast text improves accuracy
- **Image Size:** Larger images may take longer to process
- **Text Density:** Images with lots of text require more processing time
- **Network:** Stable internet connection improves reliability

## Best Practices

### Image Preparation
- Use high-resolution images (300+ DPI)
- Ensure good contrast between text and background
- Avoid shadows and reflections
- Use standard fonts when possible

### Processing
- Use async processing for large images
- Monitor response times and adjust timeouts
- Validate extracted text for accuracy
- Handle multiple languages appropriately

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 