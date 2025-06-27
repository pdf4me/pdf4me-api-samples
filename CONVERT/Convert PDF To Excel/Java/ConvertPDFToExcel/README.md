# ConvertPDFToExcel

A Java prototype project for converting PDF documents to Excel format using the PDF4Me API.

## Project Structure

```
ConvertPDFToExcel/
├── src/
│   └── Main.java          # Main application entry point (prototype - logic to be implemented)
├── sample.pdf             # Sample PDF file for testing
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── ConvertPDFToExcel.iml  # IntelliJ IDEA module file
```

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic will be implemented later.

## Features (Planned)

- Convert PDF documents to Excel format (.xlsx)
- Extract tables and structured data from PDFs
- Preserve data formatting and layout
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
   - Select "Open" and navigate to the `ConvertPDFToExcel` folder
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

- **Input:** `sample.pdf` (included in the project)
- **Output:** `PDF_to_EXCEL_output.xlsx` (will be generated in the project root)

## TODO List

- [ ] Implement PDF to Excel conversion logic
- [ ] Add PDF4Me API integration
- [ ] Implement async functionality
- [ ] Add error handling and logging
- [ ] Add configuration management
- [ ] Add support for table extraction
- [ ] Add unit tests
- [ ] Add documentation

## API Configuration (Planned)

The application will use the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ConvertPdfToExcel`
- **Authentication:** Basic authentication with API key
- **Format:** Excel (.xlsx) format
- **Features:** Table extraction, data formatting, layout preservation

## Development Notes

This prototype provides the basic structure for the PDF to Excel converter. The main logic will be implemented in the `Main.java` file, including:

- PDF parsing and table extraction
- Data structure analysis
- Excel document generation
- API client implementation
- File handling utilities
- Async operation management
- Error handling
- Configuration management

The project is ready to be opened in IntelliJ IDEA and can be extended with the actual implementation logic. 