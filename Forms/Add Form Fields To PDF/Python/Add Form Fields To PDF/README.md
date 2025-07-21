# Add Form Fields To PDF (Python)

A Python sample project for adding form fields to PDF documents using the PDF4me API.

## Project Structure

```
Add Form Fields To PDF/
├── add_form_fields_to_pdf.py             # Main script for form field addition
├── sample.pdf                            # Sample PDF file for testing
├── add_form_fields_PDF_output.pdf        # Output PDF with added form fields
└── README.md                             # This file
```

## Features

- ✅ Add form fields to PDF documents using PDF4me API
- ✅ Support for various form field types (text, checkbox, radio button, dropdown)
- ✅ Configurable field properties (position, size, validation, appearance)
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
   - Open `add_form_fields_to_pdf.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4me API key

3. **Prepare your document:**
   - Place your PDF file in the project directory
   - Update the `pdf_file_path` variable in the script if needed

## Usage

1. **Set the input file and form field configuration (optional):**
   - Edit the `pdf_file_path` and form field parameters in `add_form_fields_to_pdf.py` if needed

2. **Run the script:**
   ```bash
   python add_form_fields_to_pdf.py
   ```

### Input and Output

- **Input:** PDF file (default: `sample.pdf`)
- **Output:** PDF file with added form fields (default: `add_form_fields_PDF_output.pdf`)

## Configuration

- **API Key:** Set in `add_form_fields_to_pdf.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/AddFormFieldsToPdf`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF content
  - `docName`: Output document name
  - `formFields`: Array of form field configurations
  - `async`: true/false (async recommended for large files)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/AddFormFieldsToPdf`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: PDF file with form fields (binary)
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

4. **"Invalid form field configuration"**
   - Ensure form field data is properly formatted
   - Check the API documentation for correct format

5. **"Form field position out of bounds"**
   - Ensure field coordinates are within PDF page boundaries
   - Check page dimensions and field positioning

### Debugging

- Add print statements in `add_form_fields_to_pdf.py` for additional output
- Check exception messages for details
- Review the generated output files
- Enable detailed logging in the code

## Output Structure

After successful processing, you'll find:
- `add_form_fields_PDF_output.pdf`: PDF file with added form fields
- Console output with status and result path

## Support

- For PDF4me API issues, refer to [PDF4me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 