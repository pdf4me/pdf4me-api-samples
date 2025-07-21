# Extract Attachment From PDF (Python)

A Python sample project for extracting file attachments from PDF documents using the PDF4Me API.

## Project Structure

```
Extract Attachment From PDF/
├── extract_attachment_from_pdf.py        # Main script for attachment extraction
├── sample.pdf                            # Sample PDF file for testing
├── Extract_attachment_outputs/           # Output folder for extracted files
│   ├── attachment_metadata.json          # Metadata about extracted attachments
│   ├── sample_barcode.txt               # Extracted text file (example)
│   ├── sample_doctext.txt               # Extracted document text (example)
│   └── sample_extracted.txt             # Extracted content (example)
└── README.md                             # This file
```

## Features

- ✅ Extract all file attachments from PDF documents
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Base64 encoding for secure document transmission
- ✅ Multiple output formats (ZIP, individual files, metadata)
- ✅ Automatic ZIP file extraction
- ✅ Metadata preservation for extracted files
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
   - Open `extract_attachment_from_pdf.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4Me API key

3. **Prepare your document:**
   - Place your PDF file in the project directory
   - Update the `pdf_file_path` variable in the script if needed

## Usage

1. **Set the input file and output folder (optional):**
   - Edit the `pdf_file_path` and `output_folder` variables in `extract_attachment_from_pdf.py` if needed

2. **Run the script:**
   ```bash
   python extract_attachment_from_pdf.py
   ```

### Input and Output

- **Input:** PDF document file with embedded attachments
- **Output:** 
  - Individual extracted files in the output folder
  - ZIP archive (if multiple files)
  - Metadata JSON file with attachment information

## Configuration

- **API Key:** Set in `extract_attachment_from_pdf.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ExtractAttachmentFromPdf`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF document content
  - `docName`: Source PDF file name with .pdf extension
  - `async`: true/false (async recommended for large documents)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ExtractAttachmentFromPdf`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Extracted attachments (ZIP file or JSON metadata)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Response Format

The extraction result can be:

### Binary Response (ZIP file)
- Contains all extracted attachments in a ZIP archive
- Automatically extracted to individual files

### JSON Response (Metadata)
- Contains metadata about extracted attachments
- Includes file names, sizes, and content information
- Individual files are extracted and saved separately

## Extracted File Types

The script can extract various file types including:
- Text files (.txt)
- Images (.jpg, .png, .gif, etc.)
- Documents (.doc, .docx, .pdf, etc.)
- Spreadsheets (.xls, .xlsx, etc.)
- Any other file type embedded in the PDF

## Error Handling

- Missing or invalid PDF file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- Invalid ZIP file detection
- File I/O exceptions during extraction

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

4. **"No attachments found"**
   - The PDF may not contain any embedded attachments
   - Check if the PDF actually has file attachments

5. **"ZIP extraction failed"**
   - The response may not be a valid ZIP file
   - Check the response content type and format

### Debugging

- Add print statements in `extract_attachment_from_pdf.py` for additional output
- Check exception messages for details
- Review the generated output files and metadata
- Verify the PDF contains actual file attachments

## Output Structure

After successful extraction, you'll find:
- `attachment_metadata.json`: Contains information about all extracted files
- Individual extracted files with their original names
- Any additional metadata provided by the API

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 