# Extract Text by Expression - JavaScript

This JavaScript application extracts specific text from PDF documents using regular expressions with the PDF4me API.

## Features

- Extract text matching specific patterns/expressions from PDF documents
- Support for page range selection
- Asynchronous processing with polling
- Multiple output formats (JSON, TXT, CSV)
- Cross-platform compatibility (Windows, Mac, Linux)
- **No external dependencies** - uses only built-in Node.js modules

## Prerequisites

- Node.js (version 14.0.0 or higher)
- No npm install required - completely independent!

## Installation

No installation required! The application uses only built-in Node.js modules.

1. Navigate to the project directory:
   ```bash
   cd "Extract Text by Expression"
   ```

2. Run the application directly:
   ```bash
   node app.js
   ```

   Or use npm script:
   ```bash
   npm start
   ```

## Usage

1. Place your PDF file named `sample.pdf` in the project directory
2. Run the application:
   ```bash
   node app.js
   ```

## Configuration

You can modify the following parameters in `app.js`:

- `expression`: Regular expression pattern to search for (default: "%")
- `pageSequence`: Page range to process (default: "1-3")
- `pdfFilePath`: Path to the input PDF file (default: "sample.pdf")

## Output

The application creates an `Extract_text_by_expression_outputs` folder containing:

- `extracted_text_by_expression.json`: Complete extraction metadata
- `extracted_matches.txt`: All extracted text matches in readable format
- `extracted_matches.csv`: Matches in CSV format for analysis

## API Response Handling

- **200**: Success - Text extraction completed immediately
- **202**: Accepted - Asynchronous processing with retry logic
- **Other codes**: Error message with status code and response text

## Error Handling

The application includes comprehensive error handling for:
- Missing input files
- API request failures
- Processing timeouts
- File system operations

## Technical Details

- Uses built-in Node.js `fs`, `path`, `https`, and `http` modules
- No external dependencies required
- Compatible with Node.js 14.0.0 and higher
- Works on Windows, Mac, and Linux without additional setup 