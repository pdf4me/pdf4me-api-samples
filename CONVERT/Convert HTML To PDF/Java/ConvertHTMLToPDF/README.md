# HTML to PDF Converter

A Java application that converts HTML files to PDF documents using the PDF4Me API with support for both synchronous and asynchronous operations.

## Features

- Converts HTML files to PDF format
- Supports CSS styling, images, and JavaScript elements
- Self-contained application (no external dependencies)
- **NEW: Async API calling support**
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging
- Thread pool management for concurrent operations

## Requirements

- Java 8 or higher
- Internet connection (for PDF4Me API access)

## Usage

### Running the Application

1. **Compile the code:**
   ```bash
   javac -d out src/Main.java
   ```

2. **Run the application with different modes:**

   **Synchronous (default):**
   ```bash
   java -cp out Main
   ```

   **Asynchronous:**
   ```bash
   java -cp out Main async
   ```

   **Asynchronous with polling:**
   ```bash
   java -cp out Main async-polling
   ```

### Input and Output

- **Input:** `sample.html` (included in the project)
- **Output:** `HTML_to_PDF_output.pdf` (generated in the project root)

### Async Methods

The application now provides three different conversion methods:

1. **`convertHtmlToPdf()`** - Synchronous conversion (original method)
2. **`convertHtmlToPdfAsync()`** - Fully asynchronous conversion using CompletableFuture
3. **`convertHtmlToPdfWithAsyncPolling()`** - Async API call with async polling for completion

### Custom Usage

You can modify the `main` method in `Main.java` to use different input and output files:

```java
// Sync conversion
convertHtmlToPdf("your-file.html", "your-output.pdf");

// Async conversion
CompletableFuture<Void> future = convertHtmlToPdfAsync("your-file.html", "your-output.pdf");
future.get(10, TimeUnit.MINUTES); // Wait for completion

// Async with polling
convertHtmlToPdfWithAsyncPolling("your-file.html", "your-output.pdf");
```

## Project Structure

```
ConvertHTMLToPDF/
├── src/
│   └── Main.java          # Main application with async support
├── sample.html            # Sample HTML file for testing
├── README.md              # This file
└── .gitignore             # Git ignore rules
```

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api-dev.pdf4me.com/api/v2/ConvertHtmlToPdf`
- **Authentication:** Basic authentication with API key
- **Format:** A4, Portrait layout
- **Margins:** 40px on all sides
- **Thread Pool:** 4 threads for async operations

## Async Features

### Thread Pool Management
- Uses `ExecutorService` with 4 threads for concurrent operations
- **Fixed:** Proper shutdown handling to prevent resource leaks and RejectedExecutionException
- Timeout protection (10 minutes for async operations)
- Automatic cleanup via shutdown hooks

### Async Benefits
- **Non-blocking:** API calls don't block the main thread
- **Concurrent processing:** Multiple conversions can run simultaneously
- **Better performance:** Especially useful for batch processing
- **Responsive UI:** Can be integrated into GUI applications

### Error Handling
- Comprehensive exception handling for async operations
- Timeout protection for long-running operations
- Graceful degradation if async operations fail

## Error Handling

The application includes comprehensive error handling for:
- Missing input files
- API communication errors
- Invalid responses
- File I/O operations
- Async operation timeouts
- Thread pool management

## Output

The generated PDF will include:
- All HTML content with CSS styling
- Tables, lists, and formatted text
- Proper page layout and margins
- Professional PDF formatting 