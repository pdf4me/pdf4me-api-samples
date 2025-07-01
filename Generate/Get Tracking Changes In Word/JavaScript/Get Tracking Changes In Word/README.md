# Get Tracking Changes from Word Document

This JavaScript application extracts all tracking changes, revisions, and comments from Microsoft Word documents using the PDF4Me API. It provides detailed JSON output containing comprehensive information about all changes made to the document.

## Features

- **Extract Tracking Changes**: Retrieves all revision history, comments, and change tracking information
- **Asynchronous Processing**: Supports both synchronous and asynchronous API processing
- **Retry Logic**: Robust polling mechanism for long-running operations
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **No Dependencies**: Uses only Node.js built-in modules

## Prerequisites

- Node.js version 18.0.0 or higher
- A PDF4Me API key
- A Word document with tracking changes enabled

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Get Tracking Changes In Word"
   ```

2. No additional dependencies required - the project uses only Node.js built-in modules.

## Configuration

### API Configuration

The application uses the following configuration:

```javascript
// API Configuration - PDF4Me service for getting tracking changes from Word documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/GetTrackingChangesInWord`;
```

### File Configuration

```javascript
// File paths configuration
const INPUT_WORD_PATH = "sample.docx";                                    // Path to input Word document file
const OUTPUT_JSON_PATH = "sample.tracking_changes.json";                  // Output JSON file name with tracking changes
```

### Retry Configuration

```javascript
// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds
```

## Usage

### Basic Usage

1. Place your Word document (with tracking changes) in the project directory as `sample.docx`

2. Run the application:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

3. The application will:
   - Read and encode the Word document
   - Send it to the PDF4Me API
   - Extract all tracking changes information
   - Save the results to `sample.tracking_changes.json`

### Expected Output

The application will display progress information:

```
=== Getting Tracking Changes from Word Document ===
This extracts all tracking changes, revisions, and comments from Word documents
Returns detailed JSON with all change information
------------------------------------------------------------
Input Word file: sample.docx
Output JSON file: sample.tracking_changes.json
Extracting tracking changes information...
Reading and encoding Word document file...
Word document file read successfully: 12345 bytes
Sending get tracking changes request...
Status code: 202
Request accepted. Processing asynchronously...
Polling URL: https://api.pdf4me.com/api/v2/GetTrackingChangesInWord/...
Polling attempt 1/10...
Getting tracking changes completed successfully!
Getting tracking changes completed successfully!
Tracking changes JSON saved to: sample.tracking_changes.json
Tracking changes data structure:
- Document contains tracking changes information
- JSON file size: 5678 characters
- Number of revisions: 5
- Number of comments: 3
- Number of changes: 12
Get tracking changes operation completed successfully!
Input file: sample.docx
Tracking changes JSON: sample.tracking_changes.json
All tracking changes have been extracted and saved as JSON
The JSON contains details about all revisions, comments, and changes
```

## API Response Handling

The application handles different API response scenarios:

### Status Code 200 - Success
- Immediate processing completion
- JSON response saved directly to output file

### Status Code 202 - Accepted
- Asynchronous processing initiated
- Application polls the API for completion
- Retry logic with configurable delays

### Other Status Codes
- Error messages displayed with status code and response text
- Application exits with error code 1

## Output Format

The generated JSON file contains comprehensive tracking changes information:

```json
{
  "revisions": [
    {
      "author": "John Doe",
      "date": "2024-01-15T10:30:00Z",
      "changes": [
        {
          "type": "insertion",
          "text": "new content",
          "position": 123
        }
      ]
    }
  ],
  "comments": [
    {
      "author": "Jane Smith",
      "text": "Please review this section",
      "position": 456
    }
  ],
  "metadata": {
    "documentName": "sample.docx",
    "totalRevisions": 5,
    "totalComments": 3
  }
}
```

## Error Handling

The application includes comprehensive error handling:

- **File Not Found**: Validates input file existence before processing
- **API Errors**: Handles various HTTP status codes and error responses
- **Network Issues**: Retry logic for temporary network problems
- **JSON Parsing**: Graceful handling of malformed responses

## Customization

### Modifying File Paths

Edit the configuration constants in `app.js`:

```javascript
const INPUT_WORD_PATH = "your-document.docx";
const OUTPUT_JSON_PATH = "your-output.json";
```

### Adjusting Retry Settings

Modify the retry configuration for different requirements:

```javascript
const MAX_RETRIES = 15;        // More retries for slower connections
const RETRY_DELAY = 5000;      // Shorter delay for faster processing
```

### API Endpoint

Change the API endpoint for different environments:

```javascript
const BASE_URL = "https://api.pdf4me.com/";  // Production environment
```

## Troubleshooting

### Common Issues

1. **"Input Word document file not found"**
   - Ensure `sample.docx` exists in the project directory
   - Check file permissions

2. **"API request failed"**
   - Verify API key is correct and active
   - Check internet connectivity
   - Ensure Word document is not corrupted

3. **"Timeout: Getting tracking changes did not complete"**
   - Large documents may require more time
   - Increase `MAX_RETRIES` or `RETRY_DELAY`
   - Check API service status

### Debug Information

The application provides detailed logging for troubleshooting:

- File sizes and encoding information
- API request/response details
- Polling progress and timing
- JSON structure analysis

## API Documentation

For more information about the PDF4Me API:

- **Endpoint**: `POST /api/v2/GetTrackingChangesInWord`
- **Authentication**: Basic Auth with API key
- **Content-Type**: `application/json`
- **Async Support**: Yes (recommended for large files)

## License

This project is licensed under the MIT License.

## Support

For technical support or questions about the PDF4Me API, please refer to the official documentation or contact PDF4Me support. 