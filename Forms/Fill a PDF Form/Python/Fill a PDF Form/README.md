# Fill a PDF Form (Python)

A Python sample project for filling PDF forms with data using the PDF4me API.

## Project Structure

```
Fill a PDF Form/
├── fill_pdf_form.py                     # Main script for form filling
├── sample.pdf                           # Sample PDF form for testing
├── fill_PDF_form_output.pdf             # Output filled PDF form
└── README.md                            # This file
```

## Features

- ✅ Fill PDF forms with data using PDF4me API
- ✅ Support for various form field types (text, checkbox, radio button, dropdown)
- ✅ Configurable form data mapping and validation
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
   - Open `fill_pdf_form.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4me API key

3. **Prepare your document:**
   - Place your PDF form file in the project directory
   - Update the `pdf_file_path` variable in the script if needed

## Usage

1. **Set the input file and form data (optional):**
   - Edit the `pdf_file_path` and form data in `fill_pdf_form.py` if needed

2. **Run the script:**
   ```bash
   python fill_pdf_form.py
   ```

### Input and Output

- **Input:** PDF form file (default: `sample.pdf`)
- **Output:** Filled PDF form with data (default: `fill_PDF_form_output.pdf`)

## Configuration

- **API Key:** Set in `fill_pdf_form.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/FillPdfForm`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF content
  - `docName`: Output document name
  - `formData`: Object containing form field values
  - `async`: true/false (async recommended for large files)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/FillPdfForm`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Filled PDF form (binary)
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

4. **"Form field not found"**
   - The PDF may not contain the specified form fields
   - Check if the PDF actually has form fields

5. **"Invalid form data"**
   - Ensure form data is properly formatted
   - Check the API documentation for correct format

### Debugging

- Add print statements in `fill_pdf_form.py` for additional output
- Check exception messages for details
- Review the generated output files
- Enable detailed logging in the code

## Output Structure

After successful form filling, you'll find:
- `fill_PDF_form_output.pdf`: Filled PDF form with data
- Console output with status and result path

## Support

- For PDF4me API issues, refer to [PDF4me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 