# Replace Text with Image (Python)

A Python sample project for replacing text in PDF documents with images using the PDF4Me API.

## Project Structure

```
Replace Text with Image/
├── replace_text_with_image.py           # Main script for text replacement with image
├── sample.pdf                           # Sample input PDF document
├── pdf4me.png                           # Sample replacement image
├── Replace_text_with_image_output.pdf   # Output PDF with replaced text (generated)
└── README.md                            # This file
```

## Features

- ✅ Replace specific text in PDF documents with images
- ✅ Support for multiple page selection options
- ✅ Configurable image dimensions (width and height)
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Simple, dependency-light Python implementation
- ✅ Base64 encoding for secure file transmission
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
   - Open `replace_text_with_image.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4Me API key

3. **Prepare your files:**
   - Place your input PDF and replacement image in the project directory
   - Update the `pdf_file_path` and `image_file_path` variables in the script if needed

## Usage

1. **Set the input files and replacement parameters (optional):**
   - Edit the `pdf_file_path`, `image_file_path`, `replaceText`, `imageHeight`, and `imageWidth` in `replace_text_with_image.py` if needed

2. **Run the script:**
   ```bash
   python replace_text_with_image.py
   ```

### Input and Output

- **Input:** PDF file and replacement image (default: `sample.pdf` and `pdf4me.png`)
- **Output:** Modified PDF file with replaced text (default: `Replace_text_with_image_output.pdf`)

## Configuration

- **API Key:** Set in `replace_text_with_image.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ReplaceTextWithImage`
- **Supported Formats:** PDF input, various image formats for replacement
- **Timeout:** 300 seconds (5 minutes) for large documents

## Page Selection Options

The API supports various page selection formats:

### Single Page
```python
"pageSequence": "1"  # Replace text on page 1 only
```

### Multiple Specific Pages
```python
"pageSequence": "1,3,5"  # Replace text on pages 1, 3, and 5
```

### Page Range
```python
"pageSequence": "2-5"  # Replace text on pages 2 through 5
```

### Mixed Selection
```python
"pageSequence": "1,3,7-10"  # Replace text on pages 1, 3, and 7 through 10
```

### All Pages
```python
"pageSequence": "all"  # Replace text on all pages
```

### From Page to End
```python
"pageSequence": "2-"  # Replace text from page 2 to the end
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ReplaceTextWithImage`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)
- **Response:**
  - 200: Modified PDF (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `docContent`: Base64 encoded PDF content
- `docName`: Input PDF filename
- `replaceText`: Text to be replaced with image
- `pageSequence`: Page selection (see options above)
- `imageContent`: Base64 encoded replacement image content
- `imageHeight`: Height of the replacement image (integer)
- `imageWidth`: Width of the replacement image (integer)
- `async`: true/false (async recommended for large documents)

## Error Handling

- Invalid PDF or image file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- File I/O errors
- Text not found in document
- Invalid page selection
- Image processing failures

## Troubleshooting

### Common Issues

1. **"PDF file not found" or "Image file not found"**
   - Ensure both input files exist in the project directory
   - Check the file paths in the script

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the file formats are supported

3. **"Polling timeout"**
   - Large documents may take longer to process
   - Increase `max_retries` or `retry_delay` in the code if needed

4. **"Text not found"**
   - Ensure the text to replace exists in the PDF
   - Check for exact text matching (case-sensitive)
   - Verify the text is on the selected pages

5. **"Invalid page selection"**
   - Ensure page numbers are valid for the document
   - Check the page selection format

### Debugging

- Add print statements in `replace_text_with_image.py` for additional output
- Check exception messages for details
- Verify file integrity and formats
- Examine response headers for processing information

## Code Structure

The script follows a clear workflow:
1. **File Validation:** Check if input PDF and image exist
2. **Encoding:** Convert both files to base64 for API transmission
3. **API Request:** Send text replacement request to PDF4Me
4. **Response Handling:** Process immediate (200) or async (202) responses
5. **Polling:** For async operations, poll until completion
6. **File Saving:** Save the modified PDF to disk

## Use Cases

### Document Branding
- Replace company names with logos
- Add watermarks or stamps
- Insert signature images

### Content Management
- Replace placeholder text with actual images
- Update document headers or footers
- Add visual elements to reports

### Document Automation
- Generate personalized documents
- Replace text placeholders with dynamic images
- Create branded templates

### Legal and Business
- Add signature images to contracts
- Replace text with official stamps
- Insert company logos in documents

## Performance Considerations

- **Document Size:** Larger PDFs may take longer to process
- **Image Size:** Larger replacement images increase processing time
- **Text Frequency:** Multiple text occurrences require more processing
- **Page Count:** More pages increase processing time
- **Network:** Stable internet connection improves reliability

## Best Practices

### Document Preparation
- Use clear, unique text for replacement
- Ensure text exists on the specified pages
- Use appropriate image formats (PNG, JPG)

### Image Sizing
- Set appropriate width and height for the replacement image
- Consider the original text size and spacing
- Test with different image dimensions

### Processing
- Use async processing for large documents
- Monitor response times and adjust timeouts
- Validate output PDFs for completeness
- Handle multiple text replacements appropriately

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 