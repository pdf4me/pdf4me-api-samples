## Create PDF/A Compliant Documents with Google Apps Script & PDF4Me API

This Google Apps Script provides a powerful solution to convert standard PDF documents from Google Drive into PDF/A compliant files, suitable for long-term archiving. Using the PDF4Me API, this script automates the entire workflow from reading the source file to saving the final archival-quality PDF back to your Drive.

### Features

*   **PDF to PDF/A Conversion**: Converts standard PDF files into various PDF/A compliance levels (e.g., PDF/A-1b, PDF/A-2b, PDF/A-3b).
*   **Long-Term Archiving**: Ensures your documents meet the strict standards required for digital preservation.
*   **Google Drive Integration**: Reads source PDFs directly from a specified Google Drive folder.
*   **Customizable Compliance**: Easily configure the desired PDF/A compliance level and upgrade/downgrade policies.
*   **Asynchronous Support**: Handles both immediate (synchronous) and long-running (asynchronous) conversions, making it reliable for large or complex PDFs.
*   **Automated Workflow**: Saves the final PDF/A document back to a specified folder in Google Drive, perfect for automating document archiving processes.

### Prerequisites

*   A Google Account with access to Google Drive.
*   A PDF4Me API key. You can get one from the [PDF4Me Developer Portal](https://portal.pdf4me.com/).

### Setup & Configuration

1.  **Create a new Google Apps Script:**
    *   Go to [script.google.com](https://script.google.com/home/my) and create a new project.
    *   Copy the code from `CreatePdfA.gs` and paste it into the script editor.

2.  **Set up Google Drive:**
    *   Create a folder in your Google Drive for your input files. The default is `PDF4ME input`.
    *   Upload your input PDF file (e.g., `sample.pdf`) to this folder.
    *   Create another folder for the output. The default is `PDF4ME output`.

3.  **Configure the Script:**
    *   Open the `CreatePdfA.gs` file in the Apps Script editor.
    *   **`apiKey`**: Replace the placeholder value with your actual PDF4Me API key.
    *   **`folderName`**: Set this to the name of your Google Drive folder containing the input PDF.
    *   **`fileName`**: Set this to the name of your input PDF file.
    *   **`outputFileName`**: Define the desired name for the output PDF/A file.
    *   **`outputFolderName`**: Set this to the name of the Google Drive folder where the converted file will be saved.
    *   **`compliance`**: In the `payload` section, set the desired PDF/A level (e.g., `"PdfA1b"`, `"PdfA2b"`, etc.). A list of available options is commented in the script.

### How to Run

1.  Save the script in the Apps Script editor (`Ctrl` + `S` or `Cmd` + `S`).
2.  From the function dropdown menu at the top, select `convertPdfToPdfA`.
3.  Click the **Run** button (▶️ icon).
4.  The first time you run, Google will ask for authorization to access your Google Drive and external services. Review the permissions and click **Allow**.
5.  The script will execute. You can monitor its progress by viewing the logs (`View` > `Logs`).
6.  Once completed, the converted PDF/A file will be available in the specified output folder in your Google Drive.

### Code Explanation

*   **`convertPdfToPdfA()`**: The main function that orchestrates the entire conversion process.
*   **File & API Configuration**: The script starts by defining the API key, endpoint URL, and the input/output file and folder names.
*   **File Retrieval**: It uses the `DriveApp` service to locate the specified folder and input PDF file from your Google Drive.
*   **Payload Preparation**:
    *   The PDF file's content is read and Base64 encoded.
    *   This, along with the desired `compliance` level and other settings, is assembled into a JSON payload for the API request.
*   **API Request**: `UrlFetchApp.fetch()` sends the payload to the PDF4Me API. `muteHttpExceptions: true` is used to handle API responses other than 200 OK gracefully.
*   **Response Handling**:
    *   A `200 OK` response means the conversion was synchronous and successful. The PDF/A data is in the response body.
    *   A `202 Accepted` response indicates an asynchronous job. The script retrieves a polling URL from the `Location` header to check the job status.
*   **Asynchronous Polling**: For `202` responses, the script enters a loop, polling the status URL every 10 seconds. It continues until it gets a `200 OK` (conversion complete), another status code (error), or until it times out.
*   **Save Output**: Once the PDF/A data is received, it's created as a blob and saved to the specified output folder in Google Drive.
*   **Error Handling**: The script uses a `try...catch` block and detailed `Logger.log` statements to capture and display any API errors or exceptions, making it easier to debug.

---

*This is a sample provided by PDF4Me. Check out the PDF4Me Developer Portal for more information and API documentation.*

*Keywords for search: Create PDF/A, Convert PDF to PDF/A, Google Apps Script, PDF4Me API, PDF Archival, Long-Term Preservation, PDF/A-1b, PDF/A-2b, PDF/A-3b, Google Drive Automation, Document Archiving Script.*