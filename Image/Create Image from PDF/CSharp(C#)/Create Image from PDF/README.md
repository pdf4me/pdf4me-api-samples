# Create Image from PDF (C#)

A C# sample project for converting PDF pages to images using the PDF4Me API.

## Project Structure

```
Create Image from PDF/
├── Program.cs                           # Main program with PDF to image conversion logic
├── Create_Image_from_PDF.csproj         # Project file
├── Create_Image_from_PDF.sln            # Solution file
├── global.json                          # .NET SDK configuration
├── sample.pdf                           # Sample input PDF
├── output.jpg                           # Sample output image (generated)
└── README.md                            # This file
```

## Features

- ✅ Convert PDF pages to images with customizable settings
- ✅ Support for multiple output formats (JPEG, PNG, BMP, GIF, TIFF, etc.)
- ✅ Configurable image dimensions and quality
- ✅ Page selection (specific pages or ranges)
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations with configurable retry logic
- ✅ Comprehensive error handling and logging
- ✅ Modern C# async/await patterns
- ✅ Strongly typed API integration
- ✅ Automatic output directory creation

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

3. **Prepare your PDF:**
   - Place your input PDF in the project directory
   - Update the `pdfPath` variable in the `Main` method if needed

## Usage

1. **Set the input PDF and output settings (optional):**
   - Edit the `pdfPath` and image settings in `Program.cs` if needed

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

- **Input:** PDF file (default: `sample.pdf`)
- **Output:** Image files in the project directory

## Configuration

- **API Key:** Set in `Program.cs` as `API_KEY` constant
- **API Endpoint:** `https://api.pdf4me.com/api/v2/CreateImages`
- **Supported Output Formats:** jpg, jpeg, bmp, gif, jb2, jp2, jpf, jpx, png, tif, tiff
- **Payload Options:**
  - `docContent`: Base64 encoded PDF content
  - `docname`: Input PDF filename
  - `imageAction`: Image conversion settings
    - `WidthPixel`: Output image width in pixels
    - `ImageExtension`: Output format (jpeg, png, etc.)
    - `PageSelection`: Page selection settings
  - `pageNrs`: Page range as string (e.g., "1-2", "1,3,5")
  - `async`: true/false (async recommended for large PDFs)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/CreateImages`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)
- **Response:**
  - 200: Array of converted images (JSON)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Page Selection Options

### Method 1: Page Numbers Array
```csharp
"PageSelection": {
    "PageNrs": [1, 2, 3]  // Convert pages 1, 2, and 3
}
```

### Method 2: Page Range String
```csharp
"pageNrs": "1-2"          // Convert pages 1 and 2
"pageNrs": "1,3,5"        // Convert pages 1, 3, and 5
"pageNrs": "2-"           // Convert from page 2 to end
```

## Error Handling

- Invalid PDF file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations (configurable retry logic)
- Network connectivity issues
- File I/O errors
- JSON serialization errors
- Directory creation failures

## Code Structure

The project consists of two main classes:

### Program Class
- **Main method:** Entry point that orchestrates the conversion process
- **Configuration:** API key and base URL constants

### PdfToImageConverter Class
- **Constructor:** Initializes converter with HTTP client, file paths, and API key
- **CreateImagesFromPdfAsync:** Main conversion method with async/await pattern
- **Automatic output naming:** Generates output filenames based on page numbers
- **Directory management:** Creates output directories as needed

## Troubleshooting

### Common Issues

1. **"PDF file not found"**
   - Ensure the input PDF file exists in the project directory
   - Check the file path in the `pdfPath` variable

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the PDF is valid and accessible

3. **"Polling timeout"**
   - Large PDFs may take longer to process
   - Increase `maxRetries` or `retryDelay` in the polling logic

4. **"No images found in response"**
   - Check the API response for error details
   - Verify page numbers are valid for the PDF
   - Ensure output format is supported

5. **"Directory creation failed"**
   - Check file permissions
   - Ensure sufficient disk space

6. **Build errors**
   - Ensure .NET 8.0 SDK is installed
   - Run `dotnet restore` to restore packages
   - Check that all files are in the correct directory structure

### Debugging

- Add `Console.WriteLine` statements for additional output
- Check exception messages for details
- Use Visual Studio debugger or `dotnet run --verbosity normal`

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

## Output Format

Each converted image is saved with the naming pattern:
- `{original_filename}_{page_number}.{extension}`
- Example: `sample_1.jpeg`, `sample_2.jpeg`

## Performance Considerations

- **Large PDFs:** Use async processing for PDFs with many pages
- **Image Quality:** Higher resolution images require more processing time
- **Page Selection:** Converting fewer pages is faster
- **Network:** Stable internet connection improves reliability

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