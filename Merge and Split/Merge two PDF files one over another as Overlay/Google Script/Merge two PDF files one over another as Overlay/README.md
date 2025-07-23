# PDF4me Google Apps Script Samples for PDF Merging & Overlay

![Language](https://img.shields.io/badge/Language-Google%20Apps%20Script-blue.svg)
![API](https://img.shields.io/badge/API-PDF4me-orange.svg)

This repository contains Google Apps Script examples demonstrating how to use the **PDF4me API** for advanced PDF manipulation directly from your Google Workspace environment. Automate your PDF workflows by merging multiple documents into a single file or overlaying one PDF onto another with precision.

These scripts are perfect for anyone looking to automate document-centric processes, such as combining reports, adding standard letterheads, or assembling document packages without leaving Google Drive.

## Key Features

*   **Standard PDF Merge:** Combine an array of PDF documents into a single, consolidated PDF.
*   **PDF Overlay Merge:** Place one PDF (e.g., a letterhead, watermark, or form template) on top of another PDF.
*   **Google Drive Integration:** Read source PDF files directly from a specified Google Drive folder or by file ID.
*   **Automated Output:** Save the resulting merged PDF to a designated output folder in your Google Drive.
*   **Asynchronous Processing:** Scripts are built to handle long-running jobs using the PDF4me API's asynchronous polling mechanism, ensuring reliability for large files.
*   **Easy Configuration:** Set up your API key, file names, and folder paths with simple variables at the top of each script.

## Scripts Included

1.  **`Merge Multiple PDF files into Single PDF`**
    *   **File:** `merge_multiple_files.gs`
    *   **Description:** This script takes a list of PDF file names, reads them from a Google Drive folder, and merges them sequentially into a single output PDF.

2.  **`Merge two PDF files one over another as Overlay`**
    *   **File:** `merge_pdf_files_overlay.gs`
    *   **Description:** This script takes a 'base' PDF and a 'layer' PDF. It overlays the content of the layer PDF on top of every page of the base PDF. This is ideal for applying a consistent letterhead or watermark.

## Prerequisites

*   A **Google Account** with access to Google Drive and Google Apps Script.
*   A **PDF4me API Key**. You can get a free key from the PDF4me Developer Portal.

## Setup and Usage Guide

Follow these steps to get your PDF automation running in minutes.

### 1. Create a Google Apps Script Project

*   Go to script.google.com and click **New project**.
*   Give your project a descriptive name (e.g., "PDF4me Merge Automation").

### 2. Add the Script Code

*   Choose one of the scripts from this repository (`merge_multiple_files.gs` or `merge_pdf_files_overlay.gs`).
*   Copy the entire content of the script and paste it into the `Code.gs` file in your Apps Script editor, replacing any existing content.

### 3. Prepare Your Google Drive

*   Create two folders in your Google Drive. By default, the scripts look for:
    *   `PDF4ME input`
    *   `PDF4ME output`
*   Upload the PDF files you want to process into your input folder (e.g., `PDF4ME input`).

### 4. Configure the Script

Open the script in the Apps Script editor and modify the configuration variables at the top:

```javascript
// Set your PDF4Me API key
var apiKey = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys'; 

// Set the folder and file names for the input PDFs
var folderName = 'PDF4ME input'; // <-- Set your input folder name here
var pdfFileNames = ['sample1.pdf', 'sample2.pdf']; // <-- For standard merge
var basePdfFileName = 'sample1.pdf'; // <-- For overlay merge (base layer)
var layerPdfFileName = 'sample2.pdf'; // <-- For overlay merge (top layer)

// Set the output file name and folder
var outputFileName = 'Merged_pdf_output.pdf';
var outputFolderName = 'PDF4ME output'; // <-- Set your output folder name here
```

*   **`apiKey`**: **(Required)** Paste your PDF4me API key.
*   **`folderName` / `outputFolderName`**: Change these if you named your Google Drive folders differently.
*   **`pdfFileNames` / `basePdfFileName` / `layerPdfFileName`**: Update these with the exact names of your PDF files.
*   **(Alternative)** You can also use Google Drive file IDs instead of file names for more robust referencing. See the commented-out sections in the scripts for guidance.

### 5. Run the Script

1.  Click the **Save project** icon (💾).
2.  From the function dropdown menu, select the function to run (`mergePdfFiles` or `mergeOverlayPdfFiles`).
3.  Click the **Run** button.

### 6. Grant Permissions

The first time you run the script, Google will prompt you to grant permissions for the script to:
*   Access your Google Drive (to read and write files).
*   Connect to an external service (to call the PDF4me API).

You must **Allow** these permissions for the script to function.

### 7. Check the Results

*   You can monitor the script's execution by opening the logs (**View > Logs**).
*   Once the script completes successfully, your new, merged PDF will appear in your specified output folder in Google Drive.

## How It Works

The scripts automate the following workflow:

1.  **Read Files:** Locates and reads the specified PDF files from your Google Drive.
2.  **Encode:** Converts the file content into **Base64 format**, which is required for the API request payload.
3.  **API Request:** Constructs and sends a JSON payload to the appropriate PDF4me API endpoint (`/v2/Merge` or `/v2/MergeOverlay`).
4.  **Handle Response:**
    *   If the job is small, the API may return the merged PDF immediately (**HTTP 200**).
    *   For larger jobs, the API returns an "Accepted" response (**HTTP 202**) with a polling URL. The script then periodically checks this URL until the job is complete. This asynchronous pattern prevents timeouts.
5.  **Save File:** Decodes the final PDF data from the API response and saves it as a new file in your Google Drive output folder.

---

**Keywords:** PDF Merge, PDF Overlay, Combine PDF, Google Apps Script, Google Drive, PDF4me API, Automate PDF, Scripting, PDF manipulation, Google Workspace, Base64, Asynchronous API, Web API, REST API, Google Apps Script PDF, Automate PDF merge, PDF letterhead overlay, Google Drive automation.