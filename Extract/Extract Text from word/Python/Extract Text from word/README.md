# Extract Text from Word (Python)

A Python sample project for extracting text content from Word documents using the PDF4Me API.

## Project Structure

```
Extract Text from word/
├── extract_text_from_word.py              # Main script for text extraction
├── sample.docx                            # Sample Word document for testing
├── extracted_text.txt                     # Extracted text output (generated)
├── extracted_text_from_word.json          # Extraction metadata (generated)
└── README.md                              # This file
```

## Features

- ✅ Extract text content from Word documents (.docx, .doc)
- ✅ Configurable page range extraction
- ✅ Remove comments, headers, and footers
- ✅ Accept or reject tracked changes
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Base64 encoding for secure document transmission
- ✅ Multiple output formats (TXT, JSON metadata)
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
   - Open `extract_text_from_word.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4Me API key

3. **Prepare your document:**
   - Place your Word file in the project directory
   - Update the `word_file_path` variable in the script if needed

## Usage

1. **Set the input file and extraction options (optional):**
   - Edit the `word_file_path` variable in `extract_text_from_word.py` if needed
   - Configure extraction options in the payload section

2. **Run the script:**
   ```bash
   python extract_text_from_word.py
   ```

### Input and Output

- **Input:** Word document file (.docx or .doc)
- **Output:** 
  - Text file with extracted content (default: `extracted_text.txt`)
  - JSON file with extraction metadata (default: `extracted_text_from_word.json`)

## Configuration

- **API Key:** Set in `extract_text_from_word.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ExtractTextFromWord`
- **Payload Options:**
  - `docContent`: Base64 encoded Word document content
  - `docName`: Name of the input Word file
  - `StartPageNumber`: Starting page number for extraction
  - `EndPageNumber`: Ending page number for extraction
  - `RemoveComments`: true/false (remove comments from text)
  - `RemoveHeaderFooter`: true/false (remove headers and footers)
  - `AcceptChanges`: true/false (accept tracked changes)
  - `async`: true/false (async recommended for large documents)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ExtractTextFromWord`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Extracted text content (JSON or text file)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Response Format

The extraction result can be:

### JSON Response (Structured Data)
- Contains extracted text with page information
- Includes metadata about the extraction process
- Preserves document structure and formatting information

### Text Response (Plain Text)
- Contains extracted text content in plain text format
- Suitable for further processing or analysis

## Extraction Options

### Page Range
- Specify start and end page numbers
- Extract text from specific sections of the document
- Useful for large documents where you only need certain pages

### Content Filtering
- **Remove Comments:** Exclude comment text from extraction
- **Remove Headers/Footers:** Exclude header and footer content
- **Accept Changes:** Include or exclude tracked changes

### Processing Options
- **Synchronous vs Asynchronous:** Choose based on document size
- **Error Handling:** Comprehensive error detection and reporting

## Error Handling

- Missing or invalid Word file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- Invalid page range specifications
- File I/O exceptions during processing

## Troubleshooting

### Common Issues

1. **"Word file not found"**
   - Ensure the Word file exists in the specified path
   - Check file permissions

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the Word file is valid and accessible

3. **"Polling timeout"**
   - Large/complex documents may take longer
   - Increase retry count or delay in code if needed

4. **"Invalid page range"**
   - Ensure start page is less than or equal to end page
   - Check that page numbers are within document bounds

5. **"No text extracted"**
   - The document may be empty or contain only images
   - Check if the document has actual text content

### Debugging

- Add print statements in `extract_text_from_word.py` for additional output
- Check exception messages for details
- Review the generated output files
- Verify the Word document contains text content

## Output Structure

After successful extraction, you'll find:
- `extracted_text.txt`: Contains the extracted text content
- `extracted_text_from_word.json`: Contains metadata about the extraction process
- Console output with extraction summary and statistics

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 