# AddBarcode

A C# implementation for adding barcodes to PDF documents using the PDF4me API.

## Project Structure

```
AddBarcode/
├── Program.cs                # Main application with complete barcode logic
├── AddBarcode.csproj         # C# project file
├── sample.pdf                # Sample PDF file for testing
├── sample.barcoded.pdf       # Output PDF with barcode
├── README.md                 # This file
├── AddBarcode.sln            # Solution file
└── global.json               # .NET version config (if present)
```

## Project Status

✅ **IMPLEMENTATION COMPLETE** - Full Add Barcode functionality is implemented and working.

## Features

- ✅ Add various barcode types to PDF documents
- ✅ Control over position, size, and appearance
- ✅ Async API calling support
- ✅ Handles both synchronous and asynchronous API responses
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
   private const string ApiKey = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
   ```

### 2. Open in Visual Studio

1. **Open the project:**
   - Open Visual Studio
   - Select "Open a project or solution" and choose `AddBarcode.sln`

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
  - `sample.pdf` (PDF file to process)
- **Output:** `sample.barcoded.pdf` (PDF with barcode)

## API Configuration

The application uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/addbarcode`
- **Authentication:** Basic authentication with API key
- **Features:** Add barcode, PDF modification

## Barcode Settings

The current implementation uses these settings:
- **Text:** "PDF4me Barcode Sample"
- **Barcode Type:** "qrCode"
- **Pages:** "1-3"
- **Align X/Y:** "Right"/"Bottom"
- **Height/Width:** 40mm (113pt)
- **Margin:** 20mm (57pt)
- **Opacity:** 100
- **Display Text:** "below"
- **Hide Text:** false
- **Show Only In Print:** false
- **Is Text Above:** false
- **Async Processing:** true (recommended for large files)

## Implementation Details

### Main Components

1. **Program Class:**
   - Entry point for the application
   - Configuration constants (API key, URLs, retry settings)
   - HTTP client initialization

2. **Key Methods:**
   - `AddBarcodeToPdf()`: Main method for barcode addition
   - `ExecuteBarcodeAddition()`: HTTP requests and API integration
   - File I/O operations with proper error handling

### Key Features

- **Async Processing:** Handles both sync and async API responses
- **Retry Logic:** Implements polling with configurable retry attempts
- **Error Handling:** Comprehensive exception handling and logging
- **File Management:** Efficient file I/O with proper resource management
- **HTTP Client:** Uses HttpClient for modern HTTP operations

## Error Handling

The application handles various error scenarios:
- **401 Unauthorized:** Invalid or missing API key
- **404 Not Found:** Input file not found
- **202 Accepted:** Async processing (handled with polling)
- **500 Server Error:** API server issues
- **Timeout:** Long-running operations that exceed retry limits

## Sample Files

### sample.pdf
A sample PDF document that will be used for testing barcode addition.

### sample.barcoded.pdf
A sample output file showing the expected result after barcode addition.

## Expected Workflow

1. Load the PDF document
2. Validate the document format
3. Prepare barcode parameters
4. Call the PDF4me API to add the barcode
5. Handle the response (sync/async)
6. Save the resulting PDF with barcode
7. Provide status feedback to the user

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error:**
   - Ensure you have set a valid API key in `Program.cs`
   - Check that your API key is active and has sufficient credits

2. **File Not Found:**
   - Make sure `sample.pdf` exists in the project root
   - Check file permissions

3. **Build Errors:**
   - Ensure you're using .NET 6.0 or higher
   - Check that all source files are in the correct location

4. **Network Issues:**
   - Verify internet connectivity
   - Check firewall settings
   - Ensure the PDF4me API is accessible

## Performance Notes

- **Small Files (< 5MB):** Usually processed synchronously (200 response)
- **Large Files (> 5MB):** Processed asynchronously (202 response with polling)
- **Processing Time:** Depends on file size, barcode complexity, and server load
- **Retry Settings:** Configurable via retry constants in the code

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch processing multiple files
- [ ] Configurable barcode settings via command line
- [ ] Progress reporting for long-running operations
- [ ] Support for additional barcode types
- [ ] Web-based user interface 