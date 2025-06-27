# Protect Document - Java Implementation

This Java project demonstrates how to protect PDF documents using the PDF4ME API. It adds password protection and permission restrictions to PDF files.

## Features

- **Password Protection**: Adds password protection to PDF documents
- **Permission Control**: Sets PDF permissions to control access
- **Asynchronous Processing**: Handles large files efficiently with async processing
- **Error Handling**: Comprehensive error handling and logging
- **Polling Mechanism**: Implements retry logic for long-running operations

## Prerequisites

- Java 11 or higher
- PDF4ME API key (get from https://dev.pdf4me.com/dashboard/#/api-keys/)
- Sample PDF file for testing

## Project Structure

```
Protect_Document/
├── src/
│   └── Main.java          # Main implementation
├── sample.pdf             # Sample PDF file for testing
├── Protect_Document.iml   # IntelliJ IDEA module file
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Configuration

### API Key Setup

1. Get your API key from [PDF4ME Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
2. Update the `API_KEY` constant in `Main.java`:

```java
private static final String API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
```

### Base URL

The project uses the development API endpoint by default:
```java
private static final String BASE_URL = "https://api.pdf4me.com/";
```

## Usage

### Running the Application

1. **Compile the Java code:**
   ```bash
   javac -cp . src/Main.java
   ```

2. **Run the application:**
   ```bash
   java -cp src Main
   ```

### Expected Output

```
=== Protecting PDF Document ===
Protected document saved to: sample.protected.pdf
```

## API Endpoints

- **POST** `/api/v2/Protect` - Protects a PDF document with password and permissions

## Request Payload

```json
{
  "docName": "output.pdf",
  "docContent": "base64-encoded-pdf-content",
  "password": "1234",
  "pdfPermission": "All",
  "async": true
}
```

## Response Handling

The application handles two types of responses:

1. **200 OK**: Immediate success, returns the protected PDF
2. **202 Accepted**: Asynchronous processing, polls for completion

## Error Handling

- File not found errors
- API authentication errors (401)
- Network connectivity issues
- Timeout errors for long-running operations

## Dependencies

This project uses only standard Java libraries:
- `java.net.http` - HTTP client for API communication
- `java.nio.file` - File operations
- `java.util.Base64` - Base64 encoding/decoding
- `java.util` - Collections and utilities

## Security Considerations

- API keys should be stored securely (not hardcoded in production)
- Use HTTPS for all API communications
- Validate input files before processing
- Implement proper error handling for sensitive operations

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check your API key configuration
2. **File not found**: Ensure `sample.pdf` exists in the project directory
3. **Network errors**: Verify internet connectivity and API endpoint accessibility

### Debug Mode

Enable debug logging by adding print statements or using a logging framework.

## License

This project is part of the PDF4ME API samples collection.

## Support

For API-related issues, contact PDF4ME support.
For implementation questions, refer to the PDF4ME documentation. 