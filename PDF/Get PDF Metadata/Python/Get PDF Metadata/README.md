# Get PDF Metadata (Python)

A Python sample project for extracting metadata from PDF documents using the PDF4me API.

## Project Structure

```
Get PDF Metadata/
├── pdf_metadata.py                       # Main script for metadata extraction
├── sample.pdf                            # Sample PDF file for testing
├── sample.metadata.json                  # Output JSON file with extracted metadata
└── README.md                             # This file
```

## Features

- ✅ Extract comprehensive metadata from PDF documents using PDF4me API
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ File I/O operations with proper error handling
- ✅ Simple, dependency-light Python implementation
- ✅ JSON output formatting

## Prerequisites

- Python 3.8+
- `requests` library (install with `pip install requests`)
- Internet connection (for PDF4me API access)
- PDF4me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))

## Setup

1. **Install dependencies:**
   ```bash
   pip install requests
   ```

2. **Configure your API key:**
   - Open `pdf_metadata.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4me API key

3. **Prepare your document:**
   - Place your PDF file in the project directory
   - Update the `pdf_file_path` variable in the script if needed

## Usage

1. **Set the input file (optional):**
   - Edit the `pdf_file_path` in `pdf_metadata.py` if needed

2. **Run the script:**
   ```bash
   python pdf_metadata.py
   ```

### Input and Output

- **Input:** PDF file (default: `sample.pdf`)
- **Output:** JSON file with extracted metadata (default: `sample.metadata.json`)

## Configuration

- **API Key:** Set in `pdf_metadata.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/GetPdfMetadata`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF content
  - `docName`: Output document name
  - `async`: true/false (async recommended for large files)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/GetPdfMetadata`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: JSON metadata
  - 202: Accepted, poll the URL in the `Location` header for completion

## Error Handling

- Missing or invalid PDF file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- Invalid JSON response detection
- File I/O exceptions during processing

## Troubleshooting

### Common Issues

1. **"PDF file not found"**
   - Ensure the PDF file exists in the specified path
   - Check file permissions

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the PDF file is valid and accessible

3. **"Polling timeout"**
   - Large/complex documents may take longer
   - Increase retry count or delay in code if needed

4. **"Invalid JSON response"**
   - The API may have returned an error message
   - Check the full response for details

5. **"No metadata found"**
   - The PDF may not contain extractable metadata
   - Check if the PDF actually has metadata

### Debugging

- Add print statements in `pdf_metadata.py` for additional output
- Check exception messages for details
- Review the generated output files
- Enable detailed logging in the code

## Output Structure

After successful extraction, you'll find:
- `sample.metadata.json`: JSON file containing extracted PDF metadata
- Console output with status and result path

## Support

- For PDF4me API issues, refer to [PDF4me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 