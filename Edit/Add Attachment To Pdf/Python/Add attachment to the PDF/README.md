# Add Attachment to PDF - Python

Add file attachments to PDF documents using the PDF4me API in Python. This tool allows you to attach various file types (like .txt, .doc, .jpg, .png, etc.) to PDF documents for enhanced document management.

## Features

- Add any file type as an attachment to PDF documents
- Support for multiple attachment formats (TXT, DOC, XLS, images, etc.)
- Configurable attachment properties (name, description)
- Handles both synchronous and asynchronous API responses
- Asynchronous processing with retry logic
- Comprehensive error handling and logging

## Prerequisites

- **Python 3.7+**
- **requests** library (install with `pip install requests`)
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **A PDF file** and **an attachment file** for testing

## Project Structure

```
Add attachment to the PDF/Python/Add attachment to the PDF/
├── add_attachment_to_pdf.py            # Main script for adding attachments
├── sample.pdf                          # Input PDF file
├── sample.txt                          # File to attach
├── Add_attachment_to_PDF_output.pdf    # Output PDF with attachment (generated)
└── README.md                           # This file
```

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install requests
   ```
2. **Place your PDF and attachment files** in the directory (default: `sample.pdf`, `sample.txt`)
3. **Configure your API key and file paths** in `add_attachment_to_pdf.py`
4. **Run the script:**
   ```bash
   python add_attachment_to_pdf.py
   ```

## Configuration

Edit the constants in `add_attachment_to_pdf.py`:

```python
API_KEY = "your-api-key-here"
INPUT_PDF_PATH = "sample.pdf"
ATTACHMENT_PATH = "sample.txt"
OUTPUT_PDF_PATH = "Add_attachment_to_PDF_output.pdf"
```

### Supported File Types
- Text files: .txt, .md, .log
- Documents: .doc, .docx, .pdf
- Images: .jpg, .jpeg, .png, .gif, .bmp
- Spreadsheets: .xls, .xlsx, .csv
- Presentations: .ppt, .pptx
- Archives: .zip, .rar, .7z
- Audio/video: .mp3, .wav, .mp4, .avi, etc.
- Any file type can be attached

## Output

The processed PDF with attachments will be saved as `Add_attachment_to_PDF_output.pdf` in the same directory.

## Error Handling

- File validation for input PDF and attachment
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses

## Troubleshooting

- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure `sample.pdf` and `sample.txt` exist
- **API request failed**: Check internet connection and API status
- **Processing timeout**: Large files may take longer to process

## License

MIT License - see project root for details 