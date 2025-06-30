# Read Barcode From Image - Java Implementation

This Java application demonstrates how to read barcodes from images using the PDF4me API.

## Features

- Reads barcodes from various image formats (JPG, PNG, GIF, BMP, TIFF, WEBP)
- Handles both synchronous (200) and asynchronous (202) API responses
- Comprehensive error handling and logging
- Automatic barcode data formatting and file saving
- Detailed response information for debugging

## Files

- `src/Main.java` - Main application with BarcodeReader class
- `sample.jpg` - Sample JPG image for testing
- `sample.png` - Sample PNG image for testing  
- `sample_barcode_data.json` - Output file containing barcode data (generated after execution)

## Usage

1. **Compile the application:**
   ```bash
   javac -d . src/Main.java
   ```

2. **Run the application:**
   ```bash
   java Main
   ```

3. **Check the output:**
   - The application will process the image and save barcode data to `sample_barcode_data.json`
   - Console output will show detailed processing information

## API Response

The application handles different scenarios:

- **Barcodes found**: JSON response with barcode array containing detected barcode data
- **No barcodes found**: Response with `"barcode":null` indicating no barcodes detected
- **Processing errors**: Detailed error messages and status codes

## Configuration

- **API Endpoint**: `https://api.pdf4me.com/`
- **Input Image**: Modify `imagePath` variable in `Main.java` to use different images
- **API Key**: Configured for development environment

## Sample Output

For images without barcodes:
```json
{"barcode":null,"traceId":"unique-trace-id","jobId":null}
```

For images with barcodes:
```json
{
  "barcodes": [
    {
      "type": "QR_CODE",
      "data": "barcode content",
      "position": {...}
    }
  ]
}
```

## Requirements

- Java 11 or higher
- Internet connection for API access
- Valid PDF4me API key

## Error Handling

The application includes comprehensive error handling for:
- File I/O operations
- Network connectivity issues
- API timeout scenarios
- Invalid image formats
- Authentication failures 