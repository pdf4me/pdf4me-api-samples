# Rotate Image (C#)

A C# sample project for rotating images using the PDF4Me API.

## Project Structure

```
Rotate Image/
├── Program.cs                              # Main program with image rotation logic
├── Rotate_Image.csproj                     # Project file
├── Rotate_Image.sln                        # Solution file
├── global.json                             # .NET SDK configuration
├── sample.jpg                              # Sample input image
├── sample.png                              # Sample input image
├── sample.rotated.jpg                      # Output rotated image (generated)
└── README.md                               # This file
```

## Features

- ✅ Rotate images by custom angles (0-360 degrees)
- ✅ Configurable background color for rotation
- ✅ Proportionate resize option during rotation
- ✅ Support for multiple image formats
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

3. **Prepare your image:**
   - Place your input image in the project directory
   - Update the `imagePath` variable in the `Main` method if needed

## Usage

1. **Set the input image and rotation parameters (optional):**
   - Edit the `imagePath`, `RotationAngle`, `Backgroundcolor`, and `ProportionateResize` in `Program.cs` if needed

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
- **Output:** Rotated image file (auto-generated name with `.rotated` suffix)

## Configuration

- **API Key:** Set in `Program.cs` as `API_KEY` constant
- **API Endpoint:** `https://api.pdf4me.com/api/v2/RotateImage`
- **Supported Formats:** JPG, PNG, and other common image formats
- **Timeout:** 300 seconds (5 minutes) for large images

## Rotation Options

The API supports various rotation configurations:

### Rotation Angle
```csharp
"RotationAngle": 90  // Rotate 90 degrees clockwise
```

Common rotation angles:
- **0°:** No rotation
- **90°:** Quarter turn clockwise
- **180°:** Half turn (upside down)
- **270°:** Three-quarter turn clockwise
- **Custom:** Any angle between 0-360 degrees

### Background Color
```csharp
"Backgroundcolor": "#FFFFFF"  // White background
```

Color options:
- **Hex colors:** "#FFFFFF" (white), "#000000" (black), "#FF0000" (red)
- **Transparent:** Use transparent background (if supported)
- **Custom:** Any valid hex color code

### Proportionate Resize
```csharp
"ProportionateResize": true  // Maintain proportions during rotation
```

This option:
- **True:** Maintains image proportions and fits within original dimensions
- **False:** Allows image to expand beyond original boundaries

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/RotateImage`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)
- **Response:**
  - 200: Rotated image (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `docContent`: Base64 encoded image content
- `docName`: Input image filename
- `Backgroundcolor`: Background color in hex format (e.g., "#FFFFFF")
- `ProportionateResize`: true/false (maintain proportions during rotation)
- `RotationAngle`: Rotation angle in degrees (integer, 0-360)
- `async`: true/false (async recommended for large images)

## Error Handling

- Invalid image file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations (configurable retry logic)
- Network connectivity issues
- File I/O errors
- Invalid rotation parameters
- Image processing failures

## Code Structure

The project consists of two main classes:

### Program Class
- **Main method:** Entry point that orchestrates the image rotation process
- **Configuration:** API key and base URL constants

### ImageRotator Class
- **Constructor:** Initializes rotator with HTTP client, file paths, and API key
- **RotateImageAsync:** Main rotation method with async/await pattern
- **Automatic output naming:** Generates output filename with `.rotated` suffix

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

4. **"Invalid rotation angle"**
   - Ensure rotation angle is between 0 and 360 degrees
   - Check that the angle is an integer value

5. **"Invalid background color"**
   - Ensure color is in valid hex format (e.g., "#FFFFFF")
   - Check for proper color syntax

6. **"Image quality issues"**
   - Large rotation angles may affect image quality
   - Consider using proportionate resize for better results
   - Test with different background colors

7. **Build errors**
   - Ensure .NET 8.0 SDK is installed
   - Run `dotnet restore` to restore packages
   - Check that all files are in the correct directory structure

### Debugging

- Add `Console.WriteLine` statements for additional output
- Check exception messages for details
- Use Visual Studio debugger or `dotnet run --verbosity normal`
- Verify image file integrity

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

### Image Correction
- Fix incorrectly oriented photos
- Correct landscape/portrait orientation
- Align images for proper viewing

### Creative Editing
- Create artistic rotated compositions
- Generate tilted image effects
- Produce dynamic visual layouts

### Document Processing
- Rotate scanned documents
- Correct document orientation
- Prepare images for OCR processing

### Web and Print
- Optimize images for web display
- Prepare images for print layouts
- Create thumbnail variations

## Performance Considerations

- **Image Size:** Larger images take longer to process
- **Rotation Angle:** Complex angles may require more processing time
- **Background Color:** Transparent backgrounds may increase file size
- **Proportionate Resize:** May affect final image dimensions
- **Network:** Stable internet connection improves reliability

## Best Practices

### Image Preparation
- Use high-resolution images for better results
- Ensure images are in supported formats
- Consider the target use case when choosing rotation parameters

### Rotation Parameters
- Use standard angles (90°, 180°, 270°) for best results
- Choose appropriate background colors for your use case
- Enable proportionate resize to maintain image quality
- Test with different angles to find optimal settings

### Processing
- Use async processing for large images
- Monitor response times and adjust timeouts
- Validate output images for quality
- Handle multiple rotation operations appropriately

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