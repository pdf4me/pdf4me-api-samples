function convertDocumentToPdf() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/';
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ConvertToPdf`;

  // Set the folder and file name for the input document
  var folderName = 'PDF4ME'; // <-- Set your folder name here
  var fileName = 'sample_pdf.docx'; // <-- Set your file name here

  // ===  Set the file ID for the input document ===
  // var docFileId = 'YOUR_FILE_ID_HERE'; // Optional: Use file ID instead of name
  // To get the file ID from Google Drive:
  // 1. Right-click the file in Google Drive and select "Get link".
  // 2. The link will look like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // 3. Copy the long string between '/d/' and '/view' — that's your FILE_ID.
  // ===  Set the file ID for the input document ===

  // Set the output file name for the converted PDF document
  var outputFileName = 'Document_to_PDF_output.pdf';
  var outputFolderName = 'PDF4ME'; // <-- Set your output folder name here

  try {
    // === Folder structure file input START ===
    var folders = DriveApp.getFoldersByName(folderName);
    if (!folders.hasNext()) {
      Logger.log('Folder not found: ' + folderName);
      return;
    }
    var folder = folders.next();
    var files = folder.getFilesByName(fileName);
    if (!files.hasNext()) {
      Logger.log('File not found in folder: ' + fileName);
      return;
    }
    var file = files.next();
    // === Folder structure file input END ===

    // === File ID as input START ===
    // var file = DriveApp.getFileById(docFileId);
    // === File ID as input END ===

    // Get the file as a blob (binary data)
    var docBlob = file.getBlob();
    Logger.log('File name: ' + file.getName());
    Logger.log('File size: ' + docBlob.getBytes().length);

    // Encode the document file as base64 for API transmission
    var docBase64 = Utilities.base64Encode(docBlob.getBytes());

    // Prepare the payload for the API request
    var payload = {
      docContent: docBase64,
      docName: file.getName(),
      async: true
    };

    // Set the headers for the API request
    var headers = {
      'Authorization': 'Basic ' + apiKey,
      'Content-Type': 'application/json'
    };

    // Set the options for the API request
    var options = {
      method: 'post',
      headers: headers,
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    // Send the document to the API for conversion
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('API response code: ' + code);
    Logger.log('API response: ' + response.getContentText());

    // If conversion is synchronous and successful
    if (code === 200) {
      var pdfBlob = response.getBlob().setName(outputFileName);
      var outputFolders = DriveApp.getFoldersByName(outputFolderName);
      if (!outputFolders.hasNext()) {
        Logger.log('Output folder not found: ' + outputFolderName);
        return;
      }
      var outputFolder = outputFolders.next();
      outputFolder.createFile(pdfBlob);
      Logger.log('PDF document saved to folder: ' + outputFolderName);
      return;
    }
    // If conversion is asynchronous, poll for the result
    else if (code === 202) {
      var headersAll = response.getAllHeaders();
      var locationUrl = headersAll['Location'] || headersAll['location'];
      if (!locationUrl) {
        Logger.log("No 'Location' header found in the response.");
        return;
      }
      var maxRetries = 10;
      var retryDelay = 10 * 1000; // 10 seconds
      for (var i = 0; i < maxRetries; i++) {
        Utilities.sleep(retryDelay);
        var pollResponse = UrlFetchApp.fetch(locationUrl, {
          method: 'get',
          headers: headers,
          muteHttpExceptions: true
        });
        var pollCode = pollResponse.getResponseCode();
        if (pollCode === 200) {
          var pdfBlob = pollResponse.getBlob().setName(outputFileName);
          var outputFolders = DriveApp.getFoldersByName(outputFolderName);
          if (!outputFolders.hasNext()) {
            Logger.log('Output folder not found: ' + outputFolderName);
            return;
          }
          var outputFolder = outputFolders.next();
          outputFolder.createFile(pdfBlob);
          Logger.log('PDF document saved to folder: ' + outputFolderName);
          return;
        } else if (pollCode === 202) {
          Logger.log('Conversion still in progress...');
          continue;
        } else {
          Logger.log('Error during polling. Status: ' + pollCode);
          Logger.log(pollResponse.getContentText());
          return;
        }
      }
      Logger.log('Timeout: Conversion did not complete after multiple retries.');
    } else {
      Logger.log('Error: ' + response.getContentText());
    }
  } catch (e) {
    Logger.log('Exception: ' + e);
  }
} 