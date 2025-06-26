# Add Margin to PDF - Java Implementation

This Java project demonstrates how to add margins to PDF documents using the PDF4me API.

## Features

- Add customizable margins to PDF documents
- Support for top, bottom, left, and right margins
- Configurable margin sizes in millimeters
- Asynchronous processing support
- Error handling and validation
- Base64 encoding for file transmission

## Prerequisites

- Java 17 or higher
- PDF4me API key (get from https://dev.pdf4me.com/dashboard/#/api-keys/)
- Sample PDF file for testing

## Project Structure

```
Add_Margin_To_PDF/
├── src/
│   └── Main.java          # Main application logic
├── out/                   # Compiled classes
├── .idea/                 # IntelliJ IDEA configuration
├── Add_Margin_To_PDF.iml  # IntelliJ module file
├── README.md             # This file
└── sample.pdf            # Sample PDF file (add your own)
```

## Setup

1. **Clone or download this project**
2. **Add your PDF4me API key** in `src/Main.java`:
   ```java
   private static final String API_KEY = "YOUR_API_KEY_HERE";
   ```
3. **Add a sample PDF file** named `sample.pdf` in the project root directory

## Usage

### Compile the Project
```bash
javac -d out src/Main.java
```

### Run the Application
```bash
java -cp out Main
```

## Configuration

### Margin Settings
The application is configured with the following default margins:
- **Top margin**: 20mm
- **Bottom margin**: 20mm
- **Left margin**: 20mm
- **Right margin**: 20mm

You can modify these values in the `Main.java` file.

### API Configuration
- **Base URL**: `https://api.pdf4me.com/`
- **Endpoint**: `/api/v2/AddMargin`
- **Authentication**: Basic Auth with API key

## API Endpoints

### Add Margin to PDF
- **Method**: POST
- **Endpoint**: `/api/v2/AddMargin`
- **Content-Type**: `application/json`

#### Request Payload
```json
{
  "docContent": "base64_encoded_pdf_content",
  "docName": "sample.pdf",
  "marginTop": 20,
  "marginBottom": 20,
  "marginLeft": 20,
  "marginRight": 20,
  "async": true
}
```

#### Response
- **200 OK**: PDF with margins (synchronous processing)
- **202 Accepted**: Processing started (asynchronous processing)
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Invalid API key
- **500 Internal Server Error**: Server error

## Error Handling

The application includes comprehensive error handling for:
- File not found errors
- API communication errors
- Authentication failures
- Processing timeouts
- Invalid responses

## Output

The processed PDF with margins will be saved as:
- **Filename**: `{original_name}.with_margins.pdf`
- **Location**: Same directory as the input file

## Troubleshooting

### Common Issues

1. **API Key Error (401)**
   - Verify your API key is correct
   - Ensure the key has proper permissions

2. **File Not Found**
   - Make sure `sample.pdf` exists in the project directory
   - Check file permissions

3. **Processing Timeout**
   - Large files may take longer to process
   - Check your internet connection

4. **Invalid Response (400)**
   - Verify the PDF file is valid and not corrupted
   - Check margin values are within acceptable ranges

### Debug Mode

Enable debug logging by setting the debug flag in `Main.java`:
```java
private static final boolean DEBUG = true;
```

## Dependencies

This project uses only standard Java libraries:
- `java.net.http` - HTTP client
- `java.util.Base64` - Base64 encoding
- `java.nio.file` - File operations
- `java.util.concurrent` - Async operations

## License

This project is part of the PDF4me API samples collection.

## Support

For issues related to:
- **PDF4me API**: Contact PDF4me support
- **This implementation**: Check the troubleshooting section above 