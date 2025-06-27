# FlattenPDF

A Java implementation for flattening PDF forms and annotations using the PDF4Me API with modern HttpClient.

## Project Structure

```
FlattenPDF/
├── src/
│   └── Main.java          # Main application entry point with HttpClient implementation
├── unflattened-sample.pdf # Sample PDF with interactive elements for testing
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── FlattenPDF.iml         # IntelliJ IDEA module file
```

## Features

- ✅ **Implemented** - PDF flattening using PDF4Me API
- ✅ **Modern HttpClient** - Uses Java 11+ HttpClient instead of HttpURLConnection
- ✅ **Async Polling** - Handles 202 responses with robust polling mechanism
- ✅ **Error Handling** - Comprehensive error handling with detailed status messages
- ✅ **Base64 Encoding** - Proper file encoding for API requests
- ✅ **PDF Validation** - Validates PDF responses and extracts from JSON
- ✅ **File Validation** - Checks input file existence before processing
- ✅ **Interactive Element Conversion** - Converts all interactive elements to static content

## What PDF Flattening Does

- **Form Fields** → Static text (no longer editable)
- **Annotations** → Permanent marks (comments become part of document)
- **Layers** → Single merged layer (all layers combined)
- **Digital Signatures** → Visual representation only (signatures become images)
- **Interactive Elements** → Static content (buttons, links become non-functional)

## Setup

1. Ensure you have Java 11+ installed
2. Configure your PDF4Me API key in `src/Main.java`
3. Place your PDF file with interactive elements in the project directory
4. Run the application

## Usage

```bash
# Compile the project
javac -cp . src/Main.java

# Run the application
java -cp src Main
```

## Configuration

Update the API key in `src/Main.java`:
```java
private static final String API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
```

## API Endpoint

- **Endpoint**: `https://api.pdf4me.com/api/v2/FlattenPdf`
- **Method**: POST
- **Input**: Base64 encoded PDF file
- **Output**: Flattened PDF file (direct binary or base64 in JSON)

## Features

- **Robust Polling**: Handles async processing with 10-second intervals
- **Dual Response Handling**: Supports both direct PDF and JSON responses
- **Error Recovery**: Detailed error messages with status codes
- **File Validation**: Ensures input file exists and output is valid PDF
- **Minimal Dependencies**: Uses only standard Java libraries
- **Complete Flattening**: Converts all interactive elements to static content

## Use Cases

- **Final Documents**: Prevent editing of completed forms
- **Document Archival**: Convert interactive PDFs to static content
- **Printing**: Ensure consistent printing without interactive elements
- **Distribution**: Share documents without editable form fields
- **Compliance**: Meet requirements for non-editable documents

## Sample Data

The project includes an `unflattened-sample.pdf` file that can be used for testing the flattening functionality.

## Implementation Details

- Uses Java 11+ HttpClient for modern HTTP requests
- Implements async polling for long-running conversions
- Handles both 200 (immediate) and 202 (async) responses
- Validates PDF content by checking for %PDF header
- Extracts base64 PDF data from JSON responses when needed
- Provides clear success/error messaging

## Error Handling

- File not found validation
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout handling for async operations
- Invalid PDF response detection
- Flattening conversion errors

## Conversion Quality

- Preserves visual appearance of all elements
- Maintains document layout and formatting
- Converts all interactive elements to static content
- Ensures consistent rendering across platforms
- Creates non-editable final documents
- Preserves document structure and content

## TODO

- [ ] Add API integration with PDF4Me
- [ ] Add configuration options
- [ ] Add unit tests 