# Split PDF by Swiss QR Code in Google Apps Script using PDF4me API

This Google Apps Script provides a powerful solution to automatically split a PDF document based on the presence of Swiss QR codes on its pages. It leverages the [PDF4me API](https://pdf4me.com/api) to perform the splitting action and integrates seamlessly with Google Drive for file input and output.

This is ideal for automating workflows like processing batches of Swiss invoices, where each new invoice starts with a Swiss QR code.

**Keywords**: Google Apps Script, PDF Split, Swiss QR Code, PDF4me API, Google Drive Automation, PDF Processing, Invoice Splitting, Apps Script PDF, Automate PDF.

---

## Features

*   **Split by Swiss QR Code**: Automatically detects pages with Swiss QR codes and splits the document based on them.
*   **Flexible Splitting**: Configure the script to split the document *before* or *after* the page containing the Swiss QR code.
*   **Google Drive Integration**: Reads the source PDF directly from a specified Google Drive folder and saves the split PDF files into another designated folder.
*   **Synchronous & Asynchronous Processing**: Handles both immediate (synchronous) and long-running (asynchronous) API jobs with a built-in polling mechanism.
*   **Robust Error Handling**: Includes comprehensive logging and error handling for scenarios like missing files, API errors, or decoding issues.
*   **Easy Configuration**: All key parameters (API key, folder names, file names) are clearly defined at the top of the script for easy setup.

## Prerequisites

1.  **Google Account**: To use Google Drive and Google Apps Script.
2.  **PDF4me Account & API Key**: You need a PDF4me account to get an API key. You can get one from the [PDF4me Developer Portal](https://dev.pdf4me.com/dashboard/#/api-keys).
3.  **Input PDF**: A PDF file containing one or more Swiss QR codes, stored in your Google Drive.

## How to Use

1.  **Get PDF4me API Key**:
    *   Sign up or log in to the [PDF4me Developer Portal](https://dev.pdf4me.com/dashboard/#/api-keys).
    *   Navigate to the "API Keys" section and copy your key.

2.  **Set up Google Drive**:
    *   Create an input folder in your Google Drive (e.g., `PDF4ME input`).
    *   Upload your PDF file with Swiss QR codes (e.g., `SwissQR.pdf`) into this folder.
    *   Create a parent output folder (e.g., `PDF4ME output`). The script will automatically create the specific output subfolder inside this one.

3.  **Create the Google Apps Script**:
    *   Go to script.google.com and create a new project.
    *   Give the project a name (e.g., "PDF4me Swiss QR Splitter").
    *   Delete any existing code in the `Code.gs` file.

4.  **Add the Code**:
    *   Copy the entire content of the `split_pdf_by_swissqr.gs` file from this repository.
    *   Paste it into the `Code.gs` editor in your Apps Script project.

5.  **Configure the Script**:
    *   In the script, locate the configuration section at the top.
    *   Replace the placeholder `'get the API key from ...'` with your actual PDF4me API key.
    *   Update `folderName`, `fileName`, `outputFolderName`, and `parentFolderName` to match the folder and file names you set up in Google Drive.

    ```javascript
    // API Configuration
    var apiKey = 'YOUR_API_KEY_HERE';

    // Set the folder and file name for the input PDF
    var folderName = 'PDF4ME input'; // <-- Set your input folder name here
    var fileName = 'SwissQR.pdf'; // <-- Set your PDF file name here

    // Set the output folder name for split PDF files
    var outputFolderName = 'Split_PDF_SwissQR_outputs'; // <-- Set your output folder name here
    var parentFolderName = 'PDF4ME output'; // <-- Set your parent folder name here
    ```

6.  **Run the Script**:
    *   Save the project (File > Save or `Ctrl+S`).
    *   From the function dropdown menu at the top, select `main`.
    *   Click the **Run** button.
    *   The first time you run it, Google will ask for authorization to access your Google Drive. Review and allow the permissions.

7.  **Check the Output**:
    *   Navigate to your parent output folder in Google Drive (e.g., `PDF4ME output`).
    *   You will find a new subfolder (e.g., `Split_PDF_SwissQR_outputs`) containing the split PDF files.

## Configuration Details

You can customize the script's behavior by modifying these variables:

*   `apiKey`: Your secret PDF4me API key.
*   `baseUrl`: The base URL for the PDF4me API. Default is `https://api.pdf4me.com/`.
*   `folderName`: The name of the Google Drive folder containing your input PDF.
*   `fileName`: The name of the input PDF file.
*   `outputFolderName`: The name of the folder where the split PDFs will be saved.
*   `parentFolderName`: The parent folder for the output folder.

### Alternative File Input

Instead of using folder and file names, you can directly specify the Google Drive File ID of your input PDF. Uncomment the `pdfFileId` line and comment out the "Folder structure file input" block.

```javascript
// var pdfFileId = 'YOUR_FILE_ID_HERE';
// var file = DriveApp.getFileById(pdfFileId);
```

## API Endpoint and Payload

This script interacts with the following PDF4me API endpoint:

*   **URL**: `https://api.pdf4me.com/api/v2/SplitPdfBySwissQR`
*   **Method**: `POST`

### Payload Parameters

The JSON payload sent to the API can be configured within the script:

```javascript
var payload = {
  "docContent": pdfContent,                                  // Base64 encoded PDF content
  "docName": file.getName(),                                 // Source PDF file name
  "splitQRPage": "after",                                    // Split position: "after" or "before"
  "pdfRenderDpi": "150",                                     // DPI for QR code detection: 100, 150, 200, 250
  "combinePagesWithSameBarcodes": false,                     // If true, combines pages with identical QR codes
  "returnAsZip": false,                                      // If true, returns a single ZIP file
  "async": false                                             // Set to true for large files to avoid timeouts
};
```

## Error Handling and Logging

The script uses `try...catch` blocks to handle potential errors during file reading, API requests, and response processing.

All actions, successes, and errors are logged to the Google Apps Script logger. To view the logs:
1.  In the Apps Script editor, go to **View > Logs** (or press `Ctrl+Enter`).
2.  This will show detailed information about the script's execution, which is very helpful for debugging.

## Contributing

Contributions are welcome! If you have suggestions for improvements or find a bug, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

*This script is an example of how to use the PDF4me API with Google Apps Script. PDF4me is a powerful tool for all kinds of PDF manipulations.*

