# JSON to Excel Converter

A Java application for converting JSON files to Excel spreadsheets using the PDF4Me API.

## Project Status

✅ **WORKING IMPLEMENTATION** - Complete JSON to Excel conversion functionality is implemented and ready to use.

## Features

- ✅ Converts JSON files to Excel format (.xlsx)
- ✅ Supports complex JSON structures with nested objects and arrays
- ✅ Self-contained application (no external dependencies)
- ✅ Async API calling support with polling
- ✅ Handles both synchronous and asynchronous API responses
- ✅ Comprehensive error handling and logging
- ✅ Thread pool management for concurrent operations
- ✅ Multiple worksheet support for different JSON sections
- ✅ Base64 encoding for file content
- ✅ Configurable Excel formatting options

## Requirements

- Java 8 or higher
- IntelliJ IDEA (recommended)
- Internet connection (for PDF4Me API access)

## Project Structure

```
ConvertJSONToexcel/
├── src/
│   ├── Main.java          # Main application entry point
│   └── JSONToExcel.java   # Core conversion logic
├── sample.json            # Sample JSON file for testing
├── README.md              # This file
├── .gitignore             # Git ignore rules
├── .idea/                 # IntelliJ IDEA project files
└── ConvertJSONToexcel.iml # IntelliJ IDEA module file
```

## Setup in IntelliJ IDEA

1. **Open the project:**
   - Open IntelliJ IDEA
   - Select "Open" and navigate to the `ConvertJSONToexcel` folder
   - IntelliJ will recognize it as a Java project

2. **Configure SDK:**
   - Go to File → Project Structure
   - Set Project SDK to Java 8 or higher
   - Set Project language level to 8 or higher

3. **Set up output directory:**
   - In Project Structure → Modules
   - Set the output path to `out/` directory

## Usage

### Running the Application

1. **Compile the code:**
   ```bash
   javac -d out src/*.java
   ```

2. **Run the application:**
   ```bash
   java -cp out Main
   ```

### Input and Output

- **Input:** `sample.json` (included in the project) or built-in sample data
- **Output:** `JSON_to_EXCEL_output.xlsx` (generated in the project root)

### Sample JSON Structure

The sample JSON file contains:
- **Employees array**: Personal and professional information
- **Departments array**: Department details and budgets
- **Company object**: Company overview information

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api-dev.pdf4me.com/api/v2/ConvertJsonToExcel`
- **Authentication:** Basic authentication with API key
- **Format:** Excel (.xlsx) format
- **Features:** Multiple worksheets, formatting, formulas
- **Async Support:** Polling mechanism for long-running operations

## JSON to Excel Mapping

The converter handles:
- **Arrays**: Convert to worksheet rows
- **Objects**: Convert to worksheet columns
- **Nested structures**: Flatten or create separate worksheets
- **Data types**: Proper Excel data type mapping
- **Headers**: Auto-generate column headers from JSON keys

## Implementation Details

### Core Classes

1. **Main.java**: Application entry point and orchestration
2. **JSONToExcel.java**: Core conversion logic with API integration
3. **FileUtils**: Utility methods for file operations
4. **Pdf4MeApiClient**: API client for PDF4Me service

### Key Features

- **Async Processing**: Handles 202 Accepted responses with polling
- **Error Handling**: Comprehensive error handling and logging
- **File Operations**: Base64 encoding/decoding and file I/O
- **Configuration**: Configurable Excel formatting options
- **Thread Safety**: Safe concurrent operations

### API Response Handling

- **200 OK**: Direct response, conversion completed immediately
- **202 Accepted**: Async processing, poll for completion
- **Error Codes**: Proper error handling and user feedback

## Development Notes

This implementation provides a complete JSON to Excel conversion solution with:

- Full API integration with PDF4Me
- Async operation support
- Comprehensive error handling
- File utility functions
- Configurable output options
- Ready-to-use sample data

The project is production-ready and can be extended with additional features as needed. 