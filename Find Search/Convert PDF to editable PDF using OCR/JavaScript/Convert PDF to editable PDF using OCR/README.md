# PDF to Editable PDF OCR Conversion

This JavaScript project converts PDF documents to editable and searchable PDF files using OCR (Optical Character Recognition) technology via the PDF4me API.

## Features

- Converts scanned PDFs and image-based PDFs to editable text
- Supports both synchronous and asynchronous processing
- Handles retry logic for network issues
- No external dependencies required
- Cross-platform compatibility (Windows, Mac, Linux)

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- PDF4me API key

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Convert PDF to editable PDF using OCR"
   ```

2. Install dependencies (none required, but npm install is good practice):
   ```bash
   npm install
   ```

## Usage

1. Place your input PDF file in the project directory and name it `sample.pdf`

2. Run the conversion:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

3. The converted editable PDF will be saved as `editable_PDF_output.pdf`

## Configuration

The API configuration is set in the `app.js` file:

```javascript
const API_KEY = "your-api-key-here";
const INPUT_FILE = 'sample.pdf';
const OUTPUT_FILE = 'editable_PDF_output.pdf';
```

## API Parameters

The OCR conversion uses the following parameters:

- **qualityType**: "Draft" (1 API call per file) or "High" (2 API calls per page)
- **ocrWhenNeeded**: "true" to skip recognition if text is already searchable
- **language**: "English" (or other languages as needed)
- **isAsync**: true for asynchronous processing (recommended for large files)

## Response Handling

- **200**: Success - File is saved immediately
- **202**: Accepted - Processing continues asynchronously with polling
- **Other codes**: Error with status code and response text

## Error Handling

The application includes comprehensive error handling:
- File existence validation
- Network retry logic (10 attempts with 10-second delays)
- API response validation
- Base64 encoding/decoding error handling

## Output

The converted PDF will be:
- Editable and searchable
- Maintain original formatting
- Compatible with standard PDF readers
- Saved as `editable_PDF_output.pdf`

## Troubleshooting

1. **File not found**: Ensure `sample.pdf` exists in the project directory
2. **API errors**: Verify your API key is correct and has sufficient credits
3. **Network issues**: The app will retry automatically up to 10 times
4. **Large files**: Use asynchronous processing for files larger than 10MB

## License

MIT License - see package.json for details. 