# Classify Document (Python)

A Python sample project for classifying and identifying document types using the PDF4Me API.

## Project Structure

```
Classify Document/
├── classify_document.py         # Main script for document classification
├── sample.pdf                   # Sample PDF file for testing
├── Classify_document_output.json # Output classification results (generated)
└── README.md                    # This file
```

## Features

- ✅ Classify documents based on content analysis
- ✅ Identify document types and categories automatically
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Base64 encoding for secure document transmission
- ✅ JSON output with detailed classification results
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
   - Open `classify_document.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4Me API key

3. **Prepare your document:**
   - Place your PDF file in the project directory
   - Update the `pdf_file_path` variable in the script if needed

## Usage

1. **Set the input file and output path (optional):**
   - Edit the `pdf_file_path` and `output_path` variables in `classify_document.py` if needed

2. **Run the script:**
   ```bash
   python classify_document.py
   ```

### Input and Output

- **Input:** PDF document file
- **Output:** JSON file with classification results (default: `Classify_document_output.json`)

## Configuration

- **API Key:** Set in `classify_document.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ClassifyDocument`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF document content
  - `docName`: Source PDF file name with .pdf extension
  - `async`: true/false (async recommended for large documents)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ClassifyDocument`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Classification results (JSON)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Response Format

The classification result includes:
- `templateId`: Unique identifier for the document template
- `templateName`: Name of the identified template
- `className`: Document class/category
- `traceId`: Request tracking identifier
- `jobId`: Job identifier (if applicable)
- `statusUrl`: Status polling URL (if applicable)
- `subscriptionUsage`: API usage information

## Error Handling

- Missing or invalid PDF file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- Invalid JSON response detection

## Troubleshooting

### Common Issues

1. **"PDF file not found"**
   - Ensure the PDF file exists in the specified path
   - Check file permissions

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the PDF file is valid and accessible

3. **"Polling timeout"**
   - Large/complex documents may take longer
   - Increase retry count or delay in code if needed

4. **"No classification data found"**
   - API may have returned an error message
   - Check the full response for details

### Debugging

- Add print statements in `classify_document.py` for additional output
- Check exception messages for details
- Review the generated JSON output file

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 