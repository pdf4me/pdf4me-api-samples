# Add Page Number to PDF - Python

Add customizable page numbers to PDF documents using the PDF4me API in Python. This application supports various page number formats, positioning options, and font styling.

## Features

- Add customizable page numbers to PDF documents
- Support for various page number formats and positioning
- Configurable font styling and margins
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
Add Page Number To PDF/Python/Add Page Number To PDF/
├── add_page_number_to_pdf.py         # Main script for adding page numbers
├── sample.pdf                         # Input PDF file
├── Add_page_number_to_PDF_output.pdf  # Output PDF with page numbers (generated)
└── README.md                          # This file
```

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install requests
   ```
2. **Place your PDF file** in the directory (default: `sample.pdf`)
3. **Configure your API key and file paths** in `add_page_number_to_pdf.py`
4. **Run the script:**
   ```bash
   python add_page_number_to_pdf.py
   ```

## Configuration

Edit the constants in `add_page_number_to_pdf.py`:

```python
API_KEY = "your-api-key-here"
INPUT_PDF_PATH = "sample.pdf"
OUTPUT_PDF_PATH = "Add_page_number_to_PDF_output.pdf"
```

### Page Number Options
- **Format**: Custom page number format (e.g., "Page {page} of {total}")
- **Alignment**: Horizontal (left, center, right) and vertical (top, middle, bottom)
- **Margins**: Horizontal and vertical margins in millimeters
- **Font**: Size, color, bold, italic options
- **Placement**: Background/foreground, page selection
- **Async processing**: Enable for large files

## Output

The PDF with page numbers will be saved as `Add_page_number_to_PDF_output.pdf` in the same directory.

## Error Handling

- File validation for input PDF
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses

## Troubleshooting

- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure `sample.pdf` exists
- **API request failed**: Check internet connection and API status

## License

MIT License - see project root for details 