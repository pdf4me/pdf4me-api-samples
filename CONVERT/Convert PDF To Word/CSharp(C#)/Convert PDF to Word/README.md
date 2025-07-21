# Convert PDF To Word (C#)

A C# prototype project for converting PDF documents to Word (DOCX) using the PDF4Me API.

## Project Structure

```
Convert PDF to Word/
├── Program.cs                  # Main application entry point (conversion logic)
├── sample.docx                 # Output Word file (generated)
├── Convert_PDF_to_Word.csproj  # .NET project file
├── Convert_PDF_to_Word.sln     # Visual Studio solution file
├── global.json                 # .NET SDK version
└── README.md                   # This file
```

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic is implemented in `Program.cs`.

## Features (Planned)

- Convert PDF files to Word (DOCX) format
- Support for multi-page PDFs
- Configurable Word output (formatting, layout)
- Async API calling support
- Handles both synchronous and asynchronous API responses
- Comprehensive error handling and logging

## Requirements

- .NET 8.0 SDK
- Visual Studio 2022+ (recommended) or `dotnet` CLI
- Internet connection (for PDF4Me API access)

## Setup in Visual Studio / .NET CLI

1. **Open the project:**
   - Open Visual Studio
   - Select "Open a project or solution" and choose `Convert_PDF_to_Word.sln`
   - Or, use `dotnet` CLI in the project directory

2. **Restore dependencies:**
   - Visual Studio: Restore will happen automatically
   - CLI: `dotnet restore`

3. **Build the project:**
   - Visual Studio: Build Solution
   - CLI: `dotnet build`

## Usage (After Implementation)

### Running the Application

1. **Run the application:**
   - Visual Studio: Press F5 or use "Start Debugging"
   - CLI:
     ```bash
     dotnet run
     ```

### Input and Output

- **Input:** PDF file (path specified in code or as argument)
- **Output:** Word file (will be generated in the project root)

## TODO List

- [ ] Add advanced error handling and logging
- [ ] Add configuration management
- [ ] Add support for custom Word formatting
- [ ] Add unit tests
- [ ] Add documentation

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ConvertPdfToWord`
- **Authentication:** Basic authentication with API key
- **Format:** Word (DOCX) format
- **Features:** PDF parsing, Word formatting

## Development Notes

- Main logic is in `Program.cs` and `PdfToWordConverter` class
- Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- Polls for completion if async
- Ready to be extended for more features 