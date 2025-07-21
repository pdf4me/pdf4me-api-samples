# Convert PDF To Excel (Python)

A Python prototype project for converting PDF documents to Excel (XLSX) using the PDF4Me API.

## Project Structure

```
Convert PDF To Excel/
├── pdf_to_excel.py              # Main script for PDF to Excel conversion
├── sample.pdf                   # Sample PDF file for testing
├── PDF_to_EXCEL_output.xlsx     # Output Excel file (generated)
└── README.md                    # This file
```

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic is implemented in `pdf_to_excel.py`.

## Features (Planned)

- Convert PDF files to Excel (XLSX) format
- Support for multi-page PDFs
- Configurable Excel output (sheet name, formatting)
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
   python pdf_to_excel.py
   ```

### Input and Output

- **Input:** `sample.pdf` (included in the project)
- **Output:** `PDF_to_EXCEL_output.xlsx` (will be generated in the project root)

## TODO List

- [ ] Add advanced error handling and logging
- [ ] Add configuration management
- [ ] Add support for custom Excel formatting
- [ ] Add unit tests
- [ ] Add documentation

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ConvertPdfToExcel`
- **Authentication:** Basic authentication with API key
- **Format:** Excel (XLSX) format
- **Features:** PDF parsing, Excel formatting

## Development Notes

- Main logic is in `pdf_to_excel.py`
- Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- Polls for completion if async
- Ready to be extended for more features 