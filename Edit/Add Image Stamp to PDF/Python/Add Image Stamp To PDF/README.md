# Add Image Stamp to PDF - Python

Add image stamps/watermarks to PDF documents using the PDF4me API in Python. This tool allows you to overlay images onto PDF documents with configurable positioning and sizing.

## Features

- Add image stamps to PDF documents
- Support for various image formats (PNG, JPG, etc.)
- Configurable stamp positioning and sizing
- Page range support (all pages or specific pages)
- Asynchronous processing with retry logic
- Comprehensive error handling and logging
- Handles both synchronous and asynchronous API responses

## Prerequisites

- **Python 3.7+**
- **requests** library (install with `pip install requests`)
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **A PDF file** and **an image file** for testing

## Project Structure

```
Add Image Stamp To PDF/Python/Add Image Stamp To PDF/
├── add_image_stamp_to_pdf.py            # Main script for adding image stamps
├── sample.pdf                           # Input PDF file
├── pdf4me.png                           # Image file to use as stamp
├── Add_image_stamp_to_PDF_output.pdf    # Output PDF with image stamp (generated)
└── README.md                            # This file
```

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install requests
   ```
2. **Place your PDF and image files** in the directory (default: `sample.pdf`, `pdf4me.png`)
3. **Configure your API key and file paths** in `add_image_stamp_to_pdf.py`
4. **Run the script:**
   ```bash
   python add_image_stamp_to_pdf.py
   ```

## Configuration

Edit the constants in `add_image_stamp_to_pdf.py`:

```python
API_KEY = "your-api-key-here"
INPUT_PDF_PATH = "sample.pdf"
INPUT_IMAGE_PATH = "pdf4me.png"
OUTPUT_PDF_PATH = "Add_image_stamp_to_PDF_output.pdf"
```

### Stamp Properties
Set the stamp properties in the payload:
- **Position**: Horizontal/vertical alignment or custom coordinates
- **Size**: Width/height in pixels or millimeters
- **Opacity**: Transparency (0.0 to 1.0)
- **Pages**: Apply to all or specific pages
- **Async**: Enable for large files

## Output

The PDF with the image stamp will be saved as `Add_image_stamp_to_PDF_output.pdf` in the same directory.

## Error Handling

- File validation for input PDF and image
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses

## Troubleshooting

- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure `sample.pdf` and `pdf4me.png` exist
- **API request failed**: Check internet connection and API status
- **Processing timeout**: Large files may take longer to process

## License

MIT License - see project root for details 