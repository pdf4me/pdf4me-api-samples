# Merge Multiple PDF Files into Single PDF - Python Implementation

This project demonstrates how to merge multiple PDF files into a single PDF using the PDF4Me API with Python.

## ✅ Features

- Merge multiple PDF files into a single PDF
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- Configurable merge order and settings
- Cross-platform compatibility

## Prerequisites

- Python 3.7 or higher
- PDF4Me API key
- Internet connection for API access
- Required Python packages (see Dependencies section)

## Project Structure

```
Merge Multiple PDF files into Single PDF/
├── merge_multiple_pdf_files_into_single_pdf.py  # Main application logic
├── README.md                                    # This documentation
├── sample1.pdf                                  # Sample input PDF 1
├── sample2.pdf                                  # Sample input PDF 2
└── merged_output.pdf                            # Generated merged PDF
```

## Setup

1. **Clone or download this project**
2. **Install dependencies**:
   ```bash
   pip install requests
   ```
3. **Configure your API key** in `merge_multiple_pdf_files_into_single_pdf.py`:
   ```python
   API_KEY = "your-api-key-here"
   ```
4. **Place your input PDF files** in the project directory:
   - `sample1.pdf` - First PDF to merge
   - `sample2.pdf` - Second PDF to merge
   - Add more PDF files as needed
5. **Run the application**:
   ```bash
   python merge_multiple_pdf_files_into_single_pdf.py
   ```

## Usage

The application will:
1. Read all input PDF files
2. Convert them to Base64
3. Send a request to merge the PDFs
4. Handle the response (synchronous or asynchronous)
5. Save the merged PDF

### Expected Output

```
=== Merging Multiple PDF Files into Single PDF ===
This merges multiple PDF files into a single PDF document
Returns merged PDF with all pages combined
------------------------------------------------------------
Input PDF files: ['sample1.pdf', 'sample2.pdf']
Output PDF file: merged_output.pdf
Merging PDF files...
Reading and encoding PDF files...
PDF file 1 read successfully: 12345 bytes
PDF file 2 read successfully: 6789 bytes
Sending merge PDF request...
Status code: 202
Request accepted. Processing asynchronously...
Polling URL: https://api.pdf4me.com/api/v2/MergeMultiplePdfs/...
Polling attempt 1/10...
PDF merge completed successfully!
Merged PDF saved to: merged_output.pdf
Merge operation completed successfully!
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/v2/MergeMultiplePdfs
```

## Specific Settings

### Merge Parameters
- **pdfContents**: Array of Base64 encoded PDF contents
- **pdfNames**: Array of input PDF names
- **async**: `true` for asynchronous processing (recommended for large files)

## Implementation Details

### Key Components

1. **File Reading**: Reads all input PDF files and converts them to Base64
2. **Request Building**: Constructs JSON payload with all PDF contents
3. **API Communication**: Sends HTTP POST request to PDF4Me API
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Processing**: Saves the merged PDF

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format

## API Endpoints

### Merge Multiple PDFs
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/MergeMultiplePdfs`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload

```json
{
  "pdfContents": [
    "base64-encoded-pdf-1",
    "base64-encoded-pdf-2"
  ],
  "pdfNames": [
    "sample1.pdf",
    "sample2.pdf"
  ],
  "async": true
}
```

## Response Handling

### Success Response (200 OK)
- Returns the merged PDF as binary data

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
   - Ensure all PDF files exist in the project directory
   - Check file permissions

3. **Network Errors**
   - Verify internet connection
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid PDF Format**
   - Ensure all files are valid PDF documents
   - Check if PDF files are corrupted or password-protected

5. **Large File Size**
   - Consider using asynchronous processing for large files
   - Monitor memory usage when processing multiple large PDFs

6. **Python Version Issues**
   - Ensure Python 3.7+ is installed
   - Check if virtual environment is activated

### Debug Mode

Enable detailed logging by setting:
```python
DEBUG_MODE = True
```

## Sample Files

- **sample1.pdf**: Sample input PDF 1
- **sample2.pdf**: Sample input PDF 2
- **merged_output.pdf**: Generated merged PDF

## Expected Workflow

1. **Input**: Multiple PDF files
2. **Processing**: Merge all PDFs into a single document
3. **Output**: Single PDF with all pages combined

## Next Steps

- Implement batch processing for multiple merge operations
- Add support for different PDF formats
- Integrate with web interface
- Add progress tracking for large files

## Future Enhancements

- **GUI Interface**: Create tkinter or PyQt application
- **Batch Processing**: Handle multiple merge operations simultaneously
- **Preview Feature**: Show merge preview before processing
- **Custom Options**: Configure page order and selection
- **Advanced Options**: Support for page ranges and custom ordering
- **Web Interface**: Create Flask/Django web application

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Python Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 