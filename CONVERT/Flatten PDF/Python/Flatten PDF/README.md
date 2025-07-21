# PDF Flattener (Python)

Flatten PDF documents using the PDF4Me API. Flattening a PDF merges all layers and annotations into a single layer, making the document easier to view and print.

## Features

- ✅ Flattens PDF files, merging all layers and annotations
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
Flatten PDF/Python/Flatten PDF/
├── flatten_pdf.py             # Main script for PDF flattening
├── sample.pdf                 # Sample PDF file for testing
└── README.md                  # This file
```

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install requests
   ```
2. **Place your PDF file** in the project directory (default: `sample.pdf`)
3. **Configure your API key and file paths** in `flatten_pdf.py`
4. **Run the script:**
   ```bash
   python flatten_pdf.py
   ```

## Configuration

Edit the constants in `flatten_pdf.py`:

```python
API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/"
INPUT_PDF_PATH = "sample.pdf"  # Your PDF file
OUTPUT_PDF_PATH = "sample.flattened.pdf"  # Output file name
```

## API Endpoint

- **Endpoint**: `https://api.pdf4me.com/api/v2/FlattenPdf`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: multipart/form-data

## Usage Example

```bash
python flatten_pdf.py
```

## Error Handling

- Invalid file path or unsupported format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues

## Supported Features

- ✅ Flattens all layers and annotations
- ✅ Output is a single-layer PDF

## Use Cases

- **Archiving**: Prepare PDFs for long-term storage
- **Printing**: Ensure all content is visible and printable
- **Sharing**: Distribute PDFs with all content merged

## License

MIT License - see project root for details 