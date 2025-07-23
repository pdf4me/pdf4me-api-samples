## Convert HTML to PDF with Google Apps Script and PDF4Me API

This Google Apps Script demonstrates how to convert an HTML file stored in Google Drive into a PDF document using the PDF4Me API. It handles both synchronous and asynchronous API responses and saves the resulting PDF back to a specified folder in Google Drive.

### Features

* Reads an HTML file directly from Google Drive.
* Converts HTML content to a high-quality PDF.
* Supports various page settings like format, orientation, margins, and scaling.
* Handles both immediate (synchronous) and long-running (asynchronous) conversions.
* Saves the final PDF document to a specified folder in Google Drive.

### Prerequisites

*   A Google Account with access to Google Drive.
*   A PDF4Me API key. You can get one from the [PDF4Me Developer Portal](https://portal.pdf4me.com/).

### Setup & Configuration

1. **Create a new Google Apps Script:**
    * Go to script.google.com and create a new project.
    * Copy the code from `ConvertHtmlToPdf.gs` and paste it into the script editor.

2. **Set up Google Drive:**
    * Create a folder in your Google Drive. By default, the script looks for a folder named `PDF4ME input`.
    * Upload your input HTML file (e.g., `sample.html`) to this folder.
    * Create another folder for the output. The default is `PDF4ME output`.

3. **Configure the Script:**
    * Open the `ConvertHtmlToPdf.gs` file in the Apps Script editor.
    * **`apiKey`**: Replace the placeholder value with your actual PDF4Me API key.
    * **`folderName`**: Set this to the name of your Google Drive folder containing the input HTML file (default is `PDF4ME input`).
    * **`fileName`**: Set this to the name of your input HTML file (default is `sample.html`).
    * **`outputFileName`**: Define the desired name for the output PDF file.
    * **`outputFolderName`**: Set this to the name of the Google Drive folder where the converted PDF will be saved (default is `PDF4ME output`).

### How to Run

1. Save the script in the Apps Script editor (`Ctrl` + `S` or `Cmd` + `S`).
2. From the function dropdown menu at the top, select `convertHtmlToPdf`.
3. Click the **Run** button (▶️ icon).
4. The first time you run the script, Google will ask for authorization to access your Google Drive. Review the permissions and click **Allow**.
5. The script will execute. You can monitor its progress by viewing the logs (`View` > `Logs` or `Ctrl` + `Enter`).
6. Once completed, the converted PDF file will be available in the specified output folder in your Google Drive.

### Code Explanation

* **`convertHtmlToPdf()`**: The main function that orchestrates the conversion process.
* **API & File Configuration**: The script starts by defining the API key, endpoint URL, and the input/output file and folder names.
* **File Retrieval**: It uses the `DriveApp` service to locate the specified folder and input HTML file from your Google Drive.
* **Payload Preparation**: The HTML file content is read and Base64 encoded. This, along with other conversion parameters (like page format, margins, etc.), is assembled into a JSON payload for the API request.
* **API Request**: `UrlFetchApp.fetch()` sends the payload to the PDF4Me API. `muteHttpExceptions: true` is used to handle API responses other than 200 OK gracefully.
* **Response Handling**:
    * A `200 OK` response means the conversion was synchronous and successful. The PDF data is in the response body.
    * A `202 Accepted` response indicates an asynchronous job. The script retrieves a polling URL from the `Location` header.
* **Asynchronous Polling**: For 202 responses, the script enters a loop, polling the status URL every 10 seconds. It continues until it gets a `200 OK` (conversion complete) or another status code (error), or until it times out.
* **Save Output**: Once the PDF data is received, it's created as a blob and saved to the specified output folder in Google Drive using `outputFolder.createFile(pdfBlob)`.
* **Error Handling**: The script logs any API errors or exceptions to the Apps Script logger for debugging.

---

*This is a sample provided by PDF4Me. Check out the PDF4Me Developer Portal for more information and API documentation.*