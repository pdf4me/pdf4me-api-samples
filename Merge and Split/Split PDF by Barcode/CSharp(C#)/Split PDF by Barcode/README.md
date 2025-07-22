# Split PDF by Barcode (C#)

A C# sample project for splitting PDF documents based on barcode detection using the PDF4Me API.

## Project Structure

```
Split PDF by Barcode/
├── Program.cs                              # Main program with PDF barcode splitting logic
├── Split_PDF_by_Barcode.csproj             # Project file
├── Split_PDF_by_Barcode.sln                # Solution file
├── global.json                             # .NET SDK configuration
├── sample.pdf                              # Sample input PDF with barcodes
├── barcode_split_output/                   # Output directory for split PDFs
│   └── barcode_split_result.zip            # ZIP file containing split PDFs (generated)
└── README.md                               # This file
```

## Features

- ✅ Split PDF documents based on barcode detection
- ✅ Support for multiple barcode types (QR, DataMatrix, PDF417, etc.)
- ✅ Configurable barcode filtering options
- ✅ Flexible split positioning (before, after, remove)
- ✅ Option to combine consecutive pages with same barcodes
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations with configurable retry logic
- ✅ Comprehensive error handling and logging
- ✅ Modern C# async/await patterns
- ✅ Strongly typed API integration
- ✅ Detailed response logging for debugging
- ✅ Automatic ZIP file extraction and PDF saving

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

3. **Prepare your PDF file:**
   - Place your input PDF with barcodes in the project directory
   - Update the `inputPdfPath` variable in the `Main` method if needed

## Usage

1. **Set the input PDF and barcode parameters (optional):**
   - Edit the `inputPdfPath`, `barcodeString`, `barcodeFilter`, `barcodeType`, and `splitBarcodePage` in `Program.cs` if needed

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

- **Input:** PDF file with embedded barcodes (default: `sample.pdf`)
- **Output:** ZIP file containing split PDFs in `barcode_split_output/` directory

## Configuration

- **API Key:** Set in `Program.cs` as `API_KEY` constant
- **API Endpoint:** `https://api.pdf4me.com/api/v2/SplitPdfByBarcode_old`
- **Supported Formats:** PDF files with embedded barcodes
- **Timeout:** 300 seconds (5 minutes) for large PDFs

## Barcode Split Options

The API supports various barcode splitting configurations:

### Barcode String
```csharp
"barcodeString": "Test PDF Barcode"  // Barcode text to search for
```

### Barcode Filter
```csharp
"barcodeFilter": "startsWith"  // Filter type options
```

Filter options:
- **startsWith:** Split when barcode starts with the specified string
- **endsWith:** Split when barcode ends with the specified string
- **contains:** Split when barcode contains the specified string
- **exact:** Split when barcode exactly matches the specified string

### Barcode Type
```csharp
"barcodeType": "any"  // Barcode type options
```

Supported barcode types:
- **any:** Detect all barcode types
- **datamatrix:** DataMatrix barcodes only
- **qrcode:** QR codes only
- **pdf417:** PDF417 barcodes only

### Split Position
```csharp
"splitBarcodePage": "after"  // Split position options
```

Split position options:
- **before:** Split before the page containing the barcode
- **after:** Split after the page containing the barcode
- **remove:** Remove the page containing the barcode

### Additional Options
```csharp
"combinePagesWithSameConsecutiveBarcodes": true,  // Combine consecutive pages
"pdfRenderDpi": "1"                               // PDF render DPI
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/SplitPdfByBarcode_old`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)
- **Response:**
  - 200: ZIP file containing split PDFs (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `docContent`: Base64 encoded PDF content
- `docName`: Output PDF file name
- `barcodeString`: Barcode text to search for
- `barcodeFilter`: Filter type (startsWith, endsWith, contains, exact)
- `barcodeType`: Barcode type (any, datamatrix, qrcode, pdf417)
- `splitBarcodePage`: Split position (before, after, remove)
- `combinePagesWithSameConsecutiveBarcodes`: true/false
- `pdfRenderDpi`: PDF render DPI (string)
- `async`: true/false (async recommended for large PDFs)

## Error Handling

- Invalid PDF file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations (configurable retry logic)
- Network connectivity issues
- File I/O errors
- Missing barcodes in PDF
- PDF processing failures

## Code Structure

The project consists of two main classes:

### Program Class
- **Main method:** Entry point that orchestrates the PDF barcode splitting process
- **Configuration:** API key and base URL constants

### PdfBarcodeSplitter Class
- **Constructor:** Initializes splitter with HTTP client, file paths, and API key
- **SplitByBarcodeAsync:** Main barcode splitting method with async/await pattern
- **ExecuteBarcodeSplitAsync:** Handles API communication and response processing
- **Automatic ZIP extraction:** Extracts and saves split PDFs from ZIP response

## Troubleshooting

### Common Issues

1. **"PDF file not found"**
   - Ensure the input PDF file exists in the project directory
   - Check the file path in the `inputPdfPath` variable

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the PDF file is valid

3. **"Polling timeout"**
   - Large PDFs may take longer to process
   - Increase `maxRetries` or `retryDelay` in the polling logic

4. **"No barcodes found"**
   - Verify the PDF contains barcodes
   - Check barcode type and filter settings
   - Ensure barcode string matches exactly

5. **"Split not working as expected"**
   - Verify barcode detection settings
   - Check split position configuration
   - Test with different filter options

6. **"Build errors"**
   - Ensure .NET 8.0 SDK is installed
   - Run `dotnet restore` to restore packages
   - Check that all files are in the correct directory structure

### Debugging

- Add `Console.WriteLine` statements for additional output
- Check exception messages for details
- Use Visual Studio debugger or `dotnet run --verbosity normal`
- Verify PDF file integrity

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

## Use Cases

### Document Processing
- Split invoices by customer barcodes
- Separate forms by batch numbers
- Divide reports by section identifiers
- Organize documents by category codes

### Business Applications
- Process bulk document workflows
- Automate document routing
- Separate contracts by client codes
- Split invoices by payment references

### Logistics and Inventory
- Process shipping documents by tracking codes
- Split inventory reports by product codes
- Organize delivery notes by route codes
- Separate manifests by destination codes

### Compliance and Legal
- Split legal documents by case numbers
- Organize compliance reports by regulation codes
- Separate audit documents by department codes
- Process certificates by serial numbers

## Performance Considerations

- **PDF Size:** Larger PDFs take longer to process
- **Barcode Count:** More barcodes increase processing time
- **Barcode Type:** Complex barcodes may require more processing
- **Network:** Stable internet connection improves reliability
- **Memory:** Large PDFs require sufficient memory

## Best Practices

### PDF Preparation
- Ensure PDFs contain clear, readable barcodes
- Use high-quality scans for better barcode detection
- Verify barcode format and encoding
- Test with sample documents first

### Barcode Configuration
- Use appropriate barcode type settings
- Choose correct filter options for your use case
- Test split positions with sample data
- Validate barcode string matching

### Processing
- Use async processing for large PDFs
- Monitor response times and adjust timeouts
- Validate output files for completeness
- Handle multiple split operations appropriately

## Dependencies

- **System.Net.Http:** For HTTP client functionality
- **System.Text.Json:** For JSON serialization
- **System.IO.Compression:** For ZIP file handling
- **Built-in .NET libraries:** No external NuGet packages required

## Support

- For PDF4Me API issues, refer to [PDF4Me API documentation](https://developer.pdf4me.com/docs/api/)
- For C# issues, consult [Microsoft .NET documentation](https://docs.microsoft.com/en-us/dotnet/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 