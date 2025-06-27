# ConvertJSONToexcel

A Java prototype project for converting JSON data to Excel format using the PDF4Me API.

## Project Structure

```
ConvertJSONToexcel/
├── src/
│   └── Main.java          # Main application entry point (prototype - logic to be implemented)
├── sample.json            # Sample JSON file for testing
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── ConvertJSONToexcel.iml # IntelliJ IDEA module file
```

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic will be implemented later.

## Features (Planned)

- Convert JSON data to Excel format (.xlsx)
- Support for nested JSON structures
- Automatic column mapping
- Configurable output options
- Async API calling support
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging

## Requirements

- Java 8 or higher
- IntelliJ IDEA (recommended)
- Internet connection (for PDF4Me API access)

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

## Usage (After Implementation)

### Running the Application

1. **Compile the code:**
   ```bash
   javac -d out src/Main.java
   ```

2. **Run the application:**
   ```bash
   java -cp out Main
   ```

### Input and Output

- **Input:** `sample.json` (included in the project)
- **Output:** `JSON_to_EXCEL_output.xlsx` (will be generated in the project root)

## TODO List

- [ ] Implement JSON to Excel conversion logic
- [ ] Add PDF4Me API integration
- [ ] Implement async functionality
- [ ] Add error handling and logging
- [ ] Add configuration management
- [ ] Add support for complex JSON structures
- [ ] Add unit tests
- [ ] Add documentation

## API Configuration (Planned)

The application will use the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ConvertJsonToExcel`
- **Authentication:** Basic authentication with API key
- **Format:** Excel (.xlsx) format
- **Features:** JSON parsing, column mapping, data formatting

## Development Notes

This prototype provides the basic structure for the JSON to Excel converter. The main logic will be implemented in the `Main.java` file, including:

- JSON parsing and validation
- Data structure analysis
- Excel document generation
- API client implementation
- File handling utilities
- Async operation management
- Error handling
- Configuration management

The project is ready to be opened in IntelliJ IDEA and can be extended with the actual implementation logic. 