# ConvertHTMLToPDF (Python)

A Python prototype project for converting HTML documents to PDF using the PDF4Me API.

## Project Structure

```
Convert HTML To PDF/
├── html_to_pdf.py          # Main script for HTML to PDF conversion
├── sample.html             # Sample HTML file for testing
├── HTML_to_PDF_output.pdf  # Output PDF file (generated)
└── README.md               # This file
```

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic is implemented in `html_to_pdf.py`.

## Features (Planned)

- Convert HTML files to PDF format
- Support for CSS styling and layout
- Handle images and external resources
- Configurable page settings (A4, margins, orientation)
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
   python html_to_pdf.py
   ```

### Input and Output

- **Input:** `sample.html` (included in the project)
- **Output:** `HTML_to_PDF_output.pdf` (will be generated in the project root)

## TODO List

- [ ] Add advanced error handling and logging
- [ ] Add configuration management
- [ ] Add support for CSS styling
- [ ] Add unit tests
- [ ] Add documentation

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ConvertHtmlToPdf`
- **Authentication:** Basic authentication with API key
- **Format:** PDF format
- **Features:** HTML rendering, CSS support, image handling

## Development Notes

- Main logic is in `html_to_pdf.py`
- Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- Polls for completion if async
- Ready to be extended for more features 