# Resize Image (C#)

A C# sample project for resizing images using the PDF4Me API.

## Project Structure

```
Resize Image/
├── Program.cs                              # Main program with image resizing logic
├── Resize_Image.csproj                     # Project file
├── Resize_Image.sln                        # Solution file
├── global.json                             # .NET SDK configuration
├── sample.jpg                              # Sample input image
├── sample.png                              # Sample input image
├── sample.resized.jpg                      # Output resized image (generated)
└── README.md                               # This file
```

## Features

- ✅ Resize images by percentage or specific dimensions
- ✅ Maintain aspect ratio option
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

1. **Set the input image and resize parameters (optional):**
   - Edit the `imagePath`, `ImageResizeType`, `ResizePercentage`, `Width`, `Height`, and `MaintainAspectRatio` in `Program.cs` if needed

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
- **Output:** Resized image file (auto-generated name with `.resized` suffix)

## Configuration

- **API Key:** Set in `Program.cs` as `API_KEY` constant
- **API Endpoint:** `https://api.pdf4me.com/api/v2/ResizeImage?schemaVal=Percentange`
- **Supported Formats:** JPG, PNG, and other common image formats
- **Timeout:** 300 seconds (5 minutes) for large images

## Resize Options

The API supports two main resize types:

### Percentage Resize
```csharp
"ImageResizeType": "Percentage",
"ResizePercentage": "50.0"  // Resize to 50% of original size
```

### Specific Dimensions
```csharp
"ImageResizeType": "Specific",
"Width": 800,               // Target width in pixels
"Height": 600,              // Target height in pixels
"MaintainAspectRatio": true // Keep aspect ratio
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/ResizeImage?schemaVal=Percentange`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)
- **Response:**
  - 200: Resized image (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `docName`: Input image filename
- `docContent`: Base64 encoded image content
- `ImageResizeType`: "Percentage" or "Specific"
- `ResizePercentage`: Resize percentage as decimal string (e.g., "50.0" for 50%)
- `Width`: Target width in pixels (for Specific resize type)
- `Height`: Target height in pixels (for Specific resize type)
- `MaintainAspectRatio`: true/false (maintain original aspect ratio)
- `async`: true/false (async recommended for large images)

## Error Handling

- Invalid image file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations (configurable retry logic)
- Network connectivity issues
- File I/O errors
- Invalid resize parameters
- Image processing failures

## Code Structure

The project consists of two main classes:

### Program Class
- **Main method:** Entry point that orchestrates the image resizing process
- **Configuration:** API key and base URL constants

### ImageResizer Class
- **Constructor:** Initializes resizer with HTTP client, file paths, and API key
- **ResizeImageAsync:** Main resizing method with async/await pattern
- **Automatic output naming:** Generates output filename with `.resized` suffix

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

4. **"Invalid resize parameters"**
   - Ensure percentage is between 0.1 and 1000.0
   - Check that width and height are positive integers
   - Verify resize type is "Percentage" or "Specific"

5. **"Image quality issues"**
   - Large percentage reductions may affect quality
   - Consider using specific dimensions for better control
   - Test with different resize parameters

6. **Build errors**
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

### Web Optimization
- Resize images for web display
- Reduce file sizes for faster loading
- Create thumbnails and previews

### Content Management
- Standardize image sizes across collections
- Prepare images for different platforms
- Create responsive image sets

### Storage Optimization
- Reduce storage space requirements
- Compress images for archival
- Optimize images for email attachments

### Social Media
- Resize images for platform requirements
- Create profile pictures and avatars
- Optimize images for mobile viewing

## Performance Considerations

- **Image Size:** Larger images take longer to process
- **Resize Percentage:** Extreme reductions may affect quality
- **Aspect Ratio:** Maintaining aspect ratio may limit size options
- **Network:** Stable internet connection improves reliability
- **Processing Time:** Depends on image size and resize parameters

## Best Practices

### Image Preparation
- Use high-resolution images for better results
- Ensure images are in supported formats
- Consider the target use case when choosing resize parameters

### Resize Parameters
- Use percentage resize for proportional scaling
- Use specific dimensions for exact size requirements
- Enable aspect ratio maintenance to prevent distortion
- Test with different parameters to find optimal settings

### Processing
- Use async processing for large images
- Monitor response times and adjust timeouts
- Validate output images for quality
- Handle multiple resize operations appropriately

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