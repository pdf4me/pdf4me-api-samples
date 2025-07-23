## Convert PDF to Word with Google Apps Script and PDF4Me API

This Google Apps Script demonstrates how to convert a PDF document from Google Drive into a Word (`.docx`) document using the PDF4Me API. It supports scanned PDFs via OCR and handles both synchronous and asynchronous API responses, saving the final Word file back to Google Drive.

### Features

*   Reads a PDF file directly from Google Drive.
*   Converts PDF content into an editable Word document.
*   Supports OCR (Optical Character Recognition) for scanned documents.
*   Allows configuration of conversion quality and language.
*   Handles both immediate (synchronous) and long-running (asynchronous) conversions.
*   Saves the final Word document to a specified folder in Google Drive.

### Prerequisites

*   A Google Account with access to Google Drive.
*   A PDF4Me API key. You can get one from the PDF4Me Developer Portal.

### Setup & Configuration

1.  **Create a new Google Apps Script:**
    *   Go to script.google.com and create a new project.
    *   Copy the code from `PdfToWord.gs` and paste it into the script editor.

2.  **Set up Google Drive:**
    *   Create a folder in your Google Drive. By default, the script looks for a folder named `PDF4ME`.
    *   Upload your input PDF file (e.g., `sample.pdf`) to this folder.
    *   The output will be saved to the same folder by default.

3.  **Configure the Script:**
    *   Open the `PdfToWord.gs` file in the Apps Script editor.
    *   **`apiKey`**: Replace the placeholder value with your actual PDF4Me API key.
    *   **`folderName`**: Set this to the name of your Google Drive folder containing the input PDF file.
    *   **`fileName`**: Set this to the name of your input PDF file.
    *   **`outputFileName`**: Define the desired name for the output Word file.
    *   **`outputFolderName`**: Set this to the name of the Google Drive folder where the converted file will be saved.

### How to Run

1.  Save the script in the Apps Script editor (`Ctrl` + `S` or `Cmd` + `S`).
2.  From the function dropdown menu at the top, select `convertPdfToWord`.
3.  Click the **Run** button (▶️ icon).
4.  The first time you run the script, Google will ask for authorization to access your Google Drive. Review the permissions and click **Allow**.
5.  The script will execute. You can monitor its progress by viewing the logs (`View` > `Logs` or `Ctrl` + `Enter`).
6.  Once completed, the converted Word document will be available in the specified output folder in your Google Drive.

### Code Explanation

*   **`convertPdfToWord()`**: The main function that orchestrates the entire conversion process.
*   **API & File Configuration**: The script starts by defining the API key, endpoint URL, and the input/output file and folder names.
*   **File Retrieval**: It uses the `DriveApp` service to locate the specified folder and input PDF file from your Google Drive.
*   **Payload Preparation**: The PDF file's content is read, Base64 encoded, and assembled into a JSON payload. This payload includes important conversion settings like `qualityType`, `language`, and `ocrWhenNeeded`.
*   **API Request**: `UrlFetchApp.fetch()` sends the payload to the PDF4Me API. `muteHttpExceptions: true` is used to handle API responses other than 200 OK gracefully.
*   **Response Handling**:
    *   A `200 OK` response means the conversion was synchronous and successful. The Word data is in the response body.
    *   A `202 Accepted` response indicates an asynchronous job. The script retrieves a polling URL from the `Location` header.
*   **Asynchronous Polling**: For `202` responses, the script enters a loop, polling the status URL every 10 seconds. It continues until it gets a `200 OK` (conversion complete), another status code (error), or until it times out.
*   **Save Output**: Once the Word data is received, it's created as a blob and saved to the specified output folder in Google Drive.
*   **Error Handling**: The script logs any API errors or exceptions to the Apps Script logger for debugging.

---

*This is a sample provided by PDF4Me. Check out the PDF4Me Developer Portal for more information and API documentation.*