# Rotate Document - JavaScript

A JavaScript prototype for rotating PDF documents using the PDF4Me API.

## Features

- Rotate entire PDF documents
- Support for various rotation types:
  - Clockwise: 90 degrees clockwise
  - CounterClockwise: 90 degrees counter-clockwise
  - UpsideDown: 180 degrees rotation
- Configurable rotation settings
- Handle both single and batch document rotation
- Async API calling support
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging
- Document validation and processing status tracking
- Export rotated PDF in original format

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
- **Output:** `Rotate_document_PDF_output.pdf` (rotated PDF document)

### Configuration Options

You can modify the following settings in `app.js`:

- `rotationType`: Rotation direction and angle
  - `"UpsideDown"` (default): Rotate 180 degrees
  - `"Clockwise"`: Rotate 90 degrees clockwise
  - `"CounterClockwise"`: Rotate 90 degrees counter-clockwise
- `async`: Enable/disable asynchronous processing
- `maxRetries`: Maximum number of polling attempts for async operations
- `retryInterval`: Seconds between polling attempts

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/Rotate`
- **Authentication:** Basic authentication with API key
- **Features:** Document rotation, orientation handling, metadata preservation

## Supported Rotation Types

- **Clockwise:** Rotates the document 90 degrees clockwise
- **CounterClockwise:** Rotates the document 90 degrees counter-clockwise
- **UpsideDown:** Rotates the document 180 degrees (flips upside down)

## Error Handling

The application includes comprehensive error handling for:
- File not found errors
- API authentication failures
- Network connectivity issues
- Processing timeouts
- Invalid response formats
- Invalid rotation type specifications

## Logging

The application provides detailed logging including:
- File processing status
- API request/response details
- Processing progress for async operations
- Error messages and stack traces

## Sample Output

```
=== Rotating PDF Document ===
Reading PDF file...
PDF file read successfully: sample.pdf (12345 bytes)
Sending PDF rotation request to PDF4me API...
Response Status Code: 200
Success: Document rotated successfully!
Output saved as: Rotate_document_PDF_output.pdf
Output saved: Rotate_document_PDF_output.pdf
```

## Development Notes

This JavaScript prototype provides the same functionality as the Java and C# versions, including:
- PDF document processing
- Rotation algorithms
- API client implementation
- Document validation utilities
- Async operation management
- Error handling
- Configuration management
- Processing status tracking

The project is ready to run and can be extended with additional features as needed. 