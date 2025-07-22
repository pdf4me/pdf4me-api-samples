# Resize Image (Python)

A Python sample project for resizing images using the PDF4Me API.

## Project Structure

```
Resize Image/
├── resize_image.py                    # Main script for image resizing
├── sample.jpg                         # Sample input image
├── Resize_image_output.jpg            # Output resized image (generated)
└── README.md                          # This file
```

## Features

- ✅ Resize images by percentage or specific dimensions
- ✅ Maintain aspect ratio option
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
   - Open `resize_image.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4Me API key

3. **Prepare your image:**
   - Place your input image in the project directory
   - Update the `image_file_path` variable in the script if needed

## Usage

1. **Set the input image and resize parameters (optional):**
   - Edit the `image_file_path`, `ImageResizeType`, `ResizePercentage`, `Width`, `Height`, and `MaintainAspectRatio` in `resize_image.py` if needed

2. **Run the script:**
   ```bash
   python resize_image.py
   ```

### Input and Output

- **Input:** Image file (default: `sample.jpg`)
- **Output:** Resized image file (default: `Resize_image_output.jpg`)

## Configuration

- **API Key:** Set in `resize_image.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ResizeImage?schemaVal=Percentange`
- **Supported Formats:** JPG, PNG, and other common image formats
- **Timeout:** 300 seconds (5 minutes) for large images

## Resize Options

The API supports two main resize types:

### Percentage Resize
```python
"ImageResizeType": "Percentage",
"ResizePercentage": "50.0"  # Resize to 50% of original size
```

### Specific Dimensions
```python
"ImageResizeType": "Specific",
"Width": 800,               # Target width in pixels
"Height": 600,              # Target height in pixels
"MaintainAspectRatio": True # Keep aspect ratio
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ResizeImage?schemaVal=Percentange`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)
- **Response:**
  - 200: Resized image (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `docName`: Input image filename
- `docContent`: Base64 encoded image content
- `ImageResizeType`: "Percentage" or "Specific"
- `ResizePercentage`: Resize percentage as decimal string (e.g., "50.0" for 50%)
- `Width`: Target width in pixels (for Specific resize type)
- `Height`: Target height in pixels (for Specific resize type)
- `MaintainAspectRatio`: true/false (maintain original aspect ratio)
- `async`: true/false (async recommended for large images)

## Error Handling

- Invalid image file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- File I/O errors
- Invalid resize parameters
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

4. **"Invalid resize parameters"**
   - Ensure percentage is between 0.1 and 1000.0
   - Check that width and height are positive integers
   - Verify resize type is "Percentage" or "Specific"

5. **"Image quality issues"**
   - Large percentage reductions may affect quality
   - Consider using specific dimensions for better control
   - Test with different resize parameters

### Debugging

- Add print statements in `resize_image.py` for additional output
- Check exception messages for details
- Verify image file integrity
- Examine response headers for processing information

## Code Structure

The script follows a clear workflow:
1. **File Validation:** Check if input image exists
2. **Encoding:** Convert image to base64 for API transmission
3. **API Request:** Send resize request to PDF4Me
4. **Response Handling:** Process immediate (200) or async (202) responses
5. **Polling:** For async operations, poll until completion
6. **File Saving:** Save the resized image to disk

## Use Cases

### Web Optimization
- Resize images for web display
- Reduce file sizes for faster loading
- Create thumbnails and previews

### Content Management
- Standardize image sizes across collections
- Prepare images for different platforms
- Create responsive image sets

### Storage Optimization
- Reduce storage space requirements
- Compress images for archival
- Optimize images for email attachments

### Social Media
- Resize images for platform requirements
- Create profile pictures and avatars
- Optimize images for mobile viewing

## Performance Considerations

- **Image Size:** Larger images take longer to process
- **Resize Percentage:** Extreme reductions may affect quality
- **Aspect Ratio:** Maintaining aspect ratio may limit size options
- **Network:** Stable internet connection improves reliability
- **Processing Time:** Depends on image size and resize parameters

## Best Practices

### Image Preparation
- Use high-resolution images for better results
- Ensure images are in supported formats
- Consider the target use case when choosing resize parameters

### Resize Parameters
- Use percentage resize for proportional scaling
- Use specific dimensions for exact size requirements
- Enable aspect ratio maintenance to prevent distortion
- Test with different parameters to find optimal settings

### Processing
- Use async processing for large images
- Monitor response times and adjust timeouts
- Validate output images for quality
- Handle multiple resize operations appropriately

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 