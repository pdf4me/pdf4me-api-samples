# Rotate Page - Python Implementation

This project demonstrates how to rotate specific pages in a PDF document using the PDF4Me API with Python.

## ✅ Features

- Rotate specific pages in PDF documents
- Support for multiple rotation options (Clockwise, CounterClockwise, UpsideDown)
- Configurable page selection and rotation settings
- Comprehensive error handling
- Asynchronous processing support
- Base64 encoding for file handling

## Prerequisites

- Python 3.7 or higher
- PDF4Me API key
- Internet connection for API access
- Required Python packages (see Dependencies section)

## Project Structure

```
Rotate Page/
├── rotate_page.py              # Main application logic
├── README.md                   # This documentation
├── requirements.txt            # Python dependencies
├── input.pdf                   # Sample input PDF file
└── output.pdf                  # Generated output PDF file
```

## Setup

1. **Clone or download this project**
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Configure your API key** in `rotate_page.py`:
   ```python
   API_KEY = "your-api-key-here"
   ```
4. **Place your input PDF** in the project directory
5. **Run the application**:
   ```bash
   python rotate_page.py
   ```

## Usage

The application will:
1. Read the input PDF file
2. Convert it to Base64
3. Send a request to rotate specific pages
4. Handle the response (synchronous or asynchronous)
5. Save the processed PDF as `output.pdf`

### Expected Output

```
Reading input PDF file...
PDF file read successfully. Size: 245760 bytes

Sending request to rotate pages...
Request sent successfully.

Processing response...
Response Status: 200 OK

Downloading processed PDF...
PDF downloaded successfully. Size: 245760 bytes

Saving output file...
Output saved as: output.pdf

Process completed successfully!
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/RotatePage/RotatePage
```

## Specific Settings

### rotationType
- **Type**: `str`
- **Description**: Specifies the rotation direction
- **Options**:
  - `"Clockwise"`: Rotate 90 degrees clockwise
  - `"CounterClockwise"`: Rotate 90 degrees counter-clockwise
  - `"UpsideDown"`: Rotate 180 degrees

### pageNumbers
- **Type**: `list[int]`
- **Description**: List of page numbers to rotate (1-based indexing)
- **Example**: `[1, 3, 5]` - rotates pages 1, 3, and 5

## Implementation Details

### Key Components

1. **File Reading**: Reads PDF file and converts to Base64
2. **Request Building**: Constructs JSON payload with page rotation parameters
3. **API Communication**: Sends HTTP POST request to PDF4Me API
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Download**: Downloads processed PDF and saves to local file system

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format

## API Endpoints

### Rotate Page
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/RotatePage/RotatePage`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {API_KEY}`

## Request Payload

```json
{
  "document": {
    "docData": "base64-encoded-pdf-content"
  },
  "rotatePageAction": {
    "rotationType": "Clockwise",
    "pageNumbers": [1, 3, 5]
  }
}
```

## Response Handling

### Success Response (200 OK)
```json
{
  "document": {
    "docData": "base64-encoded-processed-pdf"
  }
}
```

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
- **Response Processing**: Invalid JSON, unexpected status codes
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
   - Ensure `input.pdf` exists in the project directory
   - Check file permissions

3. **Network Errors**
   - Verify internet connection
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid Page Numbers**
   - Page numbers must be 1-based
   - Ensure page numbers don't exceed PDF page count
   - Check for duplicate page numbers

5. **Invalid Rotation Type**
   - Ensure rotation type is one of: "Clockwise", "CounterClockwise", "UpsideDown"
   - Check for typos in rotation type string

6. **Python Version Issues**
   - Ensure Python 3.7+ is installed
   - Check if virtual environment is activated

### Debug Mode

Enable detailed logging by setting:
```python
DEBUG_MODE = True
```

## Sample Files

- **input.pdf**: Sample PDF file for testing
- **output.pdf**: Generated PDF after page rotation

## Expected Workflow

1. **Input**: PDF file with multiple pages
2. **Processing**: Rotate specific pages (e.g., pages 1, 3, 5 clockwise)
3. **Output**: PDF file with selected pages rotated

## Next Steps

- Implement batch processing for multiple files
- Add support for more page selection options
- Integrate with web interface
- Add progress tracking for large files

## Future Enhancements

- **GUI Interface**: Create tkinter or PyQt application
- **Batch Processing**: Handle multiple PDF files simultaneously
- **Preview Feature**: Show PDF thumbnails before rotation
- **Custom Rotation Angles**: Support for arbitrary rotation angles
- **Advanced Options**: Rotate based on content analysis
- **Web Interface**: Create Flask/Django web application

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Python Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 