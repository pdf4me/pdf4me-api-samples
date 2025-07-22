# Get Image Metadata (C#)

A C# sample project for extracting metadata from images using the PDF4Me API.

## Project Structure

```
Get Image Metadata/
├── Program.cs                        # Main program with metadata extraction logic
├── Get_Image_Metadata.csproj         # Project file
├── Get_Image_Metadata.sln            # Solution file
├── global.json                       # .NET SDK configuration
├── sample.jpg                        # Sample input image
├── sample.png                        # Sample input image
└── README.md                         # This file
```

## Features

- ✅ Extract comprehensive metadata from images
- ✅ Support for multiple image formats (JPG, PNG)
- ✅ EXIF data extraction and analysis
- ✅ Image properties and technical information
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations with configurable retry logic
- ✅ Comprehensive error handling and logging
- ✅ Modern C# async/await patterns
- ✅ Strongly typed API integration
- ✅ JSON output format for easy parsing

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

- **Input:** Image file (default: `sample.png`)
- **Output:** JSON metadata (displayed in console and can be saved to file)

## Configuration

- **API Key:** Set in `Program.cs` as `API_KEY` constant
- **API Endpoint:** `https://api.pdf4me.com/api/v2/GetImageMetadata`
- **Supported Formats:** JPG, PNG
- **Image Types:**
  - **JPG:** JPEG image format
  - **PNG:** PNG image format

## Metadata Information

The API extracts various types of metadata including:

### Basic Image Properties
- **Dimensions:** Width and height in pixels
- **File Size:** Size in bytes
- **Format:** Image format and version
- **Color Space:** RGB, CMYK, Grayscale, etc.
- **Bit Depth:** Color depth information

### EXIF Data (if available)
- **Camera Information:** Make, model, lens
- **Capture Settings:** Aperture, shutter speed, ISO
- **Date/Time:** Original capture date
- **GPS Data:** Location coordinates (if present)
- **Software:** Editing software used

### Technical Information
- **Compression:** Compression type and quality
- **Resolution:** DPI and resolution information
- **Color Profile:** Embedded color profiles
- **Metadata Standards:** EXIF, IPTC, XMP support

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/GetImageMetadata`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Metadata JSON
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
- JSON serialization errors

## Code Structure

The project consists of two main classes:

### Program Class
- **Main method:** Entry point that orchestrates the metadata extraction process
- **Configuration:** API key and base URL constants

### ImageMetadataExtractor Class
- **Constructor:** Initializes extractor with HTTP client, file paths, and API key
- **GetImageMetadataAsync:** Main extraction method with async/await pattern
- **GetImageTypeFromExtension:** Utility method to determine image type from file extension
- **FormatMetadataJson:** Utility method to format JSON output for readability

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

4. **"Invalid image type"**
   - Ensure image type is "JPG" or "PNG"
   - Check that the image format matches the specified type

5. **"No metadata found"**
   - Some images may not contain metadata
   - Check if the image has EXIF data embedded

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

## Metadata Examples

### Basic Image Info
```json
{
  "width": 1920,
  "height": 1080,
  "format": "JPEG",
  "fileSize": 245760,
  "colorSpace": "RGB",
  "bitDepth": 8
}
```

### EXIF Data
```json
{
  "exif": {
    "make": "Canon",
    "model": "EOS 5D Mark IV",
    "dateTime": "2023:01:15 14:30:25",
    "exposureTime": "1/125",
    "fNumber": "f/2.8",
    "iso": 100
  }
}
```

## Use Cases

### Image Analysis
- Extract technical specifications
- Analyze image quality and properties
- Verify image authenticity

### Content Management
- Organize images by metadata
- Filter images by camera settings
- Track image origins and history

### Digital Forensics
- Extract embedded metadata
- Analyze image timestamps
- Verify image sources

## Performance Considerations

- **Large Images:** Use async processing for high-resolution images
- **Image Format:** Some formats may process faster than others
- **Network:** Stable internet connection improves reliability
- **Metadata Size:** Images with extensive metadata may take longer

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