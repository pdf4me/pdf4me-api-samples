function readSwissQrCode() {
  // Set your PDF4me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  
  // Set the PDF4me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ReadSwissQrBill`;
  
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

  // Set the output folder name for Swiss QR code data
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
    // What reading Swiss QR codes does:
    // - Reads Swiss QR codes from PDF documents containing Swiss QR bills
    // - Extracts structured data from Swiss QR code format
    // - Provides payment information, recipient details, and bill data
    // - Useful for payment processing, invoice analysis, and financial document handling
    var payload = {
      docContent: pdfBase64,                        // Base64 encoded PDF document content
      docName: file.getName(),                      // Name of the input PDF file
      async: true                                   // Asynchronous processing (recommended for large files)
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

    // Send the initial Swiss QR code reading request to the API
    Logger.log('Sending Swiss QR code reading request to PDF4me API...');
    Logger.log('Processing Swiss QR code reading: ' + fileName);

    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('Status code: ' + code);
    Logger.log('Response content length: ' + response.getContentText().length);

    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 means "Success" - Swiss QR code reading completed successfully
      Logger.log('Success! Swiss QR code reading completed!');
      
      // Save the Swiss QR code data
      try {
        // Parse the JSON response containing Swiss QR code data
        var swissQrData = JSON.parse(response.getContentText());
        
        // Process and save Swiss QR code data
        processSwissQrData(swissQrData, outputFolderName, file.getName());
        
      } catch (e) {
        Logger.log('Error processing Swiss QR code data: ' + e);
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
      // 202 means "Accepted" - API is processing the Swiss QR code reading asynchronously
      Logger.log('202 - Request accepted. Processing asynchronously...');
      
      // Get the polling URL from the Location header
      var headersAll = response.getAllHeaders();
      var locationUrl = headersAll['Location'] || headersAll['location'];
      if (!locationUrl) {
        Logger.log("Error: No polling URL found in response");
        return;
      }

      // Retry logic for polling the result
      var maxRetries = 20;    // Maximum number of polling attempts (increased for Swiss QR processing)
      var retryDelay = 10 * 1000; // 10 seconds between each polling attempt

      // Poll the API until Swiss QR code reading is complete
      for (var attempt = 0; attempt < maxRetries; attempt++) {
        Logger.log('Checking status... (Attempt ' + (attempt + 1) + '/' + maxRetries + ')');
        Utilities.sleep(retryDelay);  // Wait before next attempt

        // Check the processing status by calling the polling URL
        var responseExtraction = UrlFetchApp.fetch(locationUrl, {
          method: 'get',
          headers: headers,
          muteHttpExceptions: true
        });
        
        var pollCode = responseExtraction.getResponseCode();

        if (pollCode === 200) {
          // 200 - Success: Processing completed
          Logger.log('Success! Swiss QR code reading completed!');
          
          // Save the Swiss QR code data
          try {
            // Parse the JSON response containing Swiss QR code data
            var swissQrData = JSON.parse(responseExtraction.getContentText());
            
            // Process and save Swiss QR code data
            processSwissQrData(swissQrData, outputFolderName, file.getName());
            
          } catch (e) {
            Logger.log('Error processing Swiss QR code data: ' + e);
            // Save raw response content as fallback
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (outputFolders.hasNext()) {
              var outputFolder = outputFolders.next();
              var rawBlob = Utilities.newBlob(responseExtraction.getContentText(), 'text/plain', 'raw_response.txt');
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
          Logger.log('Error during processing: ' + pollCode + ' - ' + responseExtraction.getContentText());
          return;
        }
      }

      // If we reach here, polling timed out
      Logger.log('Timeout: Swiss QR code reading did not complete after multiple retries');
      
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

function processSwissQrData(swissQrData, outputFolderName, fileName) {
  // Process and save Swiss QR code data in JSON format
  try {
    var outputFolders = DriveApp.getFoldersByName(outputFolderName);
    if (!outputFolders.hasNext()) {
      Logger.log('Output folder not found: ' + outputFolderName);
      return;
    }
    var outputFolder = outputFolders.next();
    
    // Save complete Swiss QR code data as JSON
    var jsonContent = JSON.stringify(swissQrData, null, 2);
    var jsonBlob = Utilities.newBlob(jsonContent, 'application/json', 'read_swissqr_code_output.json');
    outputFolder.createFile(jsonBlob);
    Logger.log('Swiss QR code data saved: read_swissqr_code_output.json');
    
    // Display Swiss QR code data summary
    if (typeof swissQrData === 'object') {
      Logger.log('Swiss QR Code Data:');
      
      // Check for common Swiss QR code fields
      var qrFields = ['qrCode', 'swissQrCode', 'billData', 'paymentData', 'recipient', 'amount', 'currency', 'reference'];
      var foundFields = [];
      
      for (var i = 0; i < qrFields.length; i++) {
        var field = qrFields[i];
        if (swissQrData[field]) {
          foundFields.push(field);
          Logger.log('  ' + field + ': ' + swissQrData[field]);
        }
      }
      
      if (foundFields.length === 0) {
        // Display top-level data if no specific Swiss QR fields found
        var keys = Object.keys(swissQrData);
        var maxKeys = Math.min(keys.length, 5);
        for (var i = 0; i < maxKeys; i++) {
          var key = keys[i];
          var value = swissQrData[key];
          Logger.log('  ' + key + ': ' + value);
        }
        
        if (keys.length > 5) {
          Logger.log('  ... and ' + (keys.length - 5) + ' more fields');
        }
      }
      
      // Log summary information
      if (foundFields.length > 0) {
        Logger.log('Swiss QR Code Fields Found: ' + foundFields.join(', '));
      } else {
        Logger.log('Available data fields: ' + Object.keys(swissQrData).join(', '));
      }
      
    } else {
      Logger.log('No Swiss QR code data found in the PDF');
      
      // Log info message
      Logger.log('No Swiss QR code data was found in the PDF document.');
    }
    
  } catch (e) {
    Logger.log('Error processing Swiss QR code data: ' + e);
    
    // Create error file
    var errorContent = 'Swiss QR Code Reading Error\n' +
                      '===========================\n' +
                      'Error occurred on: ' + new Date().toString() + '\n\n' +
                      'Error details: ' + e + '\n';
    
    var errorBlob = Utilities.newBlob(errorContent, 'text/plain', 'reading_error.txt');
    var outputFolders = DriveApp.getFoldersByName(outputFolderName);
    if (outputFolders.hasNext()) {
      var outputFolder = outputFolders.next();
      outputFolder.createFile(errorBlob);
      Logger.log('Error info saved: reading_error.txt');
    }
  }
}
