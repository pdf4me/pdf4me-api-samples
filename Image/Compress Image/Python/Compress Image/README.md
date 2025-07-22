# Compress Image - Python Implementation

This project demonstrates how to compress images using the PDF4Me API with Python.

## ✅ Features

- Compress images in various formats (PNG, JPG, GIF, etc.)
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- Configurable compression quality and settings
- Cross-platform compatibility

## Prerequisites

- Python 3.7 or higher
- PDF4Me API key
- Internet connection for API access
- Required Python packages (see Dependencies section)

## Project Structure

```
Compress Image/
├── compress_image.py           # Main application logic
├── README.md                   # This documentation
├── sample.png                  # Sample input image
└── compressed_output.png       # Generated compressed image
```

## Setup

1. **Clone or download this project**
2. **Install dependencies**:
   ```bash
   pip install requests
   ```
3. **Configure your API key** in `compress_image.py`:
   ```python
   API_KEY = "your-api-key-here"
   ```
4. **Place your input image** in the project directory:
   - `sample.png` - Your image to compress
5. **Run the application**:
   ```bash
   python compress_image.py
   ```

## Usage

The application will:
1. Read the input image
2. Convert it to Base64
3. Send a request to compress the image
4. Handle the response (synchronous or asynchronous)
5. Save the compressed image

### Expected Output

```
=== Compressing Image ===
This compresses images to reduce file size while maintaining quality
Returns compressed image with optimized file size
------------------------------------------------------------
Input image file: sample.png
Output image file: compressed_output.png
Compressing image...
Reading and encoding image file...
Image file read successfully: 12345 bytes
Sending compress image request...
Status code: 202
Request accepted. Processing asynchronously...
Polling URL: https://api.pdf4me.com/api/v2/CompressImage/...
Polling attempt 1/10...
Image compression completed successfully!
Compressed image saved to: compressed_output.png
Compression operation completed successfully!
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/v2/CompressImage
```

## Specific Settings

### Compression Parameters
- **imageContent**: Base64 encoded image content
- **imageName**: Input image name
- **quality**: Compression quality (1-100, where 100 is highest quality)
- **format**: Output format (JPEG, PNG, etc.)
- **async**: `true` for asynchronous processing (recommended for large images)

## Implementation Details

### Key Components

1. **File Reading**: Reads input image and converts to Base64
2. **Request Building**: Constructs JSON payload with image content and compression settings
3. **API Communication**: Sends HTTP POST request to PDF4Me API
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Processing**: Saves the compressed image

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format

## API Endpoints

### Compress Image
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/CompressImage`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload

```json
{
  "imageContent": "base64-encoded-image",
  "imageName": "sample.png",
  "quality": 80,
  "format": "JPEG",
  "async": true
}
```

## Response Handling

### Success Response (200 OK)
- Returns the compressed image as binary data

### Asynchronous Response (202 Accepted)
```json
{
  "jobId": "job-12345",
  "status": "Accepted"
}
```

## Error Handling

The application includes comprehensive error handling for:

- **File Operations**: Missing files, permission issues
- **API Communication**: Network errors, timeouts
- **Response Processing**: Invalid responses, unexpected status codes
- **Base64 Operations**: Encoding/decoding errors

## Dependencies

### Required Packages
```
requests>=2.25.1
```

### Installation
```bash
pip install requests
```

Or install from requirements.txt:
```bash
pip install -r requirements.txt
```

## Security Considerations

- **API Key Protection**: Store API keys securely, not in source code
- **File Validation**: Validate input files before processing
- **Error Information**: Avoid exposing sensitive information in error messages
- **HTTPS**: All API communications use HTTPS

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify your API key is correct
   - Check if the key has necessary permissions

2. **File Not Found**
   - Ensure `sample.png` exists in the project directory
   - Check file permissions

3. **Network Errors**
   - Verify internet connection
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid Image Format**
   - Ensure image file is in a supported format (PNG, JPG, GIF, etc.)
   - Check if image file is corrupted

5. **Compression Quality Issues**
   - Adjust quality settings for better balance between size and quality
   - Consider different output formats for better compression

6. **Python Version Issues**
   - Ensure Python 3.7+ is installed
   - Check if virtual environment is activated

### Debug Mode

Enable detailed logging by setting:
```python
DEBUG_MODE = True
```

## Sample Files

- **sample.png**: Sample input image
- **compressed_output.png**: Generated compressed image

## Expected Workflow

1. **Input**: Image file
2. **Processing**: Compress image with specified quality and format settings
3. **Output**: Compressed image with reduced file size

## Next Steps

- Implement batch processing for multiple images
- Add support for different image formats
- Integrate with web interface
- Add progress tracking for large images

## Future Enhancements

- **GUI Interface**: Create tkinter or PyQt application
- **Batch Processing**: Handle multiple images simultaneously
- **Preview Feature**: Show compression preview before processing
- **Custom Options**: Configure advanced compression settings
- **Advanced Options**: Support for different compression algorithms
- **Web Interface**: Create Flask/Django web application

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Python Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 