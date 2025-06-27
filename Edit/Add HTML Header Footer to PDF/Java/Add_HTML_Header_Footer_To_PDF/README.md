# Add_HTML_Header_Footer_To_PDF

A Java implementation for adding HTML headers and footers to PDF documents using the PDF4Me API.

## Project Structure

```
Add_HTML_Header_Footer_To_PDF/
├── src/
│   └── Main.java          # Complete implementation
├── sample.pdf             # Sample PDF file for testing
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── Add_HTML_Header_Footer_To_PDF.iml   # IntelliJ IDEA module file
```

## Features

- Add custom HTML headers to PDF documents
- Add custom HTML footers to PDF documents
- Support for dynamic content (page numbers, dates)
- Configurable page ranges
- Async API calling support
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging
- Customizable HTML styling

## Requirements

- Java 8 or higher
- IntelliJ IDEA (recommended)
- Internet connection (for PDF4Me API access)

## Setup in IntelliJ IDEA

1. **Open the project:**
   - Open IntelliJ IDEA
   - Select "Open" and navigate to the `Add_HTML_Header_Footer_To_PDF` folder
   - IntelliJ will recognize it as a Java project

2. **Configure SDK:**
   - Go to File → Project Structure
   - Set Project SDK to Java 8 or higher
   - Set Project language level to 8 or higher

3. **Set up output directory:**
   - In Project Structure → Modules
   - Set the output path to `out/` directory

## Usage

### Running the Application

1. **Compile the code:**
   ```bash
   javac -d out src/Main.java
   ```

2. **Run the application:**
   ```bash
   java -cp out Main
   ```

### Input and Output

- **Input:** `sample.pdf` (source PDF file)
- **Output:** `sample.with_html_header_footer.pdf` (will be generated in the project root)

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/AddHtmlHeaderFooter`
- **Authentication:** Basic authentication with API key
- **Features:** HTML header/footer rendering, dynamic content support

## HTML Header/Footer Features

### Default Header
```html
<div style='text-align: center; font-size: 12px; color: #333;'>
    Company Header - Confidential Document
</div>
```

### Default Footer
```html
<div style='text-align: center; font-size: 10px; color: #666;'>
    Page {page} of {total} - Generated on {date}
</div>
```

### Dynamic Content Support
- `{page}` - Current page number
- `{total}` - Total number of pages
- `{date}` - Current date
- `{time}` - Current time

## Customization

### Modifying Header/Footer Content
Edit the `headerHtml` and `footerHtml` values in the `addHtmlHeaderFooterToPdf` method:

```java
payload.put("headerHtml", "<div style='text-align: center; font-size: 14px; color: #000;'>Your Custom Header</div>");
payload.put("footerHtml", "<div style='text-align: right; font-size: 10px; color: #666;'>Custom Footer - Page {page}</div>");
```

### Page Range Configuration
- `"all"` - Apply to all pages
- `"1-5"` - Apply to pages 1 through 5
- `"1,3,5"` - Apply to specific pages

## Implementation Details

### Main Components

1. **`main()` method** - Entry point that orchestrates the process
2. **`addHtmlHeaderFooterToPdf()`** - Main method that handles file validation and payload preparation
3. **`executeHtmlHeaderFooterAddition()`** - Handles API communication and response processing
4. **JSON Utilities** - Helper methods for converting data structures to JSON

### API Integration

- **Endpoint**: `https://api.pdf4me.com/api/v2/AddHtmlHeaderFooter`
- **Authentication**: Basic authentication with API key
- **Payload Structure**: Matches PDF4Me API requirements
- **Response Handling**: Supports both immediate and async responses

### Error Handling

- File existence validation
- API error responses
- Timeout handling
- Exception catching and logging

## Sample Files

### sample.pdf
A sample PDF document that will be used as the base document for testing HTML header/footer functionality.

## Expected Workflow

1. Load the source PDF document
2. Validate the PDF file exists
3. Prepare the HTML header/footer content
4. Call the PDF4Me API to add HTML header/footer
5. Handle the response (sync/async)
6. Save the resulting PDF with HTML header/footer
7. Provide status feedback to the user

## Troubleshooting

### Common Issues

1. **PDF file not found**
   - Ensure `sample.pdf` exists in the project root
   - Check file permissions

2. **API authentication failed**
   - Update the `API_KEY` constant with your valid API key
   - Get your API key from https://dev.pdf4me.com/dashboard/#/api-keys/

3. **HTML rendering issues**
   - Check HTML syntax in header/footer content
   - Ensure CSS styles are valid
   - Test with simple HTML first

4. **Timeout errors**
   - Increase `maxRetries` or `retryDelay` values
   - Check network connectivity
   - Verify API endpoint availability

## Development Notes

This implementation provides a complete solution for adding HTML headers and footers to PDF documents. The code is optimized for:

- **Performance**: Efficient HTTP client usage
- **Reliability**: Comprehensive error handling
- **Maintainability**: Clean, well-structured code
- **Extensibility**: Easy to customize and extend

The project is ready for production use with proper API key configuration. 