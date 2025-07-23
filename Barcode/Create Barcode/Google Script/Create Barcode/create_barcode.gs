function createBarcode() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/CreateBarcode`;
  
  // Set the output file name for the barcode
  var outputFileName = 'Barcode_create_output.png';
  var outputFolderName = 'PDF4ME output'; // <-- Set your output folder name here

  try {
    // Prepare the payload for the API request
    // What barcode creation does:
    // - Text → Visual barcode/QR code (machine-readable format)
    // - Various formats → Code128, QR Code, DataMatrix, Aztec, PDF417, etc.
    // - Customizable → Hide/show text, different sizes and formats
    // - Standalone images → PNG format for versatile usage
    var payload = {
      text: "PDF4me Create Barcode Sample",      // Text to encode in barcode
      barcodeType: "qrCode",                     // Barcode types: qrCode, code128, dataMatrix, aztec, hanXin, pdf417, etc.
      hideText: false,                           // Hide barcode text: true=hide, false=show text alongside barcode
      async: true                                // Enable asynchronous processing
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

    // Send the initial barcode creation request to the API
    Logger.log('Sending request to PDF4Me API...');
    Logger.log('Creating barcode for text: "' + payload.text + '"');
    Logger.log('Barcode type: ' + payload.barcodeType);
    Logger.log('Converting text to machine-readable format...');
    
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('Status code: ' + code);
    Logger.log('Response content length: ' + response.getContentText().length);

    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 means "Success" - barcode creation completed successfully
      Logger.log('Barcode creation completed successfully!');
      
      // Check if response is a binary image file
      var contentType = response.getHeaders()['Content-Type'] || response.getHeaders()['content-type'] || '';
      var responseContent = response.getBlob();
      
      if (contentType.startsWith('image/') || 
          contentType === 'application/octet-stream') {
        
        // Get the output folder by name
        var outputFolders = DriveApp.getFoldersByName(outputFolderName);
        if (!outputFolders.hasNext()) {
          Logger.log('Output folder not found: ' + outputFolderName);
          return;
        }
        var outputFolder = outputFolders.next();
        
        var barcodeBlob = responseContent.setName(outputFileName);
        outputFolder.createFile(barcodeBlob);
        Logger.log('Barcode image saved to: ' + outputFileName);
        Logger.log('Text successfully converted to machine-readable barcode');
        return;
      }
      
      // Try to parse JSON response if it's not a binary image
      try {
        var result = JSON.parse(response.getContentText());
        Logger.log('Successfully parsed JSON response');
        
        // Look for image data in different possible JSON locations
        var imageBase64Response = null;
        if (result.document && result.document.docData) {
          imageBase64Response = result.document.docData;  // Common location 1
        } else if (result.docData) {
          imageBase64Response = result.docData;           // Common location 2
        } else if (result.data) {
          imageBase64Response = result.data;              // Alternative location
        }
        
        if (imageBase64Response) {
          try {
            // Decode base64 image data and save to file
            var imageBytes = Utilities.base64Decode(imageBase64Response);
            var imageBlob = Utilities.newBlob(imageBytes, 'image/png', outputFileName);
            
            // Get the output folder by name
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (!outputFolders.hasNext()) {
              Logger.log('Output folder not found: ' + outputFolderName);
              return;
            }
            var outputFolder = outputFolders.next();
            
            outputFolder.createFile(imageBlob);
            Logger.log('Barcode image saved to: ' + outputFileName);
            Logger.log('Text successfully converted to machine-readable barcode');
          } catch (e) {
            Logger.log('Error saving barcode image: ' + e);
          }
        } else {
          Logger.log('No image data found in the response.');
          Logger.log('Full response: ' + JSON.stringify(result));
        }
        
      } catch (e) {
        Logger.log('Failed to parse JSON response: ' + e);
        Logger.log('Raw response text: ' + response.getContentText().substring(0, 500) + '...');
      }
      
    } else if (code === 202) {
      // 202 means "Accepted" - API is processing the barcode creation asynchronously
      Logger.log('Request accepted. PDF4Me is processing asynchronously...');
      
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

      // Poll the API until barcode creation is complete
      for (var attempt = 0; attempt < maxRetries; attempt++) {
        Logger.log('Waiting for result... (Attempt ' + (attempt + 1) + '/' + maxRetries + ')');
        Utilities.sleep(retryDelay);  // Wait before next attempt

        // Check the barcode creation status by calling the polling URL
        var responseConversion = UrlFetchApp.fetch(locationUrl, {
          method: 'get',
          headers: headers,
          muteHttpExceptions: true
        });
        
        var pollCode = responseConversion.getResponseCode();

        if (pollCode === 200) {
          // Barcode creation completed successfully
          Logger.log('Barcode creation completed successfully!');
          
          // Validate and save the barcode image
          var responseBlob = responseConversion.getBlob();
          if (responseBlob.getBytes().length > 100) { // Basic validation for image file
            var barcodeBlob = responseBlob.setName(outputFileName);
            
            // Get the output folder by name
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (!outputFolders.hasNext()) {
              Logger.log('Output folder not found: ' + outputFolderName);
              return;
            }
            var outputFolder = outputFolders.next();
            
            outputFolder.createFile(barcodeBlob);
            Logger.log('Barcode image saved successfully to: ' + outputFileName);
            Logger.log('Text successfully converted to machine-readable barcode');
          } else {
            Logger.log('Warning: Response doesn\'t appear to be a valid image file');
            Logger.log('Response size: ' + responseBlob.getBytes().length + ' bytes');
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
      Logger.log('Timeout: Barcode creation did not complete after multiple retries.');
      
    } else {
      // All other status codes are errors
      Logger.log('Error: Failed to create barcode. Status code: ' + code);
      Logger.log('Response text: ' + response.getContentText());
      return;
    }
    
  } catch (e) {
    // Log any exceptions that occur during the process
    Logger.log('Exception: ' + e);
  }
}