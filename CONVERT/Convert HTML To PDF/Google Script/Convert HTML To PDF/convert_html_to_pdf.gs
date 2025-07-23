function convertHtmlToPdf() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ConvertHtmlToPdf`;
  
  // Set the folder and file name for the input HTML
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var fileName = 'sample.html'; // <-- Set your file name here

  // Set the output file name for the converted PDF document
  var outputFileName = 'HTML_to_PDF_output.pdf';
  var outputFolderName = 'PDF4ME output'; // <-- Set your output folder name here

  try {
    // === Folder structure file input START ===

    // Get the folder by name
    var folders = DriveApp.getFoldersByName(folderName);
    if (!folders.hasNext()) {
      Logger.log('Folder not found: ' + folderName);
      return;
    }
    // Get the first folder found
    var folder = folders.next();
    // Get the file by name within the folder
    var files = folder.getFilesByName(fileName);
    if (!files.hasNext()) {
      Logger.log('File not found in folder: ' + fileName);
      return;
    }
    // Get the first file found
    var file = files.next();

    // === Folder structure file input END ===

    //         ===  Set the file ID for the input PDF ===
// var pdfFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q'; // 
// To get the file ID from Google Drive:
// 1. Right-click the file in Google Drive and select "Get link".
// 2. The link will look like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
// 3. Copy the long string between '/d/' and '/view' — that's your FILE_ID.
// Example: For https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
//          The file ID is: 1A2B3C4D5E6F7G8H9I0J
//          ===  Set the file ID for the input PDF ===

    // Get the file as a blob (binary data)
    var htmlBlob = file.getBlob();
    Logger.log('File name: ' + file.getName());
    Logger.log('File size: ' + htmlBlob.getBytes().length);

    // Encode the HTML file as base64 for API transmission
    var htmlBase64 = Utilities.base64Encode(htmlBlob.getBytes());

    // Prepare the payload for the API request
    var payload = {
        docContent: htmlBase64,           //  Use the correctly defined variable
        docName: outputFileName,          //  Use the output file name
        indexFilePath: fileName,          //  Use the input file name
        layout: "Portrait",               //  String value: "Portrait" or "Landscape"
        format: "A4",                     //  String value: "A4", "Letter", "A5", "A6", etc.
        scale: 0.8,                       // Scaling factor for content (0.1 to 2.0)
        topMargin: "40px",                // Top margin spacing
        bottomMargin: "40px",             // Bottom margin spacing
        leftMargin: "40px",               // Left margin spacing
        rightMargin: "40px",              // Right margin spacing
        printBackground: true,            //  Boolean value, not string
        displayHeaderFooter: true,        //  Boolean value, not string
        async: true                       //  Boolean value, not string
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

    // Send the HTML to the API for conversion
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('API response code: ' + code);
    
    // Only log response content if there's an error (not for successful PDF data)
    if (code !== 200 && code !== 202) {
      Logger.log('API response: ' + response.getContentText());
    }

    // If conversion is synchronous and successful
    if (code === 200) {
      var pdfBlob = response.getBlob().setName(outputFileName);
        // Get the output folder by name
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
      // Get the polling URL from the Location header
      var headersAll = response.getAllHeaders();
      var locationUrl = headersAll['Location'] || headersAll['location'];
      if (!locationUrl) {
        Logger.log("No 'Location' header found in the response.");
        return;
      }
      // Poll the API until the conversion is complete or times out
      var maxRetries = 10;
      var retryDelay = 10 * 1000; // 10 seconds
      for (var i = 0; i < maxRetries; i++) {
        Utilities.sleep(retryDelay);
        // Poll the conversion status
        var pollResponse = UrlFetchApp.fetch(locationUrl, {
          method: 'get',
          headers: headers,
          muteHttpExceptions: true
        });
        var pollCode = pollResponse.getResponseCode();
        // If conversion is complete, save the PDF file
        if (pollCode === 200) {
          var pdfBlob = pollResponse.getBlob().setName(outputFileName);

        // Get the output folder by name
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

        // If still processing, continue polling
        else if (pollCode === 202) {
          Logger.log('Conversion still in progress...');
          continue;
        } 
        // If error during polling, log and exit
        else {
          Logger.log('Error during polling. Status: ' + pollCode);
          Logger.log(pollResponse.getContentText());
          return;
        }
      }
      // If polling times out, log a timeout message
      Logger.log('Timeout: Conversion did not complete after multiple retries.');
    } 
    // If initial API call fails, log the error
    else {
      Logger.log('Error response code: ' + code);
      Logger.log('Error details: ' + response.getContentText());
    }
  } catch (e) {
    // Log any exceptions that occur during the process
    Logger.log('Exception: ' + e);
  }
}