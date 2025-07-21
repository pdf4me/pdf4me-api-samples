# Word to PDF Form Converter (Python)

Convert Word documents (.docx) to interactive PDF forms using the PDF4Me API. This tool transforms Word documents containing form fields into PDF forms with fillable fields for data collection, surveys, and interactive documents.

## Features

- ✅ Convert Word documents (.docx) to PDF forms with fillable fields
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Preserves form fields and document layout
- ✅ Comprehensive error handling and logging

## Prerequisites

- **Python 3.7+**
- **requests** library (install with `pip install requests`)
- **PDF4Me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **A Word file** (.docx)

## Project Structure

```
Convert Word To PDF Form/Python/Convert Word To PDF Form/
├── word_to_pdfform.py         # Main script for Word to PDF Form conversion
├── sample.docx                # Sample Word file for testing
└── README.md                  # This file
```

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install requests
   ```
2. **Place your Word file** in the project directory (default: `sample.docx`)
3. **Configure your API key and file paths** in `word_to_pdfform.py`
4. **Run the script:**
   ```bash
   python word_to_pdfform.py
   ```

## Configuration

Edit the constants in `word_to_pdfform.py`:

```python
API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/"
INPUT_WORD_PATH = "sample.docx"  # Your Word file
OUTPUT_PDF_PATH = "Word_to_PDF_Form_output.pdf"  # Output file name
```

## API Endpoint

- **Endpoint**: `https://api.pdf4me.com/api/v2/ConvertWordToPdfForm`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: multipart/form-data

## Usage Example

```bash
python word_to_pdfform.py
```

## Error Handling

- Invalid file path or unsupported format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues

## Supported Features

- ✅ Preserves form fields and document layout
- ✅ Fillable PDF output

## Use Cases

- **Data collection**: Create fillable PDF forms from Word templates
- **Surveys**: Distribute interactive forms for feedback
- **Document automation**: Generate forms for contracts, HR, and more

## License

MIT License - see project root for details 