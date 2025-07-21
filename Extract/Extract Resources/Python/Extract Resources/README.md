# Extract Resources from PDF - Python

Extract text content and embedded images from PDF documents using the PDF4me API in Python. This tool supports both synchronous and asynchronous processing with automatic retry logic.

## Features

- Extract all text content from PDF documents
- Extract embedded images from PDF files
- Asynchronous processing with polling
- Multiple output formats (text, images)
- Comprehensive error handling and logging

## Prerequisites

- **Python 3.7+**
- **requests** library (install with `pip install requests`)
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **A PDF file** for testing

## Project Structure

```
Extract Resources/Python/Extract Resources/
├── extract_resources.py                # Main script for extracting resources
├── sample.pdf                          # Input PDF file
├── Extract_resources_outputs/          # Output folder for extracted resources
└── README.md                           # This file
```

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install requests
   ```
2. **Place your PDF file** in the directory (default: `sample.pdf`)
3. **Configure your API key** in `extract_resources.py`
4. **Run the script:**
   ```bash
   python extract_resources.py
   ```

## Configuration

Edit the constants in `extract_resources.py`:

```python
api_key = "your-api-key-here"
pdf_file_path = "sample.pdf"
output_folder = "Extract_resources_outputs"
```

## Output

The application creates an `Extract_resources_outputs` folder containing:
- Extracted text files
- Extracted images (if present)
- Extraction metadata (JSON)

## Error Handling

- File validation for input PDF
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses

## Troubleshooting

- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure `sample.pdf` exists
- **API request failed**: Check internet connection and API status
- **Processing timeout**: Large files may take longer to process

## License

MIT License - see project root for details 