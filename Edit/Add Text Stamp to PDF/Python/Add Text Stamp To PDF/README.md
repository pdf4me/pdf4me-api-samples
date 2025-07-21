# PDF Text Stamp - Python

Add text stamps/watermarks to PDF documents using the PDF4me API in Python. This application allows you to add customizable text watermarks to PDF documents for authorization and piracy prevention.

## Features

- Add text stamps/watermarks to PDF documents
- Customizable text content, font, size, color, and positioning
- Support for rotation and opacity settings
- Background/foreground placement options
- Handles both synchronous and asynchronous API responses
- Automatic polling for async operations
- Comprehensive error handling and logging

## Prerequisites

- **Python 3.7+**
- **requests** library (install with `pip install requests`)
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **A PDF file** for testing

## Project Structure

```
Add Text Stamp To PDF/Python/Add Text Stamp To PDF/
├── add_text_stamp_to_pdf.py         # Main script for adding text stamps
├── sample.pdf                        # Input PDF file
├── Add_text_stamp_to_PDF_output.pdf  # Output PDF with text stamp (generated)
└── README.md                         # This file
```

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install requests
   ```
2. **Place your PDF file** in the directory (default: `sample.pdf`)
3. **Configure your API key and file paths** in `add_text_stamp_to_pdf.py`
4. **Run the script:**
   ```bash
   python add_text_stamp_to_pdf.py
   ```

## Configuration

Edit the constants in `add_text_stamp_to_pdf.py`:

```python
API_KEY = "your-api-key-here"
INPUT_PDF_PATH = "sample.pdf"
OUTPUT_PDF_PATH = "Add_text_stamp_to_PDF_output.pdf"
```

### Text Stamp Options
- **Text content**: Customizable watermark text
- **Font settings**: Font name, size, color, bold, italic, underline
- **Positioning**: Horizontal/vertical alignment, margins (mm/pixels)
- **Appearance**: Opacity (0-100), rotation angle
- **Placement**: Background/foreground, page selection
- **Async processing**: Enable for large files

## Output

The PDF with text stamp will be saved as `Add_text_stamp_to_PDF_output.pdf` in the same directory.

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