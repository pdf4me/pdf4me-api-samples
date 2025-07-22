# Convert Image Format (Python)

A Python sample project for converting image formats using the PDF4Me API.

## Project Structure

```
Convert Image Format/
├── convert_image_format.py           # Main script for image format conversion
├── sample_image.jpg                  # Sample input image
├── Convert_image_format_output.png   # Output image (generated)
└── README.md                         # This file
```

## Features

- ✅ Convert images between multiple formats (BMP, GIF, JPG, PNG, TIFF)
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Simple, dependency-light Python implementation
- ✅ Base64 encoding for secure image transmission

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
   - Open `convert_image_format.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4Me API key

3. **Prepare your image:**
   - Place your input image in the project directory
   - Update the `image_file_path` variable in the script if needed

## Usage

1. **Set the input image and output format (optional):**
   - Edit the `image_file_path` and format variables in `convert_image_format.py` if needed

2. **Run the script:**
   ```bash
   python convert_image_format.py
   ```

### Input and Output

- **Input:** Image file (default: `sample_image.jpg`)
- **Output:** Converted image file (default: `Convert_image_format_output.png`)

## Configuration

- **API Key:** Set in `convert_image_format.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ConvertImageFormat`
- **Supported Formats:**
  - Input: BMP, GIF, JPG, PNG, TIFF
  - Output: BMP, GIF, JPG, PNG, TIFF
- **Payload Options:**
  - `docContent`: Base64 encoded image content
  - `docName`: Input image filename
  - `currentImageFormat`: Current format (JPG, PNG, etc.)
  - `newImageFormat`: Target format (JPG, PNG, etc.)
  - `async`: true/false (async recommended for large images)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ConvertImageFormat`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Converted image (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Error Handling

- Invalid image file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- File I/O errors

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

4. **"Unsupported format"**
   - Check that both input and output formats are supported
   - Ensure format names are in uppercase (JPG, PNG, etc.)

### Debugging

- Add print statements in `convert_image_format.py` for additional output
- Check exception messages for details
- Verify image file integrity

## Code Structure

The script follows a clear workflow:
1. **File Validation:** Check if input image exists
2. **Encoding:** Convert image to base64 for API transmission
3. **API Request:** Send conversion request to PDF4Me
4. **Response Handling:** Process immediate (200) or async (202) responses
5. **Polling:** For async operations, poll until completion
6. **File Saving:** Save the converted image to disk

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 