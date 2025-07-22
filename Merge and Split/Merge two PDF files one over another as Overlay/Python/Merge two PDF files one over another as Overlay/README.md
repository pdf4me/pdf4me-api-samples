# Merge Two PDF Files One Over Another as Overlay (Python)

A Python sample project for merging two PDF files by overlaying one on top of another using the PDF4Me API.

## Project Structure

```
Merge two PDF files one over another as Overlay/
├── merge_two_pdf_files_one_over_another_as_overlay.py  # Main script for PDF overlay merging
├── sample1.pdf                                        # Base PDF file (first layer)
├── sample2.pdf                                        # Layer PDF file (second layer)
├── Merge_overlay_output.pdf                           # Output overlay merged PDF (generated)
└── README.md                                          # This file
```

## Features

- ✅ Merge two PDF files by overlaying one on top of another
- ✅ Precision content integration with layer positioning
- ✅ Support for complex PDF layouts and content
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Simple, dependency-light Python implementation
- ✅ Base64 encoding for secure PDF transmission
- ✅ Detailed response logging for debugging

## Prerequisites

- Python 3.6+
- `requests` library (install with `pip install requests`)
- Internet connection (for PDF4Me API access)
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))

## Setup

1. **Install dependencies:**
   ```bash
   pip install requests
   ```

2. **Configure your API key:**
   - Open `merge_two_pdf_files_one_over_another_as_overlay.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4Me API key

3. **Prepare your PDF files:**
   - Place your base and layer PDF files in the project directory
   - Update the `base_pdf_file_path` and `layer_pdf_file_path` variables in the script if needed

## Usage

1. **Set the input PDF files and output (optional):**
   - Edit the `base_pdf_file_path`, `layer_pdf_file_path`, and `output_path` in `merge_two_pdf_files_one_over_another_as_overlay.py` if needed

2. **Run the script:**
   ```bash
   python merge_two_pdf_files_one_over_another_as_overlay.py
   ```

### Input and Output

- **Input:** Two PDF files (base PDF and layer PDF)
- **Output:** Single overlay merged PDF file (default: `Merge_overlay_output.pdf`)

## Configuration

- **API Key:** Set in `merge_two_pdf_files_one_over_another_as_overlay.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/MergeOverlay`
- **Supported Formats:** PDF files
- **Timeout:** 300 seconds (5 minutes) for large PDFs

## Overlay Process

The API merges PDFs by overlaying content:

### Base PDF (First Layer)
- Serves as the background/underlying document
- Contains the main content and layout
- Remains unchanged in the final output

### Layer PDF (Second Layer)
- Overlaid on top of the base PDF
- Content is positioned precisely over the base
- Can include forms, stamps, watermarks, or additional content

### Result
- Single PDF with both layers combined
- Layer content appears on top of base content
- Maintains original positioning and formatting

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/MergeOverlay`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)
- **Response:**
  - 200: Overlay merged PDF (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `baseDocContent`: Base64 encoded base PDF content
- `baseDocName`: Name of the base PDF file
- `layerDocContent`: Base64 encoded layer PDF content
- `layerDocName`: Name of the layer PDF file
- `async`: true/false (async recommended for large PDFs)

## Error Handling

- Invalid PDF files or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- File I/O errors
- Missing input files
- PDF processing failures

## Troubleshooting

### Common Issues

1. **"Base PDF file not found"**
   - Ensure the base PDF file exists in the project directory
   - Check the file path in the script

2. **"Layer PDF file not found"**
   - Ensure the layer PDF file exists in the project directory
   - Check the file path in the script

3. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the PDF files are valid

4. **"Polling timeout"**
   - Large PDFs may take longer to process
   - Increase `max_retries` or `retry_delay` in the code if needed

5. **"Overlay not appearing correctly"**
   - Check that both PDFs have compatible page sizes
   - Verify layer PDF content positioning
   - Ensure PDFs are not corrupted

6. **"File size issues"**
   - Large PDFs may exceed API limits
   - Consider compressing PDFs before processing
   - Check available memory and disk space

### Debugging

- Add print statements in `merge_two_pdf_files_one_over_another_as_overlay.py` for additional output
- Check exception messages for details
- Verify PDF file integrity
- Examine response headers for processing information

## Code Structure

The script follows a clear workflow:
1. **File Validation:** Check if both input PDF files exist
2. **Encoding:** Convert both PDFs to base64 for API transmission
3. **API Request:** Send overlay merge request to PDF4Me
4. **Response Handling:** Process immediate (200) or async (202) responses
5. **Polling:** For async operations, poll until completion
6. **File Saving:** Save the overlay merged PDF to disk

## Use Cases

### Document Processing
- Add watermarks to existing documents
- Overlay forms on template documents
- Combine letterheads with content
- Add stamps or signatures to PDFs

### Business Applications
- Merge contracts with terms and conditions
- Overlay company branding on documents
- Add approval stamps to reports
- Combine invoices with payment forms

### Creative Projects
- Create layered document designs
- Overlay graphics on text documents
- Combine multiple design elements
- Create composite documents

### Legal and Compliance
- Add legal disclaimers to documents
- Overlay compliance stamps
- Merge certificates with content
- Add digital signatures

## Performance Considerations

- **PDF Size:** Larger PDFs take longer to process
- **Content Complexity:** Complex layouts may require more processing time
- **Page Count:** More pages increase processing time
- **Network:** Stable internet connection improves reliability
- **Memory:** Large PDFs require sufficient memory

## Best Practices

### PDF Preparation
- Ensure both PDFs have compatible page sizes
- Check for any password protection
- Verify PDF integrity before processing
- Consider file size limitations

### Content Positioning
- Test layer positioning with sample files
- Ensure important content isn't obscured
- Check for content overlap issues
- Validate final output quality

### Processing
- Use async processing for large PDFs
- Monitor response times and adjust timeouts
- Validate output PDFs for quality
- Handle multiple overlay operations appropriately

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 