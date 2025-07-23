# Split PDF in Google Drive using Google Apps Script and PDF4me API

This Google Apps Script provides a powerful and flexible solution to split PDF documents directly within your Google Drive. By leveraging the [PDF4me API](https://pdf4me.com/api), this script can automate the process of splitting a single PDF into multiple smaller documents based on various criteria, such as splitting after a specific page, splitting into fixed-size chunks, or extracting specific page ranges.

This is an ideal solution for automating document workflows, organizing large reports, or distributing specific sections of a PDF without manual intervention.

**Keywords**: `Split PDF`, `Google Apps Script`, `PDF4me API`, `Google Drive Automation`, `Extract PDF Pages`, `Split PDF by Page`, `Automate PDF Splitting`, `Recurring PDF Split`, `PDF Page Range`.

## Features

- **Multiple Splitting Modes**:
  - `SplitAfterPage`: Splits the PDF into two parts after a specified page number.
  - `RecurringSplitAfterPage`: Splits the PDF into multiple documents, each containing a fixed number of pages.
  - `SplitSequence`: Splits the PDF at specified, non-consecutive page numbers.
  - `SplitRanges`: Extracts one or more page ranges (e.g., "1-4, 7, 9-11") into a new PDF.
- **Direct Google Drive Integration**: Reads the source PDF from a specified Google Drive folder and saves the output files to another folder.
- **Asynchronous Processing**: Handles large files efficiently by using PDF4me's asynchronous job processing, polling for completion without timing out.
- **Easy Configuration**: Set your API key, input/output folders, and splitting options directly in the script.
- **Detailed Logging**: Comprehensive `console.log` statements for easy debugging and monitoring in the Apps Script execution log.

## Prerequisites

1.  **Google Account**: To use Google Apps Script and Google Drive.
2.  **PDF4me Account**: A PDF4me account is required to get an API key. You can create a free developer account at dev.pdf4me.com to get your API key.

## Setup and Configuration

Follow these steps to set up and run the script:

1.  **Create a Google Apps Script Project**:
    - Go to script.google.com and create a new project.
    - Give the project a name, for example, "PDF4me PDF Splitter".

2.  **Add the Script**:
    - Delete any default code in the `Code.gs` file.
    - Copy the entire content of the `split_pdf.gs` file from this repository and paste it into the `Code.gs` file in your Apps Script project.

3.  **Configure the Script**:
    - **API Key**: On line 7, replace `'get the API key from ...'` with your actual PDF4me API key.
      ```javascript
      var apiKey = 'YOUR_PDF4ME_API_KEY';
      ```
    - **Input File**:
      - Set the `folderName` and `fileName` for your source PDF.
        ```javascript
        var folderName = 'PDF4ME input'; // The folder in your Google Drive
        var fileName = 'sample.pdf';   // The PDF file to split
        ```
      - *Alternatively*, you can use the file's Google Drive ID by uncommenting line 18 and commenting out the folder/file name logic.
    - **Output Folder**:
      - Set the `outputFolderName` and the `parentFolderName` where the split PDFs will be saved. The script will create these folders if they don't exist.
        ```javascript
        var outputFolderName = 'Split_PDF_outputs';
        var parentFolderName = 'PDF4ME output';
        ```

4.  **Choose a Splitting Action**:
    - The script contains four pre-configured `payload` objects for different splitting actions.
    - By default, `SplitAfterPage` is active.
    - To use a different action (e.g., `RecurringSplitAfterPage`), comment out the active `payload` and uncomment the one you wish to use. **Ensure only one `payload` object is active at a time.**

## How to Run the Script

1.  **Upload Your PDF**: Place the PDF file you want to split into the input folder you configured in Google Drive.
2.  **Execute the Function**:
    - In the Google Apps Script editor, ensure the `main` function is selected from the function dropdown menu.
    - Click the **Run** button.
3.  **Authorize the Script**: The first time you run the script, Google will ask for permissions to access your Google Drive. Follow the prompts to grant the necessary permissions.
4.  **Check the Output**:
    - The script will log its progress in the **Execution log**.
    - Once completed, the split PDF files will appear in the specified output folder in your Google Drive.

## Splitting Options Explained

Here are the different `splitAction` payloads you can use:

### 1. SplitAfterPage
Splits the document into two parts after a specific page.

```javascript
var payload = {
  "docContent": pdfContent,
  "docName": file.getName(),
  "splitAction": "SplitAfterPage",
  "splitActionNumber": 1, // Splits after page 1
  "fileNaming": "NameAsPerOrder",
  "async": true
};
```

### 2. RecurringSplitAfterPage
Splits the document repeatedly after every N pages. For example, `splitActionNumber: 4` will create documents of 4 pages each.

```javascript
var payload = {
  "docContent": pdfContent,
  "docName": file.getName(),
  "splitAction": "RecurringSplitAfterPage",
  "splitActionNumber": 4, // Creates PDFs of 4 pages each
  "fileNaming": "NameAsPerOrder",
  "async": true
};
```

### 3. SplitSequence
Splits the document at the specified page numbers. For example, `[1, 3, 8]` will result in documents containing pages `1`, `2-3`, `4-8`, and `9-end`.

```javascript
var payload = {
  "docContent": pdfContent,
  "docName": file.getName(),
  "splitAction": "SplitSequence",
  "splitSequence": [1, 3, 8], // Split points
  "fileNaming": "NameAsPerOrder",
  "async": true
};
```

### 4. SplitRanges
Extracts specific pages or page ranges into a single new document.

```javascript
var payload = {
  "docContent": pdfContent,
  "docName": file.getName(),
  "splitAction": "SplitRanges",
  "splitRanges": "1-4, 8, 10-12", // Extract pages 1-4, 8, and 10-12
  "fileNaming": "NameAsPerOrder",
  "async": true
};
```

For more details on the API capabilities, please refer to the **PDF4me Split API Documentation**.