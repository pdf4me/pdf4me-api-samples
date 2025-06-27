# Read_SwissQR_Code

A Java implementation for reading Swiss QR codes from PDF documents using the PDF4me API.

## Project Structure

```
Read_SwissQR_Code/
├── .idea/                   # IntelliJ IDEA configuration
│   ├── .gitignore
│   ├── misc.xml
│   ├── modules.xml
│   └── vcs.xml
├── src/
│   └── Main.java            # Main application with complete Swiss QR reading logic
├── read_swissqr_code_output.json # Output Swiss QR data
├── README.md                # This file
├── .gitignore               # Git ignore rules
└── Read_SwissQR_Code.iml    # IntelliJ IDEA module file
```

## Project Status

✅ **IMPLEMENTATION COMPLETE** - Full Swiss QR code reading functionality implemented.

## Features

- ✅ Project structure and configuration complete
- ✅ Read Swiss QR codes from PDF documents
- ✅ Extract structured Swiss QR code data
- ✅ Async API calling support with extended polling
- ✅ Comprehensive error handling and logging
- ✅ JSON output with Swiss QR code details

## Requirements

- Java 8 or higher
- IntelliJ IDEA (recommended)
- Internet connection (for PDF4me API access)
- Valid PDF4me API key

## Setup

### 1. Get API Key
First, you need to get a valid API key from PDF4me:
1. Visit https://dev.pdf4me.com/dashboard/#/api-keys/
2. Create an account and generate an API key
3. Replace the placeholder in `Main.java`:
   ```java
   private static final String API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
   ```

### 2. Setup in IntelliJ IDEA

1. **Open the project:**
   - Open IntelliJ IDEA
   - Select "Open" and navigate to the `Read_SwissQR_Code` folder
   - IntelliJ will recognize it as a Java project

2. **Configure SDK:**
   - Go to File → Project Structure
   - Set Project SDK to Java 8 or higher
   - Set Project language level to 8 or higher

3. **Set up output directory:**
   - In Project Structure → Modules
   - Set the output path to `out/` directory

## Usage

### Manual Compilation and Execution

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
  - PDF document containing Swiss QR codes (configured in Main.java)
- **Output:** `read_swissqr_code_output.json` (extracted Swiss QR data)

## API Configuration

The application uses the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ReadSwissQR`
- **Authentication:** Basic authentication with API key
- **Features:** Read Swiss QR code data from PDF documents

## Swiss QR Code Reading Settings

The implementation supports these settings:
- **PDF Input:** Configurable PDF file path
- **Output Format:** JSON with Swiss QR code data and metadata
- **Async Processing:** Extended polling with 20 retries (10-second intervals)
- **Error Handling:** Comprehensive error handling and fallback mechanisms

## Implementation Details

### Main Components

1. **Main Class:**
   - Entry point for the application
   - Configuration constants (API key, URLs, settings)
   - HTTP client initialization

2. **Key Methods:**
   - `readSwissQrCode()`: Main method for Swiss QR reading
   - `executeSwissQrReading()`: HTTP requests and API integration
   - File I/O operations with proper error handling

### Key Features

- **Modern HTTP Client:** Uses Java 11+ HttpClient for HTTP operations
- **Error Handling:** Comprehensive exception handling and logging
- **File Management:** Efficient PDF I/O with proper resource management
- **Extended Polling:** 20 retries for Swiss QR processing (longer than standard barcodes)
- **Configurable Options:** Easy to modify reading settings

## Expected Workflow

1. Load PDF document containing Swiss QR codes
2. Prepare API request parameters
3. Call the PDF4me API to read Swiss QR codes
4. Handle the response (immediate or async)
5. Save the extracted Swiss QR data
6. Provide status feedback to the user

## Swiss QR Code Data Structure

The API returns structured data including:
- **Account Information:** IBAN, account holder details
- **Payment Information:** Amount, currency, reference
- **Additional Data:** Structured message, unstructured message
- **QR Code Metadata:** Position, confidence scores

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error:**
   - Ensure you have set a valid API key in `Main.java`
   - Check that your API key is active and has sufficient credits

2. **Compilation Errors:**
   - Ensure you're using Java 8 or higher
   - Check that all source files are in the correct location

3. **Network Issues:**
   - Verify internet connectivity
   - Check firewall settings
   - Ensure the PDF4me API is accessible

4. **Timeout Issues:**
   - Swiss QR processing may take longer than standard barcodes
   - The implementation uses extended polling (20 retries)
   - Check API service status if timeouts persist

## Performance Notes

- **Processing Time:** Swiss QR codes may take longer to process than standard barcodes
- **Detection Accuracy:** High accuracy for Swiss QR code format
- **Format Support:** Specifically designed for Swiss QR code standard

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch PDF processing
- [ ] Command line interface for PDF input
- [ ] Custom Swiss QR detection settings
- [ ] Integration with other document formats
- [ ] Web-based user interface
- [ ] Swiss QR code validation and verification 