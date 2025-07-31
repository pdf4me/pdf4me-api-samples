## Generate Document Single with Google Apps Script and PDF4Me API

This Google Apps Script demonstrates how to generate a single document from a template and data using the PDF4Me API. It handles both synchronous and asynchronous API responses and saves the resulting generated document back to a specified folder in Google Drive.

### Features

* Reads template files (HTML, Word, PDF) directly from Google Drive.
* Reads JSON/XML data files directly from Google Drive.
* Generates documents by merging template with data.
* Supports various output formats (PDF, Word, Excel, HTML).
* Handles both immediate (synchronous) and long-running (asynchronous) generation.
* Saves the final generated document to a specified folder in Google Drive.

### Prerequisites

*   A Google Account with access to Google Drive.
*   A PDF4Me API key. You can get one from the [PDF4Me Developer Portal](https://portal.pdf4me.com/).

### Setup & Configuration

1. **Create a new Google Apps Script:**
    * Go to script.google.com and create a new project.
    * Copy the code from `generate_document_single.gs` and paste it into the script editor.

2. **Set up Google Drive:**
    * Create a folder in your Google Drive. By default, the script looks for a folder named `PDF4ME input`.
    * Upload your template file (e.g., `invoice_sample.html`) to this folder.
    * Upload your data file (e.g., `invoice_sample_data.json`) to this folder.
    * Create another folder for the output. The default is `PDF4ME output`.

3. **Configure the Script:**
    * Open the `generate_document_single.gs` file in the Apps Script editor.
    * **`apiKey`**: Replace the placeholder value with your actual PDF4Me API key.
    * **`folderName`**: Set this to the name of your Google Drive folder containing the input files (default is `PDF4ME input`).
    * **`templateFileName`**: Set this to the name of your template file (default is `invoice_sample.html`).
    * **`jsonDataFileName`**: Set this to the name of your JSON data file (default is `invoice_sample_data.json`).
    * **`outputFileName`**: Define the desired name for the output generated document.
    * **`outputFolderName`**: Set this to the name of the Google Drive folder where the generated document will be saved (default is `PDF4ME output`).
    * **Payload Configuration**: Modify the payload object to customize the generation parameters:
        * `templateFileType`: Type of template file (HTML, Word, PDF)
        * `templateFileName`: Name of the template file
        * `documentDataType`: Type of data (text for JSON/XML)
        * `outputType`: Desired output format (PDF, Word, Excel, HTML)
        * `documentDataText`: The actual data content

### How to Run

1. Save the script in the Apps Script editor (`Ctrl` + `S` or `Cmd` + `S`).
2. From the function dropdown menu at the top, select `generateDocumentSingle`.
3. Click the **Run** button (▶️ icon).
4. The first time you run the script, Google will ask for authorization to access your Google Drive. Review the permissions and click **Allow**.
5. The script will execute. You can monitor its progress by viewing the logs (`View` > `Logs` or `Ctrl` + `Enter`).
6. Once completed, the generated document file will be available in the specified output folder in your Google Drive.

### Code Explanation

* **`generateDocumentSingle()`**: The main function that orchestrates the document generation process.
* **API & File Configuration**: The script starts by defining the API key, endpoint URL, and the input/output file and folder names.
* **File Retrieval**: It uses the `DriveApp` service to locate the specified folder and input files (template and data) from your Google Drive.
* **Payload Preparation**: The template file content is read and Base64 encoded. The JSON data is read as text. Both are assembled into a JSON payload for the API request.
* **API Request**: `UrlFetchApp.fetch()` sends the payload to the PDF4Me API. `muteHttpExceptions: true` is used to handle API responses other than 200 OK gracefully.
* **Response Handling**:
    * A `200 OK` response means the document generation was synchronous and successful. The document data is in the response body.
    * A `202 Accepted` response indicates an asynchronous job. The script retrieves a polling URL from the `Location` header.
* **Asynchronous Polling**: For 202 responses, the script enters a loop, polling the status URL every 10 seconds. It continues until it gets a `200 OK` (generation complete) or another status code (error), or until it times out.
* **Save Output**: Once the generated document data is received, it's created as a blob and saved to the specified output folder in Google Drive using `outputFolder.createFile(documentBlob)`.
* **Error Handling**: The script logs any API errors or exceptions to the Apps Script logger for debugging.

### Supported Template Types

The script supports various template and output combinations:

1. **HTML Template with JSON Data** (Default):
   * Template: HTML file
   * Data: JSON file
   * Output: HTML, PDF, Word, or Excel

2. **Word Template with JSON Data**:
   * Template: Word document (.docx)
   * Data: JSON file
   * Output: PDF, Word, or Excel

3. **PDF Template with XML Data**:
   * Template: PDF file
   * Data: XML file
   * Output: Word document

4. **HTML Template with JSON Data to Excel**:
   * Template: HTML file
   * Data: JSON file
   * Output: Excel file

### Example Payload Configurations

The script includes commented examples for different scenarios:

* **Word to PDF**: Convert Word template with JSON data to PDF
* **PDF to Word**: Convert PDF template with XML data to Word
* **HTML to Excel**: Convert HTML template with JSON data to Excel

You can uncomment and modify these examples to suit your specific needs.

### Template and Data Requirements

* **Template Files**: Should contain placeholders that will be replaced with data
* **JSON Data**: Should contain the data that will be merged into the template
* **File Names**: Ensure the template and data file names match what's configured in the script

---

*This is a sample provided by PDF4Me. Check out the PDF4Me Developer Portal for more information and API documentation.* 