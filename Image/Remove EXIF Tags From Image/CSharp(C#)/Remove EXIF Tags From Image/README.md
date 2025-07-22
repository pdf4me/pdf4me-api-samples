# Remove EXIF Tags From Image (C#)

A C# sample project for removing EXIF tags and metadata from images using the PDF4Me API.

## Project Structure

```
Remove EXIF Tags From Image/
├── Program.cs                              # Main program with EXIF tag removal logic
├── Remove_EXIF_Tags_From_Image.csproj      # Project file
├── Remove_EXIF_Tags_From_Image.sln         # Solution file
├── global.json                             # .NET SDK configuration
├── sample.jpg                              # Sample input image with EXIF data
├── sample.png                              # Sample input image
├── sample.noexif.jpg                       # Sample output cleaned image (generated)
└── README.md                               # This file
```

## Features

- ✅ Remove EXIF tags and metadata from images
- ✅ Support for multiple image formats (JPG, PNG)
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations with configurable retry logic
- ✅ Comprehensive error handling and logging
- ✅ Modern C# async/await patterns
- ✅ Strongly typed API integration
- ✅ Detailed response logging for debugging
- ✅ Privacy protection and file size optimization

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

1. **Set the input image and image type (optional):**
   - Edit the `imagePath` and image type in `Program.cs` if needed

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

- **Input:** Image file with EXIF data (default: `sample.jpg`)
- **Output:** Cleaned image file without EXIF tags (auto-generated name with `.noexif` suffix)

## Configuration

- **API Key:** Set in `Program.cs` as `API_KEY` constant
- **API Endpoint:** `https://api.pdf4me.com/api/v2/RemoveEXIFTagsFromImage`
- **Supported Formats:** JPG, PNG
- **Image Types:**
  - **JPG:** JPEG image format
  - **PNG:** PNG image format
- **Timeout:** 300 seconds (5 minutes) for large images

## EXIF Data Removal

The API removes various types of metadata including:

### Camera Information
- **Make and Model:** Camera manufacturer and model
- **Lens Information:** Lens type and specifications
- **Serial Numbers:** Camera and lens serial numbers

### Capture Settings
- **Aperture:** F-stop values
- **Shutter Speed:** Exposure time
- **ISO:** Light sensitivity settings
- **Focal Length:** Lens focal length
- **Flash Information:** Flash usage and settings

### Location Data
- **GPS Coordinates:** Latitude and longitude
- **GPS Altitude:** Elevation data
- **GPS Timestamp:** Location timestamp

### Date and Time
- **Original Capture Date:** When the photo was taken
- **Modification Date:** Last modification timestamp
- **Software Information:** Editing software used

### Other Metadata
- **Color Space:** Color profile information
- **Resolution:** DPI and resolution data
- **Copyright:** Copyright information
- **Artist Information:** Photographer details

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/RemoveEXIFTagsFromImage`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Timeout:** 300 seconds (5 minutes)
- **Response:**
  - 200: Cleaned image (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `docContent`: Base64 encoded image content
- `docName`: Input image filename
- `imageType`: "JPG" or "PNG"
- `async`: true/false (async recommended for large images)

## Error Handling

- Invalid image file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations (configurable retry logic)
- Network connectivity issues
- File I/O errors
- Invalid image type
- EXIF removal failures

## Code Structure

The project consists of two main classes:

### Program Class
- **Main method:** Entry point that orchestrates the EXIF removal process
- **Configuration:** API key and base URL constants

### ExifTagRemover Class
- **Constructor:** Initializes remover with HTTP client, file paths, and API key
- **RemoveExifTagsAsync:** Main removal method with async/await pattern
- **GetImageTypeFromExtension:** Utility method to determine image type from file extension
- **Automatic output naming:** Generates output filename with `.noexif` suffix

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

4. **"No EXIF data found"**
   - Some images may not contain EXIF data
   - The API will still return a cleaned image

5. **"Invalid image type"**
   - Ensure image type is "JPG" or "PNG"
   - Check that the image format matches the specified type

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

### Privacy Protection
- Remove location data from social media images
- Strip camera information from sensitive photos
- Protect personal information in shared images

### File Optimization
- Reduce file size by removing unnecessary metadata
- Clean images for web publishing
- Optimize images for storage

### Compliance
- Meet privacy regulations (GDPR, CCPA)
- Remove metadata for legal documents
- Ensure data protection standards

### Content Management
- Standardize image metadata across collections
- Prepare images for public distribution
- Clean images for archival purposes

## Performance Considerations

- **Image Quality:** EXIF removal doesn't affect image quality
- **File Size:** May reduce file size by removing metadata
- **Image Size:** Larger images may take longer to process
- **Network:** Stable internet connection improves reliability
- **Processing Time:** Depends on image size and metadata complexity

## Best Practices

### Image Preparation
- Use high-resolution images for better results
- Ensure images are in supported formats (JPG, PNG)
- Check for existing EXIF data before processing

### Processing
- Use async processing for large images
- Monitor response times and adjust timeouts
- Validate output images for completeness
- Handle multiple image formats appropriately

### Privacy Considerations
- Always remove EXIF data from images shared publicly
- Consider EXIF removal for sensitive content
- Implement automated EXIF removal for user uploads

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