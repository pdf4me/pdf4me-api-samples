# Merge Two PDF Files One Over Another as Overlay (C#)

A C# sample project for merging two PDF files by overlaying one on top of another using the PDF4Me API.

## Project Structure

```
Merge two PDF files one over another as Overlay/
├── Program.cs                              # Main program with PDF overlay merging logic
├── Merge_two_PDF_files_one_over_another_as_Overlay.csproj  # Project file
├── Merge_two_PDF_files_one_over_another_as_Overlay.sln     # Solution file
├── global.json                             # .NET SDK configuration
├── sample.pdf                              # Sample base PDF file
├── overlayed_output.pdf                    # Output overlay merged PDF (generated)
└── README.md                               # This file
```

## Features

- ✅ Merge two PDF files by overlaying one on top of another
- ✅ Precision content integration with layer positioning
- ✅ Support for complex PDF layouts and content
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations with configurable retry logic
- ✅ Comprehensive error handling and logging
- ✅ Modern C# async/await patterns
- ✅ Strongly typed API integration
- ✅ Detailed response logging for debugging
- ✅ Automatic output file naming

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

3. **Prepare your PDF files:**
   - Place your base and layer PDF files in the project directory
   - Update the `basePdfPath` and `layerPdfPath` variables in the `Main` method if needed

## Usage

1. **Set the input PDF files (optional):**
   - Edit the `basePdfPath` and `layerPdfPath` in `Program.cs` if needed

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

- **Input:** Two PDF files (base PDF and layer PDF)
- **Output:** Single overlay merged PDF file (auto-generated name with `.overlayed` suffix)

## Configuration

- **API Key:** Set in `Program.cs` as `API_KEY` constant
- **API Endpoint:** `https://api.pdf4me.com/api/v2/MergeOverlay`
- **Supported Formats:** PDF files
- **Timeout:** 300 seconds (5 minutes) for large PDFs

## Overlay Process

The API merges PDFs by overlaying content:

### Base PDF (First Layer)
- Serves as the background/underlying document
- Contains the main content and layout
- Remains unchanged in the final output

### Layer PDF (Second Layer)
- Overlaid on top of the base PDF
- Content is positioned precisely over the base
- Can include forms, stamps, watermarks, or additional content

### Result
- Single PDF with both layers combined
- Layer content appears on top of base content
- Maintains original positioning and formatting

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/MergeOverlay`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)
- **Response:**
  - 200: Overlay merged PDF (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `baseDocContent`: Base64 encoded base PDF content
- `baseDocName`: Name of the base PDF file
- `layerDocContent`: Base64 encoded layer PDF content
- `layerDocName`: Name of the layer PDF file
- `async`: true/false (async recommended for large PDFs)

## Error Handling

- Invalid PDF files or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations (configurable retry logic)
- Network connectivity issues
- File I/O errors
- Missing input files
- PDF processing failures

## Code Structure

The project consists of two main classes:

### Program Class
- **Main method:** Entry point that orchestrates the PDF overlay merging process
- **Configuration:** API key and base URL constants

### PdfOverlayer Class
- **Constructor:** Initializes overlayer with HTTP client, file paths, and API key
- **OverlayPdfsAsync:** Main overlay merging method with async/await pattern
- **Automatic output naming:** Generates output filename with `.overlayed` suffix

## Troubleshooting

### Common Issues

1. **"Base PDF file not found"**
   - Ensure the base PDF file exists in the project directory
   - Check the file path in the `basePdfPath` variable

2. **"Layer PDF file not found"**
   - Ensure the layer PDF file exists in the project directory
   - Check the file path in the `layerPdfPath` variable

3. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the PDF files are valid

4. **"Polling timeout"**
   - Large PDFs may take longer to process
   - Increase `maxRetries` or `retryDelay` in the polling logic

5. **"Overlay not appearing correctly"**
   - Check that both PDFs have compatible page sizes
   - Verify layer PDF content positioning
   - Ensure PDFs are not corrupted

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
- Add watermarks to existing documents
- Overlay forms on template documents
- Combine letterheads with content
- Add stamps or signatures to PDFs

### Business Applications
- Merge contracts with terms and conditions
- Overlay company branding on documents
- Add approval stamps to reports
- Combine invoices with payment forms

### Creative Projects
- Create layered document designs
- Overlay graphics on text documents
- Combine multiple design elements
- Create composite documents

### Legal and Compliance
- Add legal disclaimers to documents
- Overlay compliance stamps
- Merge certificates with content
- Add digital signatures

## Performance Considerations

- **PDF Size:** Larger PDFs take longer to process
- **Content Complexity:** Complex layouts may require more processing time
- **Page Count:** More pages increase processing time
- **Network:** Stable internet connection improves reliability
- **Memory:** Large PDFs require sufficient memory

## Best Practices

### PDF Preparation
- Ensure both PDFs have compatible page sizes
- Check for any password protection
- Verify PDF integrity before processing
- Consider file size limitations

### Content Positioning
- Test layer positioning with sample files
- Ensure important content isn't obscured
- Check for content overlap issues
- Validate final output quality

### Processing
- Use async processing for large PDFs
- Monitor response times and adjust timeouts
- Validate output PDFs for quality
- Handle multiple overlay operations appropriately

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