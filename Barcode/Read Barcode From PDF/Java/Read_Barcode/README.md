# Read_Barcode

A Java implementation for reading barcode images from PDF documents using the PDF4me API.

## Project Structure

```
Read_Barcode/
├── .idea/                   # IntelliJ IDEA configuration
│   ├── .gitignore
│   ├── misc.xml
│   ├── modules.xml
│   └── vcs.xml
├── src/
│   └── Main.java            # Main application with complete barcode reading logic
├── Read_barcode_output.json # Output barcode data
├── README.md                # This file
├── .gitignore               # Git ignore rules
└── Read_Barcode.iml         # IntelliJ IDEA module file
```

## Project Status

🚧 **IMPLEMENTATION PENDING** - Basic structure created, logic implementation pending.

## Features (Planned)

- ✅ Project structure and configuration complete
- 🚧 Read various barcode types from PDF documents
- 🚧 Support for different barcode formats (QR Code, Code128, DataMatrix, etc.)
- 🚧 Extract barcode data and metadata
- 🚧 Async API calling support
- 🚧 Comprehensive error handling and logging

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
   - Select "Open" and navigate to the `Read_Barcode` folder
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
  - PDF document containing barcodes (configured in Main.java)
- **Output:** `Read_barcode_output.json` (extracted barcode data)

## API Configuration

The application will use the PDF4me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/readbarcode`
- **Authentication:** Basic authentication with API key
- **Features:** Read barcode data from PDF documents

## Barcode Reading Settings (Planned)

The implementation will support these settings:
- **PDF Input:** Configurable PDF file path
- **Barcode Types:** QR Code, Code128, DataMatrix, Aztec, etc.
- **Output Format:** JSON with barcode data and metadata
- **Page Range:** Specific pages to scan for barcodes
- **Confidence Threshold:** Minimum confidence level for barcode detection

## Implementation Details

### Main Components (Planned)

1. **Main Class:**
   - Entry point for the application
   - Configuration constants (API key, URLs, settings)
   - HTTP client initialization

2. **Key Methods:**
   - `readBarcode()`: Main method for barcode reading
   - `executeBarcodeReading()`: HTTP requests and API integration
   - File I/O operations with proper error handling

### Key Features (Planned)

- **Modern HTTP Client:** Uses Java 11+ HttpClient for HTTP operations
- **Error Handling:** Comprehensive exception handling and logging
- **File Management:** Efficient PDF I/O with proper resource management
- **Configurable Options:** Easy to modify reading settings

## Expected Workflow

1. Load PDF document containing barcodes
2. Prepare API request parameters
3. Call the PDF4me API to read barcodes
4. Handle the response
5. Save the extracted barcode data
6. Provide status feedback to the user

## Troubleshooting

### Common Issues (When Implemented)

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

## Performance Notes

- **Processing Time:** Depends on PDF size and number of barcodes
- **Detection Accuracy:** High accuracy for various barcode types
- **Format Support:** Multiple barcode formats supported

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for batch PDF processing
- [ ] Command line interface for PDF input
- [ ] Custom barcode detection settings
- [ ] Integration with other document formats
- [ ] Web-based user interface 