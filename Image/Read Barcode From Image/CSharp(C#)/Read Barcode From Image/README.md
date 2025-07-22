# Read Barcode From Image (C#)

A C# sample project for reading barcodes from images using the PDF4Me API.

## Project Structure

```
Read Barcode From Image/
├── Program.cs                           # Main program with barcode reading logic
├── Read_Barcode_From_Image.csproj       # Project file
├── Read_Barcode_From_Image.sln          # Solution file
├── global.json                          # .NET SDK configuration
├── sample.jpg                           # Sample input image with barcode
├── sample.png                           # Sample input image
└── README.md                            # This file
```

## Features

- ✅ Read multiple barcode types from images
- ✅ Support for various barcode formats (QR, UPC, Code128, EAN, etc.)
- ✅ Support for multiple image formats (JPG, PNG)
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations with configurable retry logic
- ✅ Comprehensive error handling and logging
- ✅ Modern C# async/await patterns
- ✅ Strongly typed API integration
- ✅ JSON output format with structured barcode data
- ✅ Detailed response logging for debugging

## Prerequisites

- .NET 8.0 SDK or later
- Visual Studio 2022, VS Code, or any .NET-compatible IDE
- Internet connection (for PDF4Me API access)
- PDF4Me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))

## Setup

1. **Install .NET SDK:**
   - Download and install .NET 8.0 SDK from [Microsoft](https://dotnet.microsoft.com/download)

2. **Configure your API key:**
   - Open `Program.cs`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4Me API key

3. **Prepare your image:**
   - Place your input image in the project directory
   - Update the `imagePath` variable in the `Main` method if needed

## Usage

1. **Set the input image and image type (optional):**
   - Edit the `imagePath` and image type in `Program.cs` if needed

2. **Build and run the project:**
   ```bash
   dotnet build
   dotnet run
   ```

   Or run directly:
   ```bash
   dotnet run
   ```

### Input and Output

- **Input:** Image file containing barcode(s) (default: `sample.jpg`)
- **Output:** JSON string with barcode data (displayed in console and can be saved to file)

## Configuration

- **API Key:** Set in `Program.cs` as `API_KEY` constant
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
- Timeout for async operations (configurable retry logic)
- Network connectivity issues
- File I/O errors
- Invalid image type
- JSON serialization errors
- No barcode found in image

## Code Structure

The project consists of two main classes:

### Program Class
- **Main method:** Entry point that orchestrates the barcode reading process
- **Configuration:** API key and base URL constants

### BarcodeReader Class
- **Constructor:** Initializes reader with HTTP client, file paths, and API key
- **ReadBarcodesFromImageAsync:** Main reading method with async/await pattern
- **GetImageTypeFromExtension:** Utility method to determine image type from file extension
- **FormatBarcodeData:** Utility method to format and parse barcode data

## Troubleshooting

### Common Issues

1. **"Image file not found"**
   - Ensure the input image file exists in the project directory
   - Check the file path in the `imagePath` variable

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the image format is supported

3. **"Polling timeout"**
   - Large images may take longer to process
   - Increase `maxRetries` or `retryDelay` in the polling logic

4. **"No barcode found"**
   - Ensure the image contains a clear, readable barcode
   - Check image quality and resolution
   - Verify barcode is not damaged or obscured

5. **"Invalid image type"**
   - Ensure image type is "JPG" or "PNG"
   - Check that the image format matches the specified type

6. **Build errors**
   - Ensure .NET 8.0 SDK is installed
   - Run `dotnet restore` to restore packages
   - Check that all files are in the correct directory structure

### Debugging

- Add `Console.WriteLine` statements for additional output
- Check exception messages for details
- Use Visual Studio debugger or `dotnet run --verbosity normal`
- Verify image quality and barcode clarity

## Development

### Building for Release
```bash
dotnet build --configuration Release
```

### Running Tests
```bash
dotnet test
```

### Publishing
```bash
dotnet publish --configuration Release
```

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

## Dependencies

- **System.Net.Http:** For HTTP client functionality
- **System.Text.Json:** For JSON serialization
- **Built-in .NET libraries:** No external NuGet packages required

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For C# issues, consult [Microsoft .NET documentation](https://docs.microsoft.com/en-us/dotnet/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 