# Delete Blank Pages from PDF - C# Implementation

Delete blank pages from PDF documents using the PDF4Me API. This C# project removes pages that contain no text or images based on configurable detection criteria.

## Features

- ✅ Delete blank pages from PDF documents based on specified criteria
- ✅ Support for different blank page detection options:
  - NoTextNoImages: Pages with no text and no images
  - NoText: Pages with no text content
  - NoImages: Pages with no images
- ✅ Configurable blank page detection settings
- ✅ Handle both single and multiple blank pages
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling and logging
- ✅ File I/O operations with proper error handling
- ✅ HTTP client implementation using .NET HttpClient
- ✅ Page validation and processing status tracking
- ✅ Export cleaned PDF in original format

## Prerequisites

- **.NET 8.0 or higher** (required for modern C# features)
- **Visual Studio 2022 or VS Code** (recommended)
- **Internet connection** for API access
- **Valid PDF4Me API key** (get from https://dev.pdf4me.com/dashboard/#/api-keys/)
- **PDF file** for testing blank page removal

## Project Structure

```
Delete Blank Pages from PDF/
├── Program.cs                                    # Main application with complete blank page deletion logic
├── Delete_Blank_Pages_from_PDF.csproj            # C# project file
├── Delete_Blank_Pages_from_PDF.sln               # Visual Studio solution file
├── global.json                                   # .NET SDK version configuration
├── sample.pdf                                    # Sample PDF file for testing
├── sample.no_blank_pages.pdf                     # Output PDF with blank pages removed (generated)
└── README.md                                     # This file
```

## Setup

### 1. Get API Key
First, you need to get a valid API key from PDF4me:
1. Visit https://dev.pdf4me.com/dashboard/#/api-keys/
2. Create an account and generate an API key
3. Replace the placeholder in `Program.cs`:
   ```csharp
   public static readonly string API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
   ```

### 2. Setup in Visual Studio

1. **Open the project:**
   - Open Visual Studio 2022
   - Select "Open a project or solution"
   - Navigate to the `Delete Blank Pages from PDF` folder and select `Delete_Blank_Pages_from_PDF.sln`

2. **Configure the project:**
   - Ensure .NET 8.0 SDK is installed
   - Build the solution to restore NuGet packages
   - Set the startup project to "Delete Blank Pages from PDF"

### 3. Setup in VS Code

1. **Open the project:**
   ```bash
   code "Organize/Delete Blank Pages from PDF/CSharp(C#)/Delete Blank Pages from PDF"
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
=== Deleting Blank Pages from PDF ===
PDF with blank pages removed saved to: sample.no_blank_pages.pdf
```

### Input and Output

- **Input:** 
  - `sample.pdf` (PDF file with potential blank pages)
- **Output:** `sample.no_blank_pages.pdf` (PDF with blank pages removed)

## API Configuration

The application uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/DeleteBlankPages`
- **Authentication:** Basic authentication with API key
- **Features:** Blank page detection, page removal, metadata handling

## Blank Page Detection Settings

The implementation supports these settings:
- **Delete Page Option:** "NoTextNoImages" (configurable - NoTextNoImages, NoText, NoImages)
- **Async Processing:** true (recommended for large files)
- **Document Name:** "output.pdf"

### Supported Detection Options

- **NoTextNoImages:** Removes pages that contain neither text nor images
- **NoText:** Removes pages that contain no text content (may keep pages with images)
- **NoImages:** Removes pages that contain no images (may keep pages with text)

## Implementation Details

### Main Components

1. **Program Class:**
   - Entry point for the application
   - Configuration constants (API key, URLs)
   - HTTP client initialization

2. **DeleteBlankPages Class:**
   - `DeleteBlankPagesAsync()`: Main method for blank page deletion
   - `ExecuteBlankPageDeletionAsync()`: HTTP requests and API integration
   - File I/O operations with proper error handling

### Key Features

- **Async Processing:** Handles both sync and async API responses
- **Retry Logic:** Implements polling with configurable retry attempts (10 retries, 10-second delays)
- **Error Handling:** Comprehensive exception handling and logging
- **File Management:** Efficient file I/O with proper resource management
- **HTTP Client:** Uses .NET HttpClient for modern HTTP operations

## API Endpoints

- **POST** `/api/v2/DeleteBlankPages` - Deletes blank pages from a PDF document

## Request Payload

```json
{
  "docContent": "base64-encoded-pdf-content",
  "docName": "output.pdf",
  "deletePageOption": "NoTextNoImages",
  "async": true
}
```

## Response Handling

The application handles two types of responses:

1. **200 OK**: Immediate success, returns the processed PDF
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
A sample PDF document that will be used for testing blank page deletion functionality.

### sample.no_blank_pages.pdf
The output file that will be generated after successful blank page removal.

## Expected Workflow

1. Load the PDF document ✅
2. Analyze each page for blank content based on selected criteria ✅
3. Prepare the API request payload with page analysis data ✅
4. Call the PDF4me API to delete blank pages ✅
5. Handle the response (sync/async) ✅
6. Save the resulting PDF without blank pages ✅
7. Provide status feedback to the user ✅

## Next Steps

To complete the testing:
1. Get a valid API key from https://dev.pdf4me.com/dashboard/#/api-keys/
2. Replace the placeholder API key in `Program.cs`
3. Run the program to test actual blank page deletion
4. Verify the output file `sample.no_blank_pages.pdf` is generated and has blank pages removed

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch processing multiple files
- [ ] Configurable detection settings via command line
- [ ] Progress reporting for long-running operations
- [ ] Support for different blank page detection algorithms
- [ ] Web-based user interface

## License

This project is part of the PDF4ME API samples collection.

## Support

For API-related issues, contact PDF4ME support.
For implementation questions, refer to the PDF4ME documentation. 