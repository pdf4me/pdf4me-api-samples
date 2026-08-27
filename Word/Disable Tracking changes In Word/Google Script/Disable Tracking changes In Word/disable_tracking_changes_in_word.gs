function disableTrackingChangesInWord() {
  // Set your PDF4me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  
  // Set the PDF4me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/DisableTrackingChangesInWord`;
  
  // Set the folder and file name for the input Word document
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var fileName = 'sample.docx'; // <-- Set your Word document file name here

  //         ===  Set the file ID for the input Word document ===
  // var docxFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q'; // 
  // To get the file ID from Google Drive:
  // 1. Right-click the file in Google Drive and select "Get link".
  // 2. The link will look like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // 3. Copy the long string between '/d/' and '/view' — that's your FILE_ID.
  // Example: For https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
  //          The file ID is: 1A2B3C4D5E6F7G8H9I0J
  //          ===  Set the file ID for the input Word document ===

  // Set the output folder name for processed Word document
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

    // === File ID as input START ===
    // var file = DriveApp.getFileById(docxFileId);
    // === File ID as input END ===

    // Get the file as a blob (binary data)
    var docxBlob = file.getBlob();
    Logger.log('File name: ' + file.getName());
    Logger.log('File size: ' + docxBlob.getBytes().length);
    Logger.log('Word document file successfully encoded to base64');

    // Encode the Word document file as base64 for API transmission
    var docxBase64 = Utilities.base64Encode(docxBlob.getBytes());

    // Prepare the payload for the API request
    // What PDF4me Word tracking changes disable does:
    // - Removes tracking changes from Word documents
    // - Accepts all tracked changes and removes markup
    // - Creates clean document without revision history
    // - Maintains document formatting and content integrity
    var payload = {
      docName: "output.docx",                               // Name of the file
      docContent: docxBase64,                               // Base64 encoded Word document content
      isAsync: true                                           // Asynchronous processing (recommended for large files)
    };

    // Set the headers for the API request
    var headers = {
      'Authorization': 'Basic ' + apiKey,  // Authentication using Basic auth with API key
      'Content-Type': 'application/json'   // We're sending JSON data
    };

    // Set the options for the API request
    var options = {
      method: 'post',
      headers: headers,
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    // Send the initial tracking changes disable request to the API
    Logger.log('Sending tracking changes disable request to PDF4me API...');
    Logger.log('Processing tracking changes disable: ' + fileName);

    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('Status code: ' + code);
    Logger.log('Response content length: ' + response.getContentText().length);

    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 means "Success" - Tracking changes disable completed successfully
      Logger.log('Success! Tracking changes disable completed!');
      
      // Save the processed Word document
      try {
        // Get the binary content from the response
        var processedDocxBlob = response.getBlob();
        
        // Process and save processed Word document
        processProcessedWordDocument(processedDocxBlob, outputFolderName, file.getName());
        
      } catch (e) {
        Logger.log('Error processing Word document: ' + e);
        // Save raw response content as fallback
        var outputFolders = DriveApp.getFoldersByName(outputFolderName);
        if (outputFolders.hasNext()) {
          var outputFolder = outputFolders.next();
          var rawBlob = Utilities.newBlob(response.getContentText(), 'text/plain', 'raw_response.txt');
          outputFolder.createFile(rawBlob);
          Logger.log('Raw response saved: raw_response.txt');
        }
      }
      
    } else if (code === 202) {
      // 202 means "Accepted" - API is processing the tracking changes disable asynchronously
      Logger.log('202 - Request accepted. Processing asynchronously...');
      
      // Get the polling URL from the Location header
      var headersAll = response.getAllHeaders();
      var locationUrl = headersAll['Location'] || headersAll['location'];
      if (!locationUrl) {
        Logger.log("Error: No polling URL found in response");
        return;
      }

      // Retry logic for polling the result
      var maxRetries = 10;    // Maximum number of polling attempts
      var retryDelay = 10 * 1000; // 10 seconds between each polling attempt

      // Poll the API until tracking changes disable is complete
      for (var attempt = 0; attempt < maxRetries; attempt++) {
        Logger.log('Checking status... (Attempt ' + (attempt + 1) + '/' + maxRetries + ')');
        Utilities.sleep(retryDelay);  // Wait before next attempt

        // Check the processing status by calling the polling URL
        var responseTracking = UrlFetchApp.fetch(locationUrl, {
          method: 'get',
          headers: headers,
          muteHttpExceptions: true
        });
        
        var pollCode = responseTracking.getResponseCode();

        if (pollCode === 200) {
          // 200 - Success: Processing completed
          Logger.log('Success! Tracking changes disable completed!');
          
          // Save the processed Word document
          try {
            // Get the binary content from the polling response
            var processedDocxBlob = responseTracking.getBlob();
            
            // Process and save processed Word document
            processProcessedWordDocument(processedDocxBlob, outputFolderName, file.getName());
            
          } catch (e) {
            Logger.log('Error processing Word document: ' + e);
            // Save raw response content as fallback
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (outputFolders.hasNext()) {
              var outputFolder = outputFolders.next();
              var rawBlob = Utilities.newBlob(responseTracking.getContentText(), 'text/plain', 'raw_response.txt');
              outputFolder.createFile(rawBlob);
              Logger.log('Raw response saved: raw_response.txt');
            }
          }
          return;
          
        } else if (pollCode === 202) {
          // Still processing, continue polling
          Logger.log('Still processing...');
          continue;
        } else {
          // Error occurred during processing
          Logger.log('Error during processing: ' + pollCode + ' - ' + responseTracking.getContentText());
          return;
        }
      }

      // If we reach here, polling timed out
      Logger.log('Timeout: Tracking changes disable did not complete after multiple retries');
      
    } else {
      // Other status codes - Error
      Logger.log('Error: ' + code + ' - ' + response.getContentText());
      return;
    }
    
  } catch (e) {
    // Log any exceptions that occur during the process
    Logger.log('Exception: ' + e);
  }
}

function processProcessedWordDocument(processedDocxBlob, outputFolderName, fileName) {
  // Process and save processed Word document
  try {
    var outputFolders = DriveApp.getFoldersByName(outputFolderName);
    if (!outputFolders.hasNext()) {
      Logger.log('Output folder not found: ' + outputFolderName);
      return;
    }
    var outputFolder = outputFolders.next();
    
    // Create output filename
    var baseName = fileName.replace(/\.docx$/i, '');
    var outputFileName = baseName + '.tracking_disabled.docx';
    
    // Set the MIME type for Word document
    processedDocxBlob.setContentType('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    
    // Save the processed Word document file
    var savedFile = outputFolder.createFile(processedDocxBlob);
    savedFile.setName(outputFileName);
    
    Logger.log('Processed Word document saved: ' + outputFileName);
    Logger.log('Processed file size: ' + savedFile.getSize() + ' bytes');
    Logger.log('Tracking changes disable completed successfully!');
    
  } catch (e) {
    Logger.log('Error processing Word document: ' + e);
    
    // Create error file
    var errorContent = 'Tracking Changes Disable Error\n' +
                      '============================\n' +
                      'Error occurred on: ' + new Date().toString() + '\n\n' +
                      'Error details: ' + e + '\n';
    
    var errorBlob = Utilities.newBlob(errorContent, 'text/plain', 'tracking_disable_error.txt');
    var outputFolders = DriveApp.getFoldersByName(outputFolderName);
    if (outputFolders.hasNext()) {
      var outputFolder = outputFolders.next();
      outputFolder.createFile(errorBlob);
      Logger.log('Error info saved: tracking_disable_error.txt');
    }
  }
} 