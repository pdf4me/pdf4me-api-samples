# Rotate Image By Exif Data (Python)

A Python sample project for automatically rotating images based on their EXIF orientation metadata using the PDF4Me API.

## Project Structure

```
Rotate Image By Exif Data/
├── rotate_image_by_exif_data.py           # Main script for EXIF-based image rotation
├── pdf4me.png                             # Sample input image with EXIF data
├── Rotate_image_by_exif_data_output.png   # Output automatically rotated image (generated)
└── README.md                              # This file
```

## Features

- ✅ Automatically rotate images based on EXIF orientation data
- ✅ No manual angle specification required
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
   - Open `rotate_image_by_exif_data.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4Me API key

3. **Prepare your image:**
   - Place your input image in the project directory
   - Update the `image_file_path` variable in the script if needed

## Usage

1. **Set the input image (optional):**
   - Edit the `image_file_path` in `rotate_image_by_exif_data.py` if needed

2. **Run the script:**
   ```bash
   python rotate_image_by_exif_data.py
   ```

### Input and Output

- **Input:** Image file with EXIF orientation data (default: `pdf4me.png`)
- **Output:** Automatically rotated image file (default: `Rotate_image_by_exif_data_output.png`)

## Configuration

- **API Key:** Set in `rotate_image_by_exif_data.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/RotateImageByExifData`
- **Supported Formats:** JPG, PNG, and other common image formats
- **Timeout:** 300 seconds (5 minutes) for large images

## EXIF Orientation Data

The API automatically detects and applies rotation based on EXIF orientation tags:

### Common EXIF Orientation Values
- **1:** Normal (no rotation needed)
- **2:** Mirrored horizontally
- **3:** Rotated 180°
- **4:** Mirrored vertically
- **5:** Mirrored horizontally and rotated 90° CCW
- **6:** Rotated 90° CW
- **7:** Mirrored horizontally and rotated 90° CW
- **8:** Rotated 90° CCW

### How It Works
1. **EXIF Detection:** API reads the image's EXIF orientation metadata
2. **Automatic Rotation:** Applies the appropriate rotation to correct orientation
3. **Output:** Returns the correctly oriented image

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/RotateImageByExifData`
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
- `async`: true/false (async recommended for large images)

## Error Handling

- Invalid image file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- File I/O errors
- Missing EXIF data
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

4. **"No rotation applied"**
   - Image may not contain EXIF orientation data
   - Image may already be correctly oriented
   - Check if the image has EXIF metadata

5. **"Unexpected rotation"**
   - Verify the image has correct EXIF orientation data
   - Check if the image was previously processed
   - Ensure the image format supports EXIF data

### Debugging

- Add print statements in `rotate_image_by_exif_data.py` for additional output
- Check exception messages for details
- Verify image file integrity
- Examine response headers for processing information

## Code Structure

The script follows a clear workflow:
1. **File Validation:** Check if input image exists
2. **Encoding:** Convert image to base64 for API transmission
3. **API Request:** Send EXIF-based rotation request to PDF4Me
4. **Response Handling:** Process immediate (200) or async (202) responses
5. **Polling:** For async operations, poll until completion
6. **File Saving:** Save the automatically rotated image to disk

## Use Cases

### Photo Management
- Correct automatically captured photos from mobile devices
- Fix landscape/portrait orientation issues
- Standardize photo collections

### Content Processing
- Prepare images for web display
- Correct scanned document orientation
- Process bulk image uploads

### Digital Asset Management
- Automate image orientation correction
- Maintain consistent image presentation
- Process legacy image collections

### Mobile Applications
- Handle photos from various devices
- Correct camera orientation issues
- Improve user experience

## Performance Considerations

- **Image Size:** Larger images take longer to process
- **EXIF Data:** Images with complex EXIF data may require more processing
- **Format Support:** Some formats may not support EXIF data
- **Network:** Stable internet connection improves reliability
- **Processing Time:** Depends on image size and EXIF complexity

## Best Practices

### Image Preparation
- Use images with valid EXIF orientation data
- Ensure images are in supported formats (JPG, PNG)
- Check for existing EXIF data before processing

### Processing
- Use async processing for large images
- Monitor response times and adjust timeouts
- Validate output images for correct orientation
- Handle multiple images appropriately

### Quality Assurance
- Verify rotation results match expectations
- Test with various image orientations
- Check for any quality degradation
- Validate EXIF data preservation

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 