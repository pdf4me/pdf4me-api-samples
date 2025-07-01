# Get PDF Metadata - JavaScript

A JavaScript prototype for extracting metadata from PDF documents using the PDF4Me API.

## Features

- Extract comprehensive metadata from PDF documents
- Support for various metadata types (document info, page info, fonts, images, etc.)
- Configurable metadata extraction options
- Handle both single and batch PDF processing
- Async API calling support
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging
- Metadata validation and formatting
- Export metadata in JSON format

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
   - Place your PDF file in the project directory
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
  - `sample.pdf` (source PDF file for metadata extraction)
- **Output:** 
  - `sample.metadata.json` (extracted metadata in JSON format)

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/GetPdfMetadata`
- **Authentication:** Basic authentication with API key
- **Features:** PDF metadata extraction, document analysis, page information

## Supported Metadata Types

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

## Expected Workflow

1. Load the source PDF document
2. Validate the PDF file format
3. Prepare the extraction request (encode PDF, set options)
4. Call the PDF4Me API to extract metadata
5. Handle the response (sync/async)
6. Parse and format the extracted metadata
7. Save the metadata results to JSON file
8. Provide status feedback to the user

## Metadata Output Format

The extracted metadata is structured and output in JSON format:

### JSON Format Example
```json
{
  "title": "Sample Document",
  "subject": "Sample PDF for testing",
  "pageCount": 2,
  "author": "PDF4Me",
  "creator": "PDF4Me API",
  "producer": "PDF4Me",
  "creationDate": "2024-01-01T00:00:00Z",
  "modificationDate": "2024-01-01T00:00:00Z",
  "size": 14601,
  "isEncrypted": false,
  "isLinearized": false,
  "pdfCompliance": null,
  "isSigned": false,
  "documentId": "00000000-0000-0000-0000-000000000000",
  "pdfVersion": "1.4",
  "keywords": null,
  "pageHeightInMM": 279,
  "pageWidthInMM": 216,
  "orientation": "Portrait"
}
```

## Error Handling

The application includes comprehensive error handling for:
- File not found errors
- API authentication errors
- Network connectivity issues
- Invalid PDF format errors
- Async processing timeouts
- JSON parsing errors

## Development Notes

This prototype provides the basic structure for the PDF metadata extraction functionality. The main logic is implemented in the `app.js` file, including:

- PDF document processing
- Metadata extraction handling
- API client implementation
- Metadata parsing utilities
- Async operation management
- Error handling
- Configuration management
- Metadata formatting and export

## Sample Files

### sample.pdf
A sample PDF document that will be used for testing metadata extraction functionality. This file contains basic document information and content for demonstration purposes.

### sample.metadata.json
The output metadata file containing extracted information from the PDF document. 