## Create Swiss QR Bill with Google Apps Script and PDF4Me API

This Google Apps Script demonstrates how to create a Swiss QR Bill from a PDF document using the PDF4Me API. It handles both synchronous and asynchronous API responses and saves the resulting Swiss QR Bill PDF back to a specified folder in Google Drive.

### Features

* Reads a PDF file directly from Google Drive.
* Creates a Swiss QR Bill with all required payment information.
* Supports various Swiss QR Bill parameters including creditor/debtor details, amounts, and IBAN.
* Handles both immediate (synchronous) and long-running (asynchronous) conversions.
* Saves the final Swiss QR Bill PDF document to a specified folder in Google Drive.

### Prerequisites

*   A Google Account with access to Google Drive.
*   A PDF4Me API key. You can get one from the [PDF4Me Developer Portal](https://portal.pdf4me.com/).

### Setup & Configuration

1. **Create a new Google Apps Script:**
    * Go to script.google.com and create a new project.
    * Copy the code from `create_swissqr_bill.gs` and paste it into the script editor.

2. **Set up Google Drive:**
    * Create a folder in your Google Drive. By default, the script looks for a folder named `PDF4ME input`.
    * Upload your input PDF file (e.g., `sample.pdf`) to this folder.
    * Create another folder for the output. The default is `PDF4ME output`.

3. **Configure the Script:**
    * Open the `create_swissqr_bill.gs` file in the Apps Script editor.
    * **`apiKey`**: Replace the placeholder value with your actual PDF4Me API key.
    * **`folderName`**: Set this to the name of your Google Drive folder containing the input PDF file (default is `PDF4ME input`).
    * **`fileName`**: Set this to the name of your input PDF file (default is `sample.pdf`).
    * **`outputFileName`**: Define the desired name for the output Swiss QR Bill PDF file.
    * **`outputFolderName`**: Set this to the name of the Google Drive folder where the Swiss QR Bill PDF will be saved (default is `PDF4ME output`).
    * **Swiss QR Bill Parameters**: Modify the payload object to customize the QR bill details:
        * `iban`: Swiss IBAN for the creditor
        * `crName`: Creditor name
        * `crAddressType`: Creditor address type (S = Structured)
        * `crStreetOrAddressLine1`: Creditor street
        * `crStreetOrAddressLine2`: Creditor street number
        * `crPostalCode`: Creditor postal code
        * `crCity`: Creditor city
        * `amount`: Payment amount
        * `currency`: Currency (CHF for Swiss Franc)
        * `udName`: Ultimate debtor name
        * `udAddressType`: Ultimate debtor address type
        * `udStreetOrAddressLine1`: Ultimate debtor street
        * `udStreetOrAddressLine2`: Ultimate debtor street number
        * `udPostalCode`: Ultimate debtor postal code
        * `udCity`: Ultimate debtor city
        * `referenceType`: Reference type (NON = No reference)
        * `languageType`: Language for the QR bill
        * `seperatorLine`: Separator line style

### How to Run

1. Save the script in the Apps Script editor (`Ctrl` + `S` or `Cmd` + `S`).
2. From the function dropdown menu at the top, select `createSwissQrBill`.
3. Click the **Run** button (▶️ icon).
4. The first time you run the script, Google will ask for authorization to access your Google Drive. Review the permissions and click **Allow**.
5. The script will execute. You can monitor its progress by viewing the logs (`View` > `Logs` or `Ctrl` + `Enter`).
6. Once completed, the Swiss QR Bill PDF file will be available in the specified output folder in your Google Drive.

### Code Explanation

* **`createSwissQrBill()`**: The main function that orchestrates the Swiss QR Bill creation process.
* **API & File Configuration**: The script starts by defining the API key, endpoint URL, and the input/output file and folder names.
* **File Retrieval**: It uses the `DriveApp` service to locate the specified folder and input PDF file from your Google Drive.
* **Payload Preparation**: The PDF file content is read and Base64 encoded. This, along with Swiss QR Bill parameters (creditor/debtor details, amounts, etc.), is assembled into a JSON payload for the API request.
* **API Request**: `UrlFetchApp.fetch()` sends the payload to the PDF4Me API. `muteHttpExceptions: true` is used to handle API responses other than 200 OK gracefully.
* **Response Handling**:
    * A `200 OK` response means the Swiss QR Bill creation was synchronous and successful. The PDF data is in the response body.
    * A `202 Accepted` response indicates an asynchronous job. The script retrieves a polling URL from the `Location` header.
* **Asynchronous Polling**: For 202 responses, the script enters a loop, polling the status URL every 10 seconds. It continues until it gets a `200 OK` (creation complete) or another status code (error), or until it times out.
* **Save Output**: Once the Swiss QR Bill PDF data is received, it's created as a blob and saved to the specified output folder in Google Drive using `outputFolder.createFile(pdfBlob)`.
* **Error Handling**: The script logs any API errors or exceptions to the Apps Script logger for debugging.

### Swiss QR Bill Details

The script creates a Swiss QR Bill with the following default details:
* **Creditor**: Test AG, Test Strasse 1, 8000 Zurich
* **Debtor**: Test Debt AG, Test Deb Strasse 2, 8000 Zurich
* **Amount**: CHF 1000
* **IBAN**: CH0200700110003765824
* **Language**: English
* **Reference Type**: No reference (NON)
* **Separator Line**: Line with scissor

You can modify these values in the payload object to match your specific requirements.

---

*This is a sample provided by PDF4Me. Check out the PDF4Me Developer Portal for more information and API documentation.* 