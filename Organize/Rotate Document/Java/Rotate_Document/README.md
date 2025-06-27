# Rotate_Document

A Java prototype project for rotating all pages in a PDF document using the PDF4me API.

## Project Structure

```
Rotate_Document/
├── src/
│   └── Main.java          # Main application entry point (prototype - logic to be implemented)
├── sample.pdf             # Sample PDF file for testing
├── README.md              # This file
```

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic will be implemented later.

## Features (Planned)

- Rotate all pages in a PDF document
- Support for different rotation types (NoRotation, Clockwise, CounterClockwise, UpsideDown)
- Async API calling support
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging
- Input validation

## Requirements

- Java 8 or higher
- IntelliJ IDEA (recommended)
- Internet connection (for PDF4me API access)

## Setup in IntelliJ IDEA

1. **Open the project:**
   - Open IntelliJ IDEA
   - Select "Open" and navigate to the `Rotate_Document` folder
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

- **Input:** 
  - `sample.pdf` (source PDF file)
- **Output:** `Rotate_document_PDF_output.pdf` (will be generated in the project root)

## TODO List

- [ ] Implement PDF document rotation functionality
- [ ] Add PDF4me API integration
- [ ] Implement async functionality
- [ ] Add error handling and logging
- [ ] Add configuration management
- [ ] Add input validation
- [ ] Add unit tests
- [ ] Add documentation

## API Configuration (Planned)

The application will use the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/Rotate`
- **Authentication:** Basic authentication with API key
- **Features:** Document rotation, input validation, metadata handling

## Supported Features (Planned)

- Rotation type support
- Async and sync API response handling
- Error and status feedback

## Development Notes

This prototype provides the basic structure for the PDF document rotation functionality. The main logic will be implemented in the `Main.java` file, including:

- PDF document processing
- API client implementation
- File validation utilities
- Async operation management
- Error handling
- Configuration management

The project is ready to be opened in IntelliJ IDEA and can be extended with the actual implementation logic.

## Sample Files

### sample.pdf
A sample PDF document that will be used as the base document for testing document rotation functionality.

## Expected Workflow

1. Load the source PDF document
2. Validate the input
3. Prepare the API request (encode, metadata)
4. Call the PDF4me API to rotate the document
5. Handle the response (sync/async)
6. Save the resulting PDF
7. Provide status feedback to the user 