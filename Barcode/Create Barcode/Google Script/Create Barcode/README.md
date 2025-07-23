# Create Barcode with PDF4me API and Google Apps Script

This Google Apps Script provides a simple yet powerful way to generate standalone barcode or QR code images using the PDF4me API. The script takes a text input, sends it to the PDF4me API, and saves the resulting barcode image (in PNG format) directly to a specified folder in your Google Drive.

This project is a perfect starting point for anyone looking to integrate barcode generation capabilities into their Google Workspace environment for applications, documents, or inventory management.

## Features

- **Dynamic Barcode Generation**: Create high-quality barcode images from any text string.
- **Google Drive Integration**: Automatically saves the generated barcode image to a designated folder in your Google Drive.
- **Wide Barcode Support**: Supports numerous barcode symbologies, including `qrCode`, `code128`, `dataMatrix`, `aztec`, `hanXin`, `pdf417`, and more.
- **Asynchronous Processing**: Includes a robust polling mechanism to handle API requests that may take longer to process, ensuring reliability.
- **Easy Configuration**: All settings, including API key, output folder, and barcode parameters, are managed in a single, well-commented script file.

## Prerequisites

1.  **A Google Account**: You'll need access to Google Drive and Google Apps Script.
2.  **A PDF4me API Key**: You can get a free API key by registering at the PDF4me Developer Portal.

## Setup and Usage

Follow these steps to get the script running in your Google account.

### 1. Set Up Your Google Drive Folder

1.  Create a new folder in your Google Drive.
2.  Name it `PDF4ME output` (or any name you prefer, but you'll need to update the script accordingly). This folder will store the generated barcode images.

### 2. Create the Google Apps Script

1.  Go to script.google.com and click **New project**.
2.  Give your project a name, for example, `PDF4me Create Barcode`.
3.  Delete the default content in the `Code.gs` file and paste the code from the `create_barcode.gs` file into the editor.

### 3. Configure the Script

Open the `create_barcode.gs` file in the editor and modify the following variables at the top of the `createBarcode` function:

```javascript
function createBarcode() {
  // Set your PDF4Me API key
  var apiKey = 'PASTE_YOUR_API_KEY_HERE'; 
  
  // Set the output file name for the barcode
  var outputFileName = 'Barcode_create_output.png';
  var outputFolderName = 'PDF4ME output'; // <-- Or your custom output folder name

  // ... rest of the script
}
```

You can also customize the barcode's content and type by modifying the `payload` object:

```javascript
    var payload = {
      text: "PDF4me Create Barcode Sample",      // Text to encode in barcode
      barcodeType: "qrCode",                     // Barcode types: qrCode, code128, etc.
      hideText: false,                           // Hide barcode text: true=hide, false=show
      async: true                                // Enable asynchronous processing
    };
```

### 4. Run the Script

1.  Make sure the `createBarcode` function is selected in the function dropdown menu at the top of the editor.
2.  Click the **Run** button (▶).
3.  **Authorization**: The first time you run the script, Google will prompt you for authorization.
    - Click **Review permissions**.
    - Choose your Google account.
    - You may see a "Google hasn’t verified this app" warning. Click **Advanced**, then click **Go to [Your Project Name] (unsafe)**.
    - Click **Allow** to grant the script permission to connect to external services and manage your Google Drive files.

### 5. Check the Output

After the script finishes executing, navigate to your `PDF4ME output` folder in Google Drive. You will find the new PNG image file (`Barcode_create_output.png`) waiting for you.

You can monitor the script's progress and see detailed logs by going to **View -> Logs** in the Apps Script editor.

## Barcode Configuration (Payload)

You can customize the barcode by modifying the `payload` object within the script. Below is a description of the key parameters.

| Parameter     | Type    | Description                                                                                             |
|---------------|---------|---------------------------------------------------------------------------------------------------------|
| `text`        | String  | The text or data you want to encode into the barcode.                                                   |
| `barcodeType` | String  | The type of barcode. E.g., `qrCode`, `code128`, `dataMatrix`, `aztec`, `hanXin`, `pdf417`.                 |
| `hideText`    | Boolean | If `true`, the encoded text is not displayed with the barcode (only applicable for 1D barcodes).        |
| `async`       | Boolean | Set to `true` to process the request asynchronously. This is recommended for ensuring reliable execution. |

## API Documentation

For more advanced options and a full list of supported barcode types and parameters, please refer to the official **PDF4me CreateBarcode API Documentation**.

---

*Keywords for SEO: PDF4me, Google Apps Script, Create Barcode, Generate QR Code, Code 128, Barcode Generator, Google Drive Automation, PNG Barcode, JavaScript, Automate Image Generation, Google Workspace, API, Barcode API.*