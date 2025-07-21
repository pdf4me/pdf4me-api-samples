# Extract Pages from PDF - Python Implementation

This project demonstrates how to extract specific pages from a PDF document using the PDF4Me API with Python.

## ✅ Features

- Extract specific pages from PDF documents
- Support for single page numbers and page ranges
- Configurable page extraction options
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
Extract Pages/
├── extract_pages.py            # Main application logic
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
3. **Configure your API key** in `extract_pages.py`:
   ```python
   API_KEY = "your-api-key-here"
   ```
4. **Place your input PDF** in the project directory
5. **Run the application**:
   ```bash
   python extract_pages.py
   ```

## Usage

The application will:
1. Read the input PDF file
2. Convert it to Base64
3. Send a request to extract specific pages
4. Handle the response (synchronous or asynchronous)
5. Save the extracted pages as `output.pdf`

### Expected Output

```
Reading input PDF file...
PDF file read successfully. Size: 245760 bytes

Sending request to extract pages...
Request sent successfully.

Processing response...
Response Status: 200 OK

Downloading extracted PDF...
PDF downloaded successfully. Size: 156432 bytes

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
POST /api/ExtractPage/ExtractPage
```

## Specific Settings

### extractPageOption
- **Type**: `str`
- **Description**: Specifies which pages to extract
- **Options**:
  - `"PageNumbers"`: Extract specific page numbers
  - `"PageRanges"`: Extract page ranges

### pageNumbers
- **Type**: `list[int]`
- **Description**: List of page numbers to extract (1-based indexing)
- **Example**: `[1, 3, 5]` - extracts pages 1, 3, and 5

### pageRanges
- **Type**: `list[str]`
- **Description**: List of page ranges to extract
- **Example**: `["1-3", "5-7"]` - extracts pages 1-3 and 5-7

## Implementation Details

### Key Components

1. **File Reading**: Reads PDF file and converts to Base64
2. **Request Building**: Constructs JSON payload with page extraction parameters
3. **API Communication**: Sends HTTP POST request to PDF4Me API
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Download**: Downloads extracted PDF and saves to local file system

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format

## API Endpoints

### Extract Pages
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/ExtractPage/ExtractPage`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {API_KEY}`

## Request Payload

```json
{
  "document": {
    "docData": "base64-encoded-pdf-content"
  },
  "extractPageAction": {
    "extractPageOption": "PageNumbers",
    "pageNumbers": [1, 3, 5]
  }
}
```

## Response Handling

### Success Response (200 OK)
```json
{
  "document": {
    "docData": "base64-encoded-extracted-pdf"
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

5. **Python Version Issues**
   - Ensure Python 3.7+ is installed
   - Check if virtual environment is activated

### Debug Mode

Enable detailed logging by setting:
```python
DEBUG_MODE = True
```

## Sample Files

- **input.pdf**: Sample PDF file for testing
- **output.pdf**: Generated PDF with extracted pages

## Expected Workflow

1. **Input**: PDF file with multiple pages
2. **Processing**: Extract specified pages (e.g., pages 1, 3, 5)
3. **Output**: PDF file containing only the extracted pages

## Next Steps

- Implement batch processing for multiple files
- Add support for more page selection options
- Integrate with web interface
- Add progress tracking for large files

## Future Enhancements

- **GUI Interface**: Create tkinter or PyQt application
- **Batch Processing**: Handle multiple PDF files simultaneously
- **Preview Feature**: Show PDF thumbnails before extraction
- **Multiple Output Formats**: Support for different output formats
- **Advanced Options**: Extract pages based on content analysis
- **Web Interface**: Create Flask/Django web application

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Python Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 