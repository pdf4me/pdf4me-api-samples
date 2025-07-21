# Rotate Document - C# Implementation

This project demonstrates how to rotate an entire PDF document using the PDF4Me API with C#.

## ✅ Features

- Rotate entire PDF documents
- Support for multiple rotation options (Clockwise, CounterClockwise, UpsideDown)
- Configurable rotation settings
- Comprehensive error handling
- Asynchronous processing support
- Base64 encoding for file handling

## Prerequisites

- .NET Framework 4.7.2 or higher / .NET Core 2.1 or higher
- PDF4Me API key
- Visual Studio 2019 or later (recommended)
- Internet connection for API access

## Project Structure

```
Rotate Document/
├── Program.cs                 # Main application logic
├── README.md                  # This documentation
├── input.pdf                  # Sample input PDF file
└── output.pdf                 # Generated output PDF file
```

## Setup

1. **Clone or download this project**
2. **Configure your API key** in `Program.cs`:
   ```csharp
   private const string API_KEY = "your-api-key-here";
   ```
3. **Place your input PDF** in the project directory
4. **Run the application**:
   ```bash
   dotnet run
   ```

## Usage

The application will:
1. Read the input PDF file
2. Convert it to Base64
3. Send a request to rotate the document
4. Handle the response (synchronous or asynchronous)
5. Save the rotated PDF as `output.pdf`

### Expected Output

```
Reading input PDF file...
PDF file read successfully. Size: 245760 bytes

Sending request to rotate document...
Request sent successfully.

Processing response...
Response Status: 200 OK

Downloading rotated PDF...
PDF downloaded successfully. Size: 245760 bytes

Saving output file...
Output saved as: output.pdf

Process completed successfully!
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/RotatePage/RotatePage
```

## Specific Settings

### rotationType
- **Type**: `string`
- **Description**: Specifies the rotation direction
- **Options**:
  - `"Clockwise"`: Rotate 90 degrees clockwise
  - `"CounterClockwise"`: Rotate 90 degrees counter-clockwise
  - `"UpsideDown"`: Rotate 180 degrees

### pageNumbers
- **Type**: `int[]`
- **Description**: Array of page numbers to rotate (empty for entire document)
- **Example**: `[]` - rotates all pages in the document

## Implementation Details

### Key Components

1. **File Reading**: Reads PDF file and converts to Base64
2. **Request Building**: Constructs JSON payload with rotation parameters
3. **API Communication**: Sends HTTP POST request to PDF4Me API
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Download**: Downloads rotated PDF and saves to local file system

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format

## API Endpoints

### Rotate Document
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/RotatePage/RotatePage`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {API_KEY}`

## Request Payload

```json
{
  "document": {
    "docData": "base64-encoded-pdf-content"
  },
  "rotatePageAction": {
    "rotationType": "Clockwise",
    "pageNumbers": []
  }
}
```

## Response Handling

### Success Response (200 OK)
```json
{
  "document": {
    "docData": "base64-encoded-rotated-pdf"
  }
}
```

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
- **Response Processing**: Invalid JSON, unexpected status codes
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
   - Ensure `input.pdf` exists in the project directory
   - Check file permissions

3. **Network Errors**
   - Verify internet connection
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid Rotation Type**
   - Ensure rotation type is one of: "Clockwise", "CounterClockwise", "UpsideDown"
   - Check for typos in rotation type string

### Debug Mode

Enable detailed logging by setting:
```csharp
private const bool DEBUG_MODE = true;
```

## Sample Files

- **input.pdf**: Sample PDF file for testing
- **output.pdf**: Generated PDF after rotation

## Expected Workflow

1. **Input**: PDF file with multiple pages
2. **Processing**: Rotate entire document (e.g., 90 degrees clockwise)
3. **Output**: PDF file with all pages rotated

## Next Steps

- Implement batch processing for multiple files
- Add support for selective page rotation
- Integrate with web interface
- Add progress tracking for large files

## Future Enhancements

- **GUI Interface**: Create Windows Forms or WPF application
- **Batch Processing**: Handle multiple PDF files simultaneously
- **Preview Feature**: Show PDF thumbnails before rotation
- **Custom Rotation Angles**: Support for arbitrary rotation angles
- **Advanced Options**: Rotate based on content analysis

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **C# Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 