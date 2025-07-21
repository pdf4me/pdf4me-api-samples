# Add Form Fields To PDF (C#)

A C# .NET sample project for adding form fields to PDF documents using the PDF4me API.

## Project Structure

```
Add Form Fields To PDF/
├── Program.cs                           # Main program with form field addition logic
├── Add_Form_Fields_To_PDF.csproj        # Project file with dependencies
├── Add_Form_Fields_To_PDF.sln           # Solution file
├── global.json                          # .NET SDK configuration
├── sample.pdf                           # Sample PDF file for testing
├── sample.withformfield.pdf             # Output PDF with added form fields
└── README.md                            # This file
```

## Features

- ✅ Add form fields to PDF documents using PDF4me API
- ✅ Support for various form field types (text, checkbox, radio button, dropdown)
- ✅ Configurable field properties (position, size, validation, appearance)
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ File I/O operations with proper error handling
- ✅ Modern C# async/await patterns
- ✅ .NET 8.0 compatibility

## Prerequisites

- .NET 8.0 SDK or later
- Visual Studio 2022, VS Code, or any .NET-compatible IDE
- Internet connection (for PDF4me API access)
- PDF4me API key ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))

## Setup

1. **Install .NET SDK:**
   - Download and install .NET 8.0 SDK from [Microsoft](https://dotnet.microsoft.com/download)

2. **Configure your API key:**
   - Open `Program.cs`
   - Replace the placeholder in the `API_KEY` constant with your actual PDF4me API key

3. **Prepare your document:**
   - Place your PDF file in the project directory
   - Update the `pdfPath` variable in `Program.cs` if needed

## Usage

### Method 1: Using Visual Studio

1. **Open the solution:**
   ```bash
   # Open Add_Form_Fields_To_PDF.sln in Visual Studio
   # Or use command line:
   dotnet open Add_Form_Fields_To_PDF.sln
   ```

2. **Build and run:**
   ```bash
   dotnet build
   dotnet run
   ```

### Method 2: Using Command Line

1. **Navigate to the project directory:**
   ```bash
   cd Add Form Fields To PDF
   ```

2. **Restore dependencies and run:**
   ```bash
   dotnet restore
   dotnet run
   ```

### Input and Output

- **Input:** PDF file (default: `sample.pdf`)
- **Output:** PDF file with added form fields (default: `sample.withformfield.pdf`)

## Configuration

- **API Key:** Set in `Program.cs`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/AddFormFieldsToPdf`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF content
  - `docName`: Output document name
  - `formFields`: Array of form field configurations
  - `async`: true/false (async recommended for large files)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/AddFormFieldsToPdf`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: PDF file with form fields (binary)
  - 202: Accepted, poll the URL in the `Location` header for completion

## Error Handling

- Missing or invalid PDF file
- API authentication errors (401)
- Processing errors (400, 500)
- Timeout for async operations
- Network connectivity issues
- Invalid PDF response detection
- File I/O exceptions during processing

## Troubleshooting

### Common Issues

1. **"PDF file not found"**
   - Ensure the PDF file exists in the specified path
   - Check file permissions

2. **"API request failed"**
   - Verify API key is correct
   - Check internet connection
   - Ensure the PDF file is valid and accessible

3. **"Polling timeout"**
   - Large/complex documents may take longer
   - Increase retry count or delay in code if needed

4. **"Invalid form field configuration"**
   - Ensure form field data is properly formatted
   - Check the API documentation for correct format

5. **"Form field position out of bounds"**
   - Ensure field coordinates are within PDF page boundaries
   - Check page dimensions and field positioning

### Debugging

- Use Visual Studio debugger or add console output
- Check exception messages in the console
- Review the generated output files
- Enable detailed logging in the code

## Output Structure

After successful processing, you'll find:
- `sample.withformfield.pdf`: PDF file with added form fields
- Console output with status and result path

## Support

- For PDF4me API issues, refer to [PDF4me API documentation](https://developer.pdf4me.com/docs/api/)
- For .NET issues, consult [Microsoft .NET Documentation](https://docs.microsoft.com/en-us/dotnet/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 