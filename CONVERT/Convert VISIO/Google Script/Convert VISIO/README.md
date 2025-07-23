## Convert Visio to PDF, JPG, PNG, or TIFF with Google Apps Script & PDF4Me API

This Google Apps Script provides a powerful way to automate the conversion of Microsoft Visio files (`.vsdx`, `.vsd`, `.vsdm`) stored in Google Drive into various formats like PDF, JPG, PNG, or TIFF using the PDF4Me API.

### Features

*   **Versatile Conversion**: Convert Visio diagrams to high-quality PDF or image formats (JPG, PNG, TIFF).
*   **Google Drive Integration**: Reads Visio files directly from a specified Google Drive folder.
*   **Customizable Output**: Supports a wide range of conversion settings for page selection, quality, compliance, and image properties.
*   **Asynchronous Support**: Handles both immediate (synchronous) and long-running (asynchronous) conversions, making it suitable for large or complex files.
*   **Automated Workflow**: Saves the final converted document back to a specified folder in Google Drive, perfect for automating document workflows.

### Prerequisites

*   A Google Account with access to Google Drive.
*   A PDF4Me API key. You can get one from the PDF4Me Developer Portal.

### Setup & Configuration

1.  **Create a new Google Apps Script:**
    *   Go to script.google.com and create a new project.
    *   Copy the code from `ConvertToVisio.gs` and paste it into the script editor.

2.  **Set up Google Drive:**
    *   Create a folder in your Google Drive for your input files. The default is `PDF4ME input`.
    *   Upload your input Visio file (e.g., `E-Commerce.vsdx`) to this folder.
    *   Create another folder for the output. The default is `PDF4ME output`.

3.  **Configure the Script:**
    *   Open the `ConvertToVisio.gs` file in the Apps Script editor.
    *   **`apiKey`**: Replace the placeholder value with your actual PDF4Me API key.
    *   **`folderName`**: Set this to the name of your Google Drive folder containing the input Visio file.
    *   **`fileName`**: Set this to the name of your input Visio file (e.g., `E-Commerce.vsdx`).
    *   **`outputFileName`**: Define the desired name for the output file (e.g., `VISIO_to_PDF_output.pdf`).
    *   **`outputFolderName`**: Set this to the name of the Google Drive folder where the converted file will be saved.
    *   **`payload`**: The script is pre-configured to convert to PDF. To convert to **JPG, PNG, or TIFF**, comment out the default `payload` and uncomment the corresponding example payload provided in the script.

### How to Run

1.  Save the script in the Apps Script editor (`Ctrl` + `S` or `Cmd` + `S`).
2.  From the function dropdown menu at the top, select `convertVisioToPdf`.
3.  Click the **Run** button (▶️ icon).
4.  The first time you run, Google will ask for authorization to access your Google Drive and external services. Review the permissions and click **Allow**.
5.  The script will execute. You can monitor its progress by viewing the logs (`View` > `Logs`).
6.  Once completed, the converted file will be available in the specified output folder in your Google Drive.

### Code Explanation

*   **`convertVisioToPdf()`**: The main function that orchestrates the entire conversion process.
*   **File & API Configuration**: The script starts by defining the API key, endpoint URL, and the input/output file and folder names.
*   **File Retrieval**: It uses the `DriveApp` service to locate the specified folder and input Visio file from your Google Drive.
*   **Payload Preparation**:
    *   The Visio file's content is read and Base64 encoded.
    *   This, along with other conversion parameters (like `OutputFormat`, `IsPdfCompliant`, `PageIndex`, etc.), is assembled into a JSON payload for the API request. The script includes commented-out examples for creating JPG, PNG, and TIFF files.
*   **API Request**: `UrlFetchApp.fetch()` sends the payload to the PDF4Me API. `muteHttpExceptions: true` is used to handle API responses other than 200 OK gracefully.
*   **Response Handling**:
    *   A `200 OK` response means the conversion was synchronous and successful. The converted file data is in the response body.
    *   A `202 Accepted` response indicates an asynchronous job. The script retrieves a polling URL from the `Location` header to check the job status.
*   **Asynchronous Polling**: For `202` responses, the script enters a loop, polling the status URL every 10 seconds. It continues until it gets a `200 OK` (conversion complete), another status code (error), or until it times out.
*   **Save Output**: Once the file data is received, it's created as a blob and saved to the specified output folder in Google Drive.
*   **Error Handling**: The script uses a `try...catch` block and detailed `Logger.log` statements to capture and display any API errors or exceptions, making it easier to debug.

---

*This is a sample provided by PDF4Me. Check out the PDF4Me Developer Portal for more information and API documentation.*

*Keywords for search: Visio to PDF, Google Apps Script, PDF4Me API, Convert VSDX to PDF, Convert VSD to PDF, Visio to Image, VSDX to JPG, VSDX to PNG, Automate Visio Conversion, Google Drive Automation, Visio to TIFF.*