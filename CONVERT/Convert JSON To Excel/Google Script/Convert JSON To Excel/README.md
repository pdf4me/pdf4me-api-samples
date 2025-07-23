## Convert JSON to Excel with Google Apps Script and PDF4Me API

This Google Apps Script demonstrates how to convert a JSON file stored in Google Drive into an Excel (`.xlsx`) document using the PDF4Me API. It handles both synchronous and asynchronous API responses and saves the resulting Excel file back to a specified folder in Google Drive.

### Features

*   Reads a JSON file directly from Google Drive.
*   Converts JSON data into a structured Excel spreadsheet.
*   Supports various Excel formatting options like worksheet name, title styling, and data type conversion.
*   Handles both immediate (synchronous) and long-running (asynchronous) conversions.
*   Saves the final Excel document to a specified folder in Google Drive.

### Prerequisites

*   A Google Account with access to Google Drive.
*   A PDF4Me API key. You can get one from the PDF4Me Developer Portal.

### Setup & Configuration

1.  **Create a new Google Apps Script:**
    *   Go to script.google.com and create a new project.
    *   Copy the code from `ConvertJsonToExcel.gs` and paste it into the script editor.

2.  **Set up Google Drive:**
    *   Create a folder in your Google Drive for your input files. By default, the script looks for a folder named `PDF4ME input`.
    *   Upload your input JSON file (e.g., `row.json`) to this folder.
    *   Create another folder for the output. The default is `PDF4ME output`.

3.  **Configure the Script:**
    *   Open the `ConvertJsonToExcel.gs` file in the Apps Script editor.
    *   **`apiKey`**: Replace the placeholder value with your actual PDF4Me API key.
    *   **`folderName`**: Set this to the name of your Google Drive folder containing the input JSON file.
    *   **`fileName`**: Set this to the name of your input JSON file.
    *   **`outputFileName`**: Define the desired name for the output Excel file.
    *   **`outputFolderName`**: Set this to the name of the Google Drive folder where the converted file will be saved.

### How to Run

1.  Save the script in the Apps Script editor (`Ctrl` + `S` or `Cmd` + `S`).
2.  From the function dropdown menu at the top, select `convertJsonToExcel`.
3.  Click the **Run** button (▶️ icon).
4.  The first time you run the script, Google will ask for authorization to access your Google Drive. Review the permissions and click **Allow**.
5.  The script will execute. You can monitor its progress by viewing the logs (`View` > `Logs` or `Ctrl` + `Enter`).
6.  Once completed, the converted Excel file will be available in the specified output folder in your Google Drive.

### Code Explanation

*   **`convertJsonToExcel()`**: The main function that orchestrates the entire conversion process.
*   **API & File Configuration**: The script starts by defining the API key, endpoint URL, and the input/output file and folder names.
*   **File Retrieval**: It uses the `DriveApp` service to locate the specified folder and input JSON file from your Google Drive.
*   **Payload Preparation**:
    *   The script reads the JSON file's content and validates its format using `JSON.parse()`.
    *   The raw JSON string is then Base64 encoded.
    *   This, along with other conversion parameters (like `worksheetName`, `isTitleBold`, `dateFormat`, etc.), is assembled into a JSON payload for the API request.
*   **API Request**: `UrlFetchApp.fetch()` sends the payload to the PDF4Me API. `muteHttpExceptions: true` is used to handle API responses other than 200 OK gracefully.
*   **Response Handling**:
    *   A `200 OK` response means the conversion was synchronous and successful. The Excel data is in the response body.
    *   A `202 Accepted` response indicates an asynchronous job. The script retrieves a polling URL from the `Location` header.
*   **Asynchronous Polling**: For `202` responses, the script enters a loop, polling the status URL every 10 seconds. It continues until it gets a `200 OK` (conversion complete), another status code (error), or until it times out.
*   **Save Output**: Once the Excel data is received, it's created as a blob and saved to the specified output folder in Google Drive.
*   **Error Handling**: The script logs any API errors or exceptions to the Apps Script logger for debugging.

---

*This is a sample provided by PDF4Me. Check out the PDF4Me Developer Portal for more information and API documentation.*