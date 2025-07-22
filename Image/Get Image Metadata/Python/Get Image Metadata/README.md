# Get Image Metadata (Python)

A Python sample project for extracting metadata from images using the PDF4Me API.

## Project Structure

```
Get Image Metadata/
├── get_image_metadata.py           # Main script for metadata extraction
├── sample.png                      # Sample input image
├── Image_metadata_output.json      # Output metadata file (generated)
└── README.md                       # This file
```

## Features

- ✅ Extract comprehensive metadata from images
- ✅ Support for multiple image formats (JPG, PNG)
- ✅ EXIF data extraction and analysis
- ✅ Image properties and technical information
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Simple, dependency-light Python implementation
- ✅ Base64 encoding for secure image transmission
- ✅ JSON output format for easy parsing

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
   - Open `get_image_metadata.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4Me API key

3. **Prepare your image:**
   - Place your input image in the project directory
   - Update the `image_file_path` variable in the script if needed

## Usage

1. **Set the input image and image type (optional):**
   - Edit the `image_file_path` and `imageType` in `get_image_metadata.py` if needed

2. **Run the script:**
   ```bash
   python get_image_metadata.py
   ```

### Input and Output

- **Input:** Image file (default: `sample.png`)
- **Output:** JSON metadata file (default: `Image_metadata_output.json`)

## Configuration

- **API Key:** Set in `get_image_metadata.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/GetImageMetadata`
- **Supported Formats:** JPG, PNG
- **Image Types:**
  - **JPG:** JPEG image format
  - **PNG:** PNG image format

## Metadata Information

The API extracts various types of metadata including:

### Basic Image Properties
- **Dimensions:** Width and height in pixels
- **File Size:** Size in bytes
- **Format:** Image format and version
- **Color Space:** RGB, CMYK, Grayscale, etc.
- **Bit Depth:** Color depth information

### EXIF Data (if available)
- **Camera Information:** Make, model, lens
- **Capture Settings:** Aperture, shutter speed, ISO
- **Date/Time:** Original capture date
- **GPS Data:** Location coordinates (if present)
- **Software:** Editing software used

### Technical Information
- **Compression:** Compression type and quality
- **Resolution:** DPI and resolution information
- **Color Profile:** Embedded color profiles
- **Metadata Standards:** EXIF, IPTC, XMP support

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/GetImageMetadata`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Metadata JSON
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
- JSON parsing errors

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

4. **"Invalid image type"**
   - Ensure image type is "JPG" or "PNG"
   - Check that the image format matches the specified type

5. **"No metadata found"**
   - Some images may not contain metadata
   - Check if the image has EXIF data embedded

### Debugging

- Add print statements in `get_image_metadata.py` for additional output
- Check exception messages for details
- Verify image file integrity
- Examine the JSON output for metadata structure

## Code Structure

The script follows a clear workflow:
1. **File Validation:** Check if input image exists
2. **Encoding:** Convert image to base64 for API transmission
3. **API Request:** Send metadata extraction request to PDF4Me
4. **Response Handling:** Process immediate (200) or async (202) responses
5. **Polling:** For async operations, poll until completion
6. **File Saving:** Save the metadata JSON to disk

## Metadata Examples

### Basic Image Info
```json
{
  "width": 1920,
  "height": 1080,
  "format": "JPEG",
  "fileSize": 245760,
  "colorSpace": "RGB",
  "bitDepth": 8
}
```

### EXIF Data
```json
{
  "exif": {
    "make": "Canon",
    "model": "EOS 5D Mark IV",
    "dateTime": "2023:01:15 14:30:25",
    "exposureTime": "1/125",
    "fNumber": "f/2.8",
    "iso": 100
  }
}
```

## Use Cases

### Image Analysis
- Extract technical specifications
- Analyze image quality and properties
- Verify image authenticity

### Content Management
- Organize images by metadata
- Filter images by camera settings
- Track image origins and history

### Digital Forensics
- Extract embedded metadata
- Analyze image timestamps
- Verify image sources

## Performance Considerations

- **Large Images:** Use async processing for high-resolution images
- **Image Format:** Some formats may process faster than others
- **Network:** Stable internet connection improves reliability
- **Metadata Size:** Images with extensive metadata may take longer

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 