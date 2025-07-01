# Extract Table from PDF - JavaScript

A Node.js application that extracts table structures and data from PDF documents using the PDF4Me API. This tool supports both synchronous and asynchronous processing with automatic retry logic.

## Features

- **Table Extraction**: Extracts table structures and data from PDF documents
- **Multiple Output Formats**: Saves tables in JSON and CSV formats
- **Asynchronous Processing**: Handles both immediate and queued processing
- **Retry Logic**: Automatic retry mechanism for long-running operations
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **No Dependencies**: Uses only built-in Node.js modules

## Prerequisites

- Node.js version 18.0.0 or higher
- npm (comes with Node.js)
- Internet connection for API access

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Extract/Extract Table From PDF/JavaScript/Extract Table From PDF"
   ```

2. No additional dependencies required - the project uses only built-in Node.js modules.

## Configuration

The application is pre-configured with the following settings:

- **API Key**: Already configured for PDF4Me service
- **Input File**: `sample.pdf` (place your PDF file in the project directory)
- **Output Folder**: `Extract_table_outputs` (created automatically)
- **Retry Settings**: 10 retries with 10-second delays

## Usage

### Basic Usage

1. Place your PDF file in the project directory and name it `sample.pdf`
2. Run the application:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

### Custom Configuration

To use a different PDF file or modify settings, edit the configuration variables in `app.js`:

```javascript
// File paths configuration
const INPUT_PDF_PATH = "your_file.pdf";              // Change to your PDF file
const OUTPUT_FOLDER = "your_output_folder";          // Change output folder name

// Retry configuration
const MAX_RETRIES = 15;                              // Increase retry attempts
const RETRY_DELAY = 15000;                           // Increase delay (15 seconds)
```

## Output

The application creates the following output files in the `Extract_table_outputs` folder:

- **`extracted_tables.json`**: Complete table data in JSON format
- **`table_1.json`**, **`table_2.json`**, etc.: Individual tables as JSON files
- **`table_1.csv`**, **`table_2.csv`**, etc.: Individual tables as CSV files
- **`extracted_tables.xlsx`**: Excel format (if API returns binary data)

## API Response Handling

The application handles different types of API responses:

### Status Code 200 - Immediate Success
- Table extraction completed immediately
- Results are processed and saved immediately

### Status Code 202 - Asynchronous Processing
- Request accepted for processing
- Application polls the API until completion
- Automatic retry logic with configurable delays

### Error Handling
- Detailed error messages for failed requests
- Graceful handling of network issues
- Fallback file saving for unexpected response formats

## Table Data Structure

The extracted table data follows this structure:

```json
{
  "tables": [
    {
      "rows": [
        ["Header1", "Header2", "Header3"],
        ["Data1", "Data2", "Data3"],
        ["Data4", "Data5", "Data6"]
      ]
    }
  ]
}
```

## CSV Output Format

Tables are automatically converted to CSV format with proper escaping:
- Headers are included as the first row
- Special characters are properly escaped
- UTF-8 encoding is used for international characters

## Error Messages

Common error messages and solutions:

- **"Input PDF file not found"**: Ensure `sample.pdf` exists in the project directory
- **"API request failed"**: Check internet connection and API key validity
- **"Polling failed"**: Network issues or API timeout - increase retry settings
- **"No tables found"**: The PDF may not contain extractable table structures

## Troubleshooting

### Network Issues
- Check your internet connection
- Verify firewall settings allow outbound HTTPS connections
- Try increasing `RETRY_DELAY` for slower connections

### API Errors
- Verify the API key is valid and active
- Check if the PDF file is corrupted or password-protected
- Ensure the PDF contains actual table structures

### File Permission Issues
- Ensure write permissions in the output directory
- Check available disk space for output files

## Performance Considerations

- **File Size**: Larger PDFs may take longer to process
- **Table Complexity**: Complex table layouts require more processing time
- **Network Speed**: Slower connections benefit from increased retry delays

## Security Notes

- The API key is embedded in the code for demonstration purposes
- For production use, consider using environment variables
- The application does not store or transmit PDF content beyond the API call

## Support

For issues related to:
- **PDF4Me API**: Contact PDF4Me support
- **Application Logic**: Check the error messages and troubleshooting section
- **Node.js Issues**: Ensure you're using Node.js 18.0.0 or higher

## License

This project is licensed under the MIT License. 