# Split PDF - C# Implementation

This project demonstrates how to split PDF files using the PDF4Me API with C#.

## ✅ Features

- Split PDF files by various criteria (page numbers, ranges, recurring patterns)
- Support for both synchronous and asynchronous processing
- Comprehensive error handling and logging
- Automatic polling for async operations
- Base64 encoding for file handling
- Multiple split methods (after page, recurring, sequence, ranges)
- Cross-platform compatibility

## Prerequisites

- .NET Framework 4.7.2 or higher / .NET Core 2.1 or higher
- PDF4Me API key
- Visual Studio 2019 or later (recommended)
- Internet connection for API access

## Project Structure

```
Split PDF/
├── Program.cs                 # Main application logic
├── README.md                  # This documentation
├── sample.pdf                 # Sample input PDF
└── split_output/              # Generated split PDF files
    ├── split_after_page_result.zip
    ├── recurring_split_result.zip
    ├── split_sequence_result.zip
    └── split_ranges_result.zip
```

## Setup

1. **Clone or download this project**
2. **Configure your API key** in `Program.cs`:
   ```csharp
   public static readonly string API_KEY = "your-api-key-here";
   ```
3. **Place your input PDF** in the project directory:
   - `sample.pdf` - Your PDF to split
4. **Run the application**:
   ```bash
   dotnet run
   ```

## Usage

The application will:
1. Read the input PDF file
2. Convert it to Base64
3. Send a request to split the PDF based on specified criteria
4. Handle the response (synchronous or asynchronous)
5. Save the split PDF files as a ZIP archive

### Expected Output

```
=== Splitting PDF ===
This splits PDF files by various criteria
Returns split PDF files in ZIP format
------------------------------------------------------------
Input PDF file: sample.pdf
Output directory: split_output/
Splitting PDF...
Reading and encoding PDF file...
PDF file read successfully: 12345 bytes
Sending split PDF request...
Status code: 202
Request accepted. Processing asynchronously...
Polling URL: https://api.pdf4me.com/api/v2/SplitPdf/...
Polling attempt 1/10...
PDF split completed successfully!
Split PDF files saved to: split_output/split_after_page_result.zip
Split operation completed successfully!
```

## API Configuration

### Base URL
```
https://api.pdf4me.com
```

### Endpoint
```
POST /api/v2/SplitPdf
```

## Specific Settings

### Split Parameters
- **pdfContent**: Base64 encoded PDF content
- **pdfName**: Input PDF name
- **splitAfterPage**: Split after specific page number
- **splitRecurringAfterPage**: Split recurring after specific page number
- **splitSequence**: Array of page numbers to split at
- **splitRanges**: String of page ranges (e.g., "1-3,5-7,9-10")
- **async**: `true` for asynchronous processing (recommended for large files)

## Implementation Details

### Key Components

1. **File Reading**: Reads input PDF and converts to Base64
2. **Request Building**: Constructs JSON payload with PDF content and split settings
3. **API Communication**: Sends HTTP POST request to PDF4Me API
4. **Response Handling**: Processes both synchronous (200) and asynchronous (202) responses
5. **File Processing**: Saves the split PDF files as ZIP archive

### Error Handling

- **File Not Found**: Handles missing input files
- **API Errors**: Processes HTTP error responses
- **Network Issues**: Handles connection timeouts and failures
- **Invalid Responses**: Validates API response format

## API Endpoints

### Split PDF
- **Method**: `POST`
- **URL**: `https://api.pdf4me.com/api/v2/SplitPdf`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Basic {API_KEY}`

## Request Payload Examples

### Split After Page
```json
{
  "pdfContent": "base64-encoded-pdf",
  "pdfName": "sample.pdf",
  "splitAfterPage": 5,
  "async": true
}
```

### Recurring Split
```json
{
  "pdfContent": "base64-encoded-pdf",
  "pdfName": "sample.pdf",
  "splitRecurringAfterPage": 3,
  "async": true
}
```

### Split Sequence
```json
{
  "pdfContent": "base64-encoded-pdf",
  "pdfName": "sample.pdf",
  "splitSequence": [2, 5, 8],
  "async": true
}
```

### Split Ranges
```json
{
  "pdfContent": "base64-encoded-pdf",
  "pdfName": "sample.pdf",
  "splitRanges": "1-3,5-7,9-10",
  "async": true
}
```

## Response Handling

### Success Response (200 OK)
- Returns the split PDF files as a ZIP archive

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
   - Ensure `sample.pdf` exists in the project directory
   - Check file permissions

3. **Network Errors**
   - Verify internet connection
   - Check firewall settings
   - Ensure API endpoint is accessible

4. **Invalid PDF Format**
   - Ensure input file is a valid PDF document
   - Check if PDF file is corrupted or password-protected

5. **Invalid Split Parameters**
   - Ensure page numbers are within the PDF's page range
   - Check split range format for range-based splitting

### Debug Mode

Enable detailed logging by setting:
```csharp
private const bool DEBUG_MODE = true;
```

## Sample Files

- **sample.pdf**: Sample input PDF
- **split_output/**: Directory containing split PDF ZIP files

## Expected Workflow

1. **Input**: PDF file and split criteria
2. **Processing**: Split PDF according to specified method
3. **Output**: ZIP archive containing split PDF files

## Next Steps

- Implement batch processing for multiple PDFs
- Add support for different PDF formats
- Integrate with web interface
- Add progress tracking for large files

## Future Enhancements

- **GUI Interface**: Create Windows Forms or WPF application
- **Batch Processing**: Handle multiple PDFs simultaneously
- **Preview Feature**: Show split preview before processing
- **Custom Options**: Configure output file naming and organization
- **Advanced Options**: Support for custom split patterns and criteria

## License

This project is provided as-is for educational and development purposes.

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **C# Implementation**: Check the troubleshooting section above
- **General Questions**: Refer to PDF4Me documentation 