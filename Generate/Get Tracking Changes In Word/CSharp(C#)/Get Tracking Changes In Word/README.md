# Get Tracking Changes In Word - C# Implementation

This project demonstrates how to extract tracking changes, revisions, and comments from Word documents using the PDF4Me API with C#.

## ✅ Features

- Extract tracking changes from Word documents
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- JSON output with detailed change information
- Cross-platform compatibility

## Prerequisites

- .NET Framework 4.7.2 or higher / .NET Core 2.1 or higher
- PDF4Me API key
- Visual Studio 2019 or later (recommended)
- Internet connection for API access

## Project Structure

```
Get Tracking Changes In Word/
├── Program.cs                 # Main application logic
├── README.md                  # This documentation
├── sample.docx                # Sample input Word document
└── sample.tracking_changes.json  # Generated JSON with tracking changes
```

## Setup

1. **Clone or download this project**
2. **Configure your API key** in `Program.cs`:
   ```csharp
   public static readonly string API_KEY = "your-api-key-here";
   ```
3. **Place your input Word document** as `sample.docx` in the project directory
4. **Run the application**:
   ```bash
   dotnet run
   ```

## Usage

The application will:
1. Read the input Word document
2. Convert it to Base64
3. Send a request to extract tracking changes
4. Handle the response (synchronous or asynchronous)
5. Save the tracking changes as JSON

### Expected Output

```
=== Getting Tracking Changes from Word Document ===
This extracts all tracking changes, revisions, and comments from Word documents
Returns detailed JSON with all change information
------------------------------------------------------------
Input Word file: sample.docx
Output JSON file: sample.tracking_changes.json
Extracting tracking changes information...
Reading and encoding Word document file...
Word document file read successfully: 12345 bytes
Sending get tracking changes request...
Status code: 202
Request accepted. Processing asynchronously...
Polling URL: https://api.pdf4me.com/api/v2/GetTrackingChangesInWord/...
Polling attempt 1/10...
Getting tracking changes completed successfully!
Tracking changes JSON saved to: sample.tracking_changes.json
Tracking changes data structure:
- Document contains tracking changes information
- JSON file size: 5678 characters
- Number of revisions: 5
- Number of comments: 3
- Number of changes: 12
Get tracking changes operation completed successfully!
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/v2/GetTrackingChangesInWord
```

## Specific Settings

### Tracking Changes Parameters
- **docContent**: Base64 encoded Word document content
- **docName**: Input document name
- **async**: `true` for asynchronous processing (recommended for large files)

## Implementation Details

### Key Components

1. **File Reading**: Reads Word document and converts to Base64
2. **Request Building**: Constructs JSON payload with document content
3. **API Communication**: Sends HTTP POST request to PDF4Me API
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **JSON Processing**: Parses and saves tracking changes information

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format

## API Endpoints

### Get Tracking Changes
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/GetTrackingChangesInWord`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload

```json
{
  "docContent": "base64-encoded-word-document",
  "docName": "sample.docx",
  "async": true
}
```

## Response Handling

### Success Response (200 OK)
```json
{
  "revisions": [
    {
      "author": "John Doe",
      "date": "2024-01-15T10:30:00Z",
      "changes": [
        {
          "type": "insertion",
          "text": "new content",
          "position": 123
        }
      ]
    }
  ],
  "comments": [
    {
      "author": "Jane Smith",
      "text": "Please review this section",
      "position": 456
    }
  ],
  "metadata": {
    "documentName": "sample.docx",
    "totalRevisions": 5,
    "totalComments": 3
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
   - Ensure `sample.docx` exists in the project directory
   - Check file permissions

3. **Network Errors**
   - Verify internet connection
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid Word Document Format**
   - Ensure input file is a valid .docx document
   - Check if document is corrupted or password-protected

5. **No Tracking Changes Found**
   - Ensure the Word document has tracking changes enabled
   - Check if the document contains revisions or comments

### Debug Mode

Enable detailed logging by setting:
```csharp
private const bool DEBUG_MODE = true;
```

## Sample Files

- **sample.docx**: Sample Word document with tracking changes
- **sample.tracking_changes.json**: Generated JSON with tracking changes information

## Expected Workflow

1. **Input**: Word document (.docx format) with tracking changes
2. **Processing**: Extract all tracking changes, revisions, and comments
3. **Output**: JSON file with detailed change information

## Next Steps

- Implement batch processing for multiple files
- Add support for different Word document formats
- Integrate with web interface
- Add progress tracking for large files

## Future Enhancements

- **GUI Interface**: Create Windows Forms or WPF application
- **Batch Processing**: Handle multiple Word documents simultaneously
- **Preview Feature**: Show tracking changes summary before extraction
- **Custom Filters**: Filter changes by author, date, or type
- **Advanced Options**: Export to different formats (XML, CSV)

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **C# Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 