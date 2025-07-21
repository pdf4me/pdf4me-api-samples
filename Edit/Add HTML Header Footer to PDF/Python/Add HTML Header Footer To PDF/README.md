# Add HTML Header Footer to PDF - Python

Add custom HTML headers and footers to PDF documents using the PDF4me API in Python. This tool allows you to add styled HTML content as headers, footers, or both, with support for dynamic content and page selection.

## Features

- Add HTML content as headers, footers, or both to PDF documents
- Support for dynamic content (page numbers, dates)
- Configurable page selection and margins
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
Add HTML Header Footer To PDF/Python/Add HTML Header Footer To PDF/
├── add_html_header_footer.py            # Main script for adding HTML header/footer
├── sample.pdf                           # Input PDF file
├── Add_header_footer_to_PDF_output.pdf  # Output PDF with HTML header/footer (generated)
└── README.md                            # This file
```

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install requests
   ```
2. **Place your PDF file** in the directory (default: `sample.pdf`)
3. **Configure your API key and HTML content** in `add_html_header_footer.py`
4. **Run the script:**
   ```bash
   python add_html_header_footer.py
   ```

## Configuration

Edit the constants in `add_html_header_footer.py`:

```python
API_KEY = "your-api-key-here"
INPUT_PDF_PATH = "sample.pdf"
OUTPUT_PDF_PATH = "Add_header_footer_to_PDF_output.pdf"
```

### HTML Content
Set the header and footer HTML in the payload:

```python
header_html = """
<div style='text-align: center; font-size: 12px; color: #333;'>
    Company Header - Confidential Document
</div>
"""
footer_html = """
<div style='text-align: center; font-size: 10px; color: #666;'>
    Page {page} of {total} - Generated on {date}
</div>
"""
```

- **Dynamic tags:** `{page}`, `{total}`, `{date}`, `{time}`
- **Location:** Header, Footer, or Both
- **Pages:** All, range ("1-5"), or specific ("1,3,5")
- **Margins:** Customizable in pixels

## Output

The processed PDF with HTML header/footer will be saved as `Add_header_footer_to_PDF_output.pdf` in the same directory.

## Error Handling

- File validation for input PDF
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses

## Troubleshooting

- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure `sample.pdf` exists
- **API request failed**: Check internet connection and API status
- **HTML rendering issues**: Check HTML syntax and CSS
- **Processing timeout**: Large files may take longer to process

## License

MIT License - see project root for details 