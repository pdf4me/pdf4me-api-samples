# Rotate Image By Exif Data (C#)

A C# sample project for automatically rotating images based on their EXIF orientation metadata using the PDF4Me API.

## Project Structure

```
Rotate Image By Exif Data/
├── Program.cs                              # Main program with EXIF-based rotation logic
├── Rotate_Image_By_Exif_Data.csproj        # Project file
├── Rotate_Image_By_Exif_Data.sln           # Solution file
├── global.json                             # .NET SDK configuration
├── sample.jpg                              # Sample input image with EXIF data
├── sample.png                              # Sample input image
├── sample.exifrotated.jpg                  # Output automatically rotated image (generated)
└── README.md                               # This file
```

## Features

- ✅ Automatically rotate images based on EXIF orientation data
- ✅ No manual angle specification required
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

- **Input:** Image file with EXIF orientation data (default: `sample.jpg`)
- **Output:** Automatically rotated image file (auto-generated name with `.exifrotated` suffix)

## Configuration

- **API Key:** Set in `Program.cs` as `API_KEY` constant
- **API Endpoint:** `https://api.pdf4me.com/api/v2/RotateImageByExifData`
- **Supported Formats:** JPG, PNG, and other common image formats
- **Timeout:** 300 seconds (5 minutes) for large images

## EXIF Orientation Data

The API automatically detects and applies rotation based on EXIF orientation tags:

### Common EXIF Orientation Values
- **1:** Normal (no rotation needed)
- **2:** Mirrored horizontally
- **3:** Rotated 180°
- **4:** Mirrored vertically
- **5:** Mirrored horizontally and rotated 90° CCW
- **6:** Rotated 90° CW
- **7:** Mirrored horizontally and rotated 90° CW
- **8:** Rotated 90° CCW

### How It Works
1. **EXIF Detection:** API reads the image's EXIF orientation metadata
2. **Automatic Rotation:** Applies the appropriate rotation to correct orientation
3. **Output:** Returns the correctly oriented image

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/RotateImageByExifData`
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
- `async`: true/false (async recommended for large images)

## Error Handling

- Invalid image file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations (configurable retry logic)
- Network connectivity issues
- File I/O errors
- Missing EXIF data
- Image processing failures

## Code Structure

The project consists of two main classes:

### Program Class
- **Main method:** Entry point that orchestrates the EXIF-based rotation process
- **Configuration:** API key and base URL constants

### ExifImageRotator Class
- **Constructor:** Initializes rotator with HTTP client, file paths, and API key
- **RotateImageByExifDataAsync:** Main rotation method with async/await pattern
- **Automatic output naming:** Generates output filename with `.exifrotated` suffix

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

4. **"No rotation applied"**
   - Image may not contain EXIF orientation data
   - Image may already be correctly oriented
   - Check if the image has EXIF metadata

5. **"Unexpected rotation"**
   - Verify the image has correct EXIF orientation data
   - Check if the image was previously processed
   - Ensure the image format supports EXIF data

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

### Photo Management
- Correct automatically captured photos from mobile devices
- Fix landscape/portrait orientation issues
- Standardize photo collections

### Content Processing
- Prepare images for web display
- Correct scanned document orientation
- Process bulk image uploads

### Digital Asset Management
- Automate image orientation correction
- Maintain consistent image presentation
- Process legacy image collections

### Mobile Applications
- Handle photos from various devices
- Correct camera orientation issues
- Improve user experience

## Performance Considerations

- **Image Size:** Larger images take longer to process
- **EXIF Data:** Images with complex EXIF data may require more processing
- **Format Support:** Some formats may not support EXIF data
- **Network:** Stable internet connection improves reliability
- **Processing Time:** Depends on image size and EXIF complexity

## Best Practices

### Image Preparation
- Use images with valid EXIF orientation data
- Ensure images are in supported formats (JPG, PNG)
- Check for existing EXIF data before processing

### Processing
- Use async processing for large images
- Monitor response times and adjust timeouts
- Validate output images for correct orientation
- Handle multiple images appropriately

### Quality Assurance
- Verify rotation results match expectations
- Test with various image orientations
- Check for any quality degradation
- Validate EXIF data preservation

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