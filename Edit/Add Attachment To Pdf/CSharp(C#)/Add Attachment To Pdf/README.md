# Add Attachment to PDF - C#

Add file attachments to PDF documents using the PDF4me API in C#. This tool allows you to attach various file types (like .txt, .doc, .jpg, .png, etc.) to PDF documents for enhanced document management.

## Features

- Add any file type as an attachment to PDF documents
- Support for multiple attachment formats (TXT, DOC, XLS, images, etc.)
- Configurable attachment properties (name, description)
- Handles both synchronous and asynchronous API responses
- Asynchronous processing with retry logic
- Comprehensive error handling and logging

## Prerequisites

- **.NET 8.0 SDK**
- **Visual Studio 2022+** (recommended) or `dotnet` CLI
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **A PDF file** and **an attachment file** for testing

## Project Structure

```
Add Attachment To Pdf/CSharp(C#)/Add Attachment To Pdf/
├── Program.cs                      # Main application entry point
├── sample.pdf                      # Input PDF file
├── sample.txt                      # File to attach
├── sample.with_attachment.pdf      # Output PDF with attachment (generated)
├── Add_Attachment_To_Pdf.csproj    # .NET project file
├── Add_Attachment_To_Pdf.sln       # Visual Studio solution file
└── README.md                       # This file
```

## Quick Start

1. **Open the project:**
   - Visual Studio: Open `Add_Attachment_To_Pdf.sln`
   - CLI: Navigate to the project directory
2. **Restore dependencies:**
   - Visual Studio: Restore happens automatically
   - CLI: `dotnet restore`
3. **Build the project:**
   - Visual Studio: Build Solution
   - CLI: `dotnet build`
4. **Configure your API key and file paths:**
   - Open `Program.cs` and set your PDF4me API key, PDF, and attachment file paths
5. **Place your PDF and attachment files** in the directory (default: `sample.pdf`, `sample.txt`)
6. **Run the application:**
   - Visual Studio: Press F5 or use "Start Debugging"
   - CLI:
     ```bash
     dotnet run
     ```

## Configuration

Edit the constants or variables in `Program.cs` to set your API key, PDF, and attachment file paths.

## Output

The processed PDF with the attachment will be saved as `sample.with_attachment.pdf` in the same directory.

## Error Handling

- File validation for input PDF and attachment
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses

## Troubleshooting

- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure `sample.pdf` and `sample.txt` exist
- **API request failed**: Check internet connection and API status
- **Processing timeout**: Large files may take longer to process

## License

MIT License - see project root for details 