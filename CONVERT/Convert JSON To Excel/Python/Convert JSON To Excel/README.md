# Convert JSON To Excel (Python)

A Python prototype project for converting JSON data to Excel (XLSX) using the PDF4Me API.

## Project Structure

```
Convert JSON To Excel/
├── json_to_excel.py             # Main script for JSON to Excel conversion
├── row.json                     # Sample JSON file for testing
├── JSON_to_EXCEL_output.xlsx    # Output Excel file (generated)
└── README.md                    # This file
```

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic is implemented in `json_to_excel.py`.

## Features (Planned)

- Convert JSON files to Excel (XLSX) format
- Support for various JSON structures
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
   python json_to_excel.py
   ```

### Input and Output

- **Input:** `row.json` (included in the project)
- **Output:** `JSON_to_EXCEL_output.xlsx` (will be generated in the project root)

## TODO List

- [ ] Add advanced error handling and logging
- [ ] Add configuration management
- [ ] Add support for custom Excel formatting
- [ ] Add unit tests
- [ ] Add documentation

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ConvertJsonToExcel`
- **Authentication:** Basic authentication with API key
- **Format:** Excel (XLSX) format
- **Features:** JSON parsing, Excel formatting

## Development Notes

- Main logic is in `json_to_excel.py`
- Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- Polls for completion if async
- Ready to be extended for more features 