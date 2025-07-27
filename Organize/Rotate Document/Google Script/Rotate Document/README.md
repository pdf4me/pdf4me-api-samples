# Rotate Document - Google Apps Script

This Google Apps Script automatically rotates entire PDF documents using the PDF4me API. The script processes PDF files stored in Google Drive and saves the rotated versions to a specified output folder.

## Features

- **Complete document rotation**: Rotates all pages in a document with the same rotation direction
- **Multiple rotation options**: Support for 90°, 180°, and 270° rotations
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

// Set the output folder name for rotated PDF
var outputFolderName = 'PDF4ME output'; // <-- Set your output folder name here

// Document rotation configuration
var rotationType = 'UpsideDown'; // <-- Set rotation type
```

### 4. Rotation Type Options

Choose one of the following rotation types:

- **`NoRotation`**: No rotation applied (keeps original orientation)
- **`Clockwise`**: Rotate 90 degrees clockwise
- **`CounterClockwise`**: Rotate 90 degrees counter-clockwise
- **`UpsideDown`**: Rotate 180 degrees (flip upside down)

## Usage

### Method 1: Folder-based File Input (Recommended)

1. Place your PDF file in the input folder (`PDF4ME input`)
2. Update the `fileName` variable with your PDF filename
3. Set the `rotationType` variable to specify the desired rotation
4. Run the `rotateDocument()` function

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
4. Run the `rotateDocument()` function

## How It Works

1. **File Reading**: The script reads the PDF file from Google Drive
2. **Base64 Encoding**: Converts the PDF to base64 for API transmission
3. **API Request**: Sends the PDF to PDF4me API for processing
4. **Processing**: PDF4me rotates all pages in the document according to your specification
5. **Polling**: For large files, the script polls the API until processing is complete
6. **File Saving**: Saves the rotated PDF to the output folder

## Output

- **Rotated PDF**: Saved with `.rotated.pdf` suffix
- **Logs**: Detailed processing logs in Google Apps Script console
- **Error Files**: If errors occur, error details are saved as text files

## Error Handling

The script includes comprehensive error handling:

- **File not found**: Checks if input file exists
- **Folder not found**: Validates input/output folders
- **API errors**: Handles network and API response errors
- **Processing errors**: Saves error details for troubleshooting
- **Invalid rotation type**: Validates rotation type parameter

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

5. **Invalid rotation type**
   - Ensure the rotation type is one of the valid options
   - Check the spelling and case of the rotation type

### Debug Information

The script logs detailed information including:
- File names and sizes
- Rotation type being applied
- API response codes
- Processing status updates
- Error details with timestamps

## File Structure

```
Google Drive/
├── PDF4ME input/
│   └── sample.pdf (your input file)
└── PDF4ME output/
    ├── sample.rotated.pdf (rotated file)
    └── rotation_error.txt (if errors occur)
```

## Rotation Type Examples

### Example 1: No rotation
```javascript
var rotationType = 'NoRotation'; // Keeps original orientation
```

### Example 2: Clockwise rotation
```javascript
var rotationType = 'Clockwise'; // Rotates 90° clockwise
```

### Example 3: Counter-clockwise rotation
```javascript
var rotationType = 'CounterClockwise'; // Rotates 90° counter-clockwise
```

### Example 4: Upside down rotation
```javascript
var rotationType = 'UpsideDown'; // Rotates 180° (flips upside down)
```

## Use Cases

### Common Applications

1. **Correcting document orientation**: Fix documents that were scanned upside down
2. **Standardizing layouts**: Ensure all documents have consistent orientation
3. **Preparing for printing**: Rotate documents to fit specific paper orientations
4. **Digital archiving**: Standardize document orientation for storage
5. **Mobile viewing**: Optimize documents for mobile device viewing

### Best Practices

1. **Test with small files first**: Verify the rotation works as expected
2. **Backup original files**: Keep copies of your original PDFs
3. **Check document content**: Ensure rotation doesn't affect readability
4. **Use appropriate rotation**: Choose the rotation that best fits your needs
5. **Monitor logs**: Check the execution logs for any issues

## API Reference

This script uses the PDF4me Rotate API endpoint:
- **Endpoint**: `https://api.pdf4me.com/api/v2/Rotate`
- **Method**: POST
- **Authentication**: Basic Auth with API key
- **Response**: 200 (immediate) or 202 (async processing)

## Limitations

- **File size**: Very large files may require longer processing times
- **Rotation consistency**: All pages are rotated with the same direction
- **API quotas**: Check your PDF4me account for API usage limits
- **Google Apps Script quotas**: Be aware of Google Apps Script execution time limits

## Performance Tips

1. **Choose appropriate rotation**: Only rotate when necessary
2. **Use appropriate file sizes**: Very large files may take longer to process
3. **Monitor API usage**: Stay within your PDF4me account limits
4. **Batch processing**: Process multiple files sequentially if needed

## Rotation Guidelines

### When to Use Each Rotation Type

- **NoRotation**: When documents are already correctly oriented
- **Clockwise**: When documents need to be rotated right by 90°
- **CounterClockwise**: When documents need to be rotated left by 90°
- **UpsideDown**: When documents are completely inverted (180°)

### Common Scenarios

1. **Scanned documents**: Often need UpsideDown rotation
2. **Landscape to portrait**: Use Clockwise or CounterClockwise
3. **Portrait to landscape**: Use Clockwise or CounterClockwise
4. **Mobile photos**: May need UpsideDown or 90° rotations

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
- **v1.4**: Added comprehensive rotation type validation
- **v1.5**: Enhanced documentation and use case examples 