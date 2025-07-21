# Find and Replace Text (Python)

A Python sample project for finding and replacing text in PDF documents using the PDF4me API.

## Project Structure

```
Find and Replace Text/
├── find_and_replace_text.py             # Main script for find/replace operations
├── sample.pdf                           # Sample PDF file for testing
├── find_and_replace_PDF_output.pdf      # Output PDF with replaced text
└── README.md                            # This file
```

## Features

- ✅ Find and replace text in PDF documents using PDF4me API
- ✅ Support for case-sensitive and case-insensitive search
- ✅ Configurable search options and replacement patterns
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
   - Open `find_and_replace_text.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4me API key

3. **Prepare your document:**
   - Place your PDF file in the project directory
   - Update the `pdf_file_path` variable in the script if needed

## Usage

1. **Set the input file and search/replace text (optional):**
   - Edit the `pdf_file_path`, `find_text`, and `replace_text` in `find_and_replace_text.py` if needed

2. **Run the script:**
   ```bash
   python find_and_replace_text.py
   ```

### Input and Output

- **Input:** PDF file with text to replace (default: `sample.pdf`)
- **Output:** PDF file with replaced text (default: `find_and_replace_PDF_output.pdf`)

## Configuration

- **API Key:** Set in `find_and_replace_text.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/FindAndReplaceText`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF content
  - `docName`: Output document name
  - `findText`: Text to search for
  - `replaceText`: Text to replace with
  - `caseSensitive`: true/false for case sensitivity
  - `async`: true/false (async recommended for large files)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/FindAndReplaceText`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Modified PDF file (binary)
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

4. **"Text not found"**
   - The PDF may not contain the specified text
   - Check case sensitivity settings
   - Verify the search text is correct

5. **"No changes made"**
   - The text may already be replaced
   - Check if the find/replace text is the same

### Debugging

- Add print statements in `find_and_replace_text.py` for additional output
- Check exception messages for details
- Review the generated output files
- Enable detailed logging in the code

## Output Structure

After successful text replacement, you'll find:
- `find_and_replace_PDF_output.pdf`: PDF file with replaced text
- Console output with status and result path

## Support

- For PDF4me API issues, refer to [PDF4me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 