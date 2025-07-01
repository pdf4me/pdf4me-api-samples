# Extract Text from Word Document - JavaScript

This JavaScript application extracts text content from Word documents (.docx or .doc files) using the PDF4me API.

## Features

- Extract text from Word documents with configurable page ranges
- Remove comments, headers, and footers
- Accept tracked changes
- Support for both synchronous and asynchronous processing
- Automatic retry logic for network issues
- Professional error handling and logging

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- Internet connection for API access

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Extract Text from word"
   ```

2. Install dependencies (none required - this project uses only built-in Node.js modules):
   ```bash
   npm install
   ```

## Usage

1. Place your Word document in the project directory and name it `sample.docx` (or update the `WORD_FILE_PATH` constant in `app.js`)

2. Run the application:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

3. The extracted text will be saved to `extracted_text.txt`

## Configuration

You can modify the following constants in `app.js`:

- `API_KEY`: Your PDF4me API key
- `WORD_FILE_PATH`: Path to your input Word document
- `OUTPUT_FILE`: Name of the output text file
- `StartPageNumber` and `EndPageNumber`: Page range to extract (in payload)
- `RemoveComments`, `RemoveHeaderFooter`, `AcceptChanges`: Extraction options

## Output Files

- `extracted_text.txt`: Main output file containing extracted text
- `extracted_text_from_word.json`: Metadata about the extraction (if available)
- `extracted_text_raw.bin`: Raw response data (if text processing fails)
- `raw_text_response.bin`: Fallback file for debugging

## Error Handling

The application includes comprehensive error handling:
- File not found errors
- Network connection issues
- API authentication errors
- Processing timeouts
- Automatic retry logic (10 attempts with 10-second delays)

## API Response Codes

- **200**: Success - Text extraction completed immediately
- **202**: Accepted - Processing asynchronously (will poll for completion)
- **Other codes**: Error - Check console output for details

## Cross-Platform Compatibility

This application runs on:
- Windows
- macOS
- Linux

No additional dependencies or installations required beyond Node.js and npm.

## Troubleshooting

1. **File not found**: Ensure `sample.docx` exists in the project directory
2. **API errors**: Verify your API key is correct and has sufficient credits
3. **Network issues**: Check your internet connection
4. **Timeout errors**: Large documents may take longer to process

## License

MIT License - see package.json for details. 