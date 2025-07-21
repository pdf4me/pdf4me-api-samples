# Convert PDF To Word (Python)

A Python prototype project for converting PDF documents to Word (DOCX) using the PDF4Me API.

## Project Structure

```
Convert PDF To Word/
├── pdf_to_word.py              # Main script for PDF to Word conversion
├── sample.pdf                  # Sample PDF file for testing
├── PDF_to_Word_output.docx     # Output Word file (generated)
└── README.md                   # This file
```

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic is implemented in `pdf_to_word.py`.

## Features (Planned)

- Convert PDF files to Word (DOCX) format
- Support for multi-page PDFs
- Configurable Word output (formatting, layout)
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
   python pdf_to_word.py
   ```

### Input and Output

- **Input:** `sample.pdf` (included in the project)
- **Output:** `PDF_to_Word_output.docx` (will be generated in the project root)

## TODO List

- [ ] Add advanced error handling and logging
- [ ] Add configuration management
- [ ] Add support for custom Word formatting
- [ ] Add unit tests
- [ ] Add documentation

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ConvertPdfToWord`
- **Authentication:** Basic authentication with API key
- **Format:** Word (DOCX) format
- **Features:** PDF parsing, Word formatting

## Development Notes

- Main logic is in `pdf_to_word.py`
- Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- Polls for completion if async
- Ready to be extended for more features 