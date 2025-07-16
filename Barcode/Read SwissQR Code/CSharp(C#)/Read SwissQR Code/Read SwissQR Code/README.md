# Read SwissQR Code

A C# implementation for reading Swiss QR codes from PDF documents using the PDF4me API.

## Project Structure

```
Read SwissQR Code/
├── Program.cs                    # Main application with complete Swiss QR reading logic
├── Read SwissQR Code.csproj      # C# project file
├── read_swissqr_code_output.json # Output Swiss QR data
├── README.md                     # This file
├── Read SwissQR Code.sln         # Solution file
├── global.json                   # .NET version config (if present)
├── sample.pdf                    # Sample PDF file for testing
```

## Project Status

✅ **IMPLEMENTATION COMPLETE** - Full Swiss QR code reading functionality is implemented and working.

## Features

- ✅ Read Swiss QR codes from PDF documents
- ✅ Extract structured Swiss QR code data
- ✅ Async API calling support with extended polling
- ✅ Comprehensive error handling and logging
- ✅ JSON output with Swiss QR code details

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
   - Select "Open a project or solution" and choose `Read SwissQR Code.sln`

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
  - PDF document containing Swiss QR codes (configured in Program.cs)
- **Output:** `read_swissqr_code_output.json` (extracted Swiss QR data)

## API Configuration

The application uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ReadSwissQR`
- **Authentication:** Basic authentication with API key
- **Features:** Read Swiss QR code data from PDF documents

## Swiss QR Code Reading Settings

The implementation supports these settings:
- **PDF Input:** Configurable PDF file path
- **Output Format:** JSON with Swiss QR code data and metadata
- **Async Processing:** Extended polling with 20 retries (10-second intervals)
- **Error Handling:** Comprehensive error handling and fallback mechanisms

## Implementation Details

### Main Components

1. **Program Class:**
   - Entry point for the application
   - Configuration constants (API key, URLs, settings)
   - HTTP client initialization

2. **Key Methods:**
   - `ReadSwissQrAsync()`: Main method for Swiss QR reading
   - File I/O operations with proper error handling

### Key Features

- **Async Processing:** Handles both sync and async API responses
- **Retry Logic:** Implements extended polling with 20 retries
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

### read_swissqr_code_output.json
A sample output file showing the expected result after Swiss QR code reading.

## Expected Workflow

1. Load PDF document containing Swiss QR codes
2. Prepare API request parameters
3. Call the PDF4me API to read Swiss QR codes
4. Handle the response (sync/async)
5. Save the extracted Swiss QR data
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

4. **Timeout Issues:**
   - Swiss QR processing may take longer than standard barcodes
   - The implementation uses extended polling (20 retries)
   - Check API service status if timeouts persist

## Performance Notes

- **Processing Time:** Swiss QR codes may take longer to process than standard barcodes
- **Detection Accuracy:** High accuracy for Swiss QR code format
- **Format Support:** Specifically designed for Swiss QR code standard

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch PDF processing
- [ ] Command line interface for PDF input
- [ ] Custom Swiss QR detection settings
- [ ] Integration with other document formats
- [ ] Web-based user interface
- [ ] Swiss QR code validation and verification 