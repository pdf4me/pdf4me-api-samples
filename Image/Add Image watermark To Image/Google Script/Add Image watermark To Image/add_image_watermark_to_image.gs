function addImageWatermarkToImage() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/AddImageWatermarkToImage`;
  
  // Set the folder and file name for the input image
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var fileName = 'sample.jpg'; // <-- Set your image file name here

  // Set the folder and file name for the watermark image
  var watermarkFolderName = 'PDF4ME input'; // <-- Set your watermark folder name here
  var watermarkFileName = 'watermark.png'; // <-- Set your watermark file name here

  // Set the output file name for the watermarked image
  var outputFileName = 'sample_watermarked.jpg';
  var outputFolderName = 'PDF4ME output'; // <-- Set your output folder name here

  // Watermark positioning options
  var position = 'center'; // Options: top-left, top-center, top-right, center-left, center, center-right, bottom-left, bottom-center, bottom-right
  var opacity = 0.5; // Opacity value between 0 and 1
  var scale = 1.0; // Scale factor for watermark size

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

    // === Get the watermark image file ===
    var watermarkFolders = DriveApp.getFoldersByName(watermarkFolderName);
    if (!watermarkFolders.hasNext()) {
      Logger.log('Watermark folder not found: ' + watermarkFolderName);
      return;
    }
    var watermarkFolder = watermarkFolders.next();
    var watermarkFiles = watermarkFolder.getFilesByName(watermarkFileName);
    if (!watermarkFiles.hasNext()) {
      Logger.log('Watermark file not found in folder: ' + watermarkFileName);
      return;
    }
    var watermarkFile = watermarkFiles.next();

    // Get the files as blobs (binary data)
    var imageBlob = file.getBlob();
    var watermarkBlob = watermarkFile.getBlob();
    Logger.log('Image file name: ' + file.getName());
    Logger.log('Image file size: ' + imageBlob.getBytes().length);
    Logger.log('Watermark file name: ' + watermarkFile.getName());
    Logger.log('Watermark file size: ' + watermarkBlob.getBytes().length);

    // Encode the files as base64 for API transmission
    var imageBase64 = Utilities.base64Encode(imageBlob.getBytes());
    var watermarkBase64 = Utilities.base64Encode(watermarkBlob.getBytes());

    // Prepare the payload for the API request
    var payload = {
        imageName: outputFileName,        // Output image name
        imageContent: imageBase64,        // Base64 encoded image content
        watermarkContent: watermarkBase64, // Base64 encoded watermark content
        position: position,               // Watermark position
        opacity: opacity,                 // Watermark opacity
        scale: scale,                     // Watermark scale
        async: true                       // For big files and too many calls async is recommended to reduce the server load
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

    // Send the image to the API for adding watermark
    Logger.log('Sending add image watermark request...');
    Logger.log('Input image file: ' + fileName);
    Logger.log('Watermark file: ' + watermarkFileName);
    Logger.log('Position: ' + position);
    Logger.log('Opacity: ' + opacity);
    Logger.log('Scale: ' + scale);
    Logger.log('Output image file: ' + outputFileName);
    Logger.log('Adding image watermark...');
    
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('API response code: ' + code);
    
    // Only log response content if there's an error (not for successful binary data)
    if (code !== 200 && code !== 202) {
      Logger.log('API response: ' + response.getContentText());
    }

    // If processing is synchronous and successful
    if (code === 200) {
      Logger.log('Add image watermark completed successfully!');
      // Read the watermarked image content from the response
      var resultBlob = response.getBlob();
      
      // Get the output folder by name
      var outputFolders = DriveApp.getFoldersByName(outputFolderName);
      if (!outputFolders.hasNext()) {
        Logger.log('Output folder not found: ' + outputFolderName);
        return;
      }
      var outputFolder = outputFolders.next();
      outputFolder.createFile(resultBlob);
      Logger.log('Watermarked image saved to folder: ' + outputFolderName);
      Logger.log('Image watermark has been successfully added to the image');
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
        // If processing is complete, save the watermarked image
        if (pollCode === 200) {
          Logger.log('Add image watermark completed successfully!');
          
          // Read the watermarked image content from the polling response
          var resultBlob = pollResponse.getBlob();

          // Get the output folder by name
          var outputFolders = DriveApp.getFoldersByName(outputFolderName);
          if (!outputFolders.hasNext()) {
            Logger.log('Output folder not found: ' + outputFolderName);
            return;
          }
          var outputFolder = outputFolders.next();
          outputFolder.createFile(resultBlob);
          Logger.log('Watermarked image saved to folder: ' + outputFolderName);
          Logger.log('Image watermark has been successfully added to the image');
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
      Logger.log('Timeout: Add image watermark did not complete after multiple retries.');
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