# Image Extract Text (C#)

A C# sample project for extracting text from images using OCR (Optical Character Recognition) via the PDF4Me API.

## Project Structure

```
Image Extract Text/
├── Program.cs                          # Main program with text extraction logic
├── Image_Extract_Text.csproj           # Project file
├── Image_Extract_Text.sln              # Solution file
├── global.json                         # .NET SDK configuration
├── sample.jpg                          # Sample input image with text
├── sample.png                          # Sample input image
└── README.md                           # This file
```

## Features

- ✅ Extract text from images using advanced OCR technology
- ✅ Support for multiple image formats (JPG, PNG, BMP, TIFF)
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations with configurable retry logic
- ✅ Comprehensive error handling and logging
- ✅ Modern C# async/await patterns
- ✅ Strongly typed API integration
- ✅ JSON output format with structured text data
- ✅ Detailed response logging for debugging

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

3. **Prepare your image:**
   - Place your input image in the project directory
   - Update the `imagePath` variable in the `Main` method if needed

## Usage

1. **Set the input image (optional):**
   - Edit the `imagePath` in `Program.cs` if needed

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

- **Input:** Image file containing text (default: `sample.jpg`)
- **Output:** JSON string with extracted text (displayed in console and can be saved to file)

## Configuration

- **API Key:** Set in `Program.cs` as `API_KEY` constant
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ImageExtractText`
- **Supported Formats:** JPG, PNG, BMP, TIFF
- **Timeout:** 300 seconds (5 minutes) for large images

## OCR Capabilities

The API provides advanced OCR functionality including:

### Text Recognition
- **Printed Text:** Clear, typed text in various fonts
- **Handwritten Text:** Cursive and printed handwriting
- **Mixed Content:** Documents with both text and images
- **Multi-language Support:** Various languages and scripts

### Layout Analysis
- **Text Positioning:** Maintains spatial relationships
- **Line Detection:** Identifies text lines and paragraphs
- **Column Recognition:** Handles multi-column layouts
- **Table Detection:** Recognizes tabular data

### Output Format
- **Structured JSON:** Organized text with positioning data
- **Confidence Scores:** Accuracy indicators for each text element
- **Bounding Boxes:** Precise location information
- **Text Hierarchy:** Headers, body text, captions

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ImageExtractText`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)
- **Response:**
  - 200: Extracted text JSON
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `docName`: Input image filename
- `docContent`: Base64 encoded image content
- `async`: true/false (async recommended for large images)

## Error Handling

- Invalid image file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations (configurable retry logic)
- Network connectivity issues
- File I/O errors
- JSON serialization errors
- OCR processing failures

## Code Structure

The project consists of two main classes:

### Program Class
- **Main method:** Entry point that orchestrates the text extraction process
- **Configuration:** API key and base URL constants

### ImageTextExtractor Class
- **Constructor:** Initializes extractor with HTTP client, file paths, and API key
- **ExtractTextFromImageAsync:** Main extraction method with async/await pattern
- **GetImageTypeFromExtension:** Utility method to determine image type from file extension
- **ParseExtractedText:** Utility method to format and parse extracted text

## Troubleshooting

### Common Issues

1. **"Image file not found"**
   - Ensure the input image file exists in the project directory
   - Check the file path in the `imagePath` variable

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the image format is supported

3. **"Polling timeout"**
   - Large images may take longer to process
   - Increase `maxRetries` or `retryDelay` in the polling logic

4. **"No text found"**
   - Ensure the image contains readable text
   - Check image quality and resolution
   - Verify text is not too small or blurry

5. **"Poor OCR results"**
   - Use high-resolution images
   - Ensure good contrast between text and background
   - Avoid heavily stylized fonts

6. **Build errors**
   - Ensure .NET 8.0 SDK is installed
   - Run `dotnet restore` to restore packages
   - Check that all files are in the correct directory structure

### Debugging

- Add `Console.WriteLine` statements for additional output
- Check exception messages for details
- Use Visual Studio debugger or `dotnet run --verbosity normal`
- Verify image quality and text clarity

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

## Output Examples

### Basic Text Extraction
```json
{
  "text": "This is sample text extracted from the image.",
  "confidence": 0.95,
  "regions": [
    {
      "text": "Sample text",
      "bbox": [100, 200, 300, 250],
      "confidence": 0.98
    }
  ]
}
```

### Structured Document
```json
{
  "pages": [
    {
      "pageNumber": 1,
      "textBlocks": [
        {
          "text": "Document Title",
          "type": "header",
          "bbox": [50, 50, 500, 80]
        },
        {
          "text": "This is the main content...",
          "type": "body",
          "bbox": [50, 100, 500, 400]
        }
      ]
    }
  ]
}
```

## Use Cases

### Document Digitization
- Convert scanned documents to searchable text
- Extract text from historical documents
- Process forms and applications

### Data Extraction
- Extract information from receipts and invoices
- Process business cards and contact information
- Analyze charts and graphs

### Content Analysis
- Extract text from screenshots
- Process handwritten notes
- Analyze printed materials

## Performance Considerations

- **Image Quality:** Higher resolution images provide better OCR results
- **Text Clarity:** Clear, high-contrast text improves accuracy
- **Image Size:** Larger images may take longer to process
- **Text Density:** Images with lots of text require more processing time
- **Network:** Stable internet connection improves reliability

## Best Practices

### Image Preparation
- Use high-resolution images (300+ DPI)
- Ensure good contrast between text and background
- Avoid shadows and reflections
- Use standard fonts when possible

### Processing
- Use async processing for large images
- Monitor response times and adjust timeouts
- Validate extracted text for accuracy
- Handle multiple languages appropriately

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