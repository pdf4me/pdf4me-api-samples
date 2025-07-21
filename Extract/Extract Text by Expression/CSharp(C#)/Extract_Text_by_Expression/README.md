# Extract Text by Expression - C#

Extract specific text from PDF documents using regular expressions with the PDF4me API in C#. This tool supports both synchronous and asynchronous processing with automatic retry logic.

## Features

- Extract text matching specific patterns/expressions from PDF documents
- Support for page range selection
- Asynchronous processing with polling
- Multiple output formats (JSON, TXT, CSV)
- Comprehensive error handling and logging

## Prerequisites

- **.NET 8.0 SDK**
- **Visual Studio 2022+** (recommended) or `dotnet` CLI
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **A PDF file** for testing

## Project Structure

```
Extract Text by Expression/CSharp(C#)/Extract_Text_by_Expression/
├── Program.cs                                       # Main application entry point
├── sample.pdf                                       # Input PDF file
├── text_expression_extraction_result.json            # Output JSON with text extraction results
├── Extract_Text_by_Expression.csproj                 # .NET project file
├── Extract_Text_by_Expression.sln                    # Visual Studio solution file
├── global.json                                       # .NET global config
└── README.md                                         # This file
```

## Quick Start

1. **Open the project:**
   - Visual Studio: Open `Extract_Text_by_Expression.sln`
   - CLI: Navigate to the project directory
2. **Restore dependencies:**
   - Visual Studio: Restore happens automatically
   - CLI: `dotnet restore`
3. **Build the project:**
   - Visual Studio: Build Solution
   - CLI: `dotnet build`
4. **Configure your API key:**
   - Open `Program.cs` and set your PDF4me API key
5. **Place your PDF file** in the directory (default: `sample.pdf`)
6. **Run the application:**
   - Visual Studio: Press F5 or use "Start Debugging"
   - CLI:
     ```bash
     dotnet run
     ```

## Configuration

Edit the constants or variables in `Program.cs` to set your API key, expression pattern, and page range.

## Output

The application creates a `text_expression_extraction_result.json` file and may output extracted text as additional JSON, TXT, or CSV files in the output folder as configured.

## Error Handling

- File validation for input PDF
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses

## Troubleshooting

- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure `sample.pdf` exists
- **API request failed**: Check internet connection and API status
- **No matches found**: The PDF may not contain text matching your expression
- **Processing timeout**: Large files may take longer to process

## License

MIT License - see project root for details 