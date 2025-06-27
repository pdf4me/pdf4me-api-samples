# Add Page Number to PDF - Java Implementation

This Java project demonstrates how to add page numbers to PDF documents using the PDF4me API.

## Features
- Add customizable page numbers to PDF documents
- Support for custom format, alignment, font size, color, and opacity
- Asynchronous processing support
- Error handling and validation
- Base64 encoding for file transmission

## Prerequisites
- Java 17 or higher
- PDF4me API key (get from https://dev.pdf4me.com/dashboard/#/api-keys/)
- Sample PDF file for testing

## Project Structure
```
Add_Page_Number_To_PDF/
├── src/
│   └── Main.java          # Main application logic
├── out/                   # Compiled classes
├── .idea/                 # IntelliJ IDEA configuration
├── Add_Page_Number_To_PDF.iml  # IntelliJ module file
├── README.md             # This file
└── sample.pdf            # Sample PDF file (add your own)
```

## Usage
### Compile the Project
```bash
javac -d out src/Main.java
```
### Run the Application
```bash
java -cp out Main
```

## Configuration
- Set your API key in `Main.java`.
- Place your input PDF as `sample.pdf` in the project directory.

## Output
- The processed PDF with page numbers will be saved as `{original_name}.with_page_numbers.pdf` in the same directory as the input file.

## Troubleshooting
- Ensure your API key is correct and has permissions.
- Make sure `sample.pdf` exists in the project directory.
- Check the console for error messages if the process fails.

## License
This project is part of the PDF4me API samples collection. 