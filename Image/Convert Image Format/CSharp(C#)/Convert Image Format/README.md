# Convert Image Format (C#)

A C# sample project for converting image formats using the PDF4Me API.

## Project Structure

```
Convert Image Format/
├── Program.cs                        # Main program with image format conversion logic
├── Convert_Image_Format.csproj       # Project file
├── Convert_Image_Format.sln          # Solution file
├── global.json                       # .NET SDK configuration
├── sample.jpg                        # Sample input image
├── sample.png                        # Sample output image (generated)
└── README.md                         # This file
```

## Features

- ✅ Convert images between multiple formats (JPG, PNG, GIF, BMP, TIFF, WEBP)
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations with configurable retry logic
- ✅ Comprehensive error handling and logging
- ✅ Modern C# async/await patterns
- ✅ Strongly typed API integration
- ✅ Automatic output file naming based on target format

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

1. **Set the input image and target format (optional):**
   - Edit the `imagePath` and `targetFormat` variables in `Program.cs` if needed

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

- **Input:** Image file (default: `sample.jpg`)
- **Output:** Converted image file (auto-generated name based on target format)

## Configuration

- **API Key:** Set in `Program.cs` as `API_KEY` constant
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ConvertImageFormat`
- **Supported Formats:**
  - Input: JPG, PNG, GIF, BMP, TIFF, WEBP
  - Output: JPG, PNG, GIF, BMP, TIFF, WEBP
- **Payload Options:**
  - `docContent`: Base64 encoded image content
  - `docName`: Output document name
  - `imageType`: Original image type (JPG, PNG, etc.)
  - `convertTo`: Target format for conversion
  - `async`: true/false (async recommended for large images)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ConvertImageFormat`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Converted image (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Error Handling

- Invalid image file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations (configurable retry logic)
- Network connectivity issues
- File I/O errors
- JSON serialization errors

## Code Structure

The project consists of two main classes:

### Program Class
- **Main method:** Entry point that orchestrates the conversion process
- **Configuration:** API key and base URL constants

### ImageFormatConverter Class
- **Constructor:** Initializes converter with HTTP client, file paths, and API key
- **ConvertImageFormatAsync:** Main conversion method with async/await pattern
- **GetImageTypeFromExtension:** Utility method to determine image type from file extension
- **Automatic output naming:** Generates output filename based on target format

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

4. **"Unsupported format"**
   - Check that both input and output formats are supported
   - Ensure format names are in uppercase (JPG, PNG, etc.)

5. **Build errors**
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