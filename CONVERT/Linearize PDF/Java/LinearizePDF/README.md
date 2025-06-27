# LinearizePDF

A Java implementation for linearizing PDF documents using the PDF4Me API with modern HttpClient.

## Project Structure

```
LinearizePDF/
├── src/
│   └── Main.java          # Main application entry point with HttpClient implementation
├── sample.pdf             # Sample PDF file for testing
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── LinearizePDF.iml       # IntelliJ IDEA module file
```

## Features

- ✅ **Implemented** - PDF linearization using PDF4Me API
- ✅ **Modern HttpClient** - Uses Java 11+ HttpClient instead of HttpURLConnection
- ✅ **Async Polling** - Handles 202 responses with robust polling mechanism
- ✅ **Error Handling** - Comprehensive error handling with detailed status messages
- ✅ **Base64 Encoding** - Proper file encoding for API requests
- ✅ **PDF Validation** - Validates PDF responses and extracts from JSON
- ✅ **File Validation** - Checks input file existence before processing
- ✅ **Web Optimization** - Optimizes PDFs for web viewing and streaming

## What PDF Linearization Does

- **Faster Loading**: Optimizes PDF structure for quick web display
- **Progressive Rendering**: Pages display as they download
- **Web Streaming**: Enables streaming PDF viewing in browsers
- **Reduced Bandwidth**: Optimizes file size for web delivery
- **Better Performance**: Improves loading times for large PDFs

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
private static final String API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
```

## API Endpoint

- **Endpoint**: `https://api.pdf4me.com/api/v2/LinearizePdf`
- **Method**: POST
- **Input**: Base64 encoded PDF file
- **Output**: Linearized PDF file (direct binary or base64 in JSON)

## Features

- **Robust Polling**: Handles async processing with 10-second intervals
- **Dual Response Handling**: Supports both direct PDF and JSON responses
- **Error Recovery**: Detailed error messages with status codes
- **File Validation**: Ensures input file exists and output is valid PDF
- **Minimal Dependencies**: Uses only standard Java libraries
- **Web Optimization**: Configurable optimization profiles

## Optimization Profiles

- **"web"**: Optimized for web viewing (fast loading, progressive display)
- **"Max"**: Maximum compression (smallest file size, slower processing)
- **"Print"**: Optimized for printing (correct fonts, colors, resolution)
- **"Default"**: Standard optimization balance
- **"WebMax"**: Maximum web optimization (best for online viewing)
- **"PrintMax"**: Maximum print optimization (best quality for printing)
- **"PrintGray"**: Print optimized with grayscale conversion
- **"Compress"**: General compression without specific optimization
- **"CompressMax"**: Maximum compression with aggressive size reduction

## Use Cases

- **Web Applications**: PDF viewing in web browsers
- **Document Portals**: Online document libraries
- **E-learning Platforms**: Course material delivery
- **Content Management**: Document sharing systems
- **Mobile Apps**: PDF viewing on mobile devices

## Sample Data

The project includes a `sample.pdf` file that can be used for testing the linearization functionality.

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
- Linearization conversion errors

## Conversion Benefits

- **Faster Web Loading**: Optimized for browser display
- **Progressive Display**: Pages appear as they download
- **Reduced Bandwidth**: Smaller file sizes for web delivery
- **Better User Experience**: Improved loading performance
- **Streaming Support**: Enables PDF streaming in web applications
- **Mobile Optimization**: Better performance on mobile devices 