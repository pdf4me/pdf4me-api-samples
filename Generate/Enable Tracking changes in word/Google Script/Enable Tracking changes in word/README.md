## Enable Tracking Changes in Word with Google Apps Script and PDF4Me API

This Google Apps Script demonstrates how to enable tracking changes in a Word document using the PDF4Me API. It handles both synchronous and asynchronous API responses and saves the resulting Word document with tracking enabled back to a specified folder in Google Drive.

### Features

* Reads a Word document directly from Google Drive.
* Enables tracking changes functionality in the Word document.
* Handles both immediate (synchronous) and long-running (asynchronous) processing.
* Saves the final Word document with tracking enabled to a specified folder in Google Drive.

### Prerequisites

*   A Google Account with access to Google Drive.
*   A PDF4Me API key. You can get one from the [PDF4Me Developer Portal](https://portal.pdf4me.com/).

### Setup & Configuration

1. **Create a new Google Apps Script:**
    * Go to script.google.com and create a new project.
    * Copy the code from `enable_tracking_changes_in_word.gs` and paste it into the script editor.

2. **Set up Google Drive:**
    * Create a folder in your Google Drive. By default, the script looks for a folder named `PDF4ME input`.
    * Upload your input Word document (e.g., `sample.docx`) to this folder.
    * Create another folder for the output. The default is `PDF4ME output`.

3. **Configure the Script:**
    * Open the `enable_tracking_changes_in_word.gs` file in the Apps Script editor.
    * **`apiKey`**: Replace the placeholder value with your actual PDF4Me API key.
    * **`folderName`**: Set this to the name of your Google Drive folder containing the input Word document (default is `PDF4ME input`).
    * **`fileName`**: Set this to the name of your input Word document (default is `sample.docx`).
    * **`outputFileName`**: Define the desired name for the output Word document with tracking enabled.
    * **`outputFolderName`**: Set this to the name of the Google Drive folder where the Word document with tracking enabled will be saved (default is `PDF4ME output`).

### How to Run

1. Save the script in the Apps Script editor (`Ctrl` + `S` or `Cmd` + `S`).
2. From the function dropdown menu at the top, select `enableTrackingChangesInWord`.
3. Click the **Run** button (▶️ icon).
4. The first time you run the script, Google will ask for authorization to access your Google Drive. Review the permissions and click **Allow**.
5. The script will execute. You can monitor its progress by viewing the logs (`View` > `Logs` or `Ctrl` + `Enter`).
6. Once completed, the Word document with tracking enabled will be available in the specified output folder in your Google Drive.

### Code Explanation

* **`enableTrackingChangesInWord()`**: The main function that orchestrates the tracking changes enabling process.
* **API & File Configuration**: The script starts by defining the API key, endpoint URL, and the input/output file and folder names.
* **File Retrieval**: It uses the `DriveApp` service to locate the specified folder and input Word document from your Google Drive.
* **Payload Preparation**: The Word document content is read and Base64 encoded. This is assembled into a JSON payload for the API request.
* **API Request**: `UrlFetchApp.fetch()` sends the payload to the PDF4Me API. `muteHttpExceptions: true` is used to handle API responses other than 200 OK gracefully.
* **Response Handling**:
    * A `200 OK` response means the tracking changes enabling was synchronous and successful. The Word document data is in the response body.
    * A `202 Accepted` response indicates an asynchronous job. The script retrieves a polling URL from the `Location` header.
* **Asynchronous Polling**: For 202 responses, the script enters a loop, polling the status URL every 10 seconds. It continues until it gets a `200 OK` (processing complete) or another status code (error), or until it times out.
* **Save Output**: Once the Word document data is received, it's created as a blob and saved to the specified output folder in Google Drive using `outputFolder.createFile(wordBlob)`.
* **Error Handling**: The script logs any API errors or exceptions to the Apps Script logger for debugging.

### What is Tracking Changes?

Tracking changes in Word documents allows users to:

* **Track Revisions**: See all changes made to the document, including additions, deletions, and formatting changes.
* **Review Process**: Enable collaborative editing where multiple users can make changes and see what others have modified.
* **Version Control**: Keep track of document versions and changes over time.
* **Accept/Reject Changes**: Choose which changes to keep or discard during the review process.

### Use Cases

* **Document Collaboration**: Enable tracking changes for team collaboration on documents.
* **Review Processes**: Set up documents for review where changes need to be tracked and approved.
* **Version Management**: Keep track of document changes for audit trails.
* **Contract Negotiations**: Track changes during contract or agreement negotiations.

### Output

The script produces a Word document with tracking changes enabled. When opened in Microsoft Word or compatible applications, users will be able to:

* See all changes marked with different colors and formatting
* Accept or reject individual changes
* View the document in different modes (Final, Original, Final Showing Markup, Original Showing Markup)
* Add comments and track who made which changes

---

*This is a sample provided by PDF4Me. Check out the PDF4Me Developer Portal for more information and API documentation.* 