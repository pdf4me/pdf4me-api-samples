# ReadBarcodeFromPDF

A C# implementation for reading barcode images from PDF documents using the PDF4me API.

## Project Structure

```
ReadBarcodeFromPDF/
├── Program.cs                # Main application with complete barcode reading logic
├── ReadBarcodeFromPDF.csproj # C# project file
├── Read_barcode_output.json  # Output barcode data
├── README.md                 # This file
├── ReadBarcodeFromPDF.sln    # Solution file
├── global.json               # .NET version config (if present)
├── sample.pdf                # Sample PDF file for testing
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

- .NET 6.0 or higher
- Visual Studio 2022+ (recommended) or VS Code
- Internet connection (for PDF4me API access)
- Valid PDF4me API key

## Setup

### 1. Get API Key
First, you need to get a valid API key from PDF4me:
1. Visit https://dev.pdf4me.com/dashboard/#/api-keys/
2. Create an account and generate an API key
3. Replace the placeholder in `Program.cs`:
   ```csharp
   public static readonly string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
   ```

### 2. Open in Visual Studio

1. **Open the project:**
   - Open Visual Studio
   - Select "Open a project or solution" and choose `ReadBarcodeFromPDF.sln`

2. **Restore NuGet packages:**
   - Visual Studio will prompt to restore packages if needed

3. **Set up .NET version:**
   - Ensure the project targets .NET 6.0 or higher (see `global.json` if present)

## Usage

### Build and Run

1. **Build the project:**
   ```bash
   dotnet build
   ```

2. **Run the application:**
   ```bash
   dotnet run
   ```

### Input and Output

- **Input:** 
  - PDF document containing barcodes (configured in Program.cs)
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

1. **Program Class:**
   - Entry point for the application
   - Configuration constants (API key, URLs, settings)
   - HTTP client initialization

2. **Key Methods:**
   - `ReadBarcodesAsync()`: Main method for barcode reading
   - File I/O operations with proper error handling

### Key Features

- **Async Processing:** Handles both sync and async API responses
- **Retry Logic:** Implements polling with configurable retry attempts
- **Error Handling:** Comprehensive exception handling and logging
- **File Management:** Efficient PDF I/O with proper resource management
- **HTTP Client:** Uses HttpClient for HTTP operations

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
   - Ensure you have set a valid API key in `Program.cs`
   - Check that your API key is active and has sufficient credits

2. **Build Errors:**
   - Ensure you're using .NET 6.0 or higher
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