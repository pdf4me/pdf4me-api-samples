# ConvertURLToPDF

A Java prototype project for converting web URLs to PDF format using the PDF4Me API.

## Project Structure

```
ConvertURLToPDF/
├── src/
│   └── Main.java          # Main application entry point
├── sample_urls.txt        # Sample URLs for testing
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── ConvertURLToPDF.iml    # IntelliJ IDEA module file
```

## Features

- Convert web URLs to PDF format
- Support for various web page types
- Configurable rendering options
- Wait for page load completion
- Error handling and validation

## Setup

1. Ensure you have Java 8+ installed
2. Add PDF4Me API dependencies to your project
3. Configure your API credentials
4. Run the application

## Usage

```bash
# Compile the project
javac -cp "path/to/pdf4me-java-sdk.jar" src/Main.java

# Run the application
java -cp "src:path/to/pdf4me-java-sdk.jar" Main
```

## Sample Data

The project includes a `sample_urls.txt` file with example URLs that can be used for testing the conversion functionality.

## TODO

- [ ] Implement URL to PDF conversion logic
- [ ] Add API integration with PDF4Me
- [ ] Add configuration options
- [ ] Implement error handling
- [ ] Add unit tests 