# Convert_To_Editable_PDF_Using_OCR

A Java implementation for converting PDF documents to editable PDF using OCR (Optical Character Recognition) with the PDF4Me API.

## Project Structure

```
Convert_To_Editable_PDF_Using_OCR/
├── src/
│   └── Main.java          # Main application with complete OCR implementation
├── sample.pdf             # Sample PDF file for testing
├── sample.ocr.pdf         # Sample OCR output file for testing
├── build.sh               # Build and run script
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── Convert_To_Editable_PDF_Using_OCR.iml   # IntelliJ IDEA module file
```

## Project Status

✅ **IMPLEMENTATION COMPLETE** - Full OCR PDF conversion functionality is implemented and working.

## Features

- ✅ Convert scanned PDF documents to editable PDF using OCR
- ✅ Support for multiple languages and character sets
- ✅ Configurable OCR settings (accuracy, language, output format)
- ✅ Handle both single and multiple page documents
- ✅ Async API calling support
- ✅ Handles both synchronous and asynchronous API responses
- ✅ Comprehensive error handling and logging
- ✅ OCR quality validation and optimization
- ✅ Support for various input formats and resolutions

## Requirements

- Java 8 or higher
- IntelliJ IDEA (recommended)
- Internet connection (for PDF4Me API access)
- Valid PDF4Me API key

## Setup

### 1. Get API Key
First, you need to get a valid API key from PDF4Me:
1. Visit https://dev.pdf4me.com/dashboard/#/api-keys/
2. Create an account and generate an API key
3. Replace the placeholder in `Main.java`:
   ```java
   public static final String API_KEY = "your-actual-api-key-here";
   ```

### 2. Setup in IntelliJ IDEA

1. **Open the project:**
   - Open IntelliJ IDEA
   - Select "Open" and navigate to the `Convert_To_Editable_PDF_Using_OCR` folder
   - IntelliJ will recognize it as a Java project

2. **Configure SDK:**
   - Go to File → Project Structure
   - Set Project SDK to Java 8 or higher
   - Set Project language level to 8 or higher

3. **Set up output directory:**
   - In Project Structure → Modules
   - Set the output path to `out/` directory

## Usage

### Quick Start (Using Build Script)

```bash
# Make the build script executable (if not already)
chmod +x build.sh

# Run the application
./build.sh
```

### Manual Compilation and Execution

1. **Compile the code:**
   ```bash
   javac -d out src/Main.java
   ```

2. **Run the application:**
   ```bash
   java -cp out Main
   ```

### Input and Output

- **Input:** 
  - `sample.pdf` (scanned PDF file to convert)
- **Output:** `sample.ocr.pdf` (editable PDF with OCR text layer)

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ConvertOcrPdf`
- **Authentication:** Basic authentication with API key
- **Features:** OCR processing, text extraction, editable PDF generation

## OCR Settings

The current implementation uses these OCR settings:
- **Quality Type:** Draft (for faster processing)
- **Language:** English
- **OCR When Needed:** true (enables OCR for scanned documents)
- **Output Format:** true (maintains original format)
- **Merge All Sheets:** true (combines all pages)
- **Async Processing:** true (recommended for large files)

## Implementation Details

### Main Components

1. **Main Class:**
   - Entry point for the application
   - Configuration constants (API key, URLs, retry settings)
   - HTTP client initialization

2. **PdfOcrConverter Class:**
   - Handles PDF file reading and Base64 encoding
   - Creates JSON payload for API requests
   - Manages HTTP requests and responses
   - Implements async polling for long-running operations
   - Handles file output and error management

### Key Features

- **Async Processing:** Uses CompletableFuture for non-blocking operations
- **Retry Logic:** Implements polling with configurable retry attempts
- **Error Handling:** Comprehensive exception handling and logging
- **File Management:** Efficient file I/O with proper resource management
- **HTTP Client:** Uses Java 11+ HttpClient for modern HTTP operations

## Supported Languages

The OCR engine supports multiple languages including:
- English
- Spanish
- French
- German
- Italian
- Portuguese
- Dutch
- Russian
- Chinese (Simplified/Traditional)
- Japanese
- Korean
- Arabic
- Hindi
- And many more...

## Error Handling

The application handles various error scenarios:
- **401 Unauthorized:** Invalid or missing API key
- **404 Not Found:** Input file not found
- **202 Accepted:** Async processing (handled with polling)
- **500 Server Error:** API server issues
- **Timeout:** Long-running operations that exceed retry limits

## Sample Files

### sample.pdf
A sample scanned PDF document that will be used for testing OCR conversion functionality.

### sample.ocr.pdf
A sample output file showing the expected result after OCR conversion (editable PDF).

## Expected Workflow

1. Load the scanned PDF document
2. Validate the document quality and format
3. Prepare OCR settings and parameters
4. Call the PDF4Me API to perform OCR conversion
5. Handle the response (sync/async)
6. Save the resulting editable PDF
7. Provide status feedback to the user

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error:**
   - Ensure you have set a valid API key in `Main.java`
   - Check that your API key is active and has sufficient credits

2. **File Not Found:**
   - Make sure `sample.pdf` exists in the project root
   - Check file permissions

3. **Compilation Errors:**
   - Ensure you're using Java 8 or higher
   - Check that all source files are in the correct location

4. **Network Issues:**
   - Verify internet connectivity
   - Check firewall settings
   - Ensure the PDF4Me API is accessible

### Debug Mode

To enable more detailed logging, you can modify the error handling in the code to print additional information about API responses and processing steps.

## Performance Notes

- **Small Files (< 5MB):** Usually processed synchronously (200 response)
- **Large Files (> 5MB):** Processed asynchronously (202 response with polling)
- **Processing Time:** Depends on file size, image quality, and server load
- **Retry Settings:** Configurable via `MAX_RETRIES` and `RETRY_DELAY` constants

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch processing multiple files
- [ ] Configurable OCR quality settings via command line
- [ ] Progress reporting for long-running operations
- [ ] Support for additional output formats
- [ ] Integration with cloud storage services
- [ ] Web-based user interface 