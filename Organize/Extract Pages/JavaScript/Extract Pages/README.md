# Extract Pages - JavaScript

A JavaScript prototype for extracting specific pages from PDF documents using the PDF4Me API.

## Features

- Extract specific pages from PDF documents
- Support for various page selection formats:
  - Individual pages: "1,3,5"
  - Page ranges: "1-5"
  - Mixed formats: "1,3-5,7"
- Configurable page extraction settings
- Handle both single and multiple page extractions
- Async API calling support
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging
- Page validation and processing status tracking
- Export extracted pages as a new PDF

## Requirements

- Node.js 18.0.0 or higher
- Internet connection (for PDF4Me API access)
- Valid PDF4Me API key

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API key:**
   - Open `app.js`
   - Replace the `API_KEY` value with your actual PDF4Me API key
   - Get your API key from: https://dev.pdf4me.com/dashboard/#/api-keys/

3. **Prepare sample files:**
   - Place your PDF file in the project directory as `sample.pdf`
   - Or modify the `INPUT_PDF_PATH` variable in `app.js`

## Usage

### Running the Application

```bash
npm start
```

or

```bash
node app.js
```

### Input and Output

- **Input:** `sample.pdf` (source PDF file)
- **Output:** `Extract_pages_PDF_output.pdf` (PDF with extracted pages)

### Configuration Options

You can modify the following settings in `app.js`:

- `pageNumbers`: Page selection criteria
  - `"1,3"` (default): Extract pages 1 and 3
  - `"1-5"`: Extract pages 1 through 5
  - `"1,3-5,7"`: Extract pages 1, 3-5, and 7
- `async`: Enable/disable asynchronous processing
- `maxRetries`: Maximum number of polling attempts for async operations
- `retryInterval`: Seconds between polling attempts

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/Extract`
- **Authentication:** Basic authentication with API key
- **Features:** Page extraction, PDF splitting, metadata handling

## Supported Page Selection Formats

- **Individual pages:** "1,3,5" - Extract specific pages
- **Page ranges:** "1-5" - Extract a range of pages
- **Mixed formats:** "1,3-5,7" - Combine individual pages and ranges
- **All pages:** "1-" - Extract from page 1 to the end

## Error Handling

The application includes comprehensive error handling for:
- File not found errors
- API authentication failures
- Network connectivity issues
- Processing timeouts
- Invalid response formats
- Invalid page number formats

## Logging

The application provides detailed logging including:
- File processing status
- API request/response details
- Processing progress for async operations
- Error messages and stack traces

## Sample Output

```
=== Extracting Pages from PDF Document ===
Reading PDF file...
PDF file read successfully: sample.pdf (12345 bytes)
Sending PDF page extraction request to PDF4me API...
Response Status Code: 200
Success: Pages extracted successfully!
Output saved as: Extract_pages_PDF_output.pdf
Output saved: Extract_pages_PDF_output.pdf
```

## Development Notes

This JavaScript prototype provides the same functionality as the Java and C# versions, including:
- PDF document processing
- Page extraction algorithms
- API client implementation
- Page validation utilities
- Async operation management
- Error handling
- Configuration management
- Processing status tracking

The project is ready to run and can be extended with additional features as needed. 