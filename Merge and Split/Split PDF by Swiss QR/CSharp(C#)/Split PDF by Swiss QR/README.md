# Split PDF by Swiss QR - C# Implementation

This project demonstrates how to split PDF files by Swiss QR barcode using the PDF4Me API with C#.

## ✅ Features

- Split PDF documents by Swiss QR barcode detection
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- Multiple barcode filter options (startsWith, contains, equals)
- Configurable split positions (before, after barcode)
- Option to combine pages with same consecutive barcodes
- Cross-platform compatibility

## Prerequisites

- .NET Framework 4.7.2 or higher / .NET Core 2.1 or higher
- PDF4Me API key
- Visual Studio 2019 or later (recommended)
- Internet connection for API access

## Project Structure

```
Split PDF by Swiss QR/
├── Program.cs                 # Main application logic
├── README.md                  # This documentation
├── global.json               # .NET SDK configuration
├── Split_PDF_by_Swiss_QR.csproj  # Project file
├── Split_PDF_by_Swiss_QR.sln     # Solution file
├── sample.pdf                # Sample input PDF file
└── swiss_qr_split_output/    # Output directory for split PDFs
    └── swiss_qr_split_result.zip  # Generated split PDF archive
```

## Setup

1. **Clone or download this project**
2. **Configure your API key** in `Program.cs`:
   ```csharp
   public static readonly string API_KEY = "your-api-key-here";
   ```
3. **Place your input file** in the project directory:
   - `sample.pdf` - Your PDF file with Swiss QR barcodes
4. **Run the application**:
   ```bash
   dotnet run
   ```

## Usage

The application will:
1. Read the input PDF file
2. Convert it to Base64
3. Send a request to split the PDF by Swiss QR barcode
4. Handle the response (synchronous or asynchronous)
5. Save the split PDF files as a ZIP archive

### Expected Output

```
=== Splitting PDF by QR Code Barcode ===
Input PDF file: sample.pdf
Output directory: swiss_qr_split_output
Barcode string: hello
Barcode filter: startsWith
Barcode type: qrcode
Split position: before
Combining pages with same consecutive barcodes: True
PDF render DPI: 1
Reading and encoding PDF file...
PDF file read successfully: 12345 bytes
Sending split PDF by barcode request...
Status code: 202
Request accepted. Processing asynchronously...
Polling URL: https://api.pdf4me.com/api/v2/SplitPdfByBarcode_old/...
Polling attempt 1/10...
PDF splitting completed successfully!
Split PDFs saved to: swiss_qr_split_output/swiss_qr_split_result.zip
PDF splitting operation completed successfully!
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/v2/SplitPdfByBarcode_old
```

## Specific Settings

### Barcode Splitting Parameters
- **docContent**: Base64 encoded PDF content
- **docName**: Output document name
- **barcodeString**: The barcode string to search for
- **barcodeFilter**: Filter type for barcode matching (startsWith, contains, equals)
- **barcodeType**: Type of barcode (qrcode, code128, code39, etc.)
- **splitBarcodePage**: Where to split relative to barcode (before, after)
- **combinePagesWithSameConsecutiveBarcodes**: Whether to combine pages with same consecutive barcodes
- **pdfRenderDpi**: DPI for PDF rendering
- **async**: `true` for asynchronous processing (recommended for large files)

## Implementation Details

### Key Components

1. **File Reading**: Reads PDF file and converts to Base64
2. **Request Building**: Constructs JSON payload with PDF content and barcode parameters
3. **API Communication**: Sends HTTP POST request to PDF4Me API
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Processing**: Saves the split PDF files as a ZIP archive

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format
- **Polling Timeout**: Handles cases where async processing takes too long

## API Endpoints

### Split PDF by Barcode
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/SplitPdfByBarcode_old`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload

```json
{
  "docContent": "base64-encoded-pdf-content",
  "docName": "output.pdf",
  "barcodeString": "hello",
  "barcodeFilter": "startsWith",
  "barcodeType": "qrcode",
  "splitBarcodePage": "before",
  "combinePagesWithSameConsecutiveBarcodes": true,
  "pdfRenderDpi": "1",
  "async": true
}
```

## Response Handling

### Success Response (200 OK)
- Returns the split PDF files as a ZIP archive

### Asynchronous Response (202 Accepted)
```json
{
  "jobId": "job-12345",
  "status": "Accepted"
}
```

## Error Handling

The application includes comprehensive error handling for:

- **File Operations**: Missing files, permission issues
- **API Communication**: Network errors, timeouts
- **Response Processing**: Invalid responses, unexpected status codes
- **Base64 Operations**: Encoding/decoding errors
- **Polling Operations**: Timeout handling for async operations

## Dependencies

- **System.Net.Http**: HTTP client for API communication
- **System.Text.Json**: JSON serialization/deserialization
- **System.IO**: File operations
- **System.Text**: Base64 encoding/decoding

## Security Considerations

- **API Key Protection**: Store API keys securely, not in source code
- **File Validation**: Validate input files before processing
- **Error Information**: Avoid exposing sensitive information in error messages
- **HTTPS**: All API communications use HTTPS

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify your API key is correct
   - Check if the key has necessary permissions

2. **File Not Found**
   - Ensure `sample.pdf` exists in the project directory
   - Check file permissions

3. **Network Errors**
   - Verify internet connection
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid PDF Format**
   - Ensure input file is a valid PDF document
   - Check if document is corrupted or password-protected

5. **Barcode Not Found**
   - Ensure the PDF contains Swiss QR barcodes
   - Verify the barcode string matches exactly
   - Check barcode filter settings

6. **Polling Timeout**
   - Large PDFs may take longer to process
   - Increase max retry count if needed
   - Check server status

### Debug Mode

Enable detailed logging by setting:
```csharp
private const bool DEBUG_MODE = true;
```

## Sample Files

- **sample.pdf**: Sample PDF file with Swiss QR barcodes
- **swiss_qr_split_result.zip**: Generated archive containing split PDF files

## Expected Workflow

1. **Input**: PDF document with Swiss QR barcodes
2. **Processing**: Split PDF at specified barcode positions
3. **Output**: ZIP archive containing individual PDF files

## Barcode Configuration Options

### Barcode Filter Types
- **startsWith**: Matches barcodes that start with the specified string
- **contains**: Matches barcodes that contain the specified string
- **equals**: Matches barcodes that exactly equal the specified string

### Split Positions
- **before**: Split before the page containing the barcode
- **after**: Split after the page containing the barcode

### Barcode Types
- **qrcode**: QR Code (including Swiss QR)
- **code128**: Code 128 barcode
- **code39**: Code 39 barcode
- **pdf417**: PDF417 barcode
- **datamatrix**: Data Matrix barcode

## Next Steps

- Implement batch processing for multiple files
- Add support for different barcode types
- Integrate with web interface
- Add progress tracking for large files
- Add preview functionality

## Future Enhancements

- **GUI Interface**: Create Windows Forms or WPF application
- **Batch Processing**: Handle multiple PDF documents simultaneously
- **Preview Feature**: Show split points before processing
- **Custom Options**: Configure barcode detection sensitivity
- **Advanced Options**: Support for multiple barcode types in one document
- **Export Options**: Support for different output formats

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **C# Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 