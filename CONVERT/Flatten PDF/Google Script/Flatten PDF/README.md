## Flatten Interactive PDFs with Google Apps Script & PDF4Me API

This Google Apps Script provides a robust solution to "flatten" PDF documents, converting all interactive elements like form fields, annotations, and layers into a single, static layer. Using the PDF4Me API, this script automates the process of reading a PDF from Google Drive, making it non-editable, and saving the secured version back to your Drive.

### Features

*   **Secure PDF Content**: Flattens PDFs to prevent further editing of form fields and annotations.
*   **Convert Interactive Elements**: Merges layers, annotations, and form fields into the document's content, making them static.
*   **Google Drive Integration**: Reads source PDFs directly from a specified Google Drive folder.
*   **Asynchronous Support**: Reliably handles both immediate (synchronous) and long-running (asynchronous) flattening jobs for files of any size.
*   **Automated Workflow**: Saves the final flattened PDF back to a specified folder in Google Drive, ideal for finalizing documents and creating secure archives.

### What does "Flattening" a PDF do?

*   **Form Fields**: Become static text and are no longer fillable.
*   **Annotations & Comments**: Are permanently drawn onto the page and cannot be moved or deleted.
*   **Layers**: Are merged into a single, visible layer.
*   **Digital Signatures**: Are converted into a visual representation, removing their cryptographic validity.

### Prerequisites

*   A Google Account with access to Google Drive.
*   A PDF4Me API key. You can get one from the [PDF4Me Developer Portal](https://portal.pdf4me.com/).

### Setup & Configuration

1.  **Create a new Google Apps Script:**
    *   Go to [script.google.com](https://script.google.com/home/my) and create a new project.
    *   Copy the code from `FlattenPdf.gs` and paste it into the script editor.

2.  **Set up Google Drive:**
    *   Create a folder in your Google Drive for your input files. The default is `PDF4ME input`.
    *   Upload your input PDF file (e.g., `unflattened-sample.pdf`) to this folder.
    *   Create another folder for the output. The default is `PDF4ME output`.

3.  **Configure the Script:**
    *   Open the `FlattenPdf.gs` file in the Apps Script editor.
    *   **`apiKey`**: Replace the placeholder value with your actual PDF4Me API key.
    *   **`folderName`**: Set this to the name of your Google Drive folder containing the input PDF.
    *   **`fileName`**: Set this to the name of your input PDF file.
    *   **`outputFileName`**: Define the desired name for the output flattened PDF.
    *   **`outputFolderName`**: Set this to the name of the Google Drive folder where the converted file will be saved.

### How to Run

1.  Save the script in the Apps Script editor (`Ctrl` + `S` or `Cmd` + `S`).
2.  From the function dropdown menu at the top, select `flattenPdf`.
3.  Click the **Run** button (▶️ icon).
4.  The first time you run, Google will ask for authorization to access your Google Drive and external services. Review the permissions and click **Allow**.
5.  The script will execute. You can monitor its progress by viewing the logs (`View` > `Logs`).
6.  Once completed, the flattened PDF will be available in the specified output folder in your Google Drive.

### Code Explanation

*   **`flattenPdf()`**: The main function that orchestrates the entire process.
*   **File & API Configuration**: The script starts by defining the API key, endpoint URL, and the input/output file and folder names.
*   **File Retrieval**: It uses the `DriveApp` service to locate the specified folder and input PDF file from your Google Drive.
*   **Payload Preparation**: The PDF file's content is read, Base64 encoded, and assembled into a JSON payload for the API request.
*   **API Request**: `UrlFetchApp.fetch()` sends the payload to the PDF4Me API. `muteHttpExceptions: true` is used to handle API responses other than 200 OK gracefully.
*   **Response Handling**:
    *   A `200 OK` response means the job was synchronous and successful. The flattened PDF data is in the response body.
    *   A `202 Accepted` response indicates an asynchronous job. The script retrieves a polling URL from the `Location` header to check the job status.
*   **Asynchronous Polling**: For `202` responses, the script enters a loop, polling the status URL every 10 seconds. It continues until it gets a `200 OK` (job complete), another status code (error), or until it times out.
*   **Save Output**: Once the flattened PDF data is received, it's created as a blob and saved to the specified output folder in Google Drive.
*   **Error Handling**: The script uses a `try...catch` block and very detailed `Logger.log` statements to capture and display any API errors or exceptions, making it easy to debug.

---

*This is a sample provided by PDF4Me. Check out the PDF4Me Developer Portal for more information and API documentation.*

*Keywords for search: Flatten PDF, Google Apps Script, PDF4Me API, Make PDF Non-Editable, Remove PDF Form Fields, Convert Interactive PDF to Static, Lock PDF, Secure PDF, Google Drive Automation, Remove Annotations from PDF.*