# Read Swiss QR Code from PDF using Google Apps Script & PDF4me API

## Overview

This README is for the `read_swissqr_code.gs` script, designed to **extract Swiss QR codes from PDF files stored in Google Drive** using the [PDF4me API](https://pdf4me.com/). This solution leverages **Google Apps Script** to automate the process of reading Swiss QR codes from invoices and other documents in your Google Workspace environment.

---

## Features

- **Detects and extracts Swiss QR codes** from PDF documents
- Automates QR code reading directly from Google Drive
- Saves extracted QR code data for further processing or record-keeping
- Integrates seamlessly with Google Apps Script and Google Drive

---

## Prerequisites

- A [PDF4me API key](https://dev.pdf4me.com/dashboard/#/api-keys/)
- A Google account with access to [Google Drive](https://drive.google.com/)
- PDF files containing Swiss QR codes (e.g., Swiss invoices)
- [Google Apps Script](https://script.google.com/) access

---

## Setup Instructions

### 1. Obtain Your PDF4me API Key
- Register or log in at the [PDF4me Developer Portal](https://dev.pdf4me.com/dashboard/#/api-keys/)
- Copy your API key for use in the script

### 2. Prepare Your Google Drive
- Create a folder for input PDFs (e.g., `SwissQR Input`)
- Upload your PDF files containing Swiss QR codes
- Create a folder for output (e.g., `SwissQR Output`)

### 3. Add or Implement the Script
- Open [Google Apps Script](https://script.google.com/)
- Create a new project or open your existing one
- If not already implemented, create a new script file named `read_swissqr_code.gs`
- Use the PDF4me API to call the Swiss QR code reading endpoint (see [PDF4me API documentation](https://developer.pdf4me.com/docs/barcode/read-barcodes/))
- Set your API key, input/output folder names, and file names as variables in the script

---

## How to Use

1. **Run the `readSwissQrCode` function** (once implemented) in the Apps Script editor
2. The script will:
   - Locate your PDF in the specified Google Drive folder
   - Send the PDF to the PDF4me API for Swiss QR code extraction
   - Save the extracted QR code data as a JSON file in your output folder
3. Check the output folder for the results

---

## Example Output

The output JSON may look like:

```json
{
  "swissQrCodes": [
    {
      "type": "SwissQR",
      "text": "SPC
0200
1
CH4431999123000889012
...
"    }
  ]
}
```

---

## Troubleshooting

- **Folder or file not found?**
  - Double-check the folder and file names in your Google Drive and script variables
- **API key issues?**
  - Ensure your API key is correct and active
- **No Swiss QR codes detected?**
  - Make sure your PDF contains a valid Swiss QR code
- **Output not saved?**
  - Confirm the output folder exists and you have write permissions

---

## SEO Keywords

- Read Swiss QR code from PDF Google Apps Script
- Extract Swiss QR code from PDF in Google Drive
- Swiss QR invoice automation Google Workspace
- PDF4me API Swiss QR code reading example
- Google Apps Script Swiss QR code reader

---

## License

This script is provided as-is for educational and automation purposes. Please refer to the [PDF4me API Terms of Service](https://pdf4me.com/terms/) for API usage guidelines.

---

## Author

[PDF4me API Samples](https://pdf4me.com/) 