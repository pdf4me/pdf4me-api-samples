## Convert Word to PDF Form with Google Apps Script & PDF4Me API

This Google Apps Script provides a powerful solution for converting Microsoft Word documents (`.docx`) containing form fields into interactive, fillable PDF forms. By leveraging the PDF4Me API, it automates the process of reading a Word file from Google Drive, performing the conversion, and saving the resulting PDF form back to a specified Drive folder.

### Features

*   **Word to Fillable PDF**: Converts Word documents to high-quality, fillable PDF forms.
*   **Preserves Form Fields**: Accurately translates Word form fields (text boxes, checkboxes, etc.) into interactive PDF form fields.
*   **Google Drive Integration**: Reads Word files directly from a specified Google Drive folder.
*   **Asynchronous Support**: Handles both immediate (synchronous) and long-running (asynchronous) conversions, making it suitable for large or complex documents.
*   **Automated Workflow**: Saves the final PDF form back to a specified folder in Google Drive, perfect for automating document workflows.

### Prerequisites

*   A Google Account with access to Google Drive.
*   A PDF4Me API key. You can get one from the PDF4Me Developer Portal.

### Setup & Configuration

1.  **Create a new Google Apps Script:**
    *   Go to script.google.com and create a new project.
    *   Copy the code from `WordToPdfForm.gs` and paste it into the script editor.

2.  **Set up Google Drive:**
    *   Create a folder in your Google Drive for your input files. The default is `PDF4ME input`.
    *   Upload your input Word document (e.g., `sample.docx`) to this folder.
    *   Create another folder for the output. The default is `PDF4ME output`.

3.  **Configure the Script:**
    *   Open the `WordToPdfForm.gs` file in the Apps Script editor.
    *   **`apiKey`**: Replace the placeholder value with your actual PDF4Me API key.
    *   **`folderName`**: Set this to the name of your Google Drive folder containing the input Word document.
    *   **`fileName`**: Set this to the name of your input Word document.
    *   **`outputFileName`**: Define the desired name for the output PDF form.
    *   **`outputFolderName`**: Set this to the name of the Google Drive folder where the converted file will be saved.

### How to Run

1.  Save the script in the Apps Script editor (`Ctrl` + `S` or `Cmd` + `S`).
2.  From the function dropdown menu at the top, select `convertWordToPdfForm`.
3.  Click the **Run** button (▶️ icon).
4.  The first time you run, Google will ask for authorization to access your Google Drive and external services. Review the permissions and click **Allow**.
5.  The script will execute. You can monitor its progress by viewing the logs (`View` > `Logs`).
6.  Once completed, the converted PDF form will be available in the specified output folder in your Google Drive.

### Code Explanation

*   **`convertWordToPdfForm()`**: The main function that orchestrates the entire conversion process.
*   **File & API Configuration**: The script starts by defining the API key, endpoint URL, and the input/output file and folder names.
*   **File Retrieval**: It uses the `DriveApp` service to locate the specified folder and input Word document from your Google Drive.
*   **Payload Preparation**: The Word document's content is read, Base64 encoded, and assembled into a JSON payload for the API request.
*   **API Request**: `UrlFetchApp.fetch()` sends the payload to the PDF4Me API. `muteHttpExceptions: true` is used to handle API responses other than 200 OK gracefully.
*   **Response Handling**:
    *   A `200 OK` response means the conversion was synchronous and successful. The PDF form data is in the response body.
    *   A `202 Accepted` response indicates an asynchronous job. The script retrieves a polling URL from the `Location` header to check the job status.
*   **Asynchronous Polling**: For `202` responses, the script enters a loop, polling the status URL every 10 seconds. It continues until it gets a `200 OK` (conversion complete), another status code (error), or until it times out.
*   **Save Output**: Once the PDF form data is received, it's created as a blob and saved to the specified output folder in Google Drive.
*   **Error Handling**: The script uses a `try...catch` block and detailed `Logger.log` statements to capture and display any API errors or exceptions, making it easier to debug.

---

*This is a sample provided by PDF4Me. Check out the PDF4Me Developer Portal for more information and API documentation.*

*Keywords for search: Convert Word to PDF Form, Google Apps Script, PDF4Me API, Fillable PDF, DOCX to PDF Form, Automate PDF Forms, Google Drive Script, Word form fields to PDF, Create PDF Form from Word.*






























































































































































































































































































































































-