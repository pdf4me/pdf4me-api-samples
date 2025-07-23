# Add Barcode to PDF using PDF4me API and Google Apps Script

This Google Apps Script demonstrates how to use the PDF4me API to add a barcode or QR code to a PDF document stored in Google Drive. The script retrieves a PDF from a specified Drive folder, sends it to the PDF4me API with custom barcode settings, and saves the modified PDF back to another folder in your Google Drive.

This is an excellent example of how to automate PDF modifications and integrate powerful PDF processing capabilities directly into your Google Workspace environment.

## Features

- **Add Barcodes to PDFs**: Seamlessly add various barcode types to your PDF files.
- **Google Drive Integration**: Fetches source PDFs from and saves output PDFs to your Google Drive.
- **Wide Barcode Support**: Supports numerous barcode types, including `qrCode`, `code128`, `dataMatrix`, `aztec`, `hanXin`, `pdf417`, and more.
- **Full Customization**: Control the barcode's text, page placement, alignment, size, margins, and opacity.
- **Asynchronous Processing**: Built-in polling mechanism to handle large files and long-running jobs.
- **Easy Configuration**: Well-commented code allows for easy customization of input/output files and barcode parameters.

## Prerequisites

1.  **A Google Account**: You'll need access to Google Drive and Google Apps Script.
2.  **A PDF4me API Key**: You can get a free API key by registering at the PDF4me Developer Portal.

## Setup and Usage

Follow these steps to get the script running in your Google account.

### 1. Set Up Your Google Drive Folders

1.  Create a new folder in your Google Drive and name it `PDF4ME input`.
2.  Create another folder and name it `PDF4ME output`.
3.  Upload a sample PDF file (e.g., `sample.pdf`) to the `PDF4ME input` folder.

### 2. Create the Google Apps Script

1.  Go to script.google.com and click **New project**.
2.  Give your project a name, for example, `PDF4me Add Barcode`.
3.  Delete the default content in the `Code.gs` file and paste the code from the `add_barcode_To_pdf.gs` file into the editor.

### 3. Configure the Script

Open the `add_barcode_To_pdf.gs` file in the editor and modify the following variables at the top of the `addBarcodeToPdf` function:

```javascript
function addBarcodeToPdf() {
  // Set your PDF4Me API key
  var apiKey = 'PASTE_YOUR_API_KEY_HERE'; 
  
  // Set the folder and file name for the input PDF
  var folderName = 'PDF4ME input'; // <-- Or your custom input folder name
  var fileName = 'sample.pdf';     // <-- The name of your source PDF

  // Set the output file name and folder
  var outputFileName = 'Add_barcode_to_PDF_output.pdf';
  var outputFolderName = 'PDF4ME output'; // <-- Or your custom output folder name

  // ... rest of the script
}
```

### 4. Run the Script

1.  Make sure the `addBarcodeToPdf` function is selected in the function dropdown menu.
2.  Click the **Run** button (▶).
3.  **Authorization**: The first time you run the script, Google will prompt you for authorization.
    - Click **Review permissions**.
    - Choose your Google account.
    - You may see a "Google hasn’t verified this app" warning. Click **Advanced**, then click **Go to [Your Project Name] (unsafe)**.
    - Click **Allow** to grant the script permission to access your Google Drive files.

### 5. Check the Output

After the script finishes, navigate to your `PDF4ME output` folder in Google Drive. You will find the new PDF file (`Add_barcode_to_PDF_output.pdf`) with the barcode added. You can check the execution logs by going to **View -> Logs**.

## Barcode Configuration (Payload)

You can customize the barcode by modifying the `payload` object within the script. Below is a description of the available parameters.

| Parameter       | Type    | Description                                                                                             |
|-----------------|---------|---------------------------------------------------------------------------------------------------------|
| `docContent`    | String  | The Base64-encoded content of the source PDF file.                                                      |
| `docName`       | String  | The desired file name for the output document.                                                          |
| `text`          | String  | The text or data you want to encode into the barcode.                                                   |
| `barcodeType`   | String  | The type of barcode. E.g., `qrCode`, `code128`, `dataMatrix`, `aztec`, `hanXin`, `pdf417`.                 |
| `pages`         | String  | Pages to add the barcode to. E.g., `""` (all), `"1"`, `"1,3,5"`, `"2-5"`, `"1,3,7-10"`, `"2-"`.            |
| `alignX`        | String  | Horizontal alignment: `"Left"`, `"Center"`, `"Right"`.                                                  |
| `alignY`        | String  | Vertical alignment: `"Top"`, `"Middle"`, `"Bottom"`.                                                    |
| `heightInMM`    | String  | The height of the barcode in millimeters. Use `"0"` for automatic sizing.                               |
| `widthInMM`     | String  | The width of the barcode in millimeters. Use `"0"` for automatic sizing.                                |
| `marginXInMM`   | String  | The horizontal margin from the edge of the page in millimeters.                                         |
| `marginYInMM`   | String  | The vertical margin from the edge of the page in millimeters.                                           |
| `opacity`       | Integer | The opacity of the barcode, from `0` (transparent) to `100` (opaque).                                   |
| `displayText`   | String  | Displays the encoded text `"above"` or `"below"` the barcode (for 1D barcodes).                         |
| `hideText`      | Boolean | If `true`, the encoded text is not displayed with the barcode.                                          |
| `showOnlyInPrint`| Boolean| If `true`, the barcode is only visible when the document is printed.                                    |
| `isTextAbove`   | Boolean | If `true`, places the text above the barcode. Deprecated in favor of `displayText`.                     |
| `async`         | Boolean | Set to `true` to process the request asynchronously, recommended for large files.                       |


## API Documentation

For more advanced options and a full list of supported barcode types, please refer to the official **PDF4me Add Barcode API Documentation**.

---

*Keywords for SEO: PDF4me, Google Apps Script, Add Barcode to PDF, QR Code PDF, Code 128 PDF, Google Drive Automation, PDF API, JavaScript, Automate PDF, Barcode Generator, PDF modification, Google Workspace.*

