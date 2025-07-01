# Add Page Number to PDF - JavaScript

A simple JavaScript application that adds page numbers to PDF documents using the PDF4me API.

## Features

- Add customizable page numbers to PDF documents
- Support for various page number formats and positioning
- Configurable font styling and margins
- Asynchronous processing with retry logic
- No external dependencies required

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Add Page Number To PDF"
   ```

2. Install dependencies (none required, but npm init is recommended):
   ```bash
   npm install
   ```

## Usage

1. Place your input file in the project directory:
   - `sample.pdf` - The PDF file to add page numbers to

2. Run the application:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

3. The application will:
   - Read the PDF file
   - Convert it to base64 encoding
   - Send the request to PDF4me API
   - Handle both synchronous (200) and asynchronous (202) responses
   - Save the output as `Add_page_number_to_PDF_output.pdf`

## Configuration

You can modify the following parameters in `app.js`:

### File Paths
- `INPUT_PDF_FILE` - Path to the input PDF file
- `OUTPUT_FILE` - Name of the output PDF file

### Page Number Properties
- `pageNumberFormat` - Format options:
  - `"Page {0}"` - Page 1, Page 2, etc.
  - `"{0} of {1}"` - 1 of 5, 2 of 5, etc.
  - `"Page {0} of {1}"` - Page 1 of 5, Page 2 of 5, etc.
  - `"- {0} -"` - - 1 -, - 2 -, etc.
  - `"[{0}/{1}]"` - [1/5], [2/5], etc.
  - `"({0})"` - (1), (2), etc.
  - `"{0}"` - 1, 2, etc.
- `alignX` - Horizontal alignment: "left", "center", "right"
- `alignY` - Vertical alignment: "top", "middle", "bottom"
- `marginXinMM` - Horizontal margin from edge in millimeters (0-100)
- `marginYinMM` - Vertical margin from edge in millimeters (0-100)
- `fontSize` - Font size for page numbers (8-72)
- `isBold` - Make page numbers bold (true/false)
- `isItalic` - Make page numbers italic (true/false)
- `skipFirstPage` - Skip numbering on first page (true/false)

### API Configuration
- `API_KEY` - Your PDF4me API key
- `BASE_URL` - PDF4me API base URL

## Error Handling

The application includes comprehensive error handling:
- File existence validation
- Network error retry logic (10 attempts with 10-second delays)
- API response status handling
- Asynchronous processing with polling

## Response Codes

- **200** - Success: Page number addition completed immediately
- **202** - Accepted: Processing asynchronously (will poll for completion)
- **Other** - Error: Displays status code and error message

## Output

The application generates:
- `Add_page_number_to_PDF_output.pdf` - The PDF with page numbers added

## Cross-Platform Compatibility

This application works on:
- Windows
- macOS
- Linux

No additional installations required beyond Node.js and npm.

## Troubleshooting

1. **File not found errors**: Ensure `sample.pdf` exists in the project directory
2. **API errors**: Verify your API key is correct and has proper permissions
3. **Network errors**: The application will automatically retry up to 10 times
4. **Timeout errors**: Increase `max_retries` or `retry_delay` values if needed

## Example Page Number Formats

Here are some common page number format examples you can use:

```javascript
// Simple page numbers
pageNumberFormat: "Page {0}"           // Page 1, Page 2, Page 3...

// Page numbers with total count
pageNumberFormat: "{0} of {1}"         // 1 of 5, 2 of 5, 3 of 5...

// Descriptive page numbers
pageNumberFormat: "Page {0} of {1}"    // Page 1 of 5, Page 2 of 5...

// Minimal page numbers
pageNumberFormat: "{0}"                // 1, 2, 3, 4, 5...

// Styled page numbers
pageNumberFormat: "- {0} -"            // - 1 -, - 2 -, - 3 -...
pageNumberFormat: "[{0}/{1}]"          // [1/5], [2/5], [3/5]...
pageNumberFormat: "({0})"              // (1), (2), (3)...
```

## Positioning Examples

```javascript
// Bottom right corner (default)
alignX: "right"
alignY: "bottom"
marginXinMM: 10
marginYinMM: 10

// Top center
alignX: "center"
alignY: "top"
marginXinMM: 0
marginYinMM: 10

// Bottom left corner
alignX: "left"
alignY: "bottom"
marginXinMM: 10
marginYinMM: 10
``` 