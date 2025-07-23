function readBarcodeFromPdf() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ReadBarcodes`;
  
  // Set the folder and file name for the input PDF
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var fileName = 'Read Barcode Sample.pdf'; // <-- Set your file name here

  //         ===  Set the file ID for the input PDF ===
  // var pdfFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q'; // 
  // To get the file ID from Google Drive:
  // 1. Right-click the file in Google Drive and select "Get link".
  // 2. The link will look like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // 3. Copy the long string between '/d/' and '/view' — that's your FILE_ID.
  // Example: For https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
  //          The file ID is: 1A2B3C4D5E6F7G8H9I0J
  //          ===  Set the file ID for the input PDF ===

  // Set the output file name for the barcode data
  var outputFileName = 'Read_barcode_output.json';
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
             //var file = DriveApp.getFileById(pdfFileId);
    // === File ID as input END ===

    // Get the file as a blob (binary data)
    var pdfBlob = file.getBlob();
    Logger.log('File name: ' + file.getName());
    Logger.log('File size: ' + pdfBlob.getBytes().length);
    Logger.log('PDF file successfully encoded to base64');

    // Encode the PDF file as base64 for API transmission
    var pdfBase64 = Utilities.base64Encode(pdfBlob.getBytes());

    // Prepare the payload for the API request
    // What barcode reading does:
    // - Scans PDF pages for barcodes and QR codes
    // - Recognizes text embedded in barcodes automatically
    // - Supports multiple barcode types (QR Code, Code128, DataMatrix, etc.)
    // - Returns structured data with barcode content and types
    var payload = {
      docContent: pdfBase64,              // Base64 encoded PDF document content
      docName: 'output.pdf',              // Output PDF file name
      barcodeType: ["all"],               // Barcode types: ["all"], ["qrCode"], ["dataMatrix"], ["code128"], etc.
      pages: "all",                       // Page options: "all", "1", "1,3,5", "2-5", "1,3,7-10", "2-"
      async: true                         // Enable asynchronous processing
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

    // Send the initial barcode reading request to the API
    Logger.log('Sending barcode reading request to PDF4me API...');
    Logger.log('Reading barcodes from: ' + fileName);
    Logger.log('Processing pages: ' + payload.pages);
    Logger.log('Barcode types to detect: ' + payload.barcodeType.join(', '));
    
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('Status code: ' + code);
    Logger.log('Response content length: ' + response.getContentText().length);

    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 means "Success" - barcode reading completed successfully
      Logger.log(' Success Barcode reading completed!');
      
      // Parse and save the barcode data
      try {
        var responseText = response.getContentText();
        var barcodeData = null;
        
        // Try to parse JSON response
        if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
          barcodeData = JSON.parse(responseText);
        } else {
          barcodeData = responseText;
        }
        
        // Create formatted JSON string for saving
        var jsonOutput = '';
        if (typeof barcodeData === 'object') {
          jsonOutput = JSON.stringify(barcodeData, null, 2);
        } else {
          jsonOutput = String(barcodeData);
        }
        
        // Get the output folder by name
        var outputFolders = DriveApp.getFoldersByName(outputFolderName);
        if (!outputFolders.hasNext()) {
          Logger.log('Output folder not found: ' + outputFolderName);
          return;
        }
        var outputFolder = outputFolders.next();
        
        // Save the barcode data to JSON file
        var jsonBlob = Utilities.newBlob(jsonOutput, 'application/json', outputFileName);
        outputFolder.createFile(jsonBlob);
        
        Logger.log('Barcode data saved: ' + outputFileName);
        
        // Display found barcodes
        if (typeof barcodeData === 'object' && barcodeData !== null && barcodeData.barcodes) {
          Logger.log('Found ' + barcodeData.barcodes.length + ' barcode(s):');
          for (var i = 0; i < barcodeData.barcodes.length; i++) {
            var barcode = barcodeData.barcodes[i];
            var barcodeType = barcode.type || 'Unknown';
            var barcodeText = barcode.text || 'No text';
            Logger.log('  ' + (i + 1) + '. Type: ' + barcodeType + ', Text: ' + barcodeText);
          }
        } else {
          Logger.log('Barcode data: ' + JSON.stringify(barcodeData));
        }
        
      } catch (e) {
        Logger.log('Error processing barcode data: ' + e);
        
        // Save raw response as fallback
        try {
          var outputFolders = DriveApp.getFoldersByName(outputFolderName);
          if (outputFolders.hasNext()) {
            var outputFolder = outputFolders.next();
            var rawBlob = response.getBlob().setName(outputFileName);
            outputFolder.createFile(rawBlob);
            Logger.log('Raw response saved: ' + outputFileName);
          }
        } catch (saveError) {
          Logger.log('Error saving raw response: ' + saveError);
        }
      }
      return;
      
    } else if (code === 202) {
      // 202 means "Accepted" - API is processing the barcode reading asynchronously
      Logger.log('202 - Request accepted. PDF4Me is processing asynchronously...');
      
      // Get the polling URL from the Location header
      var headersAll = response.getAllHeaders();
      var locationUrl = headersAll['Location'] || headersAll['location'];
      if (!locationUrl) {
        Logger.log("No 'Location' header found in the response.");
        return;
      }

      // Retry logic for polling the result
      var maxRetries = 10;    // Maximum number of polling attempts
      var retryDelay = 10 * 1000; // 10 seconds between each polling attempt

      // Poll the API until barcode reading is complete
      for (var attempt = 0; attempt < maxRetries; attempt++) {
        Logger.log('Checking status... (Attempt ' + (attempt + 1) + '/' + maxRetries + ')');
        Utilities.sleep(retryDelay);  // Wait before next attempt

        // Check the barcode reading status by calling the polling URL
        var responseConversion = UrlFetchApp.fetch(locationUrl, {
          method: 'get',
          headers: headers,
          muteHttpExceptions: true
        });
        
        var pollCode = responseConversion.getResponseCode();

        if (pollCode === 200) {
          // Barcode reading completed successfully
          Logger.log('✓ Success! Barcode reading completed!');
          
          // Parse and save the barcode data
          try {
            var responseText = responseConversion.getContentText();
            var barcodeData = null;
            
            // Try to parse JSON response
            if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
              barcodeData = JSON.parse(responseText);
            } else {
              barcodeData = responseText;
            }
            
            // Create formatted JSON string for saving
            var jsonOutput = '';
            if (typeof barcodeData === 'object') {
              jsonOutput = JSON.stringify(barcodeData, null, 2);
            } else {
              jsonOutput = String(barcodeData);
            }
            
            // Get the output folder by name
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (!outputFolders.hasNext()) {
              Logger.log('Output folder not found: ' + outputFolderName);
              return;
            }
            var outputFolder = outputFolders.next();
            
            // Save the barcode data to JSON file
            var jsonBlob = Utilities.newBlob(jsonOutput, 'application/json', outputFileName);
            outputFolder.createFile(jsonBlob);
            
            Logger.log('Barcode data saved successfully: ' + outputFileName);
            
            // Display found barcodes
            if (typeof barcodeData === 'object' && barcodeData !== null && barcodeData.barcodes) {
              Logger.log('Found ' + barcodeData.barcodes.length + ' barcode(s):');
              for (var i = 0; i < barcodeData.barcodes.length; i++) {
                var barcode = barcodeData.barcodes[i];
                var barcodeType = barcode.type || 'Unknown';
                var barcodeText = barcode.text || 'No text';
                Logger.log('  ' + (i + 1) + '. Type: ' + barcodeType + ', Text: ' + barcodeText);
              }
            } else {
              Logger.log('Barcode data: ' + JSON.stringify(barcodeData));
            }
            
          } catch (e) {
            Logger.log('Error processing barcode data: ' + e);
            
            // Save raw response as fallback
            try {
              var outputFolders = DriveApp.getFoldersByName(outputFolderName);
              if (outputFolders.hasNext()) {
                var outputFolder = outputFolders.next();
                var rawBlob = responseConversion.getBlob().setName(outputFileName);
                outputFolder.createFile(rawBlob);
                Logger.log('Raw response saved: ' + outputFileName);
              }
            } catch (saveError) {
              Logger.log('Error saving raw response: ' + saveError);
            }
          }
          return;
          
        } else if (pollCode === 202) {
          // Still processing, continue polling
          Logger.log('Still processing...');
          continue;
        } else {
          // Error occurred during processing
          Logger.log('Error during polling. Status code: ' + pollCode);
          Logger.log('Response text: ' + responseConversion.getContentText());
          return;
        }
      }

      // If we reach here, polling timed out
      Logger.log('Timeout: Barcode reading did not complete after multiple retries.');
      
    } else {
      // All other status codes are errors
      Logger.log('Error: Failed to read barcodes from PDF. Status code: ' + code);
      Logger.log('Response text: ' + response.getContentText());
      return;
    }
    
  } catch (e) {
    // Log any exceptions that occur during the process
    Logger.log('Exception: ' + e);
  }
}
