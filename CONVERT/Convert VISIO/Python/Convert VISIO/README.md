# Visio to PDF Converter (Python)

Convert Microsoft Visio files (.vsdx, .vsd, .vsdm) to PDF documents using the PDF4Me API. This tool supports both synchronous and asynchronous processing with automatic retry logic.

## Features

- ✅ Multiple input formats: .vsdx, .vsd, .vsdm
- ✅ Output to PDF (default), JPG, PNG, or TIFF
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Configurable output options (page range, hidden pages, etc.)
- ✅ Comprehensive error handling and logging

## Prerequisites

- **Python 3.7+**
- **requests** library (install with `pip install requests`)
- **PDF4Me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **A Visio file** (.vsdx, .vsd, or .vsdm)

## Project Structure

```
Convert VISIO/Python/Convert VISIO/
├── visio_converter.py         # Main script for Visio to PDF conversion
├── E-Commerce.vsdx           # Sample Visio file for testing
└── README.md                 # This file
```

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install requests
   ```
2. **Place your Visio file** in the project directory (default: `E-Commerce.vsdx`)
3. **Configure your API key and file paths** in `visio_converter.py`
4. **Run the script:**
   ```bash
   python visio_converter.py
   ```

## Configuration

Edit the constants in `visio_converter.py`:

```python
API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/"
INPUT_VISIO_PATH = "E-Commerce.vsdx"  # Your Visio file
OUTPUT_PDF_PATH = "VISIO_to_PDF_output.pdf"  # Output file name
```

### Conversion Options
Customize the payload for advanced options (see PDF4Me API docs):
- Output format: PDF, JPG, PNG, TIFF
- Page range, hidden pages, resolution, etc.

## API Endpoint

- **Endpoint**: `https://api.pdf4me.com/api/v2/ConvertVisio?schemaVal=PDF`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: multipart/form-data

## Usage Example

```bash
python visio_converter.py
```

## Error Handling

- Invalid file path or unsupported format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues

## Supported Features

- ✅ CSS styling and layout in Visio
- ✅ Images and graphics
- ✅ Multiple output formats
- ✅ Page range and hidden page support

## Use Cases

- **Document archiving**: Convert Visio diagrams to PDF for long-term storage
- **Sharing**: Distribute Visio content as universally accessible PDFs
- **Printing**: Prepare Visio diagrams for print

## License

MIT License - see project root for details 