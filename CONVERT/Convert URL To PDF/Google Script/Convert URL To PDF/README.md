## Convert URL to PDF with Google Apps Script and PDF4Me API

This Google Apps Script demonstrates how to convert a public web page into a PDF document using the PDF4Me API. It handles both synchronous and asynchronous API responses and saves the resulting PDF to a specified folder in your Google Drive.

### Features

*   Converts any public URL to a high-quality PDF.
*   Preserves the original styling and layout of the web page.
*   Supports various page settings like format, orientation, margins, and scaling.
*   Handles both immediate (synchronous) and long-running (asynchronous) conversions.
*   Saves the final PDF document to a specified folder in Google Drive.

### Prerequisites

*   A Google Account with access to Google Drive.
*   A PDF4Me API key. You can get one from the [PDF4Me Developer Portal](https://portal.pdf4me.com/).

### Setup & Configuration

1.  **Create a new Google Apps Script:**
    *   Go to [script.google.com](https://script.google.com/home/my) and create a new project.
    *   Copy the code from `UrlToPdf.gs` and paste it into the script editor.

2.  **Set up Google Drive:**
    *   Create a folder in your Google Drive where the converted PDF will be saved. By default, the script looks for a folder named `PDF4ME output`.

3.  **Configure the Script:**
    *   Open the `UrlToPdf.gs` file in the Apps Script editor.
    *   **`apiKey`**: Replace the placeholder value with your actual PDF4Me API key.
    *   **`targetUrl`**: Set this to the full URL of the web page you want to convert.
    *   **`outputFileName`**: Define the desired name for the output PDF file.
    *   **`outputFolderName`**: Set this to the name of the Google Drive folder where the PDF will be saved.

### How to Run

1.  Save the script in the Apps Script editor (`Ctrl` + `S` or `Cmd` + `S`).
2.  From the function dropdown menu at the top, select `convertUrlToPdf`.
3.  Click the **Run** button (▶️ icon).
4.  The first time you run the script, Google will ask for authorization to access your Google Drive and external services. Review the permissions and click **Allow**.
5.  The script will execute. You can monitor its progress by viewing the logs (`View` > `Logs` or `Ctrl` + `Enter`).
6.  Once completed, the converted PDF file will be available in the specified output folder in your Google Drive.

### Code Explanation

*   **`convertUrlToPdf()`**: The main function that orchestrates the entire conversion process.
*   **API & File Configuration**: The script starts by defining the API key, endpoint URL, the target web page URL, and the output file/folder names.
*   **Payload Preparation**: A JSON payload is created containing the `webUrl` and various conversion parameters (like page format, margins, scale, etc.) as specified in the PDF4Me API documentation.
*   **API Request**: `UrlFetchApp.fetch()` sends the payload to the PDF4Me API. The `muteHttpExceptions: true` option is used to handle API responses other than 200 OK gracefully.
*   **Response Handling**:
    *   A `200 OK` response means the conversion was synchronous and successful. The PDF data is immediately available in the response body.
    *   A `202 Accepted` response indicates an asynchronous job. The script retrieves a polling URL from the `Location` header to check the job status later.
*   **Asynchronous Polling**: For `202` responses, the script enters a loop, polling the status URL every 10 seconds. It continues until it receives a `200 OK` (conversion complete), another status code (indicating an error), or until it times out after several retries.
*   **Save Output**: Once the PDF data is received (either from a synchronous or a successful polled response), it's created as a blob and saved to the specified output folder in Google Drive.
*   **Error Handling**: The script uses a `try...catch` block and detailed `Logger.log` statements to capture and display any API errors or exceptions, making it easier to debug.

---

*This is a sample provided by PDF4Me. Check out the PDF4Me Developer Portal for more information and API documentation.*