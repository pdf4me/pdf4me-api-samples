# Parse Document (Python)

A Python sample project for parsing and analyzing documents using the PDF4Me API.

## Project Structure

```
Parse Document/
├── parse_document.py                        # Main script for document parsing
├── sample.pdf                               # Sample PDF file for testing
├── parsed_document.txt                      # Parsing results output (generated)
└── README.md                                # This file
```

## Features

- ✅ Parse documents with template-based analysis
- ✅ Extract document type and metadata
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Base64 encoding for secure document transmission
- ✅ Multiple output formats (TXT, JSON metadata)
- ✅ Document type detection and classification
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
   - Open `parse_document.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4Me API key

3. **Prepare your document:**
   - Place your PDF file in the project directory
   - Update the `pdf_file_path` variable in the script if needed

## Usage

1. **Set the input file and output path (optional):**
   - Edit the `pdf_file_path` and `output_path` variables in `parse_document.py` if needed

2. **Run the script:**
   ```bash
   python parse_document.py
   ```

### Input and Output

- **Input:** PDF document file
- **Output:** 
  - Text file with parsing results (default: `parsed_document.txt`)
  - Console output with parsing summary

## Configuration

- **API Key:** Set in `parse_document.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ParseDocument`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF document content
  - `docName`: Source PDF file name with .pdf extension
  - `async`: true/false (async recommended for large documents)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ParseDocument`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Parsing results (JSON)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Response Format

The parsing result includes:
- `documentType`: Type/category of the document
- `pageCount`: Number of pages in the document
- `parsedData`: Structured data extracted from the document
- `confidence`: Confidence score for the parsing results
- `templateId`: Template identifier used for parsing
- Additional metadata and extracted fields

## Parsing Capabilities

### Document Type Detection
- Automatically identifies document types
- Classifies documents based on content and structure
- Supports various document categories

### Data Extraction
- Extracts structured data from documents
- Identifies key fields and values
- Preserves document hierarchy and relationships

### Template-Based Parsing
- Uses predefined templates for consistent extraction
- Supports custom template configurations
- Provides confidence scores for extracted data

## Error Handling

- Missing or invalid PDF file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- Invalid parsing response detection
- File I/O exceptions during processing

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

4. **"No parsing data found"**
   - The document may not be recognized by any template
   - Check if the document format is supported

5. **"Low confidence parsing"**
   - The document may not match expected templates well
   - Consider using different parsing options

### Debugging

- Add print statements in `parse_document.py` for additional output
- Check exception messages for details
- Review the generated output files
- Verify the PDF document is readable and contains expected content

## Output Structure

After successful parsing, you'll find:
- `parsed_document.txt`: Contains parsing results and metadata
- Console output with parsing summary and statistics
- Structured data extracted from the document

## Use Cases

### Document Processing
- Invoice and receipt processing
- Form data extraction
- Contract analysis
- Report generation

### Data Extraction
- Key-value pair extraction
- Table data extraction
- Header and footer analysis
- Metadata extraction

### Document Classification
- Document type identification
- Content categorization
- Template matching
- Quality assessment

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 