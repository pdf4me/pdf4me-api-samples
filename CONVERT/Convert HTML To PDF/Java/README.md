# HTML to PDF Converter

This Java application converts HTML files to PDF documents using the PDF4Me API.

## Features

- Converts HTML files to PDF format
- Supports CSS styling, images, and JavaScript elements
- Configurable page layout and margins
- Asynchronous processing with polling
- Comprehensive error handling

## Prerequisites

- Java 8 or higher
- Internet connection (for API access)
- Valid PDF4Me API key

## Files

- `src/HTMLToPDF.java` - Main converter class with embedded utility classes
- `sample.html` - Sample HTML file for testing
- `run.bat` - Windows batch file to compile and run
- `run.sh` - Unix/Linux shell script to compile and run

## Usage

### Windows
```bash
run.bat
```

### Unix/Linux
```bash
chmod +x run.sh
./run.sh
```

### Manual Compilation and Execution
```bash
# Compile
javac -d bin src/HTMLToPDF.java

# Run
cd bin
java HTMLToPDF
cd ..
```

## Configuration

The converter uses the following default settings:
- Page Layout: Portrait
- Page Format: A4
- Scale: 0.8
- Margins: 40px on all sides
- Print Background: true
- Display Header Footer: true

## Output

The converted PDF file will be saved as `HTML_to_PDF_output.pdf` in the current directory.

## API Details

- **API Endpoint**: https://api-dev.pdf4me.com/api/v2/ConvertHtmlToPdf
- **Authentication**: Basic Auth with API key
- **Processing**: Asynchronous with polling mechanism

## Error Handling

The application includes comprehensive error handling for:
- File not found errors
- API communication errors
- JSON parsing errors
- Network timeout errors

## Sample HTML

The included `sample.html` contains:
- Basic HTML structure
- CSS styling
- Sample table
- Sample list
- Highlighted text

## Troubleshooting

1. **Compilation Error**: Ensure Java 8+ is installed and in PATH
2. **API Error**: Check internet connection and API key validity
3. **File Not Found**: Ensure `sample.html` exists in the current directory
4. **Permission Error**: Ensure write permissions in the current directory 