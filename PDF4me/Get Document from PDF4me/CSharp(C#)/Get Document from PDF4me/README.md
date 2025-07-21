# Get Document from PDF4me (C#)

A C# .NET sample project for splitting PDF documents by Swiss QR barcode using the PDF4me API.

## Project Structure

```
Get Document from PDF4me/
├── Program.cs                           # Main program with barcode splitting logic
├── Get_Document_from_PDF4me.csproj      # Project file with dependencies
├── Get_Document_from_PDF4me.sln         # Solution file
├── global.json                          # .NET SDK configuration
├── sample.pdf                           # Sample PDF file for testing
├── swiss_qr_split_output/               # Output folder for split PDF archive
└── README.md                            # This file
```

## Features

- ✅ Split PDF by Swiss QR barcode using PDF4me API
- ✅ Support for various barcode types (QR Code, Code128, Code39)
- ✅ Configurable barcode filtering options
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ File I/O operations with proper error handling
- ✅ Modern C# async/await patterns
- ✅ .NET 8.0 compatibility

## Prerequisites

- .NET 8.0 SDK or later
- Visual Studio 2022, VS Code, or any .NET-compatible IDE
- Internet connection (for PDF4me API access)
- PDF4me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))

## Setup

1. **Install .NET SDK:**
   - Download and install .NET 8.0 SDK from [Microsoft](https://dotnet.microsoft.com/download)

2. **Configure your API key:**
   - Open `Program.cs`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4me API key

3. **Prepare your document:**
   - Place your PDF file in the project directory
   - Update the `pdfPath` variable in `Program.cs` if needed

## Usage

### Method 1: Using Visual Studio

1. **Open the solution:**
   ```bash
   # Open Get_Document_from_PDF4me.sln in Visual Studio
   # Or use command line:
   dotnet open Get_Document_from_PDF4me.sln
   ```

2. **Build and run:**
   ```bash
   dotnet build
   dotnet run
   ```

### Method 2: Using Command Line

1. **Navigate to the project directory:**
   ```bash
   cd Get Document from PDF4me
   ```

2. **Restore dependencies and run:**
   ```bash
   dotnet restore
   dotnet run
   ```

### Input and Output

- **Input:** PDF file with barcodes (default: `sample.pdf`)
- **Output:** ZIP archive with split PDF files (default: `swiss_qr_split_output/swiss_qr_split_result.zip`)

## Configuration

- **API Key:** Set in `Program.cs`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/SplitPdfByBarcode_old`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF content
  - `docName`: Output document name
  - `barcodeString`: Text to search for in barcodes
  - `barcodeFilter`: "startsWith", "contains", "equals"
  - `barcodeType`: "qrcode", "code128", "code39"
  - `splitBarcodePage`: "before" or "after"
  - `combinePagesWithSameConsecutiveBarcodes`: true/false
  - `pdfRenderDpi`: DPI for PDF rendering
  - `async`: true/false (async recommended for large files)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/SplitPdfByBarcode_old`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: ZIP archive with split PDFs
  - 202: Accepted, poll the URL in the `Location` header for completion

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

4. **"No barcodes found"**
   - The PDF may not contain any barcodes
   - Check if the PDF actually has barcodes

5. **"ZIP extraction failed"**
   - The response may not be a valid ZIP file
   - Check the response content type and format

### Debugging

- Use Visual Studio debugger or add console output
- Check exception messages in the console
- Review the generated output files
- Enable detailed logging in the code

## Output Structure

After successful splitting, you'll find:
- `swiss_qr_split_output/swiss_qr_split_result.zip`: Contains split PDF files
- Console output with status and result path

## Support

- For PDF4me API issues, refer to [PDF4me API documentation](https://developer.pdf4me.com/docs/api/)
- For .NET issues, consult [Microsoft .NET Documentation](https://docs.microsoft.com/en-us/dotnet/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 