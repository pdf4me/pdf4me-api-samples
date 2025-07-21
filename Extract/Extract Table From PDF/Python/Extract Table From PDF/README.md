# Extract Table from PDF - Python

Extract table structures and data from PDF documents using the PDF4me API in Python. This tool supports both synchronous and asynchronous processing with automatic retry logic.

## Features

- Extract table structures and data from PDF documents
- Multiple output formats: JSON and CSV
- Asynchronous processing with polling
- Comprehensive error handling and logging

## Prerequisites

- **Python 3.7+**
- **requests** library (install with `pip install requests`)
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **A PDF file** for testing

## Project Structure

```
Extract Table From PDF/Python/Extract Table From PDF/
├── extract_table_from_pdf.py            # Main script for extracting tables
├── sample.pdf                           # Input PDF file
├── Extract_table_outputs/               # Output folder for extracted tables
└── README.md                            # This file
```

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install requests
   ```
2. **Place your PDF file** in the directory (default: `sample.pdf`)
3. **Configure your API key** in `extract_table_from_pdf.py`
4. **Run the script:**
   ```bash
   python extract_table_from_pdf.py
   ```

## Configuration

Edit the constants in `extract_table_from_pdf.py`:

```python
api_key = "your-api-key-here"
pdf_file_path = "sample.pdf"
output_folder = "Extract_table_outputs"
```

## Output

The application creates an `Extract_table_outputs` folder containing:
- `extracted_tables.json`: Complete table data in JSON format
- `table_1.json`, `table_2.json`, ...: Individual tables as JSON files
- `table_1.csv`, `table_2.csv`, ...: Individual tables as CSV files
- `extracted_tables.xlsx`: Excel format (if API returns binary data)

## Error Handling

- File validation for input PDF
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses

## Troubleshooting

- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure `sample.pdf` exists
- **API request failed**: Check internet connection and API status
- **No tables found**: The PDF may not contain extractable table structures
- **Processing timeout**: Large files may take longer to process

## License

MIT License - see project root for details 