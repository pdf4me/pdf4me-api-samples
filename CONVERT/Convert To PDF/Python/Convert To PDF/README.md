# Convert To PDF (Python)

A Python prototype project for converting various document types to PDF using the PDF4Me API.

## Project Structure

```
Convert To PDF/
├── document_to_pdf.py              # Main script for document to PDF conversion
├── sample_pdf.docx                 # Sample input file for testing
├── Document_to_PDF_output.pdf      # Output PDF file (generated)
└── README.md                       # This file
```

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic is implemented in `document_to_pdf.py`.

## Features (Planned)

- Convert various document types (Word, Excel, images, etc.) to PDF
- Support for multiple input formats
- Configurable PDF output (page size, orientation)
- Async API calling support
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging

## Requirements

- Python 3.7+
- `requests` library (install with `pip install requests`)
- Internet connection (for PDF4Me API access)

## Setup

1. **Install dependencies:**
   ```bash
   pip install requests
   ```

2. **Check Python version:**
   ```bash
   python --version
   ```

## Usage (After Implementation)

### Running the Application

1. **Run the script:**
   ```bash
   python document_to_pdf.py
   ```

### Input and Output

- **Input:** `sample_pdf.docx` (included in the project, can be changed)
- **Output:** `Document_to_PDF_output.pdf` (will be generated in the project root)

## TODO List

- [ ] Add advanced error handling and logging
- [ ] Add configuration management
- [ ] Add support for more input formats
- [ ] Add unit tests
- [ ] Add documentation

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ConvertToPdf`
- **Authentication:** Basic authentication with API key
- **Format:** PDF format
- **Features:** Multi-format conversion, async support

## Development Notes

- Main logic is in `document_to_pdf.py`
- Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- Polls for completion if async
- Ready to be extended for more features 