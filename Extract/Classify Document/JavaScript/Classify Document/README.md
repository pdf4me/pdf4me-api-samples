# Document Classification JavaScript Client

A simple JavaScript client for classifying documents using the PDF4me API. This application analyzes document content to classify and identify document types and categories.

## Features

- **No Dependencies**: Uses only Node.js built-in modules (fs, path, fetch)
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Async Processing**: Handles both immediate and asynchronous API responses
- **Retry Logic**: Automatic retry mechanism for network issues
- **Error Handling**: Comprehensive error handling and logging

## Prerequisites

- Node.js (version 18 or higher for built-in fetch support)
- npm (comes with Node.js)

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Extract/Classify Document/JavaScript/Classify Document"
   ```

2. No additional dependencies required - the project uses only Node.js built-in modules.

## Usage

1. **Prepare your PDF file**: Place your PDF file named `sample.pdf` in the project directory.

2. **Run the application**:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

3. **Check the results**: The classification results will be saved to `Classify_document_output.json`.

## Configuration

The application uses the following configuration:

- **API Key**: Pre-configured PDF4me API key
- **Input File**: `sample.pdf` (place your PDF file here)
- **Output File**: `Classify_document_output.json` (classification results)
- **API Endpoint**: `https://api.pdf4me.com/api/v2/ClassifyDocument`

## How it Works

1. **File Reading**: Reads the PDF file and converts it to base64 encoding
2. **API Request**: Sends the document to PDF4me API for classification
3. **Response Handling**: 
   - **200**: Immediate success - saves results directly
   - **202**: Asynchronous processing - polls for completion
   - **Other**: Error handling with detailed messages
4. **Result Processing**: Saves classification results to JSON file and displays summary

## Output

The application generates a JSON file containing the document classification results, including:
- Document type identification
- Category classification
- Confidence scores
- Other metadata provided by the API

## Error Handling

- **File Not Found**: Checks if input PDF exists before processing
- **Network Errors**: Automatic retry with exponential backoff
- **API Errors**: Detailed error messages with status codes
- **Timeout**: Handles long-running classification tasks

## Troubleshooting

- **"PDF file not found"**: Ensure `sample.pdf` is in the project directory
- **"API Error"**: Check your internet connection and API key validity
- **"Timeout"**: Classification may take longer for complex documents - increase retry limits if needed

## License

MIT License - see package.json for details. 