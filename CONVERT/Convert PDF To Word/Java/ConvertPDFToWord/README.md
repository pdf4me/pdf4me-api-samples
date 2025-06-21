# PDF to Word Converter - Prototype

A Java prototype for converting PDF files to Word documents using the PDF4Me API.

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic will be implemented later.

## Features (Planned)

- Converts PDF files to Word format (.docx)
- Preserves text formatting and layout
- Handles images and tables
- Self-contained application (no external dependencies)
- Async API calling support
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging
- Thread pool management for concurrent operations

## Requirements

- Java 8 or higher
- IntelliJ IDEA (recommended)
- Internet connection (for PDF4Me API access)

## Project Structure

```
ConvertPDFToWord/
├── src/
│   └── Main.java          # Main application (prototype - logic to be implemented)
├── sample.pdf             # Sample PDF file for testing
├── README.md              # This file
├── .gitignore             # Git ignore rules
├── .idea/                 # IntelliJ IDEA project files
└── ConvertPDFToWord.iml   # IntelliJ IDEA module file
```

## Setup in IntelliJ IDEA

1. **Open the project:**
   - Open IntelliJ IDEA
   - Select "Open" and navigate to the `ConvertPDFToWord` folder
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
- **Output:** `PDF_to_Word_output.docx` (will be generated in the project root)

## TODO List

- [ ] Implement PDF to Word conversion logic
- [ ] Add PDF4Me API integration
- [ ] Implement async functionality
- [ ] Add error handling and logging
- [ ] Add configuration management
- [ ] Add support for complex PDF layouts
- [ ] Add unit tests
- [ ] Add documentation

## API Configuration (Planned)

The application will use the PDF4Me API with the following configuration:
- **API URL:** `https://api-dev.pdf4me.com/api/v2/ConvertPdfToWord`
- **Authentication:** Basic authentication with API key
- **Format:** Word (.docx) format
- **Features:** Text extraction, formatting preservation, image handling
- **Thread Pool:** 4 threads for async operations

## Development Notes

This prototype provides the basic structure for the PDF to Word converter. The main logic will be implemented in the `Main.java` file, including:

- PDF parsing and text extraction
- Word document generation
- API client implementation
- File handling utilities
- Async operation management
- Error handling
- Configuration management

The project is ready to be opened in IntelliJ IDEA and can be extended with the actual implementation logic. 