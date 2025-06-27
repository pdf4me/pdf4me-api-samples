# ConvertHTMLToPDF

A Java prototype project for converting HTML documents to PDF using the PDF4Me API.

## Project Structure

```
ConvertHTMLToPDF/
├── src/
│   └── Main.java          # Main application entry point (prototype - logic to be implemented)
├── sample.html            # Sample HTML file for testing
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── ConvertHTMLToPDF.iml   # IntelliJ IDEA module file
```

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic will be implemented later.

## Features (Planned)

- Convert HTML files to PDF format
- Support for CSS styling and layout
- Handle images and external resources
- Configurable page settings (A4, margins, orientation)
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
   - Select "Open" and navigate to the `ConvertHTMLToPDF` folder
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

- **Input:** `sample.html` (included in the project)
- **Output:** `HTML_to_PDF_output.pdf` (will be generated in the project root)

## TODO List

- [ ] Implement HTML to PDF conversion logic
- [ ] Add PDF4Me API integration
- [ ] Implement async functionality
- [ ] Add error handling and logging
- [ ] Add configuration management
- [ ] Add support for CSS styling
- [ ] Add unit tests
- [ ] Add documentation

## API Configuration (Planned)

The application will use the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ConvertHtmlToPdf`
- **Authentication:** Basic authentication with API key
- **Format:** PDF format
- **Features:** HTML rendering, CSS support, image handling

## Development Notes

This prototype provides the basic structure for the HTML to PDF converter. The main logic will be implemented in the `Main.java` file, including:

- HTML parsing and rendering
- CSS style processing
- PDF document generation
- API client implementation
- File handling utilities
- Async operation management
- Error handling
- Configuration management

The project is ready to be opened in IntelliJ IDEA and can be extended with the actual implementation logic. 