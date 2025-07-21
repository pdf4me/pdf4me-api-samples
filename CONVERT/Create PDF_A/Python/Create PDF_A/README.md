# PDF to PDF/A Converter (Python)

Convert regular PDF files to PDF/A format using the PDF4Me API. PDF/A is an ISO standard for long-term archival and preservation of electronic documents.

## Features

- ✅ PDF/A compliance: Converts PDFs to various PDF/A compliance levels (PdfA1b, PdfA1a, PdfA2b, etc.)
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging

## Prerequisites

- **Python 3.7+**
- **requests** library (install with `pip install requests`)
- **PDF4Me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **A PDF file**

## Project Structure

```
Create PDF_A/Python/Create PDF_A/
├── create_pdfa.py             # Main script for PDF to PDF/A conversion
├── sample.pdf                 # Sample PDF file for testing
└── README.md                  # This file
```

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install requests
   ```
2. **Place your PDF file** in the project directory (default: `sample.pdf`)
3. **Configure your API key and file paths** in `create_pdfa.py`
4. **Run the script:**
   ```bash
   python create_pdfa.py
   ```

## Configuration

Edit the constants in `create_pdfa.py`:

```python
API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/"
INPUT_PDF_PATH = "sample.pdf"  # Your PDF file
OUTPUT_PDFA_PATH = "PDF_to_PDF_A_output.pdf"  # Output file name
```

### PDF/A Compliance Levels
- PdfA1b (default): Level B basic conformance
- PdfA1a: Level A accessible conformance
- PdfA2b: Part 2 basic compliance
- PdfA2u: Part 2 with Unicode mapping
- PdfA2a: Part 2 accessible compliance
- PdfA3b: Part 3 basic - allows file embedding
- PdfA3u: Part 3 with Unicode mapping
- PdfA3a: Part 3 accessible compliance

## API Endpoint

- **Endpoint**: `https://api.pdf4me.com/api/v2/PdfA`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: multipart/form-data

## Usage Example

```bash
python create_pdfa.py
```

## Error Handling

- Invalid file path or unsupported format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues

## Supported Features

- ✅ PDF/A-1, PDF/A-2, PDF/A-3 compliance
- ✅ Long-term archival and preservation

## Use Cases

- **Archiving**: Convert PDFs to PDF/A for legal or regulatory compliance
- **Preservation**: Ensure documents remain accessible for decades

## License

MIT License - see project root for details 