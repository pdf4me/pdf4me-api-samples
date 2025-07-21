# Add Margin to PDF - Python

Add custom margins to PDF documents using the PDF4me API in Python. This tool allows you to modify the margins of any PDF document and automatically adjusts the page size to accommodate the new margins.

## Features

- Add customizable margins to PDF documents (top, bottom, left, right)
- Configurable margin sizes in millimeters
- Asynchronous processing with retry logic
- Comprehensive error handling and logging
- Handles both synchronous and asynchronous API responses

## Prerequisites

- **Python 3.7+**
- **requests** library (install with `pip install requests`)
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **A PDF file** for testing

## Project Structure

```
Add Margin To PDF/Python/Add Margin To PDF/
├── add_margin_to_pdf.py            # Main script for adding margins
├── sample.pdf                      # Input PDF file
├── Add_margin_to_PDF_output.pdf    # Output PDF with margins (generated)
└── README.md                       # This file
```

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install requests
   ```
2. **Place your PDF file** in the directory (default: `sample.pdf`)
3. **Configure your API key and margin values** in `add_margin_to_pdf.py`
4. **Run the script:**
   ```bash
   python add_margin_to_pdf.py
   ```

## Configuration

Edit the constants in `add_margin_to_pdf.py`:

```python
API_KEY = "your-api-key-here"
INPUT_PDF_PATH = "sample.pdf"
OUTPUT_PDF_PATH = "Add_margin_to_PDF_output.pdf"
```

### Margin Settings
Set the margin values (in millimeters) in the payload:

```python
payload = {
    "marginTop": 20,     # Top margin
    "marginBottom": 20,  # Bottom margin
    "marginLeft": 20,    # Left margin
    "marginRight": 20,   # Right margin
    "async": True        # Enable async processing
}
```

## Output

The processed PDF with margins will be saved as `Add_margin_to_PDF_output.pdf` in the same directory.

## Error Handling

- File validation for input PDF
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses

## Troubleshooting

- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure `sample.pdf` exists
- **API request failed**: Check internet connection and API status
- **Processing timeout**: Large files may take longer to process

## License

MIT License - see project root for details 