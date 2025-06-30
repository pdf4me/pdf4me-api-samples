# Repair PDF Document - JavaScript

A JavaScript prototype for repairing corrupted or damaged PDF documents using the PDF4Me API.

## Features

- Repair corrupted or damaged PDF documents
- Recover PDF files that cannot be opened normally
- Fix PDF structure and content issues
- Handle both single and batch PDF processing
- Async API calling support
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging
- Repair validation and reporting
- Export repaired PDF in original format

## Requirements

- Node.js 18.0.0 or higher
- Internet connection (for PDF4Me API access)
- Valid PDF4Me API key

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API key:**
   - Open `app.js`
   - Replace the `API_KEY` value with your actual PDF4Me API key
   - Get your API key from: https://dev.pdf4me.com/dashboard/#/api-keys/

3. **Prepare sample file:**
   - Place your corrupted PDF file in the project directory
   - Update the `INPUT_PDF_PATH` in `app.js` if needed

## Usage

### Running the Application

```bash
npm start
```

or

```bash
node app.js
```

### Input and Output

- **Input:** 
  - `sample.pdf` (corrupted PDF file for repair)
- **Output:** 
  - `sample.repaired.pdf` (repaired PDF file)

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/RepairPdf`
- **Authentication:** Basic authentication with API key
- **Features:** PDF document repair, recovery, structure fixing

## Supported Repair Types

### Document Structure Issues
- Corrupted PDF headers and trailers
- Damaged cross-reference tables
- Invalid object references
- Broken page trees and catalogs

### Content Recovery
- Corrupted text content
- Damaged image data
- Broken font references
- Invalid form field data

### File Integrity Issues
- Truncated PDF files
- Corrupted compression streams
- Invalid PDF syntax
- Missing required objects

### Security and Access Issues
- Password-protected corrupted files
- Damaged encryption structures
- Invalid digital signatures
- Access permission problems

## Expected Workflow

1. Load the corrupted PDF document
2. Validate the PDF file format (even if corrupted)
3. Prepare the repair request (encode PDF, set options)
4. Call the PDF4Me API to repair the document
5. Handle the response (sync/async)
6. Validate the repaired PDF
7. Save the repaired PDF file
8. Provide status feedback to the user

## Repair Process

The PDF repair process includes:

### Analysis Phase
- Document structure analysis
- Identification of corruption points
- Assessment of repairable content
- Validation of PDF syntax

### Repair Phase
- Reconstruction of damaged structures
- Recovery of accessible content
- Fixing of object references
- Restoration of document integrity

### Validation Phase
- Verification of repaired document
- Testing of PDF compliance
- Validation of content accessibility
- Quality assurance checks

## Error Handling

The application includes comprehensive error handling for:
- File not found errors
- API authentication errors
- Network connectivity issues
- Severely corrupted PDF files
- Async processing timeouts
- Repair validation failures
- Output file write errors

## Development Notes

This prototype provides the basic structure for the PDF document repair functionality. The main logic is implemented in the `app.js` file, including:

- PDF document processing
- Repair operation handling
- API client implementation
- Repair validation utilities
- Async operation management
- Error handling
- Configuration management
- File integrity checking

## Sample Files

### sample.pdf
A sample PDF document that will be used for testing repair functionality. This file may be intentionally corrupted or damaged for demonstration purposes.

### sample.repaired.pdf
The output repaired PDF file containing the recovered and fixed document content.

## Repair Validation

After repair, the application validates:
- PDF file structure integrity
- Content accessibility
- Page rendering capability
- Document compliance
- File size and format

## Performance Considerations

- Large PDF files may require longer processing times
- Severely corrupted files may have limited recovery options
- Async processing is recommended for files larger than 10MB
- Network timeout settings may need adjustment for large files

## Troubleshooting

### Common Issues
- **API Key Errors:** Verify your PDF4Me API key is correct and active
- **File Not Found:** Ensure the input PDF file exists in the project directory
- **Network Timeouts:** Increase timeout settings for large files
- **Repair Failures:** Some severely corrupted files may not be repairable

### Best Practices
- Always backup original files before repair attempts
- Test repaired files thoroughly before using in production
- Monitor API usage and rate limits
- Validate repaired PDFs with multiple PDF viewers 