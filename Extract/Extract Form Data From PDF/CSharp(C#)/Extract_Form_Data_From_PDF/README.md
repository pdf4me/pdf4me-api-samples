# PDF Form Data Extractor - C#

A C# application that extracts form field data and values from PDF documents using the PDF4me API. This tool can extract all types of form fields including text fields, checkboxes, radio buttons, dropdowns, and more.

## Features

- Complete form data extraction from PDF documents
- Supports text fields, checkboxes, radio buttons, dropdowns, signature fields, and more
- Asynchronous processing with polling and retry logic
- Saves extracted data in structured JSON format
- Comprehensive error handling and logging

## Prerequisites

- **.NET 8.0 SDK**
- **Visual Studio 2022+** (recommended) or `dotnet` CLI
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- A PDF document containing fillable forms

## Project Structure

```
Extract Form Data From PDF/CSharp(C#)/Extract_Form_Data_From_PDF/
├── Program.cs                           # Main application entry point
├── sample.pdf                           # Input PDF file
├── form_data_extraction_result.json     # Output JSON with extracted form data
├── Extract_Form_Data_From_PDF.csproj    # .NET project file
├── Extract_Form_Data_From_PDF.sln       # Visual Studio solution file
├── global.json                          # .NET global config
└── README.md                            # This file
```

## Quick Start

1. **Open the project:**
   - Visual Studio: Open `Extract_Form_Data_From_PDF.sln`
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

Edit the constants or variables in `Program.cs` to set your API key and file paths.

## Output Format

The extracted form data is saved in JSON format with the following structure:

```json
{
  "formFields": [
    {
      "name": "field_name",
      "value": "field_value",
      "type": "field_type",
      "page": 1,
      "rect": [x, y, width, height]
    }
  ]
}
```

## Field Types Supported

- Text fields (single-line, multi-line)
- Checkboxes
- Radio buttons
- Dropdown lists
- Signature fields
- Button fields
- Choice fields (list boxes, combo boxes)

## Error Handling

- File validation for input PDF
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses

## Troubleshooting

- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure `sample.pdf` exists
- **API request failed**: Check internet connection and API status
- **No form fields found**: The PDF may not contain fillable form fields
- **Processing timeout**: Large files may take longer to process

## License

MIT License - see project root for details 