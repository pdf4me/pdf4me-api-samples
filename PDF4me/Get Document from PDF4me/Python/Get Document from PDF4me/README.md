# Get Document from PDF4me (Python)

A Python sample project for splitting PDF documents by Swiss QR barcode using the PDF4me API.

## Project Structure

```
Get Document from PDF4me/
├── get_document_from_pdf4me.py              # Main script for barcode splitting
├── sample.pdf                               # Sample PDF file for testing
├── swiss_qr_split_output/                   # Output folder for split PDF archive
└── README.md                                # This file
```

## Features

- ✅ Split PDF by Swiss QR barcode using PDF4me API
- ✅ Support for various barcode types (QR Code, Code128, Code39)
- ✅ Configurable barcode filtering options
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
   - Open `get_document_from_pdf4me.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4me API key

3. **Prepare your document:**
   - Place your PDF file in the project directory
   - Update the `pdf_file_path` variable in the script if needed

## Usage

1. **Set the input file and barcode options (optional):**
   - Edit the `pdf_file_path` and barcode parameters in `get_document_from_pdf4me.py` if needed

2. **Run the script:**
   ```bash
   python get_document_from_pdf4me.py
   ```

### Input and Output

- **Input:** PDF file with barcodes (default: `sample.pdf`)
- **Output:** ZIP archive with split PDF files (default: `swiss_qr_split_output/swiss_qr_split_result.zip`)

## Configuration

- **API Key:** Set in `get_document_from_pdf4me.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/SplitPdfByBarcode_old`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF content
  - `docName`: Output document name
  - `barcodeString`: Text to search for in barcodes
  - `barcodeFilter`: "startsWith", "contains", "equals"
  - `barcodeType`: "qrcode", "code128", "code39"
  - `splitBarcodePage`: "before" or "after"
  - `combinePagesWithSameConsecutiveBarcodes`: true/false
  - `pdfRenderDpi`: DPI for PDF rendering
  - `async`: true/false (async recommended for large files)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/SplitPdfByBarcode_old`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: ZIP archive with split PDFs
  - 202: Accepted, poll the URL in the `Location` header for completion

## Error Handling

- Missing or invalid PDF file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- Invalid ZIP file detection
- File I/O exceptions during extraction

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

4. **"No barcodes found"**
   - The PDF may not contain any barcodes
   - Check if the PDF actually has barcodes

5. **"ZIP extraction failed"**
   - The response may not be a valid ZIP file
   - Check the response content type and format

### Debugging

- Add print statements in `get_document_from_pdf4me.py` for additional output
- Check exception messages for details
- Review the generated output files
- Enable detailed logging in the code

## Output Structure

After successful splitting, you'll find:
- `swiss_qr_split_output/swiss_qr_split_result.zip`: Contains split PDF files
- Console output with status and result path

## Support

- For PDF4me API issues, refer to [PDF4me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 