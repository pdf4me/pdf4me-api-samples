# Get_PDF_Metadata

A Java prototype project for extracting metadata from PDF documents using the PDF4Me API.

## Project Structure

```
Get_PDF_Metadata/
├── src/
│   └── Main.java          # Main application entry point (prototype - logic to be implemented)
├── sample.pdf             # Sample PDF file for testing
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── Get_PDF_Metadata.iml   # IntelliJ IDEA module file
```

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic will be implemented later.

## Features (Planned)

- Extract comprehensive metadata from PDF documents
- Support for various metadata types (document info, page info, fonts, images, etc.)
- Configurable metadata extraction options
- Handle both single and batch PDF processing
- Async API calling support
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging
- Metadata validation and formatting
- Export metadata in various formats (JSON, XML, CSV)

## Requirements

- Java 8 or higher
- IntelliJ IDEA (recommended)
- Internet connection (for PDF4Me API access)

## Setup in IntelliJ IDEA

1. **Open the project:**
   - Open IntelliJ IDEA
   - Select "Open" and navigate to the `Get_PDF_Metadata` folder
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
  - `sample.pdf` (source PDF file for metadata extraction)
- **Output:** Metadata will be displayed in console and/or saved to file (format to be determined)

## TODO List

- [ ] Implement PDF metadata extraction functionality
- [ ] Add PDF4Me API integration
- [ ] Implement async functionality
- [ ] Add error handling and logging
- [ ] Add configuration management
- [ ] Add support for multiple metadata types
- [ ] Add metadata validation
- [ ] Add export functionality (JSON, XML, CSV)
- [ ] Add unit tests
- [ ] Add documentation

## API Configuration (Planned)

The application will use the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/GetPdfMetadata`
- **Authentication:** Basic authentication with API key
- **Features:** PDF metadata extraction, document analysis, page information

## Supported Metadata Types (Planned)

### Document Information
- Title, Author, Subject, Keywords
- Creator, Producer, Creation Date, Modification Date
- PDF version, Page count, File size
- Security settings, Encryption status

### Page Information
- Page dimensions, Orientation
- Page count, Page numbers
- Page rotation, Page media box

### Content Analysis
- Text content statistics
- Font information and usage
- Image count and properties
- Form field information
- Annotation details

### Technical Metadata
- PDF structure information
- Object count and types
- Compression settings
- Color space information
- Embedded files list

## Development Notes

This prototype provides the basic structure for the PDF metadata extraction functionality. The main logic will be implemented in the `Main.java` file, including:

- PDF document processing
- Metadata extraction handling
- API client implementation
- Metadata parsing utilities
- Async operation management
- Error handling
- Configuration management
- Metadata formatting and export

The project is ready to be opened in IntelliJ IDEA and can be extended with the actual implementation logic.

## Sample Files

### sample.pdf
A sample PDF document that will be used for testing metadata extraction functionality. This file contains basic document information and content for demonstration purposes.

## Expected Workflow

1. Load the source PDF document
2. Validate the PDF file format
3. Prepare the extraction request (encode PDF, set options)
4. Call the PDF4Me API to extract metadata
5. Handle the response (sync/async)
6. Parse and format the extracted metadata
7. Display or save the metadata results
8. Provide status feedback to the user

## Metadata Output Format (Planned)

The extracted metadata will be structured and can be output in various formats:

### JSON Format Example
```json
{
  "documentInfo": {
    "title": "Sample Document",
    "author": "PDF4Me",
    "subject": "Sample PDF for testing",
    "creator": "PDF4Me API",
    "producer": "PDF4Me",
    "creationDate": "2024-01-01T00:00:00Z",
    "modificationDate": "2024-01-01T00:00:00Z"
  },
  "pageInfo": {
    "pageCount": 2,
    "pageDimensions": [
      {"width": 612, "height": 792},
      {"width": 612, "height": 792}
    ]
  },
  "contentInfo": {
    "textCount": 150,
    "imageCount": 0,
    "fontCount": 1
  }
}
```

This prototype provides a solid foundation for implementing comprehensive PDF metadata extraction functionality. 