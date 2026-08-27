function readBarcodeFromImage() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ReadBarcodeFromImage`;
  
  // Set the folder and file name for the input image
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var fileName = 'sample.jpg'; // <-- Set your image file name here

  // Set the output file name for the barcode data
  var outputFileName = 'barcode_data.txt';
  var outputFolderName = 'PDF4ME output'; // <-- Set your output folder name here

  // Barcode reading configuration
  var barcodeType = 'all'; // 'all', 'qr', 'code128', 'code39', 'ean13', etc.

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

    // Get the file as a blob (binary data)
    var imageBlob = file.getBlob();
    Logger.log('Image file name: ' + file.getName());
    Logger.log('Image file size: ' + imageBlob.getBytes().length);

    // Encode the file as base64 for API transmission
    var imageBase64 = Utilities.base64Encode(imageBlob.getBytes());

    // Prepare the payload for the API request
    var payload = {
        imageContent: imageBase64,        // Base64 encoded image content
        barcodeType: barcodeType,         // Barcode type to detect
        isAsync: true                       // For big files and too many calls async is recommended to reduce the server load
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

    // Send the image to the API for barcode reading
    Logger.log('Sending read barcode from image request...');
    Logger.log('Input image file: ' + fileName);
    Logger.log('Barcode type: ' + barcodeType);
    Logger.log('Output data file: ' + outputFileName);
    Logger.log('Reading barcode from image...');
    
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('API response code: ' + code);
    
    // Only log response content if there's an error (not for successful binary data)
    if (code !== 200 && code !== 202) {
      Logger.log('API response: ' + response.getContentText());
    }

    // If processing is synchronous and successful
    if (code === 200) {
      Logger.log('Barcode reading completed successfully!');
      // Read the barcode data from the response
      var responseText = response.getContentText();
      var responseData = JSON.parse(responseText);
      var barcodeData = responseData.barcodeData;
      
      // Get the output folder by name
      var outputFolders = DriveApp.getFoldersByName(outputFolderName);
      if (!outputFolders.hasNext()) {
        Logger.log('Output folder not found: ' + outputFolderName);
        return;
      }
      var outputFolder = outputFolders.next();
      
      // Save the barcode data to a file
      var textBlob = Utilities.newBlob(JSON.stringify(barcodeData, null, 2), 'text/plain', outputFileName);
      outputFolder.createFile(textBlob);
      Logger.log('Barcode data saved to folder: ' + outputFolderName);
      
      // Log barcode information
      if (barcodeData && barcodeData.length > 0) {
        Logger.log('Found ' + barcodeData.length + ' barcode(s):');
        for (var i = 0; i < barcodeData.length; i++) {
          var barcode = barcodeData[i];
          Logger.log('Barcode ' + (i + 1) + ':');
          Logger.log('  Type: ' + barcode.type);
          Logger.log('  Value: ' + barcode.value);
          if (barcode.confidence) {
            Logger.log('  Confidence: ' + barcode.confidence);
          }
        }
      } else {
        Logger.log('No barcodes found in the image');
      }
      
      Logger.log('Barcode has been successfully read from the image');
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
        // If processing is complete, save the barcode data
        if (pollCode === 200) {
          Logger.log('Barcode reading completed successfully!');
          
          // Read the barcode data from the polling response
          var responseText = pollResponse.getContentText();
          var responseData = JSON.parse(responseText);
          var barcodeData = responseData.barcodeData;

          // Get the output folder by name
          var outputFolders = DriveApp.getFoldersByName(outputFolderName);
          if (!outputFolders.hasNext()) {
            Logger.log('Output folder not found: ' + outputFolderName);
            return;
          }
          var outputFolder = outputFolders.next();
          
          // Save the barcode data to a file
          var textBlob = Utilities.newBlob(JSON.stringify(barcodeData, null, 2), 'text/plain', outputFileName);
          outputFolder.createFile(textBlob);
          Logger.log('Barcode data saved to folder: ' + outputFolderName);
          
          // Log barcode information
          if (barcodeData && barcodeData.length > 0) {
            Logger.log('Found ' + barcodeData.length + ' barcode(s):');
            for (var i = 0; i < barcodeData.length; i++) {
              var barcode = barcodeData[i];
              Logger.log('Barcode ' + (i + 1) + ':');
              Logger.log('  Type: ' + barcode.type);
              Logger.log('  Value: ' + barcode.value);
              if (barcode.confidence) {
                Logger.log('  Confidence: ' + barcode.confidence);
              }
            }
          } else {
            Logger.log('No barcodes found in the image');
          }
          
          Logger.log('Barcode has been successfully read from the image');
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
      Logger.log('Timeout: Barcode reading did not complete after multiple retries.');
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