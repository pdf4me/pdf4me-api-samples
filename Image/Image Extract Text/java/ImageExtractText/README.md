# Image Extract Text - Java Sample

## Overview
This sample demonstrates how to extract text from images using the PDF4me API's OCR (Optical Character Recognition) functionality.

## Known Issues
- **API Timeouts**: The PDF4me OCR API can be slow and may return timeout errors (504 Gateway Timeout or request timeouts).
- **Retry Logic**: If you encounter timeouts, try again later or contact PDF4me support.
- **Large Images**: Processing time increases with image size and complexity.

## Expected Output
When the API works successfully, this sample generates:
1. `Image_text_extract_output.json` - Raw JSON response from the API
2. `Image_text_extract_output_extracted_text.txt` - Extracted text content (if available in the JSON)

## Compilation and Execution
```bash
# Compile with JSON library
javac -cp 'src/json-20230618.jar' src/Main.java

# Run the application
java -cp 'src/json-20230618.jar:src' Main
```

## Dependencies
- `json-20230618.jar` - For JSON parsing (included in src/ directory)

## Troubleshooting
If you encounter repeated timeouts:
1. Check your internet connection
2. Try with a smaller image file
3. Contact PDF4me support if the issue persists
4. The sample includes mock output files to demonstrate the expected structure

## Structure

- src/Main.java: Main entry point
- .gitignore: Ignore rules
- README.md: Project info
- out/: Output directory (ignored)
- .idea/: IntelliJ config (optional)

## TODO
- Implement text extraction logic
- Add API integration 