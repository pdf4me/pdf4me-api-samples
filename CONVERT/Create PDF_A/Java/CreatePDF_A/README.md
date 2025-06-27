# CreatePDF_A

A Java implementation for converting regular PDFs to PDF/A format using the PDF4Me API with modern HttpClient.

## Project Structure

```
CreatePDF_A/
├── src/
│   └── Main.java          # Main application entry point with HttpClient implementation
├── sample.pdf             # Sample PDF file for testing
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── CreatePDF_A.iml        # IntelliJ IDEA module file
```

## Features

- ✅ **Implemented** - PDF to PDF/A conversion using PDF4Me API
- ✅ **Modern HttpClient** - Uses Java 11+ HttpClient instead of HttpURLConnection
- ✅ **Async Polling** - Handles 202 responses with robust polling mechanism
- ✅ **Error Handling** - Comprehensive error handling with detailed status messages
- ✅ **Base64 Encoding** - Proper file encoding for API requests
- ✅ **PDF Validation** - Validates PDF responses and extracts from JSON
- ✅ **File Validation** - Checks input file existence before processing
- ✅ **Multiple Compliance Levels** - Supports various PDF/A compliance standards

## PDF/A Compliance Levels

- **PDF/A-1b**: Level B basic conformance (most common)
- **PDF/A-1a**: Level A accessible conformance (includes accessibility features)
- **PDF/A-2b**: Part 2 basic compliance (supports newer PDF features)
- **PDF/A-2u**: Part 2 with Unicode mapping
- **PDF/A-2a**: Part 2 accessible compliance
- **PDF/A-3b**: Part 3 basic (allows file embedding)
- **PDF/A-3u**: Part 3 with Unicode mapping
- **PDF/A-3a**: Part 3 accessible compliance

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

- **Endpoint**: `https://api.pdf4me.com/api/v2/PdfA`
- **Method**: POST
- **Input**: Base64 encoded PDF file
- **Output**: PDF/A compliant file (direct binary or base64 in JSON)

## Features

- **Robust Polling**: Handles async processing with 10-second intervals
- **Dual Response Handling**: Supports both direct PDF and JSON responses
- **Error Recovery**: Detailed error messages with status codes
- **File Validation**: Ensures input file exists and output is valid PDF
- **Minimal Dependencies**: Uses only standard Java libraries
- **Compliance Options**: Configurable PDF/A compliance levels

## Conversion Options

- **Compliance Level**: Choose PDF/A compliance standard
- **Allow Upgrade**: Automatically upgrade to higher compliance if needed
- **Allow Downgrade**: Allow downgrading to lower compliance if necessary
- **Font Embedding**: Ensure all fonts are embedded
- **Color Management**: Proper color space handling

## Sample Data

The project includes a `sample.pdf` file that can be used for testing the conversion functionality.

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
- Compliance conversion errors

## PDF/A Benefits

- **Long-term Archival**: Ensures documents can be reproduced reliably over time
- **ISO Standard**: Compliant with ISO 19005 standard
- **Font Embedding**: All fonts are embedded for consistent display
- **Color Management**: Proper color space handling
- **Metadata Preservation**: Maintains document metadata
- **Cross-platform**: Consistent rendering across different systems

## Use Cases

- **Document Archival**: Long-term storage of important documents
- **Legal Compliance**: Meeting regulatory requirements
- **Library Systems**: Digital library document preservation
- **Government Records**: Official document storage
- **Corporate Archives**: Business document preservation 