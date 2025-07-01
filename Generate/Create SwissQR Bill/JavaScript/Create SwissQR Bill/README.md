# Swiss QR Bill Creator

This JavaScript application creates Swiss QR Bills from PDF documents using the PDF4Me API. Swiss QR Bills are standardized payment slips used in Switzerland that contain a QR code with all payment information.

## Features

- Creates Swiss QR Bills from existing PDF documents
- Supports both synchronous and asynchronous processing
- Includes retry logic for reliable processing
- Generates QR codes with complete payment information
- Professional error handling and logging

## Prerequisites

- Node.js version 18.0.0 or higher
- npm (comes with Node.js)
- Internet connection for API access

## Installation

1. Navigate to the project directory:
   ```bash
   cd "Create SwissQR Bill/JavaScript/Create SwissQR Bill"
   ```

2. No additional dependencies required - uses built-in Node.js modules only.

## Usage

1. Place your input PDF file as `sample.pdf` in the project directory.

2. Run the application:
   ```bash
   npm start
   ```
   or
   ```bash
   node app.js
   ```

3. The application will:
   - Read and encode the input PDF
   - Send it to PDF4Me API for Swiss QR Bill creation
   - Handle the response (synchronous or asynchronous)
   - Save the Swiss QR Bill as `sample.swissqr.pdf`

## Configuration

The application is pre-configured with the following Swiss QR Bill details:

- **Creditor**: Test AG, Test Strasse 1, 8000 Zurich
- **Debtor**: Test Debt AG, Test Deb Strasse 2, 8000 Zurich
- **Amount**: CHF 1000
- **IBAN**: CH0200700110003765824
- **Language**: English
- **Reference Type**: NON (No reference)

## API Configuration

- **API Key**: Pre-configured for PDF4Me service
- **Base URL**: https://api.pdf4me.com/
- **Endpoint**: /api/v2/CreateSwissQrBill

## Response Handling

- **200 Status**: Immediate success - PDF saved directly
- **202 Status**: Asynchronous processing - polls for completion
- **Other Status Codes**: Error with detailed message

## Retry Logic

- Maximum 10 retry attempts
- 10-second delay between attempts
- Automatic polling for async jobs

## Output

The application generates a Swiss QR Bill PDF file containing:
- Original PDF content
- Swiss QR code with payment details
- Structured payment slip format
- All necessary banking information

## Error Handling

- File validation before processing
- API error detection and reporting
- Graceful handling of network issues
- Detailed error messages for troubleshooting

## File Structure

```
Create SwissQR Bill/
├── app.js              # Main application file
├── package.json        # Project configuration
├── README.md          # This file
└── sample.pdf         # Input PDF file (user-provided)
```

## Notes

- The application uses modern JavaScript features (async/await, fetch API)
- No external dependencies required
- Cross-platform compatibility (Windows, macOS, Linux)
- Professional logging without emojis
- Clear step-by-step comments throughout the code

## Troubleshooting

1. **File not found**: Ensure `sample.pdf` exists in the project directory
2. **API errors**: Check internet connection and API key validity
3. **Timeout errors**: Increase retry attempts or delay if needed
4. **Invalid PDF**: Ensure input file is a valid PDF document

## License

MIT License - see package.json for details. 