# Unlock PDF - Java Implementation

This Java project demonstrates how to unlock password-protected PDF documents using the PDF4ME API. It removes password protection from PDF files while maintaining document integrity.

## Features

- **Password Removal**: Removes password protection from PDF documents
- **Document Integrity**: Preserves original document content and formatting
- **Asynchronous Processing**: Handles large files efficiently with async processing
- **Error Handling**: Comprehensive error handling and logging
- **Polling Mechanism**: Implements retry logic for long-running operations

## Prerequisites

- Java 11 or higher
- PDF4ME API key (get from https://dev.pdf4me.com/dashboard/#/api-keys/)
- Password-protected PDF file for testing

## Project Structure

```
Unlock_PDF/
├── src/
│   └── Main.java          # Main implementation
├── sample.protected.pdf   # Sample password-protected PDF file for testing
├── Unlock_PDF.iml        # IntelliJ IDEA module file
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Configuration

### API Key Setup

1. Get your API key from [PDF4ME Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
2. Update the `API_KEY` constant in `Main.java`:

```java
private static final String API_KEY = "your-api-key-here";
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
=== Unlocking PDF Document ===
Unlocked PDF saved to: sample.protected.unlocked.pdf
```

## API Endpoints

- **POST** `/api/v2/Unlock` - Unlocks a password-protected PDF document

## Request Payload

```json
{
  "docName": "output.pdf",
  "docContent": "base64-encoded-pdf-content",
  "password": "1234",
  "async": true
}
```

## Response Handling

The application handles two types of responses:

1. **200 OK**: Immediate success, returns the unlocked PDF
2. **202 Accepted**: Asynchronous processing, polls for completion

## Error Handling

- File not found errors
- API authentication errors (401)
- Network connectivity issues
- Timeout errors for long-running operations
- Invalid password errors

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
- Be cautious when removing password protection from sensitive documents

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check your API key configuration
2. **File not found**: Ensure `sample.protected.pdf` exists in the project directory
3. **Network errors**: Verify internet connectivity and API endpoint accessibility
4. **Invalid password**: Ensure the correct password is provided for the protected PDF

### Debug Mode

Enable debug logging by adding print statements or using a logging framework.

## License

This project is part of the PDF4ME API samples collection.

## Support

For API-related issues, contact PDF4ME support.
For implementation questions, refer to the PDF4ME documentation. 