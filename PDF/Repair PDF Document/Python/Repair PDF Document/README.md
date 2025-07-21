# Repair PDF Document (Python)

A Python sample project for repairing corrupted or damaged PDF documents using the PDF4me API.

## Project Structure

```
Repair PDF Document/
├── repair_pdf_document.py               # Main script for PDF repair
├── sample.pdf                           # Sample PDF file for testing
├── sample.repaired.pdf                  # Output repaired PDF file
└── README.md                            # This file
```

## Features

- ✅ Repair corrupted or damaged PDF documents using PDF4me API
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ File I/O operations with proper error handling
- ✅ Simple, dependency-light Python implementation
- ✅ PDF structure validation and repair

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
   - Open `repair_pdf_document.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4me API key

3. **Prepare your document:**
   - Place your PDF file in the project directory
   - Update the `pdf_file_path` variable in the script if needed

## Usage

1. **Set the input file (optional):**
   - Edit the `pdf_file_path` in `repair_pdf_document.py` if needed

2. **Run the script:**
   ```bash
   python repair_pdf_document.py
   ```

### Input and Output

- **Input:** Corrupted or damaged PDF file (default: `sample.pdf`)
- **Output:** Repaired PDF file (default: `sample.repaired.pdf`)

## Configuration

- **API Key:** Set in `repair_pdf_document.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/RepairPdfDocument`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF content
  - `docName`: Output document name
  - `async`: true/false (async recommended for large files)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/RepairPdfDocument`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Repaired PDF file (binary)
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

4. **"PDF cannot be repaired"**
   - The PDF may be severely corrupted
   - Check if the PDF file is completely unreadable

5. **"No changes made"**
   - The PDF may not need repair
   - Verify the PDF is actually corrupted

### Debugging

- Add print statements in `repair_pdf_document.py` for additional output
- Check exception messages for details
- Review the generated output files
- Enable detailed logging in the code

## Output Structure

After successful repair, you'll find:
- `sample.repaired.pdf`: Repaired PDF file
- Console output with status and result path

## Support

- For PDF4me API issues, refer to [PDF4me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 