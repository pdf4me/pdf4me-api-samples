# Split PDF by Barcode (Python)

A Python sample project for splitting PDF documents based on barcode detection using the PDF4Me API.

## Project Structure

```
Split PDF by Barcode/
├── split_pdf_by_barcode.py                    # Main script for PDF barcode splitting
├── sample_barcode.pdf                         # Sample input PDF with barcodes
├── Split_PDF_Barcode_outputs/                 # Output directory for split PDFs
│   ├── output_1.pdf                          # First split PDF (generated)
│   ├── output_2.pdf                          # Second split PDF (generated)
│   ├── output_3.pdf                          # Third split PDF (generated)
│   └── output_4.pdf                          # Fourth split PDF (generated)
└── README.md                                  # This file
```

## Features

- ✅ Split PDF documents based on barcode detection
- ✅ Support for multiple barcode types (QR, DataMatrix, PDF417, etc.)
- ✅ Configurable barcode filtering options
- ✅ Flexible split positioning (before, after, remove)
- ✅ Option to combine consecutive pages with same barcodes
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Simple, dependency-light Python implementation
- ✅ Base64 encoding for secure PDF transmission
- ✅ Detailed response logging for debugging

## Prerequisites

- Python 3.6+
- `requests` library (install with `pip install requests`)
- Internet connection (for PDF4Me API access)
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))

## Setup

1. **Install dependencies:**
   ```bash
   pip install requests
   ```

2. **Configure your API key:**
   - Open `split_pdf_by_barcode.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4Me API key

3. **Prepare your PDF file:**
   - Place your input PDF with barcodes in the project directory
   - Update the `pdf_file_path` variable in the script if needed

## Usage

1. **Set the input PDF and barcode parameters (optional):**
   - Edit the `pdf_file_path`, `barcodeString`, `barcodeFilter`, `barcodeType`, and `splitBarcodePage` in `split_pdf_by_barcode.py` if needed

2. **Run the script:**
   ```bash
   python split_pdf_by_barcode.py
   ```

### Input and Output

- **Input:** PDF file with embedded barcodes (default: `sample_barcode.pdf`)
- **Output:** Multiple split PDF files in `Split_PDF_Barcode_outputs/` directory

## Configuration

- **API Key:** Set in `split_pdf_by_barcode.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/SplitPdfByBarcode_old`
- **Supported Formats:** PDF files with embedded barcodes
- **Timeout:** 300 seconds (5 minutes) for large PDFs

## Barcode Split Options

The API supports various barcode splitting configurations:

### Barcode String
```python
"barcodeString": "Test PDF Barcode"  # Barcode text to search for
```

### Barcode Filter
```python
"barcodeFilter": "startsWith"  # Filter type options
```

Filter options:
- **startsWith:** Split when barcode starts with the specified string
- **endsWith:** Split when barcode ends with the specified string
- **contains:** Split when barcode contains the specified string
- **exact:** Split when barcode exactly matches the specified string

### Barcode Type
```python
"barcodeType": "any"  # Barcode type options
```

Supported barcode types:
- **any:** Detect all barcode types
- **datamatrix:** DataMatrix barcodes only
- **qrcode:** QR codes only
- **pdf417:** PDF417 barcodes only

### Split Position
```python
"splitBarcodePage": "after"  # Split position options
```

Split position options:
- **before:** Split before the page containing the barcode
- **after:** Split after the page containing the barcode
- **remove:** Remove the page containing the barcode

### Additional Options
```python
"combinePagesWithSameConsecutiveBarcodes": False,  # Combine consecutive pages
"pdfRenderDpi": "150"                              # PDF render DPI
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/SplitPdfByBarcode_old`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)
- **Response:**
  - 200: Array of split PDF documents (JSON)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `docContent`: Base64 encoded PDF content
- `docName`: Output PDF file name
- `barcodeString`: Barcode text to search for
- `barcodeFilter`: Filter type (startsWith, endsWith, contains, exact)
- `barcodeType`: Barcode type (any, datamatrix, qrcode, pdf417)
- `splitBarcodePage`: Split position (before, after, remove)
- `combinePagesWithSameConsecutiveBarcodes`: true/false
- `pdfRenderDpi`: PDF render DPI (string)
- `async`: true/false (async recommended for large PDFs)

## Error Handling

- Invalid PDF file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- File I/O errors
- Missing barcodes in PDF
- PDF processing failures

## Troubleshooting

### Common Issues

1. **"PDF file not found"**
   - Ensure the input PDF file exists in the project directory
   - Check the file path in the script

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the PDF file is valid

3. **"Polling timeout"**
   - Large PDFs may take longer to process
   - Increase `max_retries` or `retry_delay` in the code if needed

4. **"No barcodes found"**
   - Verify the PDF contains barcodes
   - Check barcode type and filter settings
   - Ensure barcode string matches exactly

5. **"Split not working as expected"**
   - Verify barcode detection settings
   - Check split position configuration
   - Test with different filter options

6. **"Output files not created"**
   - Check output directory permissions
   - Verify API response format
   - Ensure sufficient disk space

### Debugging

- Add print statements in `split_pdf_by_barcode.py` for additional output
- Check exception messages for details
- Verify PDF file integrity
- Examine response headers for processing information

## Code Structure

The script follows a clear workflow:
1. **File Validation:** Check if input PDF exists
2. **Output Setup:** Create output directory if needed
3. **Encoding:** Convert PDF to base64 for API transmission
4. **API Request:** Send barcode split request to PDF4Me
5. **Response Handling:** Process immediate (200) or async (202) responses
6. **Polling:** For async operations, poll until completion
7. **File Processing:** Parse response and save split PDFs

## Use Cases

### Document Processing
- Split invoices by customer barcodes
- Separate forms by batch numbers
- Divide reports by section identifiers
- Organize documents by category codes

### Business Applications
- Process bulk document workflows
- Automate document routing
- Separate contracts by client codes
- Split invoices by payment references

### Logistics and Inventory
- Process shipping documents by tracking codes
- Split inventory reports by product codes
- Organize delivery notes by route codes
- Separate manifests by destination codes

### Compliance and Legal
- Split legal documents by case numbers
- Organize compliance reports by regulation codes
- Separate audit documents by department codes
- Process certificates by serial numbers

## Performance Considerations

- **PDF Size:** Larger PDFs take longer to process
- **Barcode Count:** More barcodes increase processing time
- **Barcode Type:** Complex barcodes may require more processing
- **Network:** Stable internet connection improves reliability
- **Memory:** Large PDFs require sufficient memory

## Best Practices

### PDF Preparation
- Ensure PDFs contain clear, readable barcodes
- Use high-quality scans for better barcode detection
- Verify barcode format and encoding
- Test with sample documents first

### Barcode Configuration
- Use appropriate barcode type settings
- Choose correct filter options for your use case
- Test split positions with sample data
- Validate barcode string matching

### Processing
- Use async processing for large PDFs
- Monitor response times and adjust timeouts
- Validate output files for completeness
- Handle multiple split operations appropriately

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 