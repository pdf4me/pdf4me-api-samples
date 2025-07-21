# PDF Signer - Python

Digitally sign PDF documents with an image using the PDF4me API in Python.

## Features
- Add a signature image to a PDF at a specified position
- Configurable alignment, margins, opacity, and page selection
- Handles both synchronous and asynchronous API responses
- Automatic polling for async operations
- Comprehensive error handling and logging

## Prerequisites
- Python 3.7+
- `requests` library (install with `pip install requests`)
- PDF4me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- `sample.pdf` (input PDF) and `dev.jpg` (signature image) in the project directory

## Project Structure
```
Sign PDF/Python/Sign PDF/
├── sign_pdf.py                # Main script for PDF signing
├── sample.pdf                 # Input PDF file
├── dev.jpg                    # Signature image file
├── Add_sign_to_PDF_output.pdf # Output signed PDF (generated)
└── README.md                  # This file
```

## Quick Start
1. **Install dependencies:**
   ```bash
   pip install requests
   ```
2. **Place your PDF and signature image** in the directory
3. **Configure your API key and file paths** in `sign_pdf.py`
4. **Run the script:**
   ```bash
   python sign_pdf.py
   ```

## Configuration
Edit the constants in `sign_pdf.py`:
```python
API_KEY = "your-api-key-here"
INPUT_PDF_PATH = "sample.pdf"
SIGNATURE_IMAGE_PATH = "dev.jpg"
OUTPUT_PDF_PATH = "Add_sign_to_PDF_output.pdf"
```

### Signature Options
- Page selection: e.g., "1", "1,3,5", "2-5"
- Alignment: alignX ("Left", "Center", "Right"), alignY ("Top", "Middle", "Bottom")
- Size: widthInMM, heightInMM, widthInPx, heightInPx
- Margins: marginXInMM, marginYInMM, marginXInPx, marginYInPx
- Opacity: 0-100
- Background/foreground placement
- Async processing

## Output
The signed PDF will be saved as `Add_sign_to_PDF_output.pdf` in the same directory.

## Error Handling
- File validation for input PDF and signature image
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses

## Troubleshooting
- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure `sample.pdf` and `dev.jpg` exist
- **API request failed**: Check internet connection and API status

## License
MIT License - see project root for details 