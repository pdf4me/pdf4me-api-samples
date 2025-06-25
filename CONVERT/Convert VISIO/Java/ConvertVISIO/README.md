# ConvertVISIO

A Java implementation for converting Visio diagrams to PDF using the PDF4Me API with modern HttpClient.

## Project Structure

```
ConvertVISIO/
├── src/
│   └── Main.java          # Main application entry point with HttpClient implementation
├── E-Commerce.vsdx        # Sample Visio file for testing
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── ConvertVISIO.iml       # IntelliJ IDEA module file
```

## Features

- ✅ **Implemented** - Visio to PDF conversion using PDF4Me API
- ✅ **Modern HttpClient** - Uses Java 11+ HttpClient instead of HttpURLConnection
- ✅ **Async Polling** - Handles 202 responses with robust polling mechanism
- ✅ **Error Handling** - Comprehensive error handling with detailed status messages
- ✅ **Base64 Encoding** - Proper file encoding for API requests
- ✅ **PDF Validation** - Validates PDF responses and extracts from JSON
- ✅ **File Validation** - Checks input file existence before processing
- ✅ **Multiple Output Formats** - Supports PDF, JPG, PNG, TIFF output formats

## Supported Input Formats

- Microsoft Visio (.vsdx, .vsd, .vsdm)
- Visio templates and stencils
- Legacy Visio formats

## Supported Output Formats

- **PDF**: High-quality PDF documents
- **JPG**: JPEG images with quality settings
- **PNG**: Lossless images with transparency support
- **TIFF**: High-quality format for archival/printing

## Setup

1. Ensure you have Java 11+ installed
2. Configure your PDF4Me API key in `src/Main.java`
3. Place your Visio file in the project directory
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

- **Endpoint**: `https://api.pdf4me.com/api/v2/ConvertVisio?schemaVal=PDF`
- **Method**: POST
- **Input**: Base64 encoded Visio file
- **Output**: PDF file (direct binary or base64 in JSON)

## Features

- **Robust Polling**: Handles async processing with 10-second intervals
- **Dual Response Handling**: Supports both direct PDF and JSON responses
- **Error Recovery**: Detailed error messages with status codes
- **File Validation**: Ensures input file exists and output is valid PDF
- **Minimal Dependencies**: Uses only standard Java libraries
- **Page Control**: Specify page range and count for conversion

## Conversion Options

- **Page Index**: Starting page for conversion (0-indexed)
- **Page Count**: Number of pages to convert
- **Include Hidden Pages**: Convert hidden pages in the diagram
- **Save Foreground Page**: Include foreground elements
- **Save Toolbar**: Include toolbar elements
- **Auto Fit**: Auto-fit content to page dimensions

## Sample Data

The project includes an `E-Commerce.vsdx` file that can be used for testing the conversion functionality.

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
- Unsupported Visio format errors

## Conversion Quality

- Preserves diagram layout and structure
- Maintains shapes, connectors, and text
- Handles complex Visio diagrams
- Supports multi-page diagrams
- High-quality vector graphics output 