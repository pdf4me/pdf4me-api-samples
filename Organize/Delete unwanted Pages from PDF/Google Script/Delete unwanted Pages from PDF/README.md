# Delete Unwanted Pages from PDF - Google Apps Script

This Google Apps Script automatically removes specific pages from PDF documents using the PDF4me API. The script processes PDF files stored in Google Drive and saves the cleaned versions to a specified output folder.

## Features

- **Precise page control**: Remove specific pages by number or range
- **Flexible page selection**: Support for single pages, multiple pages, and page ranges
- **Google Drive integration**: Works directly with files in Google Drive
- **Asynchronous processing**: Handles large files efficiently
- **Error handling**: Comprehensive error logging and recovery
- **Maintains document integrity**: Preserves formatting and structure

## Prerequisites

1. **Google Apps Script access**: You need access to Google Apps Script
2. **PDF4me API key**: Get your API key from [PDF4me Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
3. **Google Drive folders**: Create input and output folders in Google Drive

## Setup Instructions

### 1. Create Google Drive Folders

Create two folders in your Google Drive:
- **Input folder**: `PDF4ME input` (or your preferred name)
- **Output folder**: `PDF4ME output` (or your preferred name)

### 2. Get PDF4me API Key

1. Visit [PDF4me Dashboard](https://dev.pdf4me.com/dashboard/#/api-keys/)
2. Sign in to your account
3. Navigate to API Keys section
4. Copy your API key

### 3. Configure the Script

Open the script in Google Apps Script editor and update these configuration variables:

```javascript
// Set your PDF4me API key
var apiKey = 'YOUR_API_KEY_HERE'; 

// Set the folder and file name for the input PDF
var folderName = 'PDF4ME input'; // <-- Set your folder name here
var fileName = 'sample.pdf'; // <-- Set your file name here

// Set the output folder name for processed PDF
var outputFolderName = 'PDF4ME output'; // <-- Set your output folder name here

// Document page deletion configuration
var pageNumbers = '2-4'; // <-- Set page numbers to delete
```

### 4. Page Number Format Options

Specify pages to delete using these formats:

- **Single page**: `"2"` - Removes only page 2
- **Multiple pages**: `"1,3,5"` - Removes pages 1, 3, and 5
- **Page range**: `"2-4"` - Removes pages 2, 3, and 4
- **Mixed format**: `"1,3-5,7"` - Removes pages 1, 3, 4, 5, and 7

## Usage

### Method 1: Folder-based File Input (Recommended)

1. Place your PDF file in the input folder (`PDF4ME input`)
2. Update the `fileName` variable with your PDF filename
3. Set the `pageNumbers` variable to specify which pages to delete
4. Run the `deleteUnwantedPagesFromPdf()` function

### Method 2: File ID-based Input

1. Get the file ID from Google Drive:
   - Right-click the file in Google Drive
   - Select "Get link"
   - Copy the string between `/d/` and `/view` in the URL
2. Uncomment and update the file ID section:
   ```javascript
   var pdfFileId = 'YOUR_FILE_ID_HERE';
   var file = DriveApp.getFileById(pdfFileId);
   ```
3. Comment out the folder-based input section
4. Run the `deleteUnwantedPagesFromPdf()` function

## How It Works

1. **File Reading**: The script reads the PDF file from Google Drive
2. **Base64 Encoding**: Converts the PDF to base64 for API transmission
3. **API Request**: Sends the PDF to PDF4me API for processing
4. **Processing**: PDF4me removes the specified pages from the PDF
5. **Polling**: For large files, the script polls the API until processing is complete
6. **File Saving**: Saves the processed PDF to the output folder

## Output

- **Processed PDF**: Saved with `.pages_removed.pdf` suffix
- **Logs**: Detailed processing logs in Google Apps Script console
- **Error Files**: If errors occur, error details are saved as text files

## Error Handling

The script includes comprehensive error handling:

- **File not found**: Checks if input file exists
- **Folder not found**: Validates input/output folders
- **API errors**: Handles network and API response errors
- **Processing errors**: Saves error details for troubleshooting
- **Invalid page numbers**: Validates page number format

## Troubleshooting

### Common Issues

1. **"Folder not found" error**
   - Ensure the input folder name matches exactly
   - Check folder permissions in Google Drive

2. **"File not found in folder" error**
   - Verify the filename matches exactly (including case)
   - Ensure the file is in the correct input folder

3. **API authentication errors**
   - Verify your API key is correct
   - Check if your PDF4me account is active

4. **Processing timeout**
   - Large files may take longer to process
   - Check the logs for processing status

5. **Invalid page numbers**
   - Ensure page numbers are within the PDF's page range
   - Check the page number format (comma-separated or range)

### Debug Information

The script logs detailed information including:
- File names and sizes
- Page numbers being deleted
- API response codes
- Processing status updates
- Error details with timestamps

## File Structure

```
Google Drive/
├── PDF4ME input/
│   └── sample.pdf (your input file)
└── PDF4ME output/
    ├── sample.pages_removed.pdf (processed file)
    └── deletion_error.txt (if errors occur)
```

## Page Number Examples

### Example 1: Remove specific pages
```javascript
var pageNumbers = '1,3,5'; // Removes pages 1, 3, and 5
```

### Example 2: Remove a range of pages
```javascript
var pageNumbers = '2-4'; // Removes pages 2, 3, and 4
```

### Example 3: Remove mixed selection
```javascript
var pageNumbers = '1,3-5,7'; // Removes pages 1, 3, 4, 5, and 7
```

### Example 4: Remove single page
```javascript
var pageNumbers = '2'; // Removes only page 2
```

## API Reference

This script uses the PDF4me DeletePages API endpoint:
- **Endpoint**: `https://api.pdf4me.com/api/v2/DeletePages`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Response**: 200 (immediate) or 202 (async processing)

## Limitations

- **File size**: Very large files may require longer processing times
- **Page count**: Ensure specified pages exist in the PDF
- **API quotas**: Check your PDF4me account for API usage limits
- **Google Apps Script quotas**: Be aware of Google Apps Script execution time limits

## Best Practices

1. **Test with small files first**: Verify your page number format works correctly
2. **Backup original files**: Keep copies of your original PDFs
3. **Check page count**: Verify the PDF has the pages you want to delete
4. **Use descriptive names**: Name your output files clearly
5. **Monitor logs**: Check the execution logs for any issues

## Support

For issues related to:
- **PDF4me API**: Contact PDF4me support
- **Google Apps Script**: Check Google Apps Script documentation
- **Google Drive**: Refer to Google Drive help resources

## Version History

- **v1.0**: Initial release with folder-based file handling
- **v1.1**: Added file ID-based input option
- **v1.2**: Enhanced error handling and logging
- **v1.3**: Improved async processing and polling mechanism
- **v1.4**: Added comprehensive page number validation 