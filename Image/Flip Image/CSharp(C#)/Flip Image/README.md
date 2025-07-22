# Flip Image (C#)

A C# sample project for flipping images using the PDF4Me API.

## Project Structure

```
Flip Image/
├── Program.cs                       # Main program with image flipping logic
├── Flip_Image.csproj                # Project file
├── Flip_Image.sln                   # Solution file
├── global.json                      # .NET SDK configuration
├── sample.jpg                       # Sample input image
├── sample.flipped.jpg               # Sample output flipped image (generated)
└── README.md                        # This file
```

## Features

- ✅ Flip images horizontally, vertically, or both directions
- ✅ Support for multiple image formats (JPG, PNG, GIF, BMP, TIFF)
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations with configurable retry logic
- ✅ Comprehensive error handling and logging
- ✅ Modern C# async/await patterns
- ✅ Strongly typed API integration
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

3. **Prepare your image:**
   - Place your input image in the project directory
   - Update the `imagePath` variable in the `Main` method if needed

## Usage

1. **Set the input image and flip orientation (optional):**
   - Edit the `imagePath` and `orientationType` in `Program.cs` if needed

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
- **Output:** Flipped image file (auto-generated name with `.flipped` suffix)

## Configuration

- **API Key:** Set in `Program.cs` as `API_KEY` constant
- **API Endpoint:** `https://api.pdf4me.com/api/v2/FlipImage`
- **Supported Formats:** JPG, PNG, GIF, BMP, TIFF
- **Orientation Types:**
  - **Horizontal:** Flip image left to right
  - **Vertical:** Flip image top to bottom
  - **HorizontalAndVertical:** Flip image both horizontally and vertically

## Flip Options

### Horizontal Flip
```csharp
"orientationType": "Horizontal"  // Flip left to right
```

### Vertical Flip
```csharp
"orientationType": "Vertical"    // Flip top to bottom
```

### Both Directions
```csharp
"orientationType": "HorizontalAndVertical"  // Flip both ways
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/FlipImage`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Flipped image (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `docContent`: Base64 encoded image content
- `docName`: Input image filename
- `orientationType`: "Horizontal", "Vertical", or "HorizontalAndVertical"
- `async`: true/false (async recommended for large images)

## Error Handling

- Invalid image file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations (configurable retry logic)
- Network connectivity issues
- File I/O errors
- Invalid orientation type
- JSON serialization errors

## Code Structure

The project consists of two main classes:

### Program Class
- **Main method:** Entry point that orchestrates the flipping process
- **Configuration:** API key and base URL constants

### ImageFlipper Class
- **Constructor:** Initializes flipper with HTTP client, file paths, and API key
- **FlipImageAsync:** Main flipping method with async/await pattern
- **Automatic output naming:** Generates output filename with `.flipped` suffix
- **Orientation validation:** Ensures orientation type is valid

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

4. **"Invalid orientation type"**
   - Ensure orientation type is one of: "Horizontal", "Vertical", "HorizontalAndVertical"
   - Check for typos in the orientation parameter

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

## Use Cases

### Horizontal Flip
- Mirror images for design purposes
- Correct text that appears backwards
- Create symmetrical compositions

### Vertical Flip
- Invert images for artistic effects
- Correct upside-down images
- Create reflection effects

### Both Directions
- Rotate image 180 degrees
- Create complex transformations
- Artistic image manipulation

## Performance Considerations

- **Large Images:** Use async processing for high-resolution images
- **Image Format:** Some formats may process faster than others
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