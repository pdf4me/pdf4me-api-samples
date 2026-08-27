function replaceTextWithImageInWord() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ReplaceTextWithImageInWord`;
  
  // Set the folder and file name for the input Word document
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var fileName = 'sample.docx'; // <-- Set your file name here

  // Set the folder and file name for the input image
  var imageFolderName = 'PDF4ME input'; // <-- Set your image folder name here
  var imageFileName = 'sample.png'; // <-- Set your image file name here

  // Set the output file name for the modified Word document
  var outputFileName = 'sample_with_image.docx';
  var outputFolderName = 'PDF4ME output'; // <-- Set your output folder name here

  // Set the text to replace with image
  var textToReplace = 'REPLACE_ME'; // <-- Set the text you want to replace here

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

    // === Get the image file ===
    var imageFolders = DriveApp.getFoldersByName(imageFolderName);
    if (!imageFolders.hasNext()) {
      Logger.log('Image folder not found: ' + imageFolderName);
      return;
    }
    var imageFolder = imageFolders.next();
    var imageFiles = imageFolder.getFilesByName(imageFileName);
    if (!imageFiles.hasNext()) {
      Logger.log('Image file not found in folder: ' + imageFileName);
      return;
    }
    var imageFile = imageFiles.next();

    // Get the files as blobs (binary data)
    var wordBlob = file.getBlob();
    var imageBlob = imageFile.getBlob();
    Logger.log('Word file name: ' + file.getName());
    Logger.log('Word file size: ' + wordBlob.getBytes().length);
    Logger.log('Image file name: ' + imageFile.getName());
    Logger.log('Image file size: ' + imageBlob.getBytes().length);

    // Encode the files as base64 for API transmission
    var wordBase64 = Utilities.base64Encode(wordBlob.getBytes());
    var imageBase64 = Utilities.base64Encode(imageBlob.getBytes());

    // Prepare the payload for the API request
    var payload = {
        docName: outputFileName,      // Output document name
        docContent: wordBase64,       // Base64 encoded Word document content
        imageContent: imageBase64,    // Base64 encoded image content
        textToReplace: textToReplace, // Text to replace with image
        isAsync: true                   // For big files and too many calls async is recommended to reduce the server load
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

    // Send the Word document to the API for replacing text with image
    Logger.log('Sending replace text with image request...');
    Logger.log('Input Word file: ' + fileName);
    Logger.log('Input image file: ' + imageFileName);
    Logger.log('Text to replace: ' + textToReplace);
    Logger.log('Output Word file: ' + outputFileName);
    Logger.log('Replacing text with image...');
    
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('API response code: ' + code);
    
    // Only log response content if there's an error (not for successful binary data)
    if (code !== 200 && code !== 202) {
      Logger.log('API response: ' + response.getContentText());
    }

    // If processing is synchronous and successful
    if (code === 200) {
      Logger.log('Replace text with image completed successfully!');
      // Read the modified Word document content from the response
      var resultBlob = response.getBlob();
      
      // Get the output folder by name
      var outputFolders = DriveApp.getFoldersByName(outputFolderName);
      if (!outputFolders.hasNext()) {
        Logger.log('Output folder not found: ' + outputFolderName);
        return;
      }
      var outputFolder = outputFolders.next();
      outputFolder.createFile(resultBlob);
      Logger.log('Modified Word document saved to folder: ' + outputFolderName);
      Logger.log('Text has been successfully replaced with image in the Word document');
      return;
    }
    // If processing is asynchronous, poll for the result
    else if (code === 202) {
      Logger.log('Request accepted. Processing asynchronously...');
      // Get the polling URL from the Location header
      var headersAll = response.getAllHeaders();
      var locationUrl = headersAll['Location'] || headersAll['location'];
      if (!locationUrl) {
        Logger.log("No 'Location' header found in the response.");
        return;
      }
      Logger.log('Polling URL: ' + locationUrl);
      // Poll the API until the processing is complete or times out
      var maxRetries = 10;
      var retryDelay = 10 * 1000; // 10 seconds
      for (var i = 0; i < maxRetries; i++) {
        Utilities.sleep(retryDelay);
        // Poll the processing status
        var pollResponse = UrlFetchApp.fetch(locationUrl, {
          method: 'get',
          headers: headers,
          muteHttpExceptions: true
        });
        var pollCode = pollResponse.getResponseCode();
        // If processing is complete, save the modified Word document
        if (pollCode === 200) {
          Logger.log('Replace text with image completed successfully!');
          
          // Read the modified Word document content from the polling response
          var resultBlob = pollResponse.getBlob();

          // Get the output folder by name
          var outputFolders = DriveApp.getFoldersByName(outputFolderName);
          if (!outputFolders.hasNext()) {
            Logger.log('Output folder not found: ' + outputFolderName);
            return;
          }
          var outputFolder = outputFolders.next();
          outputFolder.createFile(resultBlob);
          Logger.log('Modified Word document saved to folder: ' + outputFolderName);
          Logger.log('Text has been successfully replaced with image in the Word document');
          return;
        } 

        // If still processing, continue polling
        else if (pollCode === 202) {
          Logger.log('Still processing, waiting...');
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
      Logger.log('Timeout: Replace text with image did not complete after multiple retries.');
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