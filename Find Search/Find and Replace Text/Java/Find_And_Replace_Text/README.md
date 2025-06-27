# Find_And_Replace_Text

A Java implementation for finding and replacing text in PDF documents using the PDF4Me API.

## Project Structure

```
Find_And_Replace_Text/
├── src/
│   └── Main.java          # Main application with complete Find & Replace implementation
├── sample.pdf             # Sample PDF file for testing
├── sample.modified.pdf    # Sample output file for testing
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── Find_And_Replace_Text.iml   # IntelliJ IDEA module file
```

## Project Status

✅ **IMPLEMENTATION COMPLETE** - Full Find and Replace Text functionality is implemented and working.

## Features

- ✅ Find and replace text in PDF documents
- ✅ Support for multiple page documents
- ✅ Configurable text search and replacement
- ✅ Async API calling support
- ✅ Handles both synchronous and asynchronous API responses
- ✅ Comprehensive error handling and logging
- ✅ Support for various text formats and encodings

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
   private static final String API_KEY = "your-actual-api-key-here";
   ```

### 2. Setup in IntelliJ IDEA

1. **Open the project:**
   - Open IntelliJ IDEA
   - Select "Open" and navigate to the `Find_And_Replace_Text` folder
   - IntelliJ will recognize it as a Java project

2. **Configure SDK:**
   - Go to File → Project Structure
   - Set Project SDK to Java 8 or higher
   - Set Project language level to 8 or higher

3. **Set up output directory:**
   - In Project Structure → Modules
   - Set the output path to `out/` directory

## Usage

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
  - `sample.pdf` (PDF file to process)
- **Output:** `sample.modified.pdf` (PDF with text replaced)

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/FindAndReplace`
- **Authentication:** Basic authentication with API key
- **Features:** Text search, text replacement, PDF modification

## Find and Replace Settings

The current implementation uses these settings:
- **Old Text:** "Sample" (text to find)
- **New Text:** "new Sample" (text to replace with)
- **Page Sequence:** "1" (all pages)
- **Async Processing:** true (recommended for large files)

## Implementation Details

### Main Components

1. **Main Class:**
   - Entry point for the application
   - Configuration constants (API key, URLs, retry settings)
   - HTTP client initialization

2. **Key Methods:**
   - `findReplaceText()`: Main method for text replacement
   - `executeFindReplace()`: HTTP requests and API integration
   - File I/O operations with proper error handling

### Key Features

- **Async Processing:** Handles both sync and async API responses
- **Retry Logic:** Implements polling with configurable retry attempts
- **Error Handling:** Comprehensive exception handling and logging
- **File Management:** Efficient file I/O with proper resource management
- **HTTP Client:** Uses Java 11+ HttpClient for modern HTTP operations

## Error Handling

The application handles various error scenarios:
- **401 Unauthorized:** Invalid or missing API key
- **404 Not Found:** Input file not found
- **202 Accepted:** Async processing (handled with polling)
- **500 Server Error:** API server issues
- **Timeout:** Long-running operations that exceed retry limits

## Sample Files

### sample.pdf
A sample PDF document that will be used for testing find and replace functionality.

### sample.modified.pdf
A sample output file showing the expected result after text replacement.

## Expected Workflow

1. Load the PDF document
2. Validate the document format
3. Prepare find and replace parameters
4. Call the PDF4Me API to perform text replacement
5. Handle the response (sync/async)
6. Save the resulting modified PDF
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

## Performance Notes

- **Small Files (< 5MB):** Usually processed synchronously (200 response)
- **Large Files (> 5MB):** Processed asynchronously (202 response with polling)
- **Processing Time:** Depends on file size, text complexity, and server load
- **Retry Settings:** Configurable via retry constants in the code

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch processing multiple files
- [ ] Configurable find/replace settings via command line
- [ ] Progress reporting for long-running operations
- [ ] Support for regex patterns
- [ ] Case-sensitive/insensitive search options
- [ ] Web-based user interface 