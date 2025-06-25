# ConvertToPowerpoint

A Java implementation for converting PDF documents to PowerPoint presentations using the PDF4Me API with modern HttpClient.

## Project Structure

```
ConvertToPowerpoint/
├── src/
│   └── Main.java          # Main application entry point with HttpClient implementation
├── sample.pdf             # Sample PDF file for testing
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── ConvertToPowerpoint.iml # IntelliJ IDEA module file
```

## Features

- ✅ **Implemented** - PDF to PowerPoint conversion using PDF4Me API
- ✅ **Modern HttpClient** - Uses Java 11+ HttpClient instead of HttpURLConnection
- ✅ **Async Polling** - Handles 202 responses with robust polling mechanism
- ✅ **Error Handling** - Comprehensive error handling with detailed status messages
- ✅ **Base64 Encoding** - Proper file encoding for API requests
- ✅ **Document Validation** - Validates PowerPoint responses and extracts from JSON
- ✅ **File Validation** - Checks input file existence before processing

## Setup

1. Ensure you have Java 11+ installed
2. Configure your PDF4Me API key in `src/Main.java`
3. Place your PDF file in the project directory
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

- **Endpoint**: `https://api.pdf4me.com/api/v2/ConvertPdfToPowerPoint`
- **Method**: POST
- **Input**: Base64 encoded PDF file
- **Output**: PowerPoint presentation (direct binary or base64 in JSON)

## Features

- **Robust Polling**: Handles async processing with 10-second intervals
- **Dual Response Handling**: Supports both direct PowerPoint and JSON responses
- **Error Recovery**: Detailed error messages with status codes
- **File Validation**: Ensures input file exists and output is valid PowerPoint
- **Minimal Dependencies**: Uses only standard Java libraries

## Sample Data

The project includes a `sample.pdf` file that can be used for testing the conversion functionality.

## Implementation Details

- Uses Java 11+ HttpClient for modern HTTP requests
- Implements async polling for long-running conversions
- Handles both 200 (immediate) and 202 (async) responses
- Validates PowerPoint document content by checking file headers
- Extracts base64 document data from JSON responses when needed
- Provides clear success/error messaging

## Error Handling

- File not found validation
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout handling for async operations
- Invalid document response detection

## Conversion Quality

- Converts PDF pages to PowerPoint slides
- Preserves text formatting and layout
- Maintains document structure
- Handles images and graphics
- Supports multi-page PDFs
- Creates editable PowerPoint presentations

## TODO

- [ ] Add API integration with PDF4Me
- [ ] Add configuration options
- [ ] Add unit tests 