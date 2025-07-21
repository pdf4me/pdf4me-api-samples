# Replace Text With Image In Word - Python Implementation

This project demonstrates how to replace text with images in Word documents using the PDF4Me API with Python.

## ✅ Features

- Replace text with images in Word documents
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- Multiple image format support (PNG, JPG, GIF, etc.)
- Cross-platform compatibility

## Prerequisites

- Python 3.7 or higher
- PDF4Me API key
- Internet connection for API access
- Required Python packages (see Dependencies section)

## Project Structure

```
Replace Text With Image In Word/
├── replace_text_with_image_in_word.py  # Main application logic
├── README.md                           # This documentation
├── sample.docx                         # Sample input Word document
├── sample.png                          # Sample input image file
└── sample.modified.docx                # Generated modified Word document
```

## Setup

1. **Clone or download this project**
2. **Install dependencies**:
   ```bash
   pip install requests
   ```
3. **Configure your API key** in `replace_text_with_image_in_word.py`:
   ```python
   API_KEY = "your-api-key-here"
   ```
4. **Place your input files** in the project directory:
   - `sample.docx` - Your Word document
   - `sample.png` - Your image file
5. **Run the application**:
   ```bash
   python replace_text_with_image_in_word.py
   ```

## Usage

The application will:
1. Read the input Word document and image file
2. Convert both to Base64
3. Send a request to replace text with the image
4. Handle the response (synchronous or asynchronous)
5. Save the modified Word document

### Expected Output

```
=== Replacing Text with Image in Word Document ===
This replaces specified text with images in Word documents
Returns modified Word document with image replacement
------------------------------------------------------------
Input Word file: sample.docx
Input image file: sample.png
Output Word file: sample.modified.docx
Replacing text with image...
Reading and encoding Word document file...
Word document file read successfully: 12345 bytes
Reading and encoding image file...
Image file read successfully: 6789 bytes
Sending replace text with image request...
Status code: 202
Request accepted. Processing asynchronously...
Polling URL: https://api.pdf4me.com/api/v2/ReplaceTextWithImageInWord/...
Polling attempt 1/10...
Text replacement completed successfully!
Modified Word document saved to: sample.modified.docx
Text replacement operation completed successfully!
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/v2/ReplaceTextWithImageInWord
```

## Specific Settings

### Text Replacement Parameters
- **docContent**: Base64 encoded Word document content
- **imageContent**: Base64 encoded image content
- **docName**: Input document name
- **imageName**: Input image name
- **textToReplace**: Text to be replaced with image
- **async**: `true` for asynchronous processing (recommended for large files)

## Implementation Details

### Key Components

1. **File Reading**: Reads Word document and image file, converts both to Base64
2. **Request Building**: Constructs JSON payload with document and image content
3. **API Communication**: Sends HTTP POST request to PDF4Me API
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Processing**: Saves the modified Word document

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format

## API Endpoints

### Replace Text With Image
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/ReplaceTextWithImageInWord`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload

```json
{
  "docContent": "base64-encoded-word-document",
  "imageContent": "base64-encoded-image",
  "docName": "sample.docx",
  "imageName": "sample.png",
  "textToReplace": "REPLACE_ME",
  "async": true
}
```

## Response Handling

### Success Response (200 OK)
- Returns the modified Word document as binary data

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
   - Ensure `sample.docx` and `sample.png` exist in the project directory
   - Check file permissions

3. **Network Errors**
   - Verify internet connection
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid Word Document Format**
   - Ensure input file is a valid .docx document
   - Check if document is corrupted or password-protected

5. **Invalid Image Format**
   - Ensure image file is in a supported format (PNG, JPG, GIF, etc.)
   - Check if image file is corrupted

6. **Text Not Found**
   - Ensure the text to replace exists in the Word document
   - Check for exact text matching (case-sensitive)

7. **Python Version Issues**
   - Ensure Python 3.7+ is installed
   - Check if virtual environment is activated

### Debug Mode

Enable detailed logging by setting:
```python
DEBUG_MODE = True
```

## Sample Files

- **sample.docx**: Sample Word document with placeholder text
- **sample.png**: Sample image file for replacement
- **sample.modified.docx**: Generated modified Word document

## Expected Workflow

1. **Input**: Word document (.docx format) and image file
2. **Processing**: Replace specified text with the image
3. **Output**: Modified Word document with image replacement

## Next Steps

- Implement batch processing for multiple files
- Add support for different Word document formats
- Integrate with web interface
- Add progress tracking for large files

## Future Enhancements

- **GUI Interface**: Create tkinter or PyQt application
- **Batch Processing**: Handle multiple Word documents simultaneously
- **Preview Feature**: Show text replacement preview before processing
- **Custom Options**: Configure image size, position, and formatting
- **Advanced Options**: Support for multiple text replacements in one document
- **Web Interface**: Create Flask/Django web application

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Python Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 