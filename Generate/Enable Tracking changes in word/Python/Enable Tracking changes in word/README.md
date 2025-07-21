# Enable Tracking Changes in Word - Python Implementation

This project demonstrates how to enable tracking changes in Word documents using the PDF4Me API with Python.

## ✅ Features

- Enable tracking changes in Word documents
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- Cross-platform compatibility

## Prerequisites

- Python 3.7 or higher
- PDF4Me API key
- Internet connection for API access
- Required Python packages (see Dependencies section)

## Project Structure

```
Enable Tracking changes in word/
├── enable_tracking_changes_in_word.py  # Main application logic
├── README.md                           # This documentation
├── sample.docx                         # Sample input Word document
└── sample_tracking_output.docx         # Generated Word document with tracking enabled
```

## Setup

1. **Clone or download this project**
2. **Install dependencies**:
   ```bash
   pip install requests
   ```
3. **Configure your API key** in `enable_tracking_changes_in_word.py`:
   ```python
   API_KEY = "your-api-key-here"
   ```
4. **Place your input Word document** as `sample.docx` in the project directory
5. **Run the application**:
   ```bash
   python enable_tracking_changes_in_word.py
   ```

## Usage

The application will:
1. Read the input Word document
2. Convert it to Base64
3. Send a request to enable tracking changes
4. Handle the response (synchronous or asynchronous)
5. Save the processed document as `sample_tracking_output.docx`

### Expected Output

```
=== Enabling Tracking Changes in Word Document ===
Tracking changes enabled successfully.
Output saved to: sample_tracking_output.docx
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/v2/EnableTrackingChangesInWord
```

## Specific Settings

### Tracking Changes Parameters
- **docContent**: Base64 encoded Word document content
- **docName**: Output document name
- **async**: `true` for asynchronous processing (recommended for large files)

## Implementation Details

### Key Components

1. **File Reading**: Reads Word document and converts to Base64
2. **Request Building**: Constructs JSON payload with document content
3. **API Communication**: Sends HTTP POST request to PDF4Me API
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Download**: Downloads processed Word document and saves to local file system

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format

## API Endpoints

### Enable Tracking Changes
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/EnableTrackingChangesInWord`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload

```json
{
  "docContent": "base64-encoded-word-document",
  "docName": "output.docx",
  "async": true
}
```

## Response Handling

### Success Response (200 OK)
```json
{
  "document": {
    "docData": "base64-encoded-word-document-with-tracking"
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
   - Ensure `sample.docx` exists in the project directory
   - Check file permissions

3. **Network Errors**
   - Verify internet connection
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid Word Document Format**
   - Ensure input file is a valid .docx document
   - Check if document is corrupted or password-protected

5. **Python Version Issues**
   - Ensure Python 3.7+ is installed
   - Check if virtual environment is activated

### Debug Mode

Enable detailed logging by setting:
```python
DEBUG_MODE = True
```

## Sample Files

- **sample.docx**: Sample Word document for testing
- **sample_tracking_output.docx**: Generated Word document with tracking enabled

## Expected Workflow

1. **Input**: Word document (.docx format)
2. **Processing**: Enable tracking changes functionality
3. **Output**: Word document with tracking changes enabled

## Next Steps

- Implement batch processing for multiple files
- Add support for different Word document formats
- Integrate with web interface
- Add progress tracking for large files

## Future Enhancements

- **GUI Interface**: Create tkinter or PyQt application
- **Batch Processing**: Handle multiple Word documents simultaneously
- **Preview Feature**: Show document preview before processing
- **Custom Settings**: Support for different tracking change options
- **Advanced Options**: Configure specific tracking change parameters
- **Web Interface**: Create Flask/Django web application

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Python Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 