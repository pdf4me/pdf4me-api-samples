# Add_Attachment_To_PDF

A Java prototype project for adding attachments to PDF documents using the PDF4Me API.

## Project Structure

```
Add_Attachment_To_PDF/
├── src/
│   └── Main.java          # Main application entry point (prototype - logic to be implemented)
├── sample.pdf             # Sample PDF file for testing
├── sample_attachment.txt  # Sample attachment file for testing
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── Add_Attachment_To_PDF.iml   # IntelliJ IDEA module file
```

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic will be implemented later.

## Features (Planned)

- Add various file types as attachments to PDF documents
- Support for multiple attachment formats (TXT, DOC, XLS, images, etc.)
- Configurable attachment properties (name, description, icon)
- Handle both single and multiple attachments
- Async API calling support
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging
- Attachment validation and size limits

## Requirements

- Java 8 or higher
- IntelliJ IDEA (recommended)
- Internet connection (for PDF4Me API access)

## Setup in IntelliJ IDEA

1. **Open the project:**
   - Open IntelliJ IDEA
   - Select "Open" and navigate to the `Add_Attachment_To_PDF` folder
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
  - `sample_attachment.txt` (file to attach)
- **Output:** `PDF_with_Attachment_output.pdf` (will be generated in the project root)

## TODO List

- [ ] Implement PDF attachment functionality
- [ ] Add PDF4Me API integration
- [ ] Implement async functionality
- [ ] Add error handling and logging
- [ ] Add configuration management
- [ ] Add support for multiple file types
- [ ] Add attachment validation
- [ ] Add unit tests
- [ ] Add documentation

## API Configuration (Planned)

The application will use the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/AddAttachmentToPdf`
- **Authentication:** Basic authentication with API key
- **Features:** PDF attachment, file validation, metadata handling

## Supported Attachment Types (Planned)

- Text files (.txt, .md, .log)
- Document files (.doc, .docx, .pdf)
- Spreadsheet files (.xls, .xlsx, .csv)
- Image files (.jpg, .png, .gif, .bmp)
- Archive files (.zip, .rar, .7z)
- Audio files (.mp3, .wav, .aac)
- Video files (.mp4, .avi, .mov)

## Development Notes

This prototype provides the basic structure for the PDF attachment functionality. The main logic will be implemented in the `Main.java` file, including:

- PDF document processing
- File attachment handling
- API client implementation
- File validation utilities
- Async operation management
- Error handling
- Configuration management
- Attachment metadata management

The project is ready to be opened in IntelliJ IDEA and can be extended with the actual implementation logic.

## Sample Files

### sample.pdf
A sample PDF document that will be used as the base document for testing attachment functionality.

### sample_attachment.txt
A sample text file that will be attached to the PDF for testing purposes.

## Expected Workflow

1. Load the source PDF document
2. Validate the attachment file
3. Prepare the attachment data (encode, metadata)
4. Call the PDF4Me API to add the attachment
5. Handle the response (sync/async)
6. Save the resulting PDF with attachment
7. Provide status feedback to the user 