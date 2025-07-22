# Remove EXIF Tags From Image (Python)

A Python sample project for removing EXIF tags and metadata from images using the PDF4Me API.

## Project Structure

```
Remove EXIF Tags From Image/
├── remove_exif_tags_from_image.py      # Main script for EXIF tag removal
├── sample.jpg                          # Sample input image with EXIF data
├── Remove_exif_tags_from_image_output.jpg # Output cleaned image (generated)
└── README.md                           # This file
```

## Features

- ✅ Remove EXIF tags and metadata from images
- ✅ Support for multiple image formats (JPG, PNG)
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Simple, dependency-light Python implementation
- ✅ Base64 encoding for secure image transmission
- ✅ Detailed response logging for debugging
- ✅ Privacy protection and file size optimization

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
   - Open `remove_exif_tags_from_image.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4Me API key

3. **Prepare your image:**
   - Place your input image in the project directory
   - Update the `image_file_path` variable in the script if needed

## Usage

1. **Set the input image and image type (optional):**
   - Edit the `image_file_path` and `imageType` in `remove_exif_tags_from_image.py` if needed

2. **Run the script:**
   ```bash
   python remove_exif_tags_from_image.py
   ```

### Input and Output

- **Input:** Image file with EXIF data (default: `sample.jpg`)
- **Output:** Cleaned image file without EXIF tags (default: `Remove_exif_tags_from_image_output.jpg`)

## Configuration

- **API Key:** Set in `remove_exif_tags_from_image.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/RemoveEXIFTagsFromImage`
- **Supported Formats:** JPG, PNG
- **Image Types:**
  - **JPG:** JPEG image format
  - **PNG:** PNG image format
- **Timeout:** 300 seconds (5 minutes) for large images

## EXIF Data Removal

The API removes various types of metadata including:

### Camera Information
- **Make and Model:** Camera manufacturer and model
- **Lens Information:** Lens type and specifications
- **Serial Numbers:** Camera and lens serial numbers

### Capture Settings
- **Aperture:** F-stop values
- **Shutter Speed:** Exposure time
- **ISO:** Light sensitivity settings
- **Focal Length:** Lens focal length
- **Flash Information:** Flash usage and settings

### Location Data
- **GPS Coordinates:** Latitude and longitude
- **GPS Altitude:** Elevation data
- **GPS Timestamp:** Location timestamp

### Date and Time
- **Original Capture Date:** When the photo was taken
- **Modification Date:** Last modification timestamp
- **Software Information:** Editing software used

### Other Metadata
- **Color Space:** Color profile information
- **Resolution:** DPI and resolution data
- **Copyright:** Copyright information
- **Artist Information:** Photographer details

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/RemoveEXIFTagsFromImage`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)
- **Response:**
  - 200: Cleaned image (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `docContent`: Base64 encoded image content
- `docName`: Input image filename
- `imageType`: "JPG" or "PNG"
- `async`: true/false (async recommended for large images)

## Error Handling

- Invalid image file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- File I/O errors
- Invalid image type
- EXIF removal failures

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

4. **"No EXIF data found"**
   - Some images may not contain EXIF data
   - The API will still return a cleaned image

5. **"Invalid image type"**
   - Ensure image type is "JPG" or "PNG"
   - Check that the image format matches the specified type

### Debugging

- Add print statements in `remove_exif_tags_from_image.py` for additional output
- Check exception messages for details
- Verify image file integrity
- Examine response headers for processing information

## Code Structure

The script follows a clear workflow:
1. **File Validation:** Check if input image exists
2. **Encoding:** Convert image to base64 for API transmission
3. **API Request:** Send EXIF removal request to PDF4Me
4. **Response Handling:** Process immediate (200) or async (202) responses
5. **Polling:** For async operations, poll until completion
6. **File Saving:** Save the cleaned image to disk

## Use Cases

### Privacy Protection
- Remove location data from social media images
- Strip camera information from sensitive photos
- Protect personal information in shared images

### File Optimization
- Reduce file size by removing unnecessary metadata
- Clean images for web publishing
- Optimize images for storage

### Compliance
- Meet privacy regulations (GDPR, CCPA)
- Remove metadata for legal documents
- Ensure data protection standards

### Content Management
- Standardize image metadata across collections
- Prepare images for public distribution
- Clean images for archival purposes

## Performance Considerations

- **Image Quality:** EXIF removal doesn't affect image quality
- **File Size:** May reduce file size by removing metadata
- **Image Size:** Larger images may take longer to process
- **Network:** Stable internet connection improves reliability
- **Processing Time:** Depends on image size and metadata complexity

## Best Practices

### Image Preparation
- Use high-resolution images for better results
- Ensure images are in supported formats (JPG, PNG)
- Check for existing EXIF data before processing

### Processing
- Use async processing for large images
- Monitor response times and adjust timeouts
- Validate output images for completeness
- Handle multiple image formats appropriately

### Privacy Considerations
- Always remove EXIF data from images shared publicly
- Consider EXIF removal for sensitive content
- Implement automated EXIF removal for user uploads

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 