# ConvertHtmlToPDF (C#)

A C# prototype project for converting HTML documents to PDF using the PDF4Me API.

## Project Structure

```
Convert Html to PDF/
├── Program.cs              # Main application entry point (conversion logic)
├── sample.html             # Sample HTML file for testing
├── sample.pdf              # Output PDF file (generated)
├── Convert_Html_to_PDF.csproj   # .NET project file
├── Convert_Html_to_PDF.sln      # Visual Studio solution file
├── global.json             # .NET SDK version
└── README.md               # This file
```

## Project Status

🚧 **PROTOTYPE** - This is a prototype structure. Logic is implemented in `Program.cs`.

## Features (Planned)

- Convert HTML files to PDF format
- Support for CSS styling and layout
- Handle images and external resources
- Configurable page settings (A4, margins, orientation)
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
   - Select "Open a project or solution" and choose `Convert_Html_to_PDF.sln`
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

- **Input:** `sample.html` (included in the project)
- **Output:** `sample.pdf` (will be generated in the project root)

## TODO List

- [ ] Add advanced error handling and logging
- [ ] Add configuration management
- [ ] Add support for CSS styling
- [ ] Add unit tests
- [ ] Add documentation

## API Configuration

The application uses the PDF4Me API with the following configuration:
- **API URL:** `https://api.pdf4me.com/api/v2/ConvertHtmlToPdf`
- **Authentication:** Basic authentication with API key
- **Format:** PDF format
- **Features:** HTML rendering, CSS support, image handling

## Development Notes

- Main logic is in `Program.cs` and `HtmlToPdfConverter` class
- Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- Polls for completion if async
- Ready to be extended for more features 