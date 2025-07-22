# Read Barcode From Image (Python)

A Python sample project for reading barcodes from images using the PDF4Me API.

## Project Structure

```
Read Barcode From Image/
├── read_barcode_from_image.py         # Main script for barcode reading
├── sample.jpg                         # Sample input image with barcode
├── sample.png                         # Sample input image
├── Read_barcode_from_image_output.json # Output JSON file with barcode data (generated)
└── README.md                          # This file
```

## Features

- ✅ Read multiple barcode types from images
- ✅ Support for various barcode formats (QR, UPC, Code128, EAN, etc.)
- ✅ Support for multiple image formats (JPG, PNG)
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ Simple, dependency-light Python implementation
- ✅ Base64 encoding for secure image transmission
- ✅ JSON output format with structured barcode data
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
   - Open `read_barcode_from_image.py`
   - Replace the placeholder in the `api_key` variable with your actual PDF4Me API key

3. **Prepare your image:**
   - Place your input image in the project directory
   - Update the `image_file_path` variable in the script if needed

## Usage

1. **Set the input image and image type (optional):**
   - Edit the `image_file_path` and `imageType` in `read_barcode_from_image.py` if needed

2. **Run the script:**
   ```bash
   python read_barcode_from_image.py
   ```

### Input and Output

- **Input:** Image file containing barcode(s) (default: `sample.jpg`)
- **Output:** JSON file with barcode data (default: `Read_barcode_from_image_output.json`)

## Configuration

- **API Key:** Set in `read_barcode_from_image.py`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ReadBarcodesfromImage`
- **Supported Formats:** JPG, PNG
- **Image Types:**
  - **JPG:** JPEG image format
  - **PNG:** PNG image format
- **Timeout:** 300 seconds (5 minutes) for large images

## Supported Barcode Types

The API can read various barcode formats including:

### 1D Barcodes
- **UPC-A:** Universal Product Code (12 digits)
- **UPC-E:** Universal Product Code (8 digits)
- **EAN-8:** European Article Number (8 digits)
- **EAN-13:** European Article Number (13 digits)
- **Code 128:** Alphanumeric barcode
- **Code 39:** Alphanumeric barcode
- **Interleaved 2 of 5:** Numeric barcode
- **Codabar:** Alphanumeric barcode

### 2D Barcodes
- **QR Code:** Quick Response code
- **Data Matrix:** 2D matrix barcode
- **PDF417:** 2D stacked barcode
- **Aztec Code:** 2D matrix barcode
- **MaxiCode:** 2D matrix barcode

### Special Formats
- **Swiss QR Code:** Swiss payment QR codes
- **GS1 DataBar:** Retail barcode
- **ITF-14:** Interleaved 2 of 5 (14 digits)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ReadBarcodesfromImage`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)
- **Response:**
  - 200: Barcode data JSON
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `docName`: Input image filename
- `docContent`: Base64 encoded image content
- `imageType`: "JPG" or "PNG"
- `async`: true/false (async recommended for large images)

## Error Handling

- Invalid image file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- File I/O errors
- Invalid image type
- JSON parsing errors
- No barcode found in image

## Troubleshooting

### Common Issues

1. **"Image file not found"**
   - Ensure the input image file exists in the project directory
   - Check the file path in the script

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the image format is supported

3. **"Polling timeout"**
   - Large images may take longer to process
   - Increase `max_retries` or `retry_delay` in the code if needed

4. **"No barcode found"**
   - Ensure the image contains a clear, readable barcode
   - Check image quality and resolution
   - Verify barcode is not damaged or obscured

5. **"Invalid image type"**
   - Ensure image type is "JPG" or "PNG"
   - Check that the image format matches the specified type

### Debugging

- Check the `Read_barcode_from_image_output.json` file for detailed results
- Add print statements in `read_barcode_from_image.py` for additional output
- Verify image quality and barcode clarity
- Examine response headers for processing information

## Code Structure

The script follows a clear workflow:
1. **File Validation:** Check if input image exists
2. **Encoding:** Convert image to base64 for API transmission
3. **API Request:** Send barcode reading request to PDF4Me
4. **Response Handling:** Process immediate (200) or async (202) responses
5. **Polling:** For async operations, poll until completion
6. **File Saving:** Save the barcode data JSON to disk

## Output Examples

### Single Barcode
```json
{
  "barcodes": [
    {
      "type": "QR_CODE",
      "value": "https://example.com",
      "confidence": 0.98,
      "bbox": [100, 200, 300, 300]
    }
  ]
}
```

### Multiple Barcodes
```json
{
  "barcodes": [
    {
      "type": "UPC_A",
      "value": "123456789012",
      "confidence": 0.95,
      "bbox": [50, 100, 200, 150]
    },
    {
      "type": "CODE_128",
      "value": "ABC123",
      "confidence": 0.92,
      "bbox": [250, 100, 400, 150]
    }
  ]
}
```

### Swiss QR Code
```json
{
  "barcodes": [
    {
      "type": "SWISS_QR",
      "value": "01000121A...",
      "confidence": 0.99,
      "bbox": [100, 200, 300, 300],
      "parsedData": {
        "iban": "CH9300762011623852957",
        "amount": "100.00",
        "currency": "CHF"
      }
    }
  ]
}
```

## Use Cases

### Retail and Inventory
- Scan product barcodes for inventory management
- Process UPC/EAN codes for pricing
- Track items through supply chain

### Document Processing
- Extract data from ID cards and documents
- Process QR codes on business cards
- Read barcodes from shipping labels

### Mobile Applications
- QR code scanning for mobile apps
- Contactless payment processing
- Event ticketing and access control

## Performance Considerations

- **Image Quality:** Higher resolution images provide better barcode detection
- **Barcode Clarity:** Clear, high-contrast barcodes improve accuracy
- **Image Size:** Larger images may take longer to process
- **Multiple Barcodes:** Images with multiple barcodes require more processing time
- **Network:** Stable internet connection improves reliability

## Best Practices

### Image Preparation
- Use high-resolution images (300+ DPI)
- Ensure good contrast between barcode and background
- Avoid shadows and reflections
- Keep barcode area clean and unobstructed

### Processing
- Use async processing for large images
- Monitor response times and adjust timeouts
- Validate barcode data for accuracy
- Handle multiple barcode types appropriately

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Python issues, consult [Python Docs](https://docs.python.org/3/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 