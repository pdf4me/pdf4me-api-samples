# JSON to Excel Converter

Convert JSON files to Excel spreadsheets using the PDF4Me API. This project transforms structured JSON data into formatted Excel documents with customizable styling and layout options.

## Features

- ✅ Convert JSON data to Excel spreadsheets
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling
- ✅ No external dependencies (uses Node.js built-in modules)
- ✅ Detailed logging and progress tracking
- ✅ Configurable formatting options (headers, data types, positioning)

## Prerequisites

- **Node.js 18.0.0 or higher** (required for built-in `fetch` API)
- **Internet connection** for API access
- **Valid PDF4Me API key**

## Quick Start

1. **Download the project folder**
2. **Place your JSON file** in the project directory (rename to `row.json` or update the path in `app.js`)
3. **Run the conversion**:
   ```bash
   node app.js
   ```

The converted Excel file will be saved as `JSON_to_EXCEL_output.xlsx` in the same directory.

## Project Structure

```
Convert JSON To Excel/
├── app.js              # Main application file
├── package.json        # Project configuration
├── README.md          # This file
└── row.json           # Sample JSON file (your input)
```

## Configuration

### File Paths
Edit the constants in `app.js` to customize file paths:

```javascript
const INPUT_JSON_PATH = "row.json";                    // Your JSON file
const OUTPUT_EXCEL_PATH = "JSON_to_EXCEL_output.xlsx"; // Output Excel name
```

### API Settings
The API key and endpoint are pre-configured:

```javascript
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
```

### Conversion Options
Customize the Excel formatting settings in the payload:

```javascript
const payload = {
    worksheetName: "Sheet1",          // Excel worksheet name
    isTitleWrapText: true,            // Enable text wrapping for headers
    isTitleBold: true,                // Make headers bold
    convertNumberAndDate: false,      // Auto-detect data types
    numberFormat: "11",               // Number formatting style
    dateFormat: "01/01/2025",         // Date format template
    ignoreNullValues: false,          // Include null/empty values
    firstRow: 1,                      // Starting row position
    firstColumn: 1,                   // Starting column position
    async: true                       // Enable async processing
};
```

## Usage Examples

### Basic Conversion
```bash
# Simple conversion with default settings
node app.js
```

### Custom File Paths
Edit `app.js` to use different files:
```javascript
const INPUT_JSON_PATH = "my-data.json";
const OUTPUT_EXCEL_PATH = "converted-data.xlsx";
```

### Different Formatting Options
Modify the payload for different Excel layouts:

```javascript
// Custom worksheet with different formatting
worksheetName: "MyData",
isTitleBold: false,
convertNumberAndDate: true,
numberFormat: "0.00",
dateFormat: "MM/DD/YYYY"

// Start data at different position
firstRow: 3,
firstColumn: 2,
ignoreNullValues: true
```

## JSON Data Format

The converter supports various JSON structures:

### Array of Objects (Recommended)
```json
[
  {"name": "John", "age": 30, "city": "New York"},
  {"name": "Jane", "age": 25, "city": "Los Angeles"}
]
```

### Object with Arrays
```json
{
  "headers": ["Name", "Age", "City"],
  "data": [
    ["John", 30, "New York"],
    ["Jane", 25, "Los Angeles"]
  ]
}
```

### Nested Objects
```json
{
  "employees": [
    {"name": "John", "details": {"age": 30, "city": "NY"}},
    {"name": "Jane", "details": {"age": 25, "city": "LA"}}
  ]
}
```

## API Response Handling

The application handles different API responses:

- **200 (Success)**: Direct Excel response, saved immediately
- **202 (Accepted)**: Async processing, polls for completion
- **Other codes**: Error with detailed message

## Error Handling

The application includes comprehensive error handling:

- ✅ Input file validation
- ✅ JSON format validation
- ✅ API request errors
- ✅ Network connectivity issues
- ✅ Invalid responses
- ✅ File system errors
- ✅ Timeout handling for async operations

## Troubleshooting

### Common Issues

1. **"Input JSON file not found"**
   - Ensure your JSON file exists in the project directory
   - Check the file path in `INPUT_JSON_PATH`

2. **"Invalid JSON format"**
   - Validate your JSON syntax using online tools
   - Ensure proper JSON structure (arrays, objects, etc.)

3. **"API request failed"**
   - Verify internet connection
   - Check API key validity
   - Ensure JSON file is valid

4. **"Polling failed"**
   - Large datasets may take longer to process
   - Increase `MAX_RETRIES` or `RETRY_DELAY` in the code

5. **"Node.js version too old"**
   - Upgrade to Node.js 18.0.0 or higher
   - Check version with: `node --version`

### Performance Tips

- **Small datasets (< 1000 rows)**: Usually process synchronously (200 response)
- **Large datasets (> 1000 rows)**: Process asynchronously (202 response) with polling
- **Complex JSON**: May take longer to parse and convert

## API Documentation

This project uses the PDF4Me ConvertJsonToExcel API v2:

- **Endpoint**: `https://api.pdf4me.com/api/v2/ConvertJsonToExcel`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: application/json

### Supported Excel Features

- ✅ Multiple worksheets
- ✅ Custom formatting (bold, text wrapping)
- ✅ Data type detection (numbers, dates)
- ✅ Custom number and date formats
- ✅ Cell positioning and layout
- ✅ Header styling
- ✅ Null value handling

## License

MIT License - feel free to use and modify as needed.

## Support

For issues with the PDF4Me API, refer to the official documentation or contact support. 