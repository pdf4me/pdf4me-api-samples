function classifyDocument() {
  // Set your PDF4me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  
  // Set the PDF4me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ClassifyDocument`;
  
  // Set the folder and file name for the input PDF
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var fileName = 'sample.pdf'; // <-- Set your file name here

  //         ===  Set the file ID for the input PDF ===
  // var pdfFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q'; // 
  // To get the file ID from Google Drive:
  // 1. Right-click the file in Google Drive and select "Get link".
  // 2. The link will look like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // 3. Copy the long string between '/d/' and '/view' — that's your FILE_ID.
  // Example: For https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
  //          The file ID is: 1A2B3C4D5E6F7G8H9I0J
  //          ===  Set the file ID for the input PDF ===

  // Set the output file name for the classification results
  var outputFileName = 'Classify_document_output.json';
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
    // var file = DriveApp.getFileById(pdfFileId);
    // === File ID as input END ===

    // Get the file as a blob (binary data)
    var pdfBlob = file.getBlob();
    Logger.log('File name: ' + file.getName());
    Logger.log('File size: ' + pdfBlob.getBytes().length);
    Logger.log('PDF file successfully encoded to base64');

    // Encode the PDF file as base64 for API transmission
    var pdfBase64 = Utilities.base64Encode(pdfBlob.getBytes());

    // Prepare the payload for the API request
    // What document classification does:
    // - Analyzes document content to classify and identify document types
    // - Identifies document categories, formats, and characteristics
    // - Provides metadata about document structure and content
    // - Useful for document organization, content analysis, and automated processing
    var payload = {
      docContent: pdfBase64,                        // Base64 encoded PDF document content
      docName: file.getName(),                      // Source PDF file name with .pdf extension
      isAsync: true                                   // Asynchronous processing
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

    // Send the initial document classification request to the API
    Logger.log('Sending document classification request to PDF4me API...');
    Logger.log('Processing document classification: ' + fileName + ' → ' + outputFileName);

    
    
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('Status code: ' + code);
    Logger.log('Response content length: ' + response.getContentText().length);

    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 means "Success" - document classification completed successfully
      Logger.log(' Success! Document classification completed!');
      
      // Parse and save the classification results
      try {
        var classificationData = JSON.parse(response.getContentText());
        
        // Get the output folder by name
        var outputFolders = DriveApp.getFoldersByName(outputFolderName);
        if (!outputFolders.hasNext()) {
          Logger.log('Output folder not found: ' + outputFolderName);
          return;
        }
        var outputFolder = outputFolders.next();
        
        // Create JSON file with classification results
        var jsonBlob = Utilities.newBlob(JSON.stringify(classificationData, null, 2), 'application/json', outputFileName);
        outputFolder.createFile(jsonBlob);
        Logger.log('Classification results saved to: ' + outputFileName);
        Logger.log('Document classification completed successfully!');
        
        // Display basic classification information
        Logger.log('Classification Results:');
        for (var key in classificationData) {
          Logger.log('  ' + key + ': ' + classificationData[key]);
        }
        
      } catch (e) {
        Logger.log('Error processing classification results: ' + e);
        // Save raw response content as fallback
        var rawBlob = Utilities.newBlob(response.getContentText(), 'text/plain', outputFileName + '.txt');
        outputFolder.createFile(rawBlob);
        Logger.log('Raw response saved: ' + outputFileName + '.txt');
      }
      
    } else if (code === 202) {
      // 202 means "Accepted" - API is processing the document classification asynchronously
      Logger.log('202 - Request accepted. Processing asynchronously...');
      
      // Get the polling URL from the Location header
      var headersAll = response.getAllHeaders();
      var locationUrl = headersAll['Location'] || headersAll['location'];
      if (!locationUrl) {
        Logger.log("Error: No polling URL found in response");
        return;
      }

      // Retry logic for polling the result
      var maxRetries = 20;    // Maximum number of polling attempts
      var retryDelay = 15 * 1000; // 15 seconds between each polling attempt

      // Poll the API until document classification is complete
      for (var attempt = 0; attempt < maxRetries; attempt++) {
        Logger.log('Checking status... (Attempt ' + (attempt + 1) + '/' + maxRetries + ')');
        Utilities.sleep(retryDelay);  // Wait before next attempt

        // Check the processing status by calling the polling URL
        var responseClassification = UrlFetchApp.fetch(locationUrl, {
          method: 'get',
          headers: headers,
          muteHttpExceptions: true
        });
        
        var pollCode = responseClassification.getResponseCode();

        if (pollCode === 200) {
          // 200 - Success: Processing completed
          Logger.log(' Success! Document classification completed!');
          
          // Parse and save the classification results
          try {
            var classificationData = JSON.parse(responseClassification.getContentText());
            
            // Get the output folder by name
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (!outputFolders.hasNext()) {
              Logger.log('Output folder not found: ' + outputFolderName);
              return;
            }
            var outputFolder = outputFolders.next();
            
            // Create JSON file with classification results
            var jsonBlob = Utilities.newBlob(JSON.stringify(classificationData, null, 2), 'application/json', outputFileName);
            outputFolder.createFile(jsonBlob);
            Logger.log('Classification results saved to: ' + outputFileName);
            Logger.log('Document classification completed successfully!');
            
            // Display basic classification information
            Logger.log('Classification Results:');
            for (var key in classificationData) {
              Logger.log('  ' + key + ': ' + classificationData[key]);
            }
            
          } catch (e) {
            Logger.log('Error processing classification results: ' + e);
            // Save raw response content as fallback
            var rawBlob = Utilities.newBlob(responseClassification.getContentText(), 'text/plain', outputFileName + '.txt');
            outputFolder.createFile(rawBlob);
            Logger.log('Raw response saved: ' + outputFileName + '.txt');
          }
          return;
          
        } else if (pollCode === 202) {
          // Still processing, continue polling
          Logger.log('Still processing...');
          continue;
        } else {
          // Error occurred during processing
          Logger.log('Error during processing: ' + pollCode + ' - ' + responseClassification.getContentText());
          return;
        }
      }

      // If we reach here, polling timed out
      Logger.log('Timeout: Document classification did not complete after multiple retries');
      
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