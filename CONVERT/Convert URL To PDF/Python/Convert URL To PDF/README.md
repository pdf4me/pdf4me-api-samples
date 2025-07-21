# Convert URL To PDF (Python)

A Python sample project for converting web URLs to PDF documents using the PDF4Me API.

## Project Structure

```
Convert URL To PDF/
├── url_to_pdf.py                # Main script for URL to PDF conversion
├── URL_to_PDF_output.pdf        # Output PDF (generated)
└── README.md                    # This file
```

## Features

- ✅ Convert web URLs to PDF with preserved styling and layout
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Configurable page settings (size, orientation, margins, background, headers/footers)
- ✅ Simple, dependency-light Python implementation

## Prerequisites

- Python 3.8+
- `requests` library (install with `pip install requests`)
- Internet connection (for PDF4Me API access)
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))

## Setup

1. **Install dependencies:**
   ```bash
   pip install requests
   ```

2. **Configure your API key:**
   - Open `url_to_pdf.py`
   - Replace the placeholder in the API key variable with your actual PDF4Me API key

## Usage

1. **Set the target URL and output file (optional):**
   - Edit the `web_url` and output file name in `url_to_pdf.py` if needed

2. **Run the script:**
   ```bash
   python url_to_pdf.py
   ```

### Input and Output

- **Input:** Web URL (set in code)
- **Output:** PDF file (default: `URL_to_PDF_output.pdf`)

## Configuration

- **API Key:** Set in `url_to_pdf.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ConvertUrlToPdf`
- **Payload Options:**
  - `webUrl`: Target web page URL
  - `authType`: Authentication type (NoAuth, Basic, etc.)
  - `layout`: "portrait" or "landscape"
  - `format`: "A4", "Letter", etc.
  - `scale`: 0.1–2.0 (scaling factor)
  - `topMargin`, `leftMargin`, `rightMargin`, `bottomMargin`: Margins (e.g., "20px")
  - `printBackground`: true/false
  - `displayHeaderFooter`: true/false
  - `async`: true/false (async recommended for large/complex pages)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ConvertUrlToPdf`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: PDF file (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Error Handling

- Invalid URL or inaccessible web page
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Invalid PDF response detection
- Network connectivity issues

## Troubleshooting

### Common Issues

1. **"Input URL not accessible"**
   - Ensure the URL is valid and publicly accessible
   - Check if the website requires authentication

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the target URL is valid and accessible

3. **"Polling timeout"**
   - Large/complex web pages may take longer
   - Increase retry count or delay in code if needed

4. **"No PDF data found in response"**
   - API may have returned an error message
   - Check the full response for details

### Debugging

- Add print statements in `url_to_pdf.py` for additional output
- Check exception messages for details

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 