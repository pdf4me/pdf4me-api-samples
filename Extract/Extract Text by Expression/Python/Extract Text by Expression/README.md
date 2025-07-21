# Extract Text by Expression - Python

Extract specific text from PDF documents using regular expressions with the PDF4me API in Python. This tool supports both synchronous and asynchronous processing with automatic retry logic.

## Features

- Extract text matching specific patterns/expressions from PDF documents
- Support for page range selection
- Asynchronous processing with polling
- Multiple output formats (JSON, TXT, CSV)
- Comprehensive error handling and logging

## Prerequisites

- **Python 3.7+**
- **requests** library (install with `pip install requests`)
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **A PDF file** for testing

## Project Structure

```
Extract Text by Expression/Python/Extract Text by Expression/
├── extract_text_by_expression.py                    # Main script for extracting text by expression
├── sample.pdf                                       # Input PDF file
├── Extract_text_by_expression_outputs/              # Output folder for extracted text
└── README.md                                        # This file
```

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install requests
   ```
2. **Place your PDF file** in the directory (default: `sample.pdf`)
3. **Configure your API key** in `extract_text_by_expression.py`
4. **Run the script:**
   ```bash
   python extract_text_by_expression.py
   ```

## Configuration

Edit the constants in `extract_text_by_expression.py`:

```python
api_key = "your-api-key-here"
pdf_file_path = "sample.pdf"
expression = "%"  # Regular expression pattern to search for
page_sequence = "1-3"  # Page range to process
```

## Output

The application creates an `Extract_text_by_expression_outputs` folder containing:
- `extracted_text_by_expression.json`: Complete extraction metadata
- `extracted_matches.txt`: All extracted text matches in readable format
- `extracted_matches.csv`: Matches in CSV format for analysis

## Error Handling

- File validation for input PDF
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses

## Troubleshooting

- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure `sample.pdf` exists
- **API request failed**: Check internet connection and API status
- **No matches found**: The PDF may not contain text matching your expression
- **Processing timeout**: Large files may take longer to process

## License

MIT License - see project root for details 