# Rotate Page - JavaScript

A JavaScript prototype for rotating specific pages in PDF documents using the PDF4Me API.

## Features

- Rotate specific pages in PDF documents
- Support for various rotation types:
  - Clockwise: 90 degrees clockwise
  - CounterClockwise: 90 degrees counter-clockwise
  - UpsideDown: 180 degrees rotation
- Configurable page selection and rotation settings
- Handle both single and multiple page rotations
- Async API calling support
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging
- Page validation and processing status tracking
- Export PDF with rotated pages

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
- **Output:** `Rotate_page_PDF_output.pdf` (PDF with specific page rotated)

### Configuration Options

You can modify the following settings in `app.js`:

- `rotationType`: Rotation direction and angle
  - `"Clockwise"` (default): Rotate 90 degrees clockwise
  - `"CounterClockwise"`: Rotate 90 degrees counter-clockwise
  - `"UpsideDown"`: Rotate 180 degrees
- `page`: Specific page to rotate
  - `"1"` (default): Rotate page 1
  - `"2"`: Rotate page 2
  - `"3"`: Rotate page 3, etc.
- `async`: Enable/disable asynchronous processing
- `maxRetries`: Maximum number of polling attempts for async operations
- `retryInterval`: Seconds between polling attempts

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/RotatePage`
- **Authentication:** Basic authentication with API key
- **Features:** Page rotation, orientation handling, metadata preservation

## Supported Rotation Types

- **Clockwise:** Rotates the specified page 90 degrees clockwise
- **CounterClockwise:** Rotates the specified page 90 degrees counter-clockwise
- **UpsideDown:** Rotates the specified page 180 degrees (flips upside down)

## Error Handling

The application includes comprehensive error handling for:
- File not found errors
- API authentication failures
- Network connectivity issues
- Processing timeouts
- Invalid response formats
- Invalid rotation type specifications
- Invalid page number specifications

## Logging

The application provides detailed logging including:
- File processing status
- API request/response details
- Processing progress for async operations
- Error messages and stack traces

## Sample Output

```
=== Rotating Specific Page in PDF Document ===
Reading PDF file...
PDF file read successfully: sample.pdf (12345 bytes)
Sending PDF page rotation request to PDF4me API...
Response Status Code: 200
Success: Page rotated successfully!
Output saved as: Rotate_page_PDF_output.pdf
Output saved: Rotate_page_PDF_output.pdf
```

## Development Notes

This JavaScript prototype provides the same functionality as the Java and C# versions, including:
- PDF document processing
- Page rotation algorithms
- API client implementation
- Page validation utilities
- Async operation management
- Error handling
- Configuration management
- Processing status tracking

The project is ready to run and can be extended with additional features as needed. 