# ConvertMarkdownToPDF

A Java implementation for converting Markdown documents to PDF using the PDF4Me API with modern HttpClient.

## Project Structure

```
ConvertMarkdownToPDF/
├── src/
│   └── Main.java          # Main application entry point with HttpClient implementation
├── sample.md              # Sample Markdown file for testing
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── ConvertMarkdownToPDF.iml # IntelliJ IDEA module file
```

## Features

- ✅ **Implemented** - Markdown to PDF conversion using PDF4Me API
- ✅ **Modern HttpClient** - Uses Java 11+ HttpClient instead of HttpURLConnection
- ✅ **Async Polling** - Handles 202 responses with robust polling mechanism
- ✅ **Error Handling** - Comprehensive error handling with detailed status messages
- ✅ **Base64 Encoding** - Proper file encoding for API requests
- ✅ **PDF Validation** - Validates PDF responses and extracts from JSON
- ✅ **File Validation** - Checks input file existence before processing

## Setup

1. Ensure you have Java 11+ installed
2. Configure your PDF4Me API key in `src/Main.java`
3. Place your Markdown file in the project directory
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
private static final String API_KEY = "your-api-key-here";
```

## API Endpoint

- **Endpoint**: `https://api.pdf4me.com/api/v2/ConvertMarkdownToPdf`
- **Method**: POST
- **Input**: Base64 encoded Markdown file
- **Output**: PDF file (direct binary or base64 in JSON)

## Features

- **Robust Polling**: Handles async processing with 10-second intervals
- **Dual Response Handling**: Supports both direct PDF and JSON responses
- **Error Recovery**: Detailed error messages with status codes
- **File Validation**: Ensures input file exists and output is valid PDF
- **Minimal Dependencies**: Uses only standard Java libraries

## Sample Data

The project includes a `sample.md` file that can be used for testing the conversion functionality.

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