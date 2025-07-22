# Rotate Image (Python)

A Python sample project for rotating images using the PDF4Me API.

## Project Structure

```
Rotate Image/
├── rotate_image.py                    # Main script for image rotation
├── pdf4me.png                         # Sample input image
├── Rotate_image_output.png            # Output rotated image (generated)
└── README.md                          # This file
```

## Features

- ✅ Rotate images by custom angles (0-360 degrees)
- ✅ Configurable background color for rotation
- ✅ Proportionate resize option during rotation
- ✅ Support for multiple image formats
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Simple, dependency-light Python implementation
- ✅ Base64 encoding for secure image transmission
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
   - Open `rotate_image.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4Me API key

3. **Prepare your image:**
   - Place your input image in the project directory
   - Update the `image_file_path` variable in the script if needed

## Usage

1. **Set the input image and rotation parameters (optional):**
   - Edit the `image_file_path`, `RotationAngle`, `Backgroundcolor`, and `ProportionateResize` in `rotate_image.py` if needed

2. **Run the script:**
   ```bash
   python rotate_image.py
   ```

### Input and Output

- **Input:** Image file (default: `pdf4me.png`)
- **Output:** Rotated image file (default: `Rotate_image_output.png`)

## Configuration

- **API Key:** Set in `rotate_image.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/RotateImage`
- **Supported Formats:** JPG, PNG, and other common image formats
- **Timeout:** 300 seconds (5 minutes) for large images

## Rotation Options

The API supports various rotation configurations:

### Rotation Angle
```python
"RotationAngle": 90  # Rotate 90 degrees clockwise
```

Common rotation angles:
- **0°:** No rotation
- **90°:** Quarter turn clockwise
- **180°:** Half turn (upside down)
- **270°:** Three-quarter turn clockwise
- **Custom:** Any angle between 0-360 degrees

### Background Color
```python
"Backgroundcolor": "#FFFFFF"  # White background
```

Color options:
- **Hex colors:** "#FFFFFF" (white), "#000000" (black), "#FF0000" (red)
- **Transparent:** Use transparent background (if supported)
- **Custom:** Any valid hex color code

### Proportionate Resize
```python
"ProportionateResize": True  # Maintain proportions during rotation
```

This option:
- **True:** Maintains image proportions and fits within original dimensions
- **False:** Allows image to expand beyond original boundaries

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/RotateImage`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)
- **Response:**
  - 200: Rotated image (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `docContent`: Base64 encoded image content
- `docName`: Input image filename
- `Backgroundcolor`: Background color in hex format (e.g., "#FFFFFF")
- `ProportionateResize`: true/false (maintain proportions during rotation)
- `RotationAngle`: Rotation angle in degrees (integer, 0-360)
- `async`: true/false (async recommended for large images)

## Error Handling

- Invalid image file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- File I/O errors
- Invalid rotation parameters
- Image processing failures

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

4. **"Invalid rotation angle"**
   - Ensure rotation angle is between 0 and 360 degrees
   - Check that the angle is an integer value

5. **"Invalid background color"**
   - Ensure color is in valid hex format (e.g., "#FFFFFF")
   - Check for proper color syntax

6. **"Image quality issues"**
   - Large rotation angles may affect image quality
   - Consider using proportionate resize for better results
   - Test with different background colors

### Debugging

- Add print statements in `rotate_image.py` for additional output
- Check exception messages for details
- Verify image file integrity
- Examine response headers for processing information

## Code Structure

The script follows a clear workflow:
1. **File Validation:** Check if input image exists
2. **Encoding:** Convert image to base64 for API transmission
3. **API Request:** Send rotation request to PDF4Me
4. **Response Handling:** Process immediate (200) or async (202) responses
5. **Polling:** For async operations, poll until completion
6. **File Saving:** Save the rotated image to disk

## Use Cases

### Image Correction
- Fix incorrectly oriented photos
- Correct landscape/portrait orientation
- Align images for proper viewing

### Creative Editing
- Create artistic rotated compositions
- Generate tilted image effects
- Produce dynamic visual layouts

### Document Processing
- Rotate scanned documents
- Correct document orientation
- Prepare images for OCR processing

### Web and Print
- Optimize images for web display
- Prepare images for print layouts
- Create thumbnail variations

## Performance Considerations

- **Image Size:** Larger images take longer to process
- **Rotation Angle:** Complex angles may require more processing time
- **Background Color:** Transparent backgrounds may increase file size
- **Proportionate Resize:** May affect final image dimensions
- **Network:** Stable internet connection improves reliability

## Best Practices

### Image Preparation
- Use high-resolution images for better results
- Ensure images are in supported formats
- Consider the target use case when choosing rotation parameters

### Rotation Parameters
- Use standard angles (90°, 180°, 270°) for best results
- Choose appropriate background colors for your use case
- Enable proportionate resize to maintain image quality
- Test with different angles to find optimal settings

### Processing
- Use async processing for large images
- Monitor response times and adjust timeouts
- Validate output images for quality
- Handle multiple rotation operations appropriately

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 