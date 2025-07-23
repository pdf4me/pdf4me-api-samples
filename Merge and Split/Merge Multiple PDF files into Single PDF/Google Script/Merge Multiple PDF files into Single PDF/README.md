# Merge Multiple PDF Files with Google Apps Script and PDF4Me API

This Google Apps Script provides a powerful and automated solution to merge multiple PDF documents from your Google Drive into a single, consolidated PDF file. It leverages the robust [PDF4Me API](https://pdf4me.com/api) to handle the merging process, supporting both synchronous and asynchronous operations for files of any size.

This script is perfect for anyone looking to automate PDF workflows, combine reports, or consolidate documents directly within their Google Workspace environment without manual downloads and uploads.

**Keywords**: Google Apps Script, PDF Merge, Combine PDF, PDF4Me API, Google Drive, Automate PDF, JavaScript, PDF Automation.

## Features

- **Combine Multiple PDFs**: Merge two or more PDF files into one document.
- **Flexible File Input**: Specify input PDFs by file name within a Google Drive folder or directly by their Google Drive file IDs.
- **Preserves Quality**: Maintains the original formatting, structure, and quality of the source documents.
- **Asynchronous Processing**: Intelligently handles large files or long-running jobs by polling for completion, ensuring reliability.
- **Automated Workflow**: Runs entirely within the Google Apps Script environment, perfect for automating document management tasks.
- **Easy Configuration**: Simple-to-edit variables for API keys, folder names, and file names.
- **Secure**: Uses your private PDF4Me API key for authenticated requests.

## Prerequisites

1.  **A Google Account**: To use Google Drive and Google Apps Script.
2.  **PDF4Me API Key**: You need an API key from PDF4Me. You can get a free key for testing and development purposes.
    -   [Register at PDF4Me](https://dev.pdf4me.com/signup)
    -   Once registered, get your API key from the [API Keys section of your dashboard](https://dev.pdf4me.com/dashboard/#/api-keys).

## Setup and Usage

Follow these steps to set up and run the script in your Google account.

### 1. Prepare Your Google Drive

- Create a folder in your Google Drive to hold your input PDF files. For example, name it `PDF4ME input`.
- Create another folder for the output. For example, name it `PDF4ME output`.
- Upload the PDF files you want to merge into the input folder.

### 2. Create the Google Apps Script

1.  Go to Google Apps Script.
2.  Click on **New project**.
3.  Give your project a name, e.g., "PDF Merger".
4.  Delete the default content in the `Code.gs` file and paste the code from `merge_multiple_files.gs`.

### 3. Configure the Script

Open the `merge_multiple_files.gs` file in the editor and modify the following configuration variables at the top of the `mergePdfFiles` function:

```javascript
// Set your PDF4Me API key
var apiKey = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys'; 

// Set the folder and file names for the input PDFs
var folderName = 'PDF4ME input'; // <-- Set your input folder name here
var pdfFileNames = ['sample1.pdf', 'sample2.pdf']; // <-- Set your PDF file names here

// Set the output file name for the merged PDF
var outputFileName = 'Merged_pdf_output.pdf';
var outputFolderName = 'PDF4ME output'; // <-- Set your output folder name here
```

- **`apiKey`**: Replace the placeholder text with your actual PDF4Me API key.
- **`folderName`**: The name of the Google Drive folder containing your source PDFs.
- **`pdfFileNames`**: An array of strings with the exact names of the PDF files you want to merge.
- **`outputFileName`**: The desired name for your final merged PDF.
- **`outputFolderName`**: The name of the Google Drive folder where the merged PDF will be saved.

#### Alternative: Using File IDs

If you prefer to use Google Drive file IDs instead of file names, you can comment out the "Folder structure file input" section and uncomment the "File ID as input" section.

```javascript
//         ===  Alternative: Set file IDs for input PDFs ===
var pdfFileIds = ['1A2B3C4D5E6F7G8H9I0J', '1K2L3M4N5O6P7Q8R9S0T']; // <-- Add your file IDs here
```

### 4. Run the Script

1.  Click the **Save project** icon (floppy disk).
2.  Select the `mergePdfFiles` function from the function dropdown list.
3.  Click the **Run** button.
4.  **Authorization**: The first time you run the script, Google will ask for permission to access your Google Drive. Follow the prompts to authorize it. You may see a "Google hasn't verified this app" warning; click "Advanced" and then "Go to (your project name) (unsafe)" to proceed.
5.  **Execution Logs**: You can view the script's progress by going to **View > Logs** (or `Ctrl+Enter`). The logs will show the status of the API calls and any errors.

### 5. Check the Output

Once the script finishes successfully, navigate to your specified output folder in Google Drive. You will find the `Merged_pdf_output.pdf` file there.

## How It Works

The script performs the following actions:

1.  **Reads Files**: It locates the specified PDF files in your Google Drive.
2.  **Encodes Data**: Each file's content is read and encoded into Base64 format, which is required for JSON-based API transmission.
3.  **API Request**: It constructs a JSON payload containing the Base64-encoded file data and sends it to the PDF4Me `/Merge` API endpoint.
4.  **Handles Response**:
    -   **Synchronous (HTTP 200)**: If the merge is completed immediately, the script receives the merged PDF file directly.
    -   **Asynchronous (HTTP 202)**: If the job is long-running, the API returns a `Location` URL. The script then polls this URL periodically until the job is complete.
5.  **Saves File**: Once the merged PDF is ready, the script decodes the response and saves it as a new file in your designated Google Drive output folder.

## API Endpoint Details

- **URL**: `https://api.pdf4me.com/api/v2/Merge`
- **Method**: `POST`
- **Authentication**: `Basic` (using your API key)
- **Payload**:
    ```json
    {
      "docContent": ["...base64_string_1...", "...base64_string_2..."],
      "docName": "output.pdf",
      "async": true
    }
    ```

For more details, refer to the PDF4Me Merge API Documentation.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

