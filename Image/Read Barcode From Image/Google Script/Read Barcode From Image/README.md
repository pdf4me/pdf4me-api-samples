# Read Barcode From Image - Google Apps Script

This Google Apps Script reads barcodes from images using the PDF4Me API. It can detect and decode various types of barcodes including QR codes, Code 128, Code 39, EAN-13, and many others.

## Prerequisites

- Google Apps Script access
- PDF4Me API key
- Google Drive with Input and Output folders
- An image file containing barcodes in the Input folder

## Setup

1. **Create Google Apps Script Project:**
   - Go to [Google Apps Script](https://script.google.com/)
   - Create a new project
   - Copy the code from `read_barcode_from_image.gs`

2. **Configure API Key:**
   ```javascript
   // Set your PDF4Me API key
   var apiKey = 'YOUR_API_KEY_HERE';
   ```

3. **Set up Google Drive Folders:**
   - Create a folder named "Input" in your Google Drive
   - Create a folder named "Output" in your Google Drive
   - Place your image file in the Input folder

4. **Configure File Names:**
   ```javascript
   var inputFileName = 'input.jpg';
   var outputFileName = 'barcode_data.txt';
   ```

## Usage

1. **Prepare your image file:**
   - Place your image file in the Input folder
   - Update the `inputFileName` variable to match your file name

2. **Configure barcode reading settings:**
   ```javascript
   var barcodeType = 'all'; // 'all', 'qr', 'code128', 'code39', 'ean13', etc.
   ```

3. **Run the script:**
   - Save the script
   - Click the "Run" button
   - Grant necessary permissions when prompted

4. **Check results:**
   - The barcode data will be saved as a text file in the Output folder
   - Check the execution logs for detailed barcode information

## API Endpoint

- **URL:** `https://api.pdf4me.com/api/v2/ReadBarcodeFromImage`
- **Method:** POST
- **Authentication:** Bearer token

## Request Payload

```json
{
  "imageContent": "base64_encoded_image_content",
  "barcodeType": "all",
  "isAsync": true
}
```

## Configuration Options

### Barcode Types
- **all:** Detect all supported barcode types (recommended)
- **qr:** QR Code only
- **code128:** Code 128 only
- **code39:** Code 39 only
- **ean13:** EAN-13 only
- **ean8:** EAN-8 only
- **upca:** UPC-A only
- **upce:** UPC-E only
- **datamatrix:** Data Matrix only
- **pdf417:** PDF417 only
- **aztec:** Aztec Code only

## Supported Barcode Formats

### 1D Barcodes
- **Code 128:** Alphanumeric barcode, widely used in logistics
- **Code 39:** Alphanumeric barcode, common in industrial applications
- **EAN-13:** 13-digit European Article Number
- **EAN-8:** 8-digit European Article Number
- **UPC-A:** 12-digit Universal Product Code
- **UPC-E:** Compressed 8-digit UPC
- **Interleaved 2 of 5:** Numeric barcode
- **Codabar:** Alphanumeric barcode

### 2D Barcodes
- **QR Code:** Quick Response code, supports text, URLs, contact info
- **Data Matrix:** High-density 2D barcode
- **PDF417:** Portable Data File 417
- **Aztec Code:** 2D matrix barcode
- **MaxiCode:** Used by UPS for package tracking

## Supported Input Formats

- JPG (JPEG)
- PNG
- GIF
- BMP
- TIFF
- WebP
- And other common image formats

## Output Format

- JSON text file containing barcode data
- Each barcode includes:
  - **type:** Barcode format (QR, Code128, etc.)
  - **value:** Decoded barcode content
  - **confidence:** Recognition confidence level (if available)

## Error Handling

The script includes comprehensive error handling:

- **File not found:** Checks if input file exists
- **API errors:** Handles HTTP error responses
- **Authentication errors:** Validates API key
- **Processing errors:** Monitors async job status
- **Timeout handling:** Prevents infinite polling
- **No barcodes found:** Handles cases where no barcodes are detected

## Troubleshooting

### Common Issues

1. **"File not found" error:**
   - Ensure the input file exists in the Input folder
   - Check the `inputFileName` variable matches your file name

2. **"API key invalid" error:**
   - Verify your PDF4Me API key is correct
   - Ensure the API key has sufficient permissions

3. **"Processing failed" error:**
   - Check if the image file is corrupted
   - Ensure image format is supported
   - Verify image contains readable barcodes

4. **"No barcodes found" result:**
   - Check image quality and resolution
   - Ensure barcodes are clearly visible and readable
   - Verify barcode type setting matches the actual barcode
   - Check if barcode is damaged or partially obscured

5. **"Timeout" error:**
   - Large or complex images may take longer to process
   - Increase the `maxAttempts` value if needed

### Performance Tips

- Use high-quality images for better barcode recognition
- Ensure good contrast between barcode and background
- Avoid heavily compressed or low-resolution images
- Position barcodes clearly in the image
- Use appropriate barcode type setting for faster processing

## Security Considerations

- Store your API key securely
- Don't share your script with API keys exposed
- Use environment variables or secure storage for production
- Regularly rotate your API keys
- Be aware that barcode data may contain sensitive information

## Performance Notes

- Processing time depends on image size and barcode complexity
- Large images may require async processing
- Recognition accuracy depends on image quality and barcode clarity
- Network latency may impact response times

## Best Practices

1. **Image quality:** Use clear, high-resolution images
2. **Barcode clarity:** Ensure barcodes are well-contrasted and readable
3. **Type selection:** Use 'all' for general scanning, specific types for targeted scanning
4. **Testing:** Test with sample images before processing large batches
5. **Error handling:** Monitor for failed recognitions and adjust settings

## Example Use Cases

### Inventory Management
- Scan product barcodes for inventory tracking
- Process shipping labels and tracking codes
- Read warehouse location codes
- Verify product identification

### Retail Operations
- Scan product barcodes for pricing
- Process customer loyalty cards
- Read promotional codes
- Verify product authenticity

### Document Processing
- Extract data from forms with barcodes
- Process ID cards and badges
- Read QR codes from business cards
- Scan event tickets and passes

### Logistics and Shipping
- Read tracking barcodes from packages
- Process shipping labels
- Scan warehouse location codes
- Verify delivery confirmations

## Barcode Recognition Quality Factors

### Image Quality
- **Resolution:** Higher resolution = better recognition
- **Contrast:** Clear contrast between barcode and background
- **Focus:** Sharp, in-focus images work best
- **Lighting:** Well-lit images with minimal shadows

### Barcode Characteristics
- **Size:** Larger barcodes are easier to recognize
- **Quality:** Undamaged, clear barcodes work best
- **Orientation:** Horizontal orientation is most accurate
- **Type:** Standard barcode formats are more reliable

### Processing Settings
- **Barcode type:** Specific type selection can improve accuracy
- **Image preprocessing:** Clean, uncluttered images work best

## Output Example

```json
[
  {
    "type": "QR",
    "value": "https://example.com/product/12345",
    "confidence": 0.95
  },
  {
    "type": "Code128",
    "value": "ABC123456789",
    "confidence": 0.88
  }
]
```

## Support

For issues related to:
- **PDF4Me API:** Contact PDF4Me support
- **Google Apps Script:** Check Google Apps Script documentation
- **Google Drive:** Refer to Google Drive help

## Additional Notes

- Barcode recognition accuracy varies based on image quality and barcode characteristics
- Multiple barcodes in a single image are all detected and reported
- Processing preserves original image file
- Confidence levels indicate recognition reliability
- Some barcode types may require specific image quality standards 