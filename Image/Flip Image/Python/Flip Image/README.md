# Flip Image (Python)

A Python sample project for flipping images using the PDF4Me API.

## Project Structure

```
Flip Image/
├── flip_image.py                    # Main script for image flipping
├── sample.jpg                       # Sample input image
├── Flip_image_output.jpg            # Output flipped image (generated)
└── README.md                        # This file
```

## Features

- ✅ Flip images horizontally, vertically, or both directions
- ✅ Support for multiple image formats (JPG, PNG, GIF, BMP, TIFF)
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
   - Open `flip_image.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4Me API key

3. **Prepare your image:**
   - Place your input image in the project directory
   - Update the `image_file_path` variable in the script if needed

## Usage

1. **Set the input image and flip orientation (optional):**
   - Edit the `image_file_path` and `orientationType` in `flip_image.py` if needed

2. **Run the script:**
   ```bash
   python flip_image.py
   ```

### Input and Output

- **Input:** Image file (default: `sample.jpg`)
- **Output:** Flipped image file (default: `Flip_image_output.jpg`)

## Configuration

- **API Key:** Set in `flip_image.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/FlipImage`
- **Supported Formats:** JPG, PNG, GIF, BMP, TIFF
- **Orientation Types:**
  - **Horizontal:** Flip image left to right
  - **Vertical:** Flip image top to bottom
  - **HorizontalAndVertical:** Flip image both horizontally and vertically

## Flip Options

### Horizontal Flip
```python
"orientationType": "Horizontal"  # Flip left to right
```

### Vertical Flip
```python
"orientationType": "Vertical"    # Flip top to bottom
```

### Both Directions
```python
"orientationType": "HorizontalAndVertical"  # Flip both ways
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/FlipImage`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Flipped image (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `docContent`: Base64 encoded image content
- `docName`: Input image filename
- `orientationType`: "Horizontal", "Vertical", or "HorizontalAndVertical"
- `async`: true/false (async recommended for large images)

## Error Handling

- Invalid image file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- File I/O errors
- Invalid orientation type

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

4. **"Invalid orientation type"**
   - Ensure orientation type is one of: "Horizontal", "Vertical", "HorizontalAndVertical"
   - Check for typos in the orientation parameter

### Debugging

- Add print statements in `flip_image.py` for additional output
- Check exception messages for details
- Verify image file integrity

## Code Structure

The script follows a clear workflow:
1. **File Validation:** Check if input image exists
2. **Encoding:** Convert image to base64 for API transmission
3. **API Request:** Send flipping request to PDF4Me
4. **Response Handling:** Process immediate (200) or async (202) responses
5. **Polling:** For async operations, poll until completion
6. **File Saving:** Save the flipped image to disk

## Use Cases

### Horizontal Flip
- Mirror images for design purposes
- Correct text that appears backwards
- Create symmetrical compositions

### Vertical Flip
- Invert images for artistic effects
- Correct upside-down images
- Create reflection effects

### Both Directions
- Rotate image 180 degrees
- Create complex transformations
- Artistic image manipulation

## Performance Considerations

- **Large Images:** Use async processing for high-resolution images
- **Image Format:** Some formats may process faster than others
- **Network:** Stable internet connection improves reliability

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 