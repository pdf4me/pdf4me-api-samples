# Create Barcode

A Python implementation for creating barcode images using the PDF4me API.

## Project Structure

```
Create Barcode/
├── create_barcode.py          # Main application with complete barcode creation logic
├── Barcode_create_output.png  # Output barcode image
├── README.md                  # This file
```

## Project Status

✅ **IMPLEMENTATION COMPLETE** - Full barcode creation functionality is implemented and working.

## Features

- ✅ Create various barcode types as images
- ✅ Support for different barcode formats (QR Code, Code128, DataMatrix, etc.)
- ✅ Configurable text and barcode options
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
3. Replace the placeholder in `create_barcode.py`:
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
   python create_barcode.py
   ```

### Input and Output

- **Input:** 
  - Text to encode (configured in create_barcode.py)
- **Output:** `Barcode_create_output.png` (barcode image)

## API Configuration

The application uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/CreateBarcode`
- **Authentication:** Basic authentication with API key
- **Features:** Create barcode images

## Barcode Settings

The implementation supports these settings:
- **Text:** Configurable text to encode
- **Barcode Type:** QR Code, Code128, DataMatrix, Aztec, etc.
- **Output Format:** PNG (default)
- **Async Processing:** true (recommended for large files)

## Implementation Details

### Main Components

1. **Main Script:**
   - Entry point for the application
   - Configuration constants (API key, URLs, settings)
   - HTTP client initialization

2. **Key Functions:**
   - `create_barcode()`: Main function for barcode creation
   - File I/O operations with proper error handling

### Key Features

- **Async Processing:** Handles both sync and async API responses
- **Retry Logic:** Implements polling with configurable retry attempts
- **Error Handling:** Comprehensive exception handling and logging
- **File Management:** Efficient image I/O with proper resource management
- **HTTP Client:** Uses `requests` for HTTP operations

## Error Handling

The application handles various error scenarios:
- **401 Unauthorized:** Invalid or missing API key
- **404 Not Found:** Input file not found
- **202 Accepted:** Async processing (handled with polling)
- **500 Server Error:** API server issues
- **Timeout:** Long-running operations that exceed retry limits

## Sample Files

### Barcode_create_output.png
A sample output file showing the expected result after barcode creation.

## Expected Workflow

1. Configure barcode text and type
2. Prepare API request parameters
3. Call the PDF4me API to create the barcode
4. Handle the response (sync/async)
5. Save the resulting barcode image
6. Provide status feedback to the user

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error:**
   - Ensure you have set a valid API key in `create_barcode.py`
   - Check that your API key is active and has sufficient credits

2. **Python Errors:**
   - Ensure you're using Python 3.7 or higher
   - Check that all source files are in the correct location

3. **Network Issues:**
   - Verify internet connectivity
   - Check firewall settings
   - Ensure the PDF4me API is accessible

## Performance Notes

- **Processing Time:** Depends on barcode complexity and server load
- **Image Quality:** High-resolution output suitable for printing
- **Format Support:** PNG output by default

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch barcode creation
- [ ] Command line interface for text input
- [ ] Custom styling and color options
- [ ] Integration with other document formats
- [ ] Web-based user interface 