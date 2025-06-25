# ConvertURLToPDF

A Java implementation for converting web URLs to PDF documents using the PDF4Me API with modern HttpClient.

## Project Structure

```
ConvertURLToPDF/
├── src/
│   └── Main.java          # Main application entry point with HttpClient implementation
├── sample_urls.txt        # Sample URLs for testing
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── ConvertURLToPDF.iml    # IntelliJ IDEA module file
```

## Features

- ✅ **Implemented** - URL to PDF conversion using PDF4Me API
- ✅ **Modern HttpClient** - Uses Java 11+ HttpClient instead of HttpURLConnection
- ✅ **Async Polling** - Handles 202 responses with robust polling mechanism
- ✅ **Error Handling** - Comprehensive error handling with detailed status messages
- ✅ **Web Page Capture** - Captures complete web pages with styling and layout
- ✅ **PDF Validation** - Validates PDF responses and extracts from JSON
- ✅ **Configurable Settings** - Page format, margins, scaling, and orientation options

## Setup

1. Ensure you have Java 11+ installed
2. Configure your PDF4Me API key in `src/Main.java`
3. Update the target URL in the code or modify the method parameters
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

- **Endpoint**: `https://api.pdf4me.com/api/v2/ConvertUrlToPdf`
- **Method**: POST
- **Input**: Web URL and page configuration settings
- **Output**: PDF file (direct binary or base64 in JSON)

## Features

- **Robust Polling**: Handles async processing with 10-second intervals
- **Dual Response Handling**: Supports both direct PDF and JSON responses
- **Error Recovery**: Detailed error messages with status codes
- **Web Page Rendering**: Captures CSS styles, images, and JavaScript elements
- **Configurable Layout**: A4, portrait/landscape, custom margins
- **Background Printing**: Includes background colors and images
- **Minimal Dependencies**: Uses only standard Java libraries

## Page Configuration Options

- **Layout**: Portrait or landscape orientation
- **Format**: A4, A3, Letter, Legal, and other standard formats
- **Scale**: Custom scaling factor (0.8 = 80%, 1.0 = 100%)
- **Margins**: Top, left, right, bottom margins in pixels
- **Background**: Include background colors and images
- **Headers/Footers**: Show or hide page headers and footers

## Implementation Details

- Uses Java 11+ HttpClient for modern HTTP requests
- Implements async polling for long-running conversions
- Handles both 200 (immediate) and 202 (async) responses
- Validates PDF content by checking for %PDF header
- Extracts base64 PDF data from JSON responses when needed
- Provides clear success/error messaging

## Error Handling

- Invalid URL validation
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout handling for async operations
- Invalid PDF response detection
- Network connectivity issues

## Web Page Capture Features

- Captures complete web pages including CSS styles
- Maintains original layout and formatting
- Preserves interactive elements as static content
- Handles both static HTML and dynamic web pages
- Supports various page formats and orientations
- Customizable margins and scaling for optimal output

## Sample Data

The project includes a `sample_urls.txt` file with example URLs that can be used for testing the conversion functionality.

## TODO

- [ ] Add API integration with PDF4Me
- [ ] Add configuration options
- [ ] Add unit tests 