## Get Tracking Changes In Word with Google Apps Script and PDF4Me API

This Google Apps Script demonstrates how to extract tracking changes information from a Word document using the PDF4Me API. It handles both synchronous and asynchronous API responses and saves the resulting tracking changes data as a JSON file back to a specified folder in Google Drive.

### Features

* Reads a Word document directly from Google Drive.
* Extracts all tracking changes information from the Word document.
* Returns detailed information about revisions, comments, and changes.
* Handles both immediate (synchronous) and long-running (asynchronous) processing.
* Saves the tracking changes data as a JSON file to a specified folder in Google Drive.

### Prerequisites

*   A Google Account with access to Google Drive.
*   A PDF4Me API key. You can get one from the [PDF4Me Developer Portal](https://portal.pdf4me.com/).

### Setup & Configuration

1. **Create a new Google Apps Script:**
    * Go to script.google.com and create a new project.
    * Copy the code from `get_tracking_changes_in_word.gs` and paste it into the script editor.

2. **Set up Google Drive:**
    * Create a folder in your Google Drive. By default, the script looks for a folder named `PDF4ME input`.
    * Upload your input Word document (e.g., `sample.docx`) to this folder.
    * Create another folder for the output. The default is `PDF4ME output`.

3. **Configure the Script:**
    * Open the `get_tracking_changes_in_word.gs` file in the Apps Script editor.
    * **`apiKey`**: Replace the placeholder value with your actual PDF4Me API key.
    * **`folderName`**: Set this to the name of your Google Drive folder containing the input Word document (default is `PDF4ME input`).
    * **`fileName`**: Set this to the name of your input Word document (default is `sample.docx`).
    * **`outputFileName`**: Define the desired name for the output JSON file with tracking changes data.
    * **`outputFolderName`**: Set this to the name of the Google Drive folder where the JSON file will be saved (default is `PDF4ME output`).

### How to Run

1. Save the script in the Apps Script editor (`Ctrl` + `S` or `Cmd` + `S`).
2. From the function dropdown menu at the top, select `getTrackingChangesInWord`.
3. Click the **Run** button (▶️ icon).
4. The first time you run the script, Google will ask for authorization to access your Google Drive. Review the permissions and click **Allow**.
5. The script will execute. You can monitor its progress by viewing the logs (`View` > `Logs` or `Ctrl` + `Enter`).
6. Once completed, the JSON file with tracking changes data will be available in the specified output folder in your Google Drive.

### Code Explanation

* **`getTrackingChangesInWord()`**: The main function that orchestrates the tracking changes extraction process.
* **API & File Configuration**: The script starts by defining the API key, endpoint URL, and the input/output file and folder names.
* **File Retrieval**: It uses the `DriveApp` service to locate the specified folder and input Word document from your Google Drive.
* **Payload Preparation**: The Word document content is read and Base64 encoded. This is assembled into a JSON payload for the API request.
* **API Request**: `UrlFetchApp.fetch()` sends the payload to the PDF4Me API. `muteHttpExceptions: true` is used to handle API responses other than 200 OK gracefully.
* **Response Handling**:
    * A `200 OK` response means the tracking changes extraction was synchronous and successful. The JSON data is in the response body.
    * A `202 Accepted` response indicates an asynchronous job. The script retrieves a polling URL from the `Location` header.
* **Asynchronous Polling**: For 202 responses, the script enters a loop, polling the status URL every 10 seconds. It continues until it gets a `200 OK` (processing complete) or another status code (error), or until it times out.
* **Save Output**: Once the JSON data is received, it's created as a blob and saved to the specified output folder in Google Drive using `outputFolder.createFile(jsonBlob)`.
* **Error Handling**: The script logs any API errors or exceptions to the Apps Script logger for debugging.

### What Information is Extracted?

The API extracts comprehensive tracking changes information including:

* **Revisions**: All text additions, deletions, and modifications
* **Comments**: All comments added to the document
* **Formatting Changes**: Style and formatting modifications
* **Author Information**: Who made each change
* **Timestamps**: When each change was made
* **Change Types**: Insertions, deletions, formatting changes, etc.
* **Document Structure**: Paragraph and section information

### JSON Output Structure

The extracted data is returned as a structured JSON object containing:

```json
{
  "revisions": [
    {
      "author": "User Name",
      "date": "2024-01-01T10:00:00Z",
      "type": "insertion",
      "text": "Added text content",
      "position": "paragraph 1, character 10"
    }
  ],
  "comments": [
    {
      "author": "Reviewer Name",
      "date": "2024-01-01T11:00:00Z",
      "text": "Comment text",
      "position": "paragraph 2"
    }
  ],
  "metadata": {
    "totalRevisions": 15,
    "totalComments": 3,
    "authors": ["User1", "User2"],
    "dateRange": {
      "start": "2024-01-01T09:00:00Z",
      "end": "2024-01-01T12:00:00Z"
    }
  }
}
```

### Use Cases

* **Document Analysis**: Analyze the revision history of documents
* **Collaboration Tracking**: Track who made what changes and when
* **Audit Trails**: Create audit trails for document changes
* **Review Processes**: Extract comments and feedback from review processes
* **Change Management**: Monitor and analyze document evolution
* **Compliance**: Ensure document changes are properly tracked for compliance

### Output

The script produces a JSON file containing all tracking changes information from the Word document. This JSON can be:

* **Parsed and Analyzed**: Use the structured data for analysis
* **Imported into Databases**: Store tracking information in databases
* **Used for Reporting**: Generate reports on document changes
* **Integrated with Workflows**: Use the data in automated workflows

---

*This is a sample provided by PDF4Me. Check out the PDF4Me Developer Portal for more information and API documentation.* 