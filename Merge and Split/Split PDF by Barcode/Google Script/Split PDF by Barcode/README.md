# Split PDF by Barcode with Google Apps Script and PDF4me API

This Google Apps Script provides a powerful solution for automatically splitting a PDF document based on barcode occurrences. By leveraging the [PDF4me API](https://pdf4me.com/api), you can integrate this functionality directly into your Google Workspace environment, streamlining your document management workflows without needing a dedicated server.

This script is perfect for automating the separation of large batches of scanned documents, such as invoices, reports, or records, where each new document is marked by a barcode.

## Key Features

*   **Barcode-Based Splitting**: Divide a PDF into multiple documents wherever a specific barcode is detected.
*   **Flexible Splitting Options**: Choose to split the document *before*, *after*, or on the page containing the barcode (and remove the page).
*   **Direct Google Drive Integration**: Reads the source PDF directly from your Google Drive and saves the split files into a designated output folder.
*   **Asynchronous Processing**: Efficiently handles large files using PDF4me's asynchronous job processing, preventing Google Apps Script timeouts.
*   **Advanced Barcode Filtering**: Specify barcode types (e.g., QRCode, DataMatrix, PDF417) and filter by content (e.g., startsWith, contains).
*   **Robust Error Handling**: Includes detailed logging for easy debugging and monitoring within the Apps Script editor.

## Prerequisites

Before you begin, ensure you have the following:

1.  A **Google Account** (for Google Drive and Google Apps Script).
2.  A **PDF4me Developer Account and API Key**. You can get a free key with monthly credits from the [PDF4me Developer Portal](https://dev.pdf4me.com/dashboard/#/api-keys).
3.  A **source PDF file** containing barcodes, uploaded to your Google Drive.

## Setup and Configuration

Follow these steps to set up and configure the script.

### 1. Get Your PDF4me API Key

*   Sign up or log in to the [PDF4me Developer Portal](https://dev.pdf4me.com/).
*   Navigate to the **API Keys** section and copy your API key.

### 2. Create the Google Apps Script

*   Go to [script.google.com](https://script.google.com) and click **New project**.
*   Give your project a name, for example, "PDF4me Barcode Splitter".
*   Delete any existing code in the `Code.gs` file and paste the entire content of the `split_pdf_by_barcode.gs` file.

### 3. Configure the Script Variables

Open the `split_pdf_by_barcode.gs` file in the editor and modify the following variables at the top of the `splitPdfByBarcode` function:

```javascript
// API Configuration - PDF4me service for splitting PDF by barcode
var apiKey = 'YOUR_API_KEY_HERE'; // <-- PASTE YOUR PDF4ME API KEY

// Set the folder and file name for the input PDF
var folderName = 'PDF4ME input'; // <-- Set your input folder name here
var fileName = 'sample_barcode.pdf'; // <-- Set your PDF file name here

// Set the output folder name for split PDF files
var outputFolderName = 'Split_PDF_Barcode_outputs'; // <-- Set your output folder name here
var parentFolderName = 'PDF4ME output'; // <-- Set your parent folder name here
```

*   **`apiKey`**: Your secret API key from the PDF4me Developer Portal.
*   **`folderName`**: The name of the folder in your Google Drive containing the source PDF.
*   **`fileName`**: The name of the PDF file you want to split (including the `.pdf` extension).
*   **`outputFolderName`**: The name of the folder where the split PDF files will be saved.
*   **`parentFolderName`**: The name of the parent folder for the output folder. The script will create this if it doesn't exist.

### 4. Configure the Split Parameters

In the `payload` section, customize the splitting behavior:

```javascript
// Request payload with PDF content and barcode split parameters
var payload = {
  "docContent": pdfContent,
  "docName": file.getName(),
  "barcodeString": "Test PDF Barcode",
  "barcodeFilter": "startsWith", // Filter type: startsWith, endsWith, contains, exact
  "barcodeType": "any", // Barcode type: any, datamatrix, qrcode, pdf417
  "splitBarcodePage": "after", // Split position: before, after, remove
  "combinePagesWithSameConsecutiveBarcodes": false,
  "pdfRenderDpi": "150",
  "async": true // Enable asynchronous processing
};
```

*   **`barcodeString`**: The text content of the barcode to search for.
*   **`barcodeFilter`**: How to match the `barcodeString`. Options are `startsWith`, `endsWith`, `contains`, `exact`.
*   **`barcodeType`**: The type of barcode to look for. Use `any` to search for all supported types.
*   **`splitBarcodePage`**: Set to `"after"` to split after the page with the barcode, `"before"` to split before it, or `"remove"` to split and discard the page.

## How to Run the Script

1.  **Save the Project**: Click the floppy disk icon or press `Ctrl+S` / `Cmd+S`.
2.  **Select the Function**: From the function dropdown menu at the top, ensure `splitPdfByBarcode` is selected.
3.  **Run the Script**: Click the **▶ Run** button.
4.  **Grant Permissions**: The first time you run the script, Google will prompt you to authorize its access to your Google Drive and external services. Review the permissions and click **Allow**.
5.  **Monitor Execution**: You can view the script's progress and any potential errors by opening the **Execution log** (`View > Logs` or `Ctrl+Enter`).

Once the script finishes, the split PDF files will be available in the output folder you specified in your Google Drive.

## API Response Handling

The script is designed to handle PDF4me's API responses gracefully:

*   **Synchronous (HTTP 200)**: For smaller files, the API may process the request immediately. The script will parse the response, decode the Base64-encoded split documents, and save them to Google Drive.
*   **Asynchronous (HTTP 202)**: For larger files, the API returns a `202 Accepted` status and a `Location` URL. The script will then poll this URL periodically until the job is complete, after which it will download and save the resulting files. This prevents script execution timeouts.

## Troubleshooting

*   **"Input folder not found"**: Make sure the `folderName` variable exactly matches the name of the folder in your Google Drive.
*   **"Input PDF file not found"**: Ensure the `fileName` is correct and the file exists within the specified `folderName`.
*   **Authorization Errors (401)**: Double-check that your `apiKey` is correct and has not expired.
*   **"Error decoding base64"**: This can happen if the API response is not in the expected format. The script will save a `debug_doc_..._base64.txt` file in the output folder for debugging. Check this file to understand what the API returned.

For more details on the PDF4me API and its capabilities, please visit the PDF4me Developer Documentation.