# Read Barcode from PDF using Google Apps Script & PDF4me API

## Overview

This script (`read_barcode_from_pdf.gs`) enables you to **read barcodes and QR codes from PDF files stored in Google Drive** using the [PDF4me API](https://pdf4me.com/). It is designed for use with **Google Apps Script** and is ideal for automating barcode extraction from PDFs in your Google Workspace environment.

---

## Features

- **Extracts all barcode types** (QR Code, Code128, DataMatrix, etc.) from PDF files
- Supports **multiple pages** and **multiple barcode types**
- Saves barcode data as a structured JSON file in your Google Drive
- Handles both synchronous and asynchronous API responses
- Easy integration with Google Drive folders

---

## Prerequisites

- A [PDF4me API key](https://dev.pdf4me.com/dashboard/#/api-keys/)
- A Google account with access to [Google Drive](https://drive.google.com/)
- A PDF file containing barcodes, stored in a Google Drive folder
- [Google Apps Script](https://script.google.com/) access

---

## Setup Instructions

### 1. Get Your PDF4me API Key
- Sign up or log in at [PDF4me Developer Portal](https://dev.pdf4me.com/dashboard/#/api-keys/)
- Copy your API key

### 2. Prepare Your Google Drive
- Create a folder for input PDFs (e.g., `PDF4ME input`)
- Upload your PDF file (e.g., `Read Barcode Sample.pdf`) to this folder
- Create a folder for output (e.g., `PDF4ME output`)

### 3. Add the Script to Google Apps Script
- Open [Google Apps Script](https://script.google.com/)
- Create a new project
- Copy the contents of `read_barcode_from_pdf.gs` into the script editor
- Update the following variables at the top of the script:
  - `apiKey`: Paste your PDF4me API key
  - `folderName`: Name of your input folder
  - `fileName`: Name of your PDF file
  - `outputFolderName`: Name of your output folder

---

## How to Use

1. **Run the `readBarcodeFromPdf` function** in the Apps Script editor
2. The script will:
   - Locate your PDF in the specified Google Drive folder
   - Send the PDF to the PDF4me API for barcode extraction
   - Save the extracted barcode data as a JSON file in your output folder
3. Check the output folder for a file named `Read_barcode_output.json` containing the barcode results

---

## Example Output

The output JSON will look like:

```json
{
  "barcodes": [
    {
      "type": "QRCode",
      "text": "https://example.com"
    },
    {
      "type": "Code128",
      "text": "1234567890"
    }
  ]
}
```

---

## Troubleshooting

- **Folder or file not found?**
  - Double-check the folder and file names in your Google Drive and script variables
- **API key issues?**
  - Ensure your API key is correct and active
- **No barcodes detected?**
  - Make sure your PDF contains readable barcodes
- **Output not saved?**
  - Confirm the output folder exists and you have write permissions

---

## SEO Keywords

- Read barcode from PDF Google Apps Script
- Extract QR code from PDF in Google Drive
- Barcode extraction automation Google Workspace
- PDF4me API barcode reading example
- Google Apps Script PDF barcode reader

---

## License

This script is provided as-is for educational and automation purposes. Please refer to the [PDF4me API Terms of Service](https://pdf4me.com/terms/) for API usage guidelines.

---

## Author

[PDF4me API Samples](https://pdf4me.com/) 