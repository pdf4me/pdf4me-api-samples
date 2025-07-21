# PDF Linearizer (Python)

Linearize (optimize for web) PDF documents using the PDF4Me API. Linearized PDFs (also known as "web-optimized" PDFs) allow faster viewing and streaming over the web.

## Features

- ✅ Linearizes PDF files for fast web viewing
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
Linearize PDF/Python/Linearize PDF/
├── linearize_pdf.py             # Main script for PDF linearization
├── sample.pdf                   # Sample PDF file for testing
└── README.md                    # This file
```

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install requests
   ```
2. **Place your PDF file** in the project directory (default: `sample.pdf`)
3. **Configure your API key and file paths** in `linearize_pdf.py`
4. **Run the script:**
   ```bash
   python linearize_pdf.py
   ```

## Configuration

Edit the constants in `linearize_pdf.py`:

```python
API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/"
INPUT_PDF_PATH = "sample.pdf"  # Your PDF file
OUTPUT_PDF_PATH = "sample.linearized.pdf"  # Output file name
```

## API Endpoint

- **Endpoint**: `https://api.pdf4me.com/api/v2/LinearizePdf`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: multipart/form-data

## Usage Example

```bash
python linearize_pdf.py
```

## Error Handling

- Invalid file path or unsupported format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues

## Supported Features

- ✅ Web-optimized PDF output
- ✅ Fast streaming and viewing

## Use Cases

- **Web publishing**: Optimize PDFs for fast online viewing
- **Document delivery**: Improve user experience for large PDFs

## License

MIT License - see project root for details 