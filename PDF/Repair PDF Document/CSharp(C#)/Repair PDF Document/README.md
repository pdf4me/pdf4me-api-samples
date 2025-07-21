# Repair PDF Document (C#)

A C# .NET sample project for repairing corrupted or damaged PDF documents using the PDF4me API.

## Project Structure

```
Repair PDF Document/
├── Program.cs                           # Main program with PDF repair logic
├── Repair_PDF_Document.csproj           # Project file with dependencies
├── Repair_PDF_Document.sln              # Solution file
├── sample.pdf                           # Sample PDF file for testing
├── sample.repaired.pdf                  # Output repaired PDF file
└── README.md                            # This file
```

## Features

- ✅ Repair corrupted or damaged PDF documents using PDF4me API
- ✅ Handles both synchronous (200 OK) and asynchronous (202 Accepted) API responses
- ✅ Automatic polling for async operations
- ✅ Comprehensive error handling and logging
- ✅ File I/O operations with proper error handling
- ✅ Modern C# async/await patterns
- ✅ .NET 8.0 compatibility
- ✅ PDF structure validation and repair

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
   # Open Repair_PDF_Document.sln in Visual Studio
   # Or use command line:
   dotnet open Repair_PDF_Document.sln
   ```

2. **Build and run:**
   ```bash
   dotnet build
   dotnet run
   ```

### Method 2: Using Command Line

1. **Navigate to the project directory:**
   ```bash
   cd Repair PDF Document
   ```

2. **Restore dependencies and run:**
   ```bash
   dotnet restore
   dotnet run
   ```

### Input and Output

- **Input:** Corrupted or damaged PDF file (default: `sample.pdf`)
- **Output:** Repaired PDF file (default: `sample.repaired.pdf`)

## Configuration

- **API Key:** Set in `Program.cs`
- **API Endpoint:** `https://api.pdf4me.com/api/v2/RepairPdfDocument`
- **Payload Options:**
  - `docContent`: Base64 encoded PDF content
  - `docName`: Output document name
  - `async`: true/false (async recommended for large files)

## API Details

- **Endpoint:** `https://api.pdf4me.com/api/v2/RepairPdfDocument`
- **Method:** POST
- **Authentication:** Basic Auth with API key
- **Content-Type:** application/json
- **Response:**
  - 200: Repaired PDF file (binary)
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

4. **"PDF cannot be repaired"**
   - The PDF may be severely corrupted
   - Check if the PDF file is completely unreadable

5. **"No changes made"**
   - The PDF may not need repair
   - Verify the PDF is actually corrupted

### Debugging

- Use Visual Studio debugger or add console output
- Check exception messages in the console
- Review the generated output files
- Enable detailed logging in the code

## Output Structure

After successful repair, you'll find:
- `sample.repaired.pdf`: Repaired PDF file
- Console output with status and result path

## Support

- For PDF4me API issues, refer to [PDF4me API documentation](https://developer.pdf4me.com/docs/api/)
- For .NET issues, consult [Microsoft .NET Documentation](https://docs.microsoft.com/en-us/dotnet/)
- For project-specific questions, check the code comments or open an issue

## License

MIT License - see project root for details 