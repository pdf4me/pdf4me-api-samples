# Generate Document Single - Java Implementation

This Java project demonstrates how to generate single documents using the PDF4ME API. It combines HTML templates with JSON data to create customized documents.

## Features

- **Template Processing**: Uses HTML templates for document generation
- **Data Integration**: Merges JSON data with templates
- **Multiple Output Formats**: Supports various output types (HTML, PDF, DOCX)
- **Asynchronous Processing**: Handles large files efficiently with async processing
- **Error Handling**: Comprehensive error handling and logging
- **Polling Mechanism**: Implements retry logic for long-running operations

## Prerequisites

- Java 11 or higher
- PDF4ME API key (get from https://dev.pdf4me.com/dashboard/#/api-keys/)
- HTML template file for testing
- JSON data file for testing

## Project Structure

```
Generate_Document_Single/
├── src/
│   └── Main.java                    # Main implementation
├── invoice_sample.html              # Sample HTML template file
├── invoice_sample_data.json         # Sample JSON data file
├── Generate_Document_Single.iml    # IntelliJ IDEA module file
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

## Configuration

### API Key Setup

1. Get your API key from [PDF4ME Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
2. Update the `API_KEY` constant in `Main.java`:

```java
private static final String API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/ ";
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
=== Generating Single Document ===
Generated document saved to: invoice_sample.generated.html
```

## API Endpoints

- **POST** `/api/v2/GenerateDocumentSingle` - Generates a single document from template and data

## Request Payload

```json
{
  "templateFileType": "html",
  "templateFileName": "invoice_template.html",
  "templateFileData": "base64-encoded-template-content",
  "documentDataType": "text",
  "outputType": "html",
  "documentDataText": "json-data-content",
  "async": false
}
```

## Response Handling

The application handles two types of responses:

1. **200 OK**: Immediate success, returns the generated document
2. **202 Accepted**: Asynchronous processing, polls for completion

## Error Handling

- File not found errors
- API authentication errors (401)
- Network connectivity issues
- Timeout errors for long-running operations
- JSON parsing errors

## Dependencies

This project uses only standard Java libraries:
- `java.net.http` - HTTP client for API communication
- `java.nio.file` - File operations
- `java.util.Base64` - Base64 encoding/decoding
- `java.util` - Collections and utilities

## Template and Data Files

### HTML Template
The project uses an HTML template (`invoice_sample.html`) that contains placeholders for dynamic data.

### JSON Data
The JSON data file (`invoice_sample_data.json`) contains the data to be merged into the template.

## Security Considerations

- API keys should be stored securely (not hardcoded in production)
- Use HTTPS for all API communications
- Validate input files before processing
- Implement proper error handling for sensitive operations

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check your API key configuration
2. **File not found**: Ensure template and data files exist in the project directory
3. **Network errors**: Verify internet connectivity and API endpoint accessibility
4. **JSON parsing errors**: Validate JSON data format

### Debug Mode

Enable debug logging by adding print statements or using a logging framework.

## License

This project is part of the PDF4ME API samples collection.

## Support

For API-related issues, contact PDF4ME support.
For implementation questions, refer to the PDF4ME documentation. 