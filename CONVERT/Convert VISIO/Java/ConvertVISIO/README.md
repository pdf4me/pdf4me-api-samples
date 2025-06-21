# ConvertVISIO

A Java prototype project for converting VISIO diagrams to PDF format using the PDF4Me API.

## Project Structure

```
ConvertVISIO/
├── src/
│   └── Main.java          # Main application entry point
├── sample.vsdx            # Sample VISIO file for testing
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── ConvertVISIO.iml       # IntelliJ IDEA module file
```

## Features

- Convert VISIO diagrams to PDF format
- Support for various VISIO file formats (.vsdx, .vsd)
- Preserve diagram layout and formatting
- Configurable output options
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

The project includes a `sample.vsdx` file that can be used for testing the conversion functionality.

## TODO

- [ ] Implement VISIO to PDF conversion logic
- [ ] Add API integration with PDF4Me
- [ ] Add configuration options
- [ ] Implement error handling
- [ ] Add unit tests 