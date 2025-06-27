# Generate Documents Multiple - Java Prototype

This project demonstrates how to generate multiple documents using the PDF4ME API in Java.

## Features

- Generates DOCX documents from templates using JSON data
- Supports multiple output formats (PDF, DOCX, HTML)
- Handles both synchronous and asynchronous API responses
- Includes proper error handling and retry logic
- Validates generated document signatures

## Usage

1. Place your input DOCX template as `sample.docx` in this directory
2. Place your JSON data as `sample.json` in this directory
3. Run `Main.java` to generate documents
4. Generated output will be saved as `sample.generated.docx`

## Implementation Details

- Uses Java 11+ HttpClient for API communication
- Implements JSON response parsing for document extraction
- Handles 200 (success) and 202 (async/polling) responses
- Includes DOCX file signature validation
- Follows the same logic as the C# Program.cs implementation

## API Endpoint

- **URL**: `/api/v2/GenerateDocumentMultiple`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: application/json

## Sample Output

The program successfully generates `sample.generated.docx` with the following output:
```
=== Generating DOCX Document ===
Response Content-Type: application/json; charset=utf-8
Received 15219 characters
Valid DOCX file signature detected
Generated DOCX document saved to: sample.generated.docx
``` 