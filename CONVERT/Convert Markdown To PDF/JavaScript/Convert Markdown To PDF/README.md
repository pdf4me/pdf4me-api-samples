# Markdown to PDF Converter

Convert Markdown files to PDF documents using the PDF4Me API. This project transforms Markdown content into professionally formatted PDF files while preserving all formatting, styling, and structure.

## Features

- ✅ Convert Markdown files to PDF with preserved formatting
- ✅ Support for both synchronous and asynchronous processing
- ✅ Automatic retry logic for async operations
- ✅ Comprehensive error handling
- ✅ No external dependencies (uses Node.js built-in modules)
- ✅ Detailed logging and progress tracking
- ✅ Preserves all Markdown syntax and styling

## Prerequisites

- **Node.js 18.0.0 or higher** (required for built-in `fetch` API)
- **Internet connection** for API access
- **Valid PDF4Me API key**

## Quick Start

1. **Download the project folder**
2. **Place your Markdown file** in the project directory (rename to `sample.md` or update the path in `app.js`)
3. **Run the conversion**:
   ```bash
   node app.js
   ```

The converted PDF will be saved as `Markdown_to_PDF_output.pdf` in the same directory.

## Project Structure

```
Convert Markdown To PDF/
├── app.js              # Main application file
├── package.json        # Project configuration
├── README.md          # This file
└── sample.md          # Sample Markdown file (your input)
```

## Configuration

### File Paths
Edit the constants in `app.js` to customize file paths:

```javascript
const INPUT_MD_PATH = "sample.md";                      // Your Markdown file
const OUTPUT_PDF_PATH = "Markdown_to_PDF_output.pdf";   // Output PDF name
```

### API Settings
The API key and endpoint are pre-configured:

```javascript
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
```

### Conversion Options
Customize the Markdown conversion settings in the payload:

```javascript
const payload = {
    docContent: mdBase64,        // Base64 encoded Markdown content
    docName: "sample.md",        // Name of the source Markdown file
    mdFilePath: "",              // Path to .md file inside ZIP (empty for single file)
    async: true                  // Enable async processing
};
```

## Usage Examples

### Basic Conversion
```bash
# Simple conversion with default settings
node app.js
```

### Custom File Paths
Edit `app.js` to use different files:
```javascript
const INPUT_MD_PATH = "my-document.md";
const OUTPUT_PDF_PATH = "converted-document.pdf";
```

## Markdown Features Supported

The converter preserves all standard Markdown formatting:

### Text Formatting
- **Bold text** (`**text**` or `__text__`)
- *Italic text* (`*text*` or `_text_`)
- `Inline code` (`` `code` ``)
- ~~Strikethrough~~ (`~~text~~`)

### Headers
```markdown
# H1 Header
## H2 Header
### H3 Header
#### H4 Header
##### H5 Header
###### H6 Header
```

### Lists
```markdown
- Unordered list item
- Another item
  - Nested item
  - Another nested item

1. Ordered list item
2. Second item
   1. Nested numbered item
   2. Another nested item
```

### Links and Images
```markdown
[Link text](https://example.com)
![Alt text](image.jpg)
```

### Code Blocks
````markdown
```javascript
function example() {
    console.log("Code block");
}
```
````

### Tables
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### Blockquotes
```markdown
> This is a blockquote
> 
> It can span multiple lines
```

### Horizontal Rules
```markdown
---
```

## API Response Handling

The application handles different API responses:

- **200 (Success)**: Direct PDF response, saved immediately
- **202 (Accepted)**: Async processing, polls for completion
- **Other codes**: Error with detailed message

## Error Handling

The application includes comprehensive error handling:

- ✅ Input file validation
- ✅ Markdown format validation
- ✅ API request errors
- ✅ Network connectivity issues
- ✅ Invalid responses
- ✅ File system errors
- ✅ Timeout handling for async operations

## Troubleshooting

### Common Issues

1. **"Input Markdown file not found"**
   - Ensure your Markdown file exists in the project directory
   - Check the file path in `INPUT_MD_PATH`

2. **"Invalid Markdown format"**
   - Validate your Markdown syntax
   - Ensure proper file extension (.md)

3. **"API request failed"**
   - Verify internet connection
   - Check API key validity
   - Ensure Markdown file is valid

4. **"Polling failed"**
   - Large documents may take longer to process
   - Increase `MAX_RETRIES` or `RETRY_DELAY` in the code

5. **"Node.js version too old"**
   - Upgrade to Node.js 18.0.0 or higher
   - Check version with: `node --version`

### Performance Tips

- **Small documents (< 10KB)**: Usually process synchronously (200 response)
- **Large documents (> 10KB)**: Process asynchronously (202 response) with polling
- **Complex formatting**: May take longer to render and convert

## API Documentation

This project uses the PDF4Me ConvertMdToPdf API v2:

- **Endpoint**: `https://api.pdf4me.com/api/v2/ConvertMdToPdf`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Content-Type**: application/json

### Supported Markdown Features

- ✅ All standard Markdown syntax
- ✅ GitHub Flavored Markdown (GFM)
- ✅ Tables and formatting
- ✅ Code highlighting
- ✅ Links and images
- ✅ Lists and nested structures
- ✅ Headers and sections
- ✅ Blockquotes and emphasis

## Use Cases

Perfect for converting:

- 📚 **Documentation** - API docs, user guides, technical manuals
- 📝 **README files** - Project documentation and setup guides
- 📄 **Reports** - Data analysis, research papers, business reports
- 📖 **Books** - E-books, manuals, educational content
- 📋 **Notes** - Meeting notes, study materials, personal documents

## License

MIT License - feel free to use and modify as needed.

## Support

For issues with the PDF4Me API, refer to the official documentation or contact support. 