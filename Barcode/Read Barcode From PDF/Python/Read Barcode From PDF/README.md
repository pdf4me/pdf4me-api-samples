# Read Barcode From PDF

A Python implementation for reading barcode images from PDF documents using the PDF4me API.

## Project Structure

```
Read Barcode From PDF/
├── read_barcode_from_pdf.py   # Main application with complete barcode reading logic
├── Read_barcode_output.json   # Output barcode data
├── sample.pdf                 # Sample PDF file for testing
├── README.md                  # This file
```

## Project Status

✅ **IMPLEMENTATION COMPLETE** - Full barcode reading functionality is implemented and working.

## Features

- ✅ Read various barcode types from PDF documents
- ✅ Support for different barcode formats (QR Code, Code128, DataMatrix, etc.)
- ✅ Extract barcode data and metadata
- ✅ Async API calling support
- ✅ Comprehensive error handling and logging

## Requirements

- Python 3.7 or higher
- `requests` library (install via `pip install requests`)
- Internet connection (for PDF4me API access)
- Valid PDF4me API key

## Setup

### 1. Get API Key
First, you need to get a valid API key from PDF4me:
1. Visit https://dev.pdf4me.com/dashboard/#/api-keys/
2. Create an account and generate an API key
3. Replace the placeholder in `read_barcode_from_pdf.py`:
   ```python
   api_key = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys"
   ```

## Usage

### Run the Application

1. **Install dependencies:**
   ```bash
   pip install requests
   ```

2. **Run the script:**
   ```bash
   python read_barcode_from_pdf.py
   ```

### Input and Output

- **Input:** 
  - PDF document containing barcodes (configured in read_barcode_from_pdf.py)
- **Output:** `Read_barcode_output.json` (extracted barcode data)

## API Configuration

The application uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ReadBarcodes`
- **Authentication:** Basic authentication with API key
- **Features:** Read barcode data from PDF documents

## Barcode Reading Settings

The implementation supports these settings:
- **PDF Input:** Configurable PDF file path
- **Barcode Types:** QR Code, Code128, DataMatrix, Aztec, etc.
- **Output Format:** JSON with barcode data and metadata
- **Page Range:** Specific pages to scan for barcodes
- **Async Processing:** true (recommended for large files)

## Implementation Details

### Main Components

1. **Main Script:**
   - Entry point for the application
   - Configuration constants (API key, URLs, settings)
   - HTTP client initialization

2. **Key Functions:**
   - `read_barcode_from_pdf()`: Main function for barcode reading
   - File I/O operations with proper error handling

### Key Features

- **Async Processing:** Handles both sync and async API responses
- **Retry Logic:** Implements polling with configurable retry attempts
- **Error Handling:** Comprehensive exception handling and logging
- **File Management:** Efficient PDF I/O with proper resource management
- **HTTP Client:** Uses `requests` for HTTP operations

## Error Handling

The application handles various error scenarios:
- **401 Unauthorized:** Invalid or missing API key
- **404 Not Found:** Input file not found
- **202 Accepted:** Async processing (handled with polling)
- **500 Server Error:** API server issues
- **Timeout:** Long-running operations that exceed retry limits

## Sample Files

### Read_barcode_output.json
A sample output file showing the expected result after barcode reading.

## Expected Workflow

1. Load PDF document containing barcodes
2. Prepare API request parameters
3. Call the PDF4me API to read barcodes
4. Handle the response (sync/async)
5. Save the extracted barcode data
6. Provide status feedback to the user

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error:**
   - Ensure you have set a valid API key in `read_barcode_from_pdf.py`
   - Check that your API key is active and has sufficient credits

2. **Python Errors:**
   - Ensure you're using Python 3.7 or higher
   - Check that all source files are in the correct location

3. **Network Issues:**
   - Verify internet connectivity
   - Check firewall settings
   - Ensure the PDF4me API is accessible

## Performance Notes

- **Processing Time:** Depends on PDF size and number of barcodes
- **Detection Accuracy:** High accuracy for various barcode types
- **Format Support:** Multiple barcode formats supported

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch PDF processing
- [ ] Command line interface for PDF input
- [ ] Custom barcode detection settings
- [ ] Integration with other document formats
- [ ] Web-based user interface 