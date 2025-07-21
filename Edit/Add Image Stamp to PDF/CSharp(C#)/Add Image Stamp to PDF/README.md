# Add Image Stamp to PDF - C#

Add image stamps/watermarks to PDF documents using the PDF4me API in C#. This tool allows you to overlay images onto PDF documents with configurable positioning and sizing.

## Features

- Add image stamps to PDF documents
- Support for various image formats (PNG, JPG, etc.)
- Configurable stamp positioning and sizing
- Page range support (all pages or specific pages)
- Asynchronous processing with retry logic
- Comprehensive error handling and logging
- Handles both synchronous and asynchronous API responses

## Prerequisites

- **.NET 8.0 SDK**
- **Visual Studio 2022+** (recommended) or `dotnet` CLI
- **PDF4me API key** ([get one here](https://dev.pdf4me.com/dashboard/#/api-keys/))
- **A PDF file** and **an image file** for testing

## Project Structure

```
Add Image Stamp to PDF/CSharp(C#)/Add Image Stamp to PDF/
├── Program.cs                      # Main application entry point
├── sample.pdf                      # Input PDF file
├── sample.png                      # Image file to use as stamp
├── sample.with_image_stamp.pdf     # Output PDF with image stamp (generated)
├── Add_Image_Stamp_to_PDF.csproj   # .NET project file
├── Add_Image_Stamp_to_PDF.sln      # Visual Studio solution file
└── README.md                       # This file
```

## Quick Start

1. **Open the project:**
   - Visual Studio: Open `Add_Image_Stamp_to_PDF.sln`
   - CLI: Navigate to the project directory
2. **Restore dependencies:**
   - Visual Studio: Restore happens automatically
   - CLI: `dotnet restore`
3. **Build the project:**
   - Visual Studio: Build Solution
   - CLI: `dotnet build`
4. **Configure your API key and file paths:**
   - Open `Program.cs` and set your PDF4me API key, PDF, and image file paths
5. **Place your PDF and image files** in the directory (default: `sample.pdf`, `sample.png`)
6. **Run the application:**
   - Visual Studio: Press F5 or use "Start Debugging"
   - CLI:
     ```bash
     dotnet run
     ```

## Configuration

Edit the constants or variables in `Program.cs` to set your API key, PDF, and image file paths, and stamp properties.

## Output

The PDF with the image stamp will be saved as `sample.with_image_stamp.pdf` in the same directory.

## Error Handling

- File validation for input PDF and image
- API authentication and HTTP errors
- Network issues and timeouts
- Invalid or unexpected API responses

## Troubleshooting

- **401 Unauthorized**: Check your API key
- **File Not Found**: Ensure `sample.pdf` and `sample.png` exist
- **API request failed**: Check internet connection and API status
- **Processing timeout**: Large files may take longer to process

## License

MIT License - see project root for details 