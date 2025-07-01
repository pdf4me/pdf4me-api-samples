# Delete Blank Pages from PDF - JavaScript

A JavaScript prototype for deleting blank pages from PDF documents using the PDF4Me API.

## Features

- Delete blank pages from PDF documents based on specified criteria
- Support for different blank page detection options:
  - NoTextNoImages: Pages with no text and no images
  - NoText: Pages with no text content
  - NoImages: Pages with no images
- Configurable blank page detection settings
- Handle both single and multiple blank pages
- Async API calling support
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging
- Page validation and processing status tracking
- Export cleaned PDF in original format

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

- **Input:** `sample.pdf` (source PDF file with potential blank pages)
- **Output:** `sample.no_blank_pages.pdf` (PDF with blank pages removed)

### Configuration Options

You can modify the following settings in `app.js`:

- `deletePageOption`: Blank page detection criteria
  - `"NoTextNoImages"` (default): Remove pages with no text and no images
  - `"NoText"`: Remove pages with no text content
  - `"NoImages"`: Remove pages with no images
- `async`: Enable/disable asynchronous processing
- `maxRetries`: Maximum number of polling attempts for async operations
- `retryInterval`: Seconds between polling attempts

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/DeleteBlankPages`
- **Authentication:** Basic authentication with API key
- **Features:** Blank page detection, page removal, metadata handling

## Supported Blank Page Detection Options

- **NoTextNoImages:** Removes pages that contain neither text nor images
- **NoText:** Removes pages that contain no text content (may keep pages with images)
- **NoImages:** Removes pages that contain no images (may keep pages with text)

## Error Handling

The application includes comprehensive error handling for:
- File not found errors
- API authentication failures
- Network connectivity issues
- Processing timeouts
- Invalid response formats

## Logging

The application provides detailed logging including:
- File processing status
- API request/response details
- Processing progress for async operations
- Error messages and stack traces

## Sample Output

```
=== Deleting Blank Pages from PDF Document ===
Reading PDF file...
PDF file read successfully: sample.pdf (12345 bytes)
Sending PDF blank page deletion request to PDF4me API...
Response Status Code: 200
Success: Blank pages deleted successfully!
Output saved as: sample.no_blank_pages.pdf
PDF with blank pages removed saved to: sample.no_blank_pages.pdf
```

## Development Notes

This JavaScript prototype provides the same functionality as the Java and C# versions, including:
- PDF document processing
- Blank page detection algorithms
- API client implementation
- Page validation utilities
- Async operation management
- Error handling
- Configuration management
- Processing status tracking

The project is ready to run and can be extended with additional features as needed. 