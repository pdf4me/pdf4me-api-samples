# Read Barcode From Image (Salesforce)

A Salesforce Apex sample project for reading barcodes from images using the PDF4Me API.

## Project Structure

```
Read Barcode From Image/
├── ReadBarcodeFromImage.cls                    # Main Apex class for barcode reading
├── ReadBarcodeFromImageTest.cls                # Test class with examples
├── Executable_Anonymous_code_ReadBarcodeFromImage.txt  # Anonymous Apex execution examples
└── README.md                                   # This file
```

## Features

- ✅ Read multiple barcode types from images
- ✅ Support for various barcode formats (QR, UPC, Code128, EAN, etc.)
- ✅ Support for multiple image formats (JPG, PNG)
- ✅ Base64 encoding/decoding for secure image transmission
- ✅ Comprehensive error handling and result wrapping
- ✅ JSON output format with structured barcode data
- ✅ Test coverage with example implementations
- ✅ Anonymous Apex execution examples

## Prerequisites

- Salesforce org (Developer, Enterprise, or Unlimited Edition)
- API access enabled
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- Internet access from Salesforce (if using callouts)

## Setup

1. **Deploy the Apex classes:**
   - Deploy `ReadBarcodeFromImage.cls` to your Salesforce org
   - Deploy `ReadBarcodeFromImageTest.cls` for testing

2. **Configure your API key:**
   - Open `ReadBarcodeFromImage.cls`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Enable callouts (if needed):**
   - Ensure your org can make external callouts
   - Add PDF4Me domain to remote site settings if required

## Usage

### Method 1: Direct Apex Class Usage

```apex
// Read barcodes from image
String imageBase64 = 'your_base64_encoded_image_here';
String result = ReadBarcodeFromImage.readBarcodesFromImage(
    imageBase64,
    'my_image.jpg',
    'JPG'  // Image type: JPG or PNG
);
```

### Method 2: Anonymous Apex Execution

Use the examples in `Executable_Anonymous_code_ReadBarcodeFromImage.txt`:

```apex
// Example: Read barcodes from image
String imageBase64 = 'base64_encoded_image';
ReadBarcodeFromImage.ReadBarcodeResult result = 
    ReadBarcodeFromImage.readBarcodesFromImage(imageBase64, 'sample.jpg', 'JPG');

if (result.error == null) {
    System.debug('Success! Barcode data: ' + result.barcodeData);
} else {
    System.debug('Error: ' + result.error);
}
```

### Method 3: Test Class Examples

Run the test class for working examples:

```apex
Test.startTest();
ReadBarcodeFromImageTest.testReadBarcodesFromImage();
Test.stopTest();
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ReadBarcodesfromImage`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)

## Configuration

- **API Key:** Set in `ReadBarcodeFromImage.cls` as `API_KEY` constant
- **Endpoint URL:** `https://api.pdf4me.com/api/v2/ReadBarcodesfromImage`
- **Supported Formats:** JPG, PNG
- **Image Types:**
  - **JPG:** JPEG image format
  - **PNG:** PNG image format

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

## Return Values

The `readBarcodesFromImage` method returns a `ReadBarcodeResult` object with:

- **barcodeData:** JSON string containing barcode information and metadata
- **error:** Error message (null if successful)

## Error Handling

- Invalid image data or format
- API authentication errors (401)
- Processing errors (400, 500)
- Network connectivity issues
- JSON serialization errors
- No barcode found in image

## Code Structure

### ReadBarcodeFromImage Class
- **readBarcodesFromImage:** Main barcode reading method
- **ReadBarcodeResult:** Inner class for result wrapping

### ReadBarcodeFromImageTest Class
- **testReadBarcodesFromImage:** Test method with example usage

## Troubleshooting

### Common Issues

1. **"Callout failed"**
   - Verify API key is correct
   - Check internet connectivity
   - Ensure remote site settings allow PDF4Me domain

2. **"Base64 encoding error"**
   - Ensure image data is properly base64 encoded
   - Check for null or empty image data

3. **"No barcode found"**
   - Ensure the image contains a clear, readable barcode
   - Check image quality and resolution
   - Verify barcode is not damaged or obscured

4. **"Invalid image type"**
   - Ensure image type is "JPG" or "PNG"
   - Check that the image format matches the specified type

### Debugging

- Use `System.debug()` statements for additional output
- Check debug logs for detailed error messages
- Verify API responses in debug logs

## Salesforce Integration

### Data Handling
- Returns barcode data as JSON string for easy parsing
- Can be stored in custom fields or processed further
- Supports integration with other Salesforce features

### Security
- Uses Salesforce's built-in security model
- Respects user permissions and sharing rules
- Secure API key storage (consider using Custom Settings for production)

## Development

### Testing
```apex
// Run tests in Developer Console
Test.startTest();
ReadBarcodeFromImageTest.testReadBarcodesFromImage();
Test.stopTest();
```

### Deployment
- Deploy to sandbox first for testing
- Use Change Sets or Metadata API for production deployment
- Consider using Custom Settings for API key management in production

## Limitations

- **Async Processing:** Current implementation uses synchronous processing
- **File Size:** Limited by Salesforce callout timeout (300 seconds)
- **API Limits:** Subject to Salesforce API call limits
- **Response Size:** Large barcode responses may be truncated

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
- Monitor response times and adjust timeouts
- Validate barcode data for accuracy
- Handle multiple barcode types appropriately

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For Salesforce issues, consult [Salesforce Developer documentation](https://developer.salesforce.com/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 