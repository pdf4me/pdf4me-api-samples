# Delete_Blank_pages_from_PDF

A Java prototype project for deleting blank pages from PDF documents using the PDF4Me API.

## Project Structure

```
Delete_Blank_pages_from_PDF/
├── src/
│   └── Main.java          # Main application entry point (prototype - logic to be implemented)
├── sample.pdf             # Sample PDF file for testing
├── sample.no_blank_pages.pdf  # Sample output PDF file (will be generated)
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── Delete_Blank_pages_from_PDF.iml   # IntelliJ IDEA module file
```

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic will be implemented later.

## Features (Planned)

- Delete blank pages from PDF documents based on specified criteria
- Support for different blank page detection options:
  - NoTextNoImages: Pages with no text and no images
  - NoText: Pages with no text content
  - NoImages: Pages with no images
- Configurable blank page detection settings
- Handle both single and multiple blank pages
- Async API calling support
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging
- Page validation and processing status tracking

## Requirements

- Java 8 or higher
- IntelliJ IDEA (recommended)
- Internet connection (for PDF4Me API access)

## Setup in IntelliJ IDEA

1. **Open the project:**
   - Open IntelliJ IDEA
   - Select "Open" and navigate to the `Delete_Blank_pages_from_PDF` folder
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
  - `sample.pdf` (source PDF file with potential blank pages)
- **Output:** `sample.no_blank_pages.pdf` (will be generated in the project root)

## TODO List

- [ ] Implement PDF blank page deletion functionality
- [ ] Add PDF4Me API integration
- [ ] Implement async functionality
- [ ] Add error handling and logging
- [ ] Add configuration management
- [ ] Add support for different blank page detection options
- [ ] Add page validation
- [ ] Add unit tests
- [ ] Add documentation

## API Configuration (Planned)

The application will use the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/DeleteBlankPages`
- **Authentication:** Basic authentication with API key
- **Features:** Blank page detection, page removal, metadata handling

## Supported Blank Page Detection Options (Planned)

- **NoTextNoImages:** Removes pages that contain neither text nor images
- **NoText:** Removes pages that contain no text content (may keep pages with images)
- **NoImages:** Removes pages that contain no images (may keep pages with text)

## Development Notes

This prototype provides the basic structure for the PDF blank page deletion functionality. The main logic will be implemented in the `Main.java` file, including:

- PDF document processing
- Blank page detection algorithms
- API client implementation
- Page validation utilities
- Async operation management
- Error handling
- Configuration management
- Processing status tracking

The project is ready to be opened in IntelliJ IDEA and can be extended with the actual implementation logic.

## Sample Files

### sample.pdf
A sample PDF document that will be used as the source document for testing blank page deletion functionality. This PDF may contain blank pages that will be removed during processing.

### sample.no_blank_pages.pdf
The output PDF file that will be generated after removing blank pages from the source document.

## Expected Workflow

1. Load the source PDF document
2. Analyze each page for blank content based on selected criteria
3. Prepare the API request payload with page analysis data
4. Call the PDF4Me API to delete blank pages
5. Handle the response (sync/async)
6. Save the resulting PDF without blank pages
7. Provide status feedback to the user

## API Payload Structure (Planned)

```json
{
  "docContent": "base64_encoded_pdf_content",
  "docName": "output.pdf",
  "deletePageOption": "NoTextNoImages",
  "async": true
}
```

## Response Handling (Planned)

- **200 Status:** Immediate completion - save the processed PDF
- **202 Status:** Asynchronous processing - poll for completion
- **Error Status:** Handle and report errors appropriately 