function convertMarkdownToPdf() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ConvertMdToPdf`;
  
  // Set the folder and file name for the input Markdown
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var fileName = 'sample.md'; // <-- Set your file name here

  // Set the output file name for the converted PDF document
  var outputFileName = 'Markdown_To_Pdf_Output.pdf';
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

    // Get the file as a blob
    var markdownBlob = file.getBlob();
    Logger.log('File name: ' + file.getName());
    Logger.log('File size: ' + markdownBlob.getBytes().length);

    // Get Markdown content as string
    var markdownContentString = markdownBlob.getDataAsString();
    Logger.log('Markdown content loaded successfully');

    // Base64 encode the Markdown string
    var markdownBase64 = Utilities.base64Encode(markdownContentString);

    // Prepare the payload for the API request
    var payload = {
      "docContent": markdownBase64,    // Base64 encoded Markdown document content
      "docName": "sample.md",          // Name of the source Markdown file with extension
      "mdFilePath": "",                // Path to .md file inside ZIP (empty for single file)
      "async": true                    // Enable asynchronous processing (JavaScript boolean, not Python)
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

    Logger.log('Sending API request...');

    // Send the Markdown to the API for conversion
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
      
      Logger.log('Polling URL: ' + locationUrl);
      
      // Poll the API until the conversion is complete or times out
      var maxRetries = 10;
      var retryDelay = 10 * 1000; // 10 seconds
      for (var i = 0; i < maxRetries; i++) {
        Logger.log('Polling attempt ' + (i + 1) + ' of ' + maxRetries);
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
    Logger.log('Exception: ' + e.toString());
    Logger.log('Stack trace: ' + e.stack);
  }
}