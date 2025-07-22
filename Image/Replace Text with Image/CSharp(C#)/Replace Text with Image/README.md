# Replace Text with Image (C#)

A C# sample project for replacing text in PDF documents with images using the PDF4Me API.

## Project Structure

```
Replace Text with Image/
├── Program.cs                              # Main program with text replacement logic
├── Replace_Text_with_Image.csproj          # Project file
├── Replace_Text_with_Image.sln             # Solution file
├── global.json                             # .NET SDK configuration
├── sample.pdf                              # Sample input PDF document
├── sample.jpg                              # Sample replacement image
├── sample.png                              # Sample replacement image
├── sample.replaced.pdf                     # Output PDF with replaced text (generated)
└── README.md                               # This file
```

## Features

- ✅ Replace specific text in PDF documents with images
- ✅ Support for multiple page selection options
- ✅ Configurable image dimensions (width and height)
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

3. **Prepare your files:**
   - Place your input PDF and replacement image in the project directory
   - Update the `pdfPath` and `imagePath` variables in the `Main` method if needed

## Usage

1. **Set the input files and replacement parameters (optional):**
   - Edit the `pdfPath`, `imagePath`, `replaceText`, `imageHeight`, and `imageWidth` in `Program.cs` if needed

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

- **Input:** PDF file and replacement image (default: `sample.pdf` and `sample.jpg`)
- **Output:** Modified PDF file with replaced text (auto-generated name with `.replaced` suffix)

## Configuration

- **API Key:** Set in `Program.cs` as `API_KEY` constant
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ReplaceTextWithImage`
- **Supported Formats:** PDF input, various image formats for replacement
- **Timeout:** 300 seconds (5 minutes) for large documents

## Page Selection Options

The API supports various page selection formats:

### Single Page
```csharp
"pageSequence": "1"  // Replace text on page 1 only
```

### Multiple Specific Pages
```csharp
"pageSequence": "1,3,5"  // Replace text on pages 1, 3, and 5
```

### Page Range
```csharp
"pageSequence": "2-5"  // Replace text on pages 2 through 5
```

### Mixed Selection
```csharp
"pageSequence": "1,3,7-10"  // Replace text on pages 1, 3, and 7 through 10
```

### All Pages
```csharp
"pageSequence": "all"  // Replace text on all pages
```

### From Page to End
```csharp
"pageSequence": "2-"  // Replace text from page 2 to the end
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ReplaceTextWithImage`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)
- **Response:**
  - 200: Modified PDF (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `docContent`: Base64 encoded PDF content
- `docName`: Input PDF filename
- `replaceText`: Text to be replaced with image
- `pageSequence`: Page selection (see options above)
- `imageContent`: Base64 encoded replacement image content
- `imageHeight`: Height of the replacement image (integer)
- `imageWidth`: Width of the replacement image (integer)
- `async`: true/false (async recommended for large documents)

## Error Handling

- Invalid PDF or image file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations (configurable retry logic)
- Network connectivity issues
- File I/O errors
- Text not found in document
- Invalid page selection
- Image processing failures

## Code Structure

The project consists of two main classes:

### Program Class
- **Main method:** Entry point that orchestrates the text replacement process
- **Configuration:** API key and base URL constants

### TextReplacer Class
- **Constructor:** Initializes replacer with HTTP client, file paths, and API key
- **ReplaceTextWithImageAsync:** Main replacement method with async/await pattern
- **Automatic output naming:** Generates output filename with `.replaced` suffix

## Troubleshooting

### Common Issues

1. **"PDF file not found" or "Image file not found"**
   - Ensure both input files exist in the project directory
   - Check the file paths in the `pdfPath` and `imagePath` variables

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the file formats are supported

3. **"Polling timeout"**
   - Large documents may take longer to process
   - Increase `maxRetries` or `retryDelay` in the polling logic

4. **"Text not found"**
   - Ensure the text to replace exists in the PDF
   - Check for exact text matching (case-sensitive)
   - Verify the text is on the selected pages

5. **"Invalid page selection"**
   - Ensure page numbers are valid for the document
   - Check the page selection format

6. **Build errors**
   - Ensure .NET 8.0 SDK is installed
   - Run `dotnet restore` to restore packages
   - Check that all files are in the correct directory structure

### Debugging

- Add `Console.WriteLine` statements for additional output
- Check exception messages for details
- Use Visual Studio debugger or `dotnet run --verbosity normal`
- Verify file integrity and formats

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

### Document Branding
- Replace company names with logos
- Add watermarks or stamps
- Insert signature images

### Content Management
- Replace placeholder text with actual images
- Update document headers or footers
- Add visual elements to reports

### Document Automation
- Generate personalized documents
- Replace text placeholders with dynamic images
- Create branded templates

### Legal and Business
- Add signature images to contracts
- Replace text with official stamps
- Insert company logos in documents

## Performance Considerations

- **Document Size:** Larger PDFs may take longer to process
- **Image Size:** Larger replacement images increase processing time
- **Text Frequency:** Multiple text occurrences require more processing
- **Page Count:** More pages increase processing time
- **Network:** Stable internet connection improves reliability

## Best Practices

### Document Preparation
- Use clear, unique text for replacement
- Ensure text exists on the specified pages
- Use appropriate image formats (PNG, JPG)

### Image Sizing
- Set appropriate width and height for the replacement image
- Consider the original text size and spacing
- Test with different image dimensions

### Processing
- Use async processing for large documents
- Monitor response times and adjust timeouts
- Validate output PDFs for completeness
- Handle multiple text replacements appropriately

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