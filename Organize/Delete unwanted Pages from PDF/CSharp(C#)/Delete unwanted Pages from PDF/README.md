# Delete Unwanted Pages from PDF - C# Implementation

This project demonstrates how to delete unwanted pages from a PDF document using the PDF4Me API with C#.

## ✅ Features

- Delete specific pages from PDF documents
- Support for single page numbers and page ranges
- Configurable page deletion options
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
Delete unwanted Pages from PDF/
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
3. Send a request to delete unwanted pages
4. Handle the response (synchronous or asynchronous)
5. Save the processed PDF as `output.pdf`

### Expected Output

```
Reading input PDF file...
PDF file read successfully. Size: 245760 bytes

Sending request to delete unwanted pages...
Request sent successfully.

Processing response...
Response Status: 200 OK

Downloading processed PDF...
PDF downloaded successfully. Size: 198432 bytes

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
POST /api/DeletePage/DeletePage
```

## Specific Settings

### deletePageOption
- **Type**: `string`
- **Description**: Specifies which pages to delete
- **Options**:
  - `"PageNumbers"`: Delete specific page numbers
  - `"PageRanges"`: Delete page ranges

### pageNumbers
- **Type**: `int[]`
- **Description**: Array of page numbers to delete (1-based indexing)
- **Example**: `[1, 3, 5]` - deletes pages 1, 3, and 5

### pageRanges
- **Type**: `string[]`
- **Description**: Array of page ranges to delete
- **Example**: `["1-3", "5-7"]` - deletes pages 1-3 and 5-7

## Implementation Details

### Key Components

1. **File Reading**: Reads PDF file and converts to Base64
2. **Request Building**: Constructs JSON payload with page deletion parameters
3. **API Communication**: Sends HTTP POST request to PDF4Me API
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Download**: Downloads processed PDF and saves to local file system

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format

## API Endpoints

### Delete Pages
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/DeletePage/DeletePage`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {API_KEY}`

## Request Payload

```json
{
  "document": {
    "docData": "base64-encoded-pdf-content"
  },
  "deletePageAction": {
    "deletePageOption": "PageNumbers",
    "pageNumbers": [1, 3, 5]
  }
}
```

## Response Handling

### Success Response (200 OK)
```json
{
  "document": {
    "docData": "base64-encoded-processed-pdf"
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

4. **Invalid Page Numbers**
   - Page numbers must be 1-based
   - Ensure page numbers don't exceed PDF page count
   - Check for duplicate page numbers

### Debug Mode

Enable detailed logging by setting:
```csharp
private const bool DEBUG_MODE = true;
```

## Sample Files

- **input.pdf**: Sample PDF file for testing
- **output.pdf**: Generated PDF after page deletion

## Expected Workflow

1. **Input**: PDF file with multiple pages
2. **Processing**: Delete specified pages (e.g., pages 1, 3, 5)
3. **Output**: PDF file with remaining pages (e.g., pages 2, 4, 6+)

## Next Steps

- Implement batch processing for multiple files
- Add support for more page selection options
- Integrate with web interface
- Add progress tracking for large files

## Future Enhancements

- **GUI Interface**: Create Windows Forms or WPF application
- **Batch Processing**: Handle multiple PDF files simultaneously
- **Preview Feature**: Show PDF thumbnails before deletion
- **Undo Functionality**: Keep backup of original files
- **Advanced Options**: Delete pages based on content analysis

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **C# Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 