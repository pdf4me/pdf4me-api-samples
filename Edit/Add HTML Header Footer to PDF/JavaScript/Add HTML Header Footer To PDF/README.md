# Add HTML Header Footer To PDF

This JavaScript application adds HTML content as headers or footers to PDF documents using the PDF4me API.

## Features

- Add HTML content as headers, footers, or both to PDF documents
- Support for custom margins and page selection
- Asynchronous processing with polling mechanism
- Cross-platform compatibility (Windows, macOS, Linux)

## Prerequisites

- Node.js (version 18.0.0 or higher)
- npm (comes with Node.js)

## Installation

1. Make sure you have Node.js installed on your system
2. Navigate to this directory in your terminal
3. No additional dependencies are required (uses built-in Node.js modules)

## Usage

### Running the Application

```bash
# Method 1: Using npm
npm start

# Method 2: Direct node execution
node app.js
```

### Configuration

The application uses the following configuration:

- **API Key**: Already configured in the code
- **Input File**: `sample.pdf` (must be present in the same directory)
- **Output File**: `Add_header_footer_to_PDF_output.pdf`

### Customization

You can modify the following parameters in the `app.js` file:

- `htmlContent`: The HTML content to add as header/footer
- `location`: "Header", "Footer", or "Both"
- `pages`: Page selection (e.g., "1", "1,3,5", "2-5", "1,3,7-10", "2-")
- `skipFirstPage`: Whether to skip the first page
- `marginLeft`, `marginRight`, `marginTop`, `marginBottom`: Margin settings in pixels

## API Response Handling

- **200**: Success - HTML header/footer addition completed immediately
- **202**: Accepted - Processing asynchronously with polling
- **Other codes**: Error with status code and response text

## Error Handling

The application includes comprehensive error handling for:
- Missing input files
- API request failures
- Processing timeouts
- Network errors

## Output

The processed PDF file will be saved as `Add_header_footer_to_PDF_output.pdf` in the same directory. 