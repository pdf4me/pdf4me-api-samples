# Crop Image (C#)

A C# sample project for cropping images using the PDF4Me API.

## Project Structure

```
Crop Image/
├── Program.cs                          # Main program with image cropping logic
├── Crop_Image.csproj                   # Project file
├── Crop_Image.sln                      # Solution file
├── global.json                         # .NET SDK configuration
├── sample.jpg                          # Sample input image
├── sample.cropped.jpg                  # Sample output cropped image (generated)
└── README.md                           # This file
```

## Features

- ✅ Crop images using border-based or rectangle-based methods
- ✅ Configurable crop dimensions and coordinates
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

1. **Set the input image and crop settings (optional):**
   - Edit the `imagePath` and crop parameters in `Program.cs` if needed

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
- **Output:** Cropped image file (auto-generated name with `.cropped` suffix)

## Configuration

- **API Key:** Set in `Program.cs` as `API_KEY` constant
- **API Endpoint:** `https://api.pdf4me.com/api/v2/CropImage?schemaVal=Border`
- **Supported Formats:** JPG, PNG, GIF, BMP, TIFF
- **Crop Types:**
  - **Border:** Crop by removing borders from all sides
  - **Rectangle:** Crop to a specific rectangular area

## Crop Methods

### Method 1: Border Cropping
Remove borders from all sides of the image:
```csharp
"CropType": "Border",
"LeftBorder": "10",      // Remove 10 pixels from left
"RightBorder": "10",     // Remove 10 pixels from right
"TopBorder": "20",       // Remove 20 pixels from top
"BottomBorder": "20"     // Remove 20 pixels from bottom
```

### Method 2: Rectangle Cropping
Crop to a specific rectangular area:
```csharp
"CropType": "Rectangle",
"UpperLeftX": 10,        // X coordinate of upper-left corner
"UpperLeftY": 10,        // Y coordinate of upper-left corner
"Width": 50,             // Width of crop area
"Height": 50             // Height of crop area
```

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/CropImage?schemaVal=Border`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Cropped image (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Payload Options

- `docContent`: Base64 encoded image content
- `docName`: Input image filename
- `CropType`: "Border" or "Rectangle"
- `LeftBorder`, `RightBorder`, `TopBorder`, `BottomBorder`: Border crop values (integers)
- `UpperLeftX`, `UpperLeftY`: Rectangle crop coordinates (integers)
- `Width`, `Height`: Rectangle crop dimensions (integers)
- `async`: true/false (async recommended for large images)

## Error Handling

- Invalid image file or format
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations (configurable retry logic)
- Network connectivity issues
- File I/O errors
- Invalid crop parameters
- JSON serialization errors

## Code Structure

The project consists of two main classes:

### Program Class
- **Main method:** Entry point that orchestrates the cropping process
- **Configuration:** API key and base URL constants

### ImageCropper Class
- **Constructor:** Initializes cropper with HTTP client, file paths, and API key
- **CropImageAsync:** Main cropping method with async/await pattern
- **Automatic output naming:** Generates output filename with `.cropped` suffix
- **Crop parameter validation:** Ensures crop dimensions are valid

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

4. **"Invalid crop parameters"**
   - Ensure crop dimensions don't exceed image size
   - Check that coordinates are within image bounds
   - Verify crop type is correctly specified

5. **"Crop area too large"**
   - Reduce crop dimensions
   - Check that crop area fits within original image

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

## Crop Examples

### Remove Borders
```csharp
// Remove 10 pixels from each side
"LeftBorder": "10",
"RightBorder": "10", 
"TopBorder": "10",
"BottomBorder": "10"
```

### Crop to Center
```csharp
// Crop to center 100x100 area
"UpperLeftX": 50,
"UpperLeftY": 50,
"Width": 100,
"Height": 100
```

### Crop Top Portion
```csharp
// Remove bottom 20% of image
"TopBorder": "0",
"BottomBorder": "80"  // Remove 80% from bottom
```

## Performance Considerations

- **Large Images:** Use async processing for high-resolution images
- **Crop Size:** Smaller crop areas process faster
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