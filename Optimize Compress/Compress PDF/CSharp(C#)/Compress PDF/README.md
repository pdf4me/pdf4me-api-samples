# Compress PDF - C# Implementation

Compress and optimize PDF documents using the PDF4Me API. This C# project reduces PDF file sizes while maintaining document quality and readability.

## Features

- ✅ Compress PDF documents with configurable quality settings
- ✅ Control over compression settings and optimization profiles
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling and logging
- ✅ File I/O operations with proper error handling
- ✅ HTTP client implementation using .NET HttpClient
- ✅ Preserves document quality and readability
- ✅ Multiple optimization profiles (Web, Print, Screen)

## Prerequisites

- **.NET 8.0 or higher** (required for modern C# features)
- **Visual Studio 2022 or VS Code** (recommended)
- **Internet connection** for API access
- **Valid PDF4Me API key** (get from https://dev.pdf4me.com/dashboard/#/api-keys/)
- **PDF file** for compression testing

## Project Structure

```
Compress PDF/
├── Program.cs                    # Main application with complete compression logic
├── Compress PDF.csproj           # C# project file
├── Compress PDF.sln              # Visual Studio solution file
├── global.json                   # .NET SDK version configuration
├── sample.pdf                    # Sample PDF file for testing
├── sample.optimized.pdf          # Output compressed PDF (generated)
└── README.md                     # This file
```

## Setup

### 1. Get API Key
First, you need to get a valid API key from PDF4me:
1. Visit https://dev.pdf4me.com/dashboard/#/api-keys/
2. Create an account and generate an API key
3. Replace the placeholder in `Program.cs`:
   ```csharp
   public static readonly string API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
   ```

### 2. Setup in Visual Studio

1. **Open the project:**
   - Open Visual Studio 2022
   - Select "Open a project or solution"
   - Navigate to the `Compress PDF` folder and select `Compress PDF.sln`

2. **Configure the project:**
   - Ensure .NET 8.0 SDK is installed
   - Build the solution to restore NuGet packages
   - Set the startup project to "Compress PDF"

### 3. Setup in VS Code

1. **Open the project:**
   ```bash
   code "Optimize Compress/Compress PDF/CSharp(C#)/Compress PDF"
   ```

2. **Install C# extension and run:**
   ```bash
   dotnet restore
   dotnet build
   dotnet run
   ```

## Usage

### Running the Application

1. **Build and run in Visual Studio:**
   - Press F5 or click "Start Debugging"
   - Or press Ctrl+F5 for "Start Without Debugging"

2. **Run from command line:**
   ```bash
   dotnet run
   ```

### Expected Output

```
=== Compressing PDF Document ===
PDF optimized and saved to: sample.optimized.pdf
```

### Input and Output

- **Input:** 
  - `sample.pdf` (PDF file to compress)
- **Output:** `sample.optimized.pdf` (Compressed PDF with reduced file size)

## API Configuration

The application uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/Optimize`
- **Authentication:** Basic authentication with API key
- **Features:** PDF compression, optimization

## Compression Settings

The implementation supports these settings:
- **Optimization Profile:** "Web" (configurable - Web, Print, Screen)
- **Async Processing:** true (recommended for large files)
- **Document Name:** "output.pdf"

### Optimization Profiles

- **Web:** Optimized for web viewing and fast loading
- **Print:** Optimized for high-quality printing
- **Screen:** Balanced optimization for screen viewing

## Implementation Details

### Main Components

1. **Program Class:**
   - Entry point for the application
   - Configuration constants (API key, URLs)
   - HTTP client initialization

2. **PdfOptimizer Class:**
   - `OptimizePdfAsync()`: Main method for PDF compression
   - `ExecuteOptimizationAsync()`: HTTP requests and API integration
   - File I/O operations with proper error handling

### Key Features

- **Async Processing:** Handles both sync and async API responses
- **Retry Logic:** Implements polling with configurable retry attempts (10 retries, 10-second delays)
- **Error Handling:** Comprehensive exception handling and logging
- **File Management:** Efficient file I/O with proper resource management
- **HTTP Client:** Uses .NET HttpClient for modern HTTP operations

## API Endpoints

- **POST** `/api/v2/Optimize` - Compresses and optimizes a PDF document

## Request Payload

```json
{
  "docName": "output.pdf",
  "docContent": "base64-encoded-pdf-content",
  "optimizeProfile": "Web",
  "async": true
}
```

## Response Handling

The application handles two types of responses:

1. **200 OK**: Immediate success, returns the compressed PDF
2. **202 Accepted**: Asynchronous processing, polls for completion

## Error Handling

The application handles various error scenarios:
- **401 Unauthorized:** Invalid or missing API key
- **404 Not Found:** Input file not found
- **202 Accepted:** Async processing (handled with polling)
- **500 Server Error:** API server issues
- **Timeout:** Long-running operations that exceed retry limits

## Dependencies

This project uses only standard .NET libraries:
- `System.Net.Http` - HTTP client for API communication
- `System.IO` - File operations
- `System.Text.Json` - JSON serialization
- `System.Text` - Text encoding utilities

## Security Considerations

- API keys should be stored securely (not hardcoded in production)
- Use HTTPS for all API communications
- Validate input files before processing
- Implement proper error handling for sensitive operations
- Consider using environment variables for API keys in production

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error:**
   - Ensure you have set a valid API key in `Program.cs`
   - Check that your API key is active and has sufficient credits

2. **File Not Found:**
   - Make sure `sample.pdf` exists in the project directory
   - Check file permissions

3. **Build Errors:**
   - Ensure you're using .NET 8.0 or higher
   - Run `dotnet restore` to restore packages
   - Check that all source files are in the correct location

4. **Network Issues:**
   - Verify internet connectivity
   - Check firewall settings
   - Ensure the PDF4me API is accessible

### Performance Tips

- **Small files (< 5MB):** Usually processed synchronously (200 response)
- **Large files (> 5MB):** Processed asynchronously (202 response) with polling
- **Complex documents:** May take longer to process

## Sample Files

### sample.pdf
A sample PDF document that will be used for testing compression functionality.

### sample.optimized.pdf
The output file that will be generated after successful compression.

## Expected Workflow

1. Load the PDF document ✅
2. Validate the document format ✅
3. Prepare compression parameters ✅
4. Call the PDF4me API to compress the PDF ✅
5. Handle the response (sync/async) ✅
6. Save the resulting compressed PDF ✅
7. Provide status feedback to the user ✅

## Next Steps

To complete the testing:
1. Get a valid API key from https://dev.pdf4me.com/dashboard/#/api-keys/
2. Replace the placeholder API key in `Program.cs`
3. Run the program to test actual PDF compression
4. Verify the output file `sample.optimized.pdf` is generated and smaller than the original

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch processing multiple files
- [ ] Configurable compression settings via command line
- [ ] Progress reporting for long-running operations
- [ ] Support for different compression algorithms
- [ ] Web-based user interface

## License

This project is part of the PDF4ME API samples collection.

## Support

For API-related issues, contact PDF4ME support.
For implementation questions, refer to the PDF4ME documentation. 