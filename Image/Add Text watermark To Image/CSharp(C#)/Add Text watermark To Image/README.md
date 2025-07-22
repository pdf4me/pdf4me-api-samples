# Add Text Watermark To Image - C# Implementation

This project demonstrates how to add text watermarks to images using the PDF4Me API with C#.

## ✅ Features

- Add text watermarks to various image formats (PNG, JPG, GIF, etc.)
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- Configurable text, font, color, position, and opacity
- Cross-platform compatibility

## Prerequisites

- .NET Framework 4.7.2 or higher / .NET Core 2.1 or higher
- PDF4Me API key
- Visual Studio 2019 or later (recommended)
- Internet connection for API access

## Project Structure

```
Add Text watermark To Image/
├── Program.cs                 # Main application logic
├── README.md                  # This documentation
├── sample.png                 # Sample input image
└── watermarked_output.png     # Generated watermarked image
```

## Setup

1. **Clone or download this project**
2. **Configure your API key** in `Program.cs`:
   ```csharp
   public static readonly string API_KEY = "your-api-key-here";
   ```
3. **Place your input image** in the project directory:
   - `sample.png` - Your base image
4. **Run the application**:
   ```bash
   dotnet run
   ```

## Usage

The application will:
1. Read the input image
2. Convert it to Base64
3. Send a request to add the text watermark
4. Handle the response (synchronous or asynchronous)
5. Save the watermarked image

### Expected Output

```
=== Adding Text Watermark to Image ===
This adds text watermarks to images with configurable styling
Returns watermarked image with applied text watermark
------------------------------------------------------------
Input image file: sample.png
Output image file: watermarked_output.png
Adding text watermark...
Reading and encoding image file...
Image file read successfully: 12345 bytes
Sending add text watermark request...
Status code: 202
Request accepted. Processing asynchronously...
Polling URL: https://api.pdf4me.com/api/v2/AddTextWatermarkToImage/...
Polling attempt 1/10...
Text watermark addition completed successfully!
Watermarked image saved to: watermarked_output.png
Text watermark addition operation completed successfully!
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/v2/AddTextWatermarkToImage
```

## Specific Settings

### Text Watermark Parameters
- **imageContent**: Base64 encoded image content
- **imageName**: Input image name
- **text**: Text to be added as watermark
- **position**: Watermark position (top-left, top-right, bottom-left, bottom-right, center)
- **fontSize**: Font size in pixels
- **fontColor**: Font color (hex code or color name)
- **opacity**: Watermark opacity (0.0 to 1.0)
- **async**: `true` for asynchronous processing (recommended for large images)

## Implementation Details

### Key Components

1. **File Reading**: Reads input image and converts to Base64
2. **Request Building**: Constructs JSON payload with image content and text watermark settings
3. **API Communication**: Sends HTTP POST request to PDF4Me API
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Processing**: Saves the watermarked image

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format

## API Endpoints

### Add Text Watermark
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/AddTextWatermarkToImage`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload

```json
{
  "imageContent": "base64-encoded-image",
  "imageName": "sample.png",
  "text": "CONFIDENTIAL",
  "position": "bottom-right",
  "fontSize": 24,
  "fontColor": "#FF0000",
  "opacity": 0.7,
  "async": true
}
```

## Response Handling

### Success Response (200 OK)
- Returns the watermarked image as binary data

### Asynchronous Response (202 Accepted)
```json
{
  "jobId": "job-12345",
  "status": "Accepted"
}
```

## Error Handling

The application includes comprehensive error handling for:

- **File Operations**: Missing files, permission issues
- **API Communication**: Network errors, timeouts
- **Response Processing**: Invalid responses, unexpected status codes
- **Base64 Operations**: Encoding/decoding errors

## Dependencies

- **System.Net.Http**: HTTP client for API communication
- **System.Text.Json**: JSON serialization/deserialization
- **System.IO**: File operations
- **System.Text**: Base64 encoding/decoding

## Security Considerations

- **API Key Protection**: Store API keys securely, not in source code
- **File Validation**: Validate input files before processing
- **Error Information**: Avoid exposing sensitive information in error messages
- **HTTPS**: All API communications use HTTPS

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify your API key is correct
   - Check if the key has necessary permissions

2. **File Not Found**
   - Ensure `sample.png` exists in the project directory
   - Check file permissions

3. **Network Errors**
   - Verify internet connection
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid Image Format**
   - Ensure image file is in a supported format (PNG, JPG, GIF, etc.)
   - Check if image file is corrupted

5. **Text Not Visible**
   - Adjust font size, color, or opacity for better visibility
   - Consider text position relative to image content

### Debug Mode

Enable detailed logging by setting:
```csharp
private const bool DEBUG_MODE = true;
```

## Sample Files

- **sample.png**: Sample input image
- **watermarked_output.png**: Generated watermarked image

## Expected Workflow

1. **Input**: Image file and text watermark settings
2. **Processing**: Add text watermark to image with specified styling
3. **Output**: Watermarked image

## Next Steps

- Implement batch processing for multiple images
- Add support for different image formats
- Integrate with web interface
- Add progress tracking for large images

## Future Enhancements

- **GUI Interface**: Create Windows Forms or WPF application
- **Batch Processing**: Handle multiple images simultaneously
- **Preview Feature**: Show watermark preview before processing
- **Custom Options**: Configure font family, rotation, and effects
- **Advanced Options**: Support for multiple text watermarks on one image

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **C# Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 