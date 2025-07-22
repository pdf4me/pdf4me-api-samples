# Crop Image (Python)

A Python sample project for cropping images using the PDF4Me API.

## Project Structure

```
Crop Image/
├── crop_image.py                    # Main script for image cropping
├── sample.jpg                       # Sample input image
├── Crop_image_output.jpg            # Output cropped image (generated)
└── README.md                        # This file
```

## Features

- ✅ Crop images using border-based or rectangle-based methods
- ✅ Configurable crop dimensions and coordinates
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
   - Open `crop_image.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4Me API key

3. **Prepare your image:**
   - Place your input image in the project directory
   - Update the `image_file_path` variable in the script if needed

## Usage

1. **Set the input image and crop settings (optional):**
   - Edit the `image_file_path` and crop parameters in `crop_image.py` if needed

2. **Run the script:**
   ```bash
   python crop_image.py
   ```

### Input and Output

- **Input:** Image file (default: `sample.jpg`)
- **Output:** Cropped image file (default: `Crop_image_output.jpg`)

## Configuration

- **API Key:** Set in `crop_image.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/CropImage?schemaVal=Border`
- **Supported Formats:** JPG, PNG, GIF, BMP, TIFF
- **Crop Types:**
  - **Border:** Crop by removing borders from all sides
  - **Rectangle:** Crop to a specific rectangular area

## Crop Methods

### Method 1: Border Cropping
Remove borders from all sides of the image:
```python
"CropType": "Border",
"LeftBorder": "10",      # Remove 10 pixels from left
"RightBorder": "10",     # Remove 10 pixels from right
"TopBorder": "20",       # Remove 20 pixels from top
"BottomBorder": "20"     # Remove 20 pixels from bottom
```

### Method 2: Rectangle Cropping
Crop to a specific rectangular area:
```python
"CropType": "Rectangle",
"UpperLeftX": 10,        # X coordinate of upper-left corner
"UpperLeftY": 10,        # Y coordinate of upper-left corner
"Width": 50,             # Width of crop area
"Height": 50             # Height of crop area
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/CropImage?schemaVal=Border`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Cropped image (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `docContent`: Base64 encoded image content
- `docName`: Input image filename
- `CropType`: "Border" or "Rectangle"
- `LeftBorder`, `RightBorder`, `TopBorder`, `BottomBorder`: Border crop values (integers)
- `UpperLeftX`, `UpperLeftY`: Rectangle crop coordinates (integers)
- `Width`, `Height`: Rectangle crop dimensions (integers)
- `async`: true/false (async recommended for large images)

## Error Handling

- Invalid image file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- File I/O errors
- Invalid crop parameters

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

4. **"Invalid crop parameters"**
   - Ensure crop dimensions don't exceed image size
   - Check that coordinates are within image bounds
   - Verify crop type is correctly specified

5. **"Crop area too large"**
   - Reduce crop dimensions
   - Check that crop area fits within original image

### Debugging

- Add print statements in `crop_image.py` for additional output
- Check exception messages for details
- Verify image file integrity and dimensions

## Code Structure

The script follows a clear workflow:
1. **File Validation:** Check if input image exists
2. **Encoding:** Convert image to base64 for API transmission
3. **API Request:** Send cropping request to PDF4Me
4. **Response Handling:** Process immediate (200) or async (202) responses
5. **Polling:** For async operations, poll until completion
6. **File Saving:** Save the cropped image to disk

## Crop Examples

### Remove Borders
```python
# Remove 10 pixels from each side
"LeftBorder": "10",
"RightBorder": "10", 
"TopBorder": "10",
"BottomBorder": "10"
```

### Crop to Center
```python
# Crop to center 100x100 area
"UpperLeftX": 50,
"UpperLeftY": 50,
"Width": 100,
"Height": 100
```

### Crop Top Portion
```python
# Remove bottom 20% of image
"TopBorder": "0",
"BottomBorder": "80"  # Remove 80% from bottom
```

## Performance Considerations

- **Large Images:** Use async processing for high-resolution images
- **Crop Size:** Smaller crop areas process faster
- **Image Format:** Some formats may process faster than others
- **Network:** Stable internet connection improves reliability

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 