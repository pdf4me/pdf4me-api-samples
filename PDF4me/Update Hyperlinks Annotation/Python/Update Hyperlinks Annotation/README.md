# Update Hyperlinks Annotation (Python)

A Python sample project for updating hyperlinks and annotations in PDF documents using the PDF4me API.

## Project Structure

```
Update Hyperlinks Annotation/
├── update_hyperlinks_annotation.py          # Main script for hyperlink updates
├── sample.pdf                               # Sample PDF file for testing
├── hyperlinks_updated_PDF_output.pdf        # Output PDF with updated hyperlinks
└── README.md                                # This file
```

## Features

- ✅ Update hyperlinks and annotations in PDF documents using PDF4me API
- ✅ Support for various annotation types and hyperlink modifications
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ File I/O operations with proper error handling
- ✅ Simple, dependency-light Python implementation

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
   - Open `update_hyperlinks_annotation.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4me API key

3. **Prepare your document:**
   - Place your PDF file in the project directory
   - Update the `pdf_file_path` variable in the script if needed

## Usage

1. **Set the input file and hyperlink options (optional):**
   - Edit the `pdf_file_path` and hyperlink parameters in `update_hyperlinks_annotation.py` if needed

2. **Run the script:**
   ```bash
   python update_hyperlinks_annotation.py
   ```

### Input and Output

- **Input:** PDF file with hyperlinks/annotations (default: `sample.pdf`)
- **Output:** Updated PDF file with modified hyperlinks/annotations (default: `hyperlinks_updated_PDF_output.pdf`)

## Configuration

- **API Key:** Set in `update_hyperlinks_annotation.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/UpdateHyperlinksAnnotation`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF content
  - `docName`: Output document name
  - `hyperlinks`: Array of hyperlink modifications
  - `annotations`: Array of annotation updates
  - `async`: true/false (async recommended for large files)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/UpdateHyperlinksAnnotation`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Updated PDF file (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Error Handling

- Missing or invalid PDF file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- Invalid PDF response detection
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

4. **"No hyperlinks found"**
   - The PDF may not contain any hyperlinks
   - Check if the PDF actually has hyperlinks to update

5. **"Invalid annotation format"**
   - Ensure annotation data is properly formatted
   - Check the API documentation for correct format

### Debugging

- Add print statements in `update_hyperlinks_annotation.py` for additional output
- Check exception messages for details
- Review the generated output files
- Enable detailed logging in the code

## Output Structure

After successful processing, you'll find:
- `hyperlinks_updated_PDF_output.pdf`: Updated PDF file with modified hyperlinks/annotations
- Console output with status and result path

## Support

- For PDF4me API issues, refer to [PDF4me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 