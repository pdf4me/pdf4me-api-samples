function linearizePdf() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/LinearizePdf`;
  
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

  // Set the output file name for the linearized PDF
  var outputFileName = 'Linearize_PDF_output.pdf';
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
    // This payload configures the linearization and optimization settings
    // Available optimization profiles:
    // - "web": Optimized for web viewing (fast loading, progressive display)
    // - "Max": Maximum compression (smallest file size, slower processing)
    // - "Print": Optimized for printing (correct fonts, colors, resolution)
    // - "Default": Standard optimization balance
    // - "WebMax": Maximum web optimization (best for online viewing)
    // - "PrintMax": Maximum print optimization (best quality for printing)
    // - "PrintGray": Print optimized with grayscale conversion
    // - "Compress": General compression without specific optimization
    // - "CompressMax": Maximum compression with aggressive size reduction
    var payload = {
      docContent: pdfBase64,        // Base64 encoded PDF document content
      docName: 'output.pdf',        // Name for the output file
      optimizeProfile: 'web',       // Optimization: web/Max/Print/Default/WebMax/PrintMax/PrintGray/Compress/CompressMax
      async: true                   // Enable asynchronous processing
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

    // Send the initial linearization request to the API
    Logger.log('Sending request to PDF4Me API...');
    Logger.log('Linearizing: ' + fileName + ' → ' + outputFileName);
    Logger.log('Optimization profile: ' + payload.optimizeProfile);
    Logger.log('Optimizing PDF for web viewing and faster loading...');
    
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('Status code: ' + code);
    Logger.log('Response content length: ' + response.getContentText().length);

    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 means "Success" - linearization completed successfully
      Logger.log('PDF linearization completed successfully!');
      
      // Check if response is a binary PDF file
      var contentType = response.getHeaders()['Content-Type'] || response.getHeaders()['content-type'] || '';
      var responseContent = response.getBlob();
      
      if (contentType.startsWith('application/pdf') || 
          contentType === 'application/octet-stream' || 
          response.getContentText().startsWith('%PDF')) {
        Logger.log('Response is a direct PDF file');
        
        // Get the output folder by name
        var outputFolders = DriveApp.getFoldersByName(outputFolderName);
        if (!outputFolders.hasNext()) {
          Logger.log('Output folder not found: ' + outputFolderName);
          return;
        }
        var outputFolder = outputFolders.next();
        
        var linearizedBlob = responseContent.setName(outputFileName);
        outputFolder.createFile(linearizedBlob);
        Logger.log('Linearized PDF saved to: ' + outputFileName);
        Logger.log('PDF is now optimized for web viewing and faster loading');
        return;
      }
      
      // Try to parse JSON response if it's not a binary PDF
      try {
        var result = JSON.parse(response.getContentText());
        Logger.log('Successfully parsed JSON response');
        
        // Look for PDF data in different possible JSON locations
        var pdfBase64Response = null;
        if (result.document && result.document.docData) {
          pdfBase64Response = result.document.docData;  // Common location 1
        } else if (result.docData) {
          pdfBase64Response = result.docData;           // Common location 2
        } else if (result.data) {
          pdfBase64Response = result.data;              // Alternative location
        }
        
        if (pdfBase64Response) {
          try {
            // Decode base64 PDF data and save to file
            var pdfBytes = Utilities.base64Decode(pdfBase64Response);
            var pdfBlob = Utilities.newBlob(pdfBytes, 'application/pdf', outputFileName);
            
            // Get the output folder by name
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (!outputFolders.hasNext()) {
              Logger.log('Output folder not found: ' + outputFolderName);
              return;
            }
            var outputFolder = outputFolders.next();
            
            outputFolder.createFile(pdfBlob);
            Logger.log('Linearized PDF saved to: ' + outputFileName);
            Logger.log('PDF is now optimized for web viewing and faster loading');
          } catch (e) {
            Logger.log('Error saving PDF: ' + e);
          }
        } else {
          Logger.log('No PDF data found in the response.');
          Logger.log('Full response: ' + JSON.stringify(result));
        }
        
      } catch (e) {
        Logger.log('Failed to parse JSON response: ' + e);
        Logger.log('Raw response text: ' + response.getContentText().substring(0, 500) + '...');
      }
      
    } else if (code === 202) {
      // 202 means "Accepted" - API is processing the linearization asynchronously
      Logger.log('Request accepted. PDF4Me is processing asynchronously...');
      
      // Get the polling URL from the Location header for checking status
      var headersAll = response.getAllHeaders();
      var locationUrl = headersAll['Location'] || headersAll['location'];
      if (!locationUrl) {
        Logger.log("No 'Location' header found in the response.");
        return;
      }

      // Retry logic for polling the result
      var maxRetries = 10;    // Maximum number of polling attempts
      var retryDelay = 10 * 1000; // 10 seconds between each polling attempt

      // Poll the API until linearization is complete
      for (var attempt = 0; attempt < maxRetries; attempt++) {
        Logger.log('Waiting for result... (Attempt ' + (attempt + 1) + '/' + maxRetries + ')');
        Utilities.sleep(retryDelay);  // Wait before next attempt

        // Check the linearization status by calling the polling URL
        var responseConversion = UrlFetchApp.fetch(locationUrl, {
          method: 'get',
          headers: headers,
          muteHttpExceptions: true
        });
        
        var pollCode = responseConversion.getResponseCode();

        if (pollCode === 200) {
          // Linearization completed successfully
          Logger.log('PDF linearization completed successfully!');
          
          // Validate and save the linearized PDF
          var responseText = responseConversion.getContentText();
          if (responseText.startsWith('%PDF') || responseConversion.getBlob().getBytes().length > 1000) {
            var linearizedBlob = responseConversion.getBlob().setName(outputFileName);
            
            // Get the output folder by name
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (!outputFolders.hasNext()) {
              Logger.log('Output folder not found: ' + outputFolderName);
              return;
            }
            var outputFolder = outputFolders.next();
            
            outputFolder.createFile(linearizedBlob);
            Logger.log('Linearized PDF saved successfully to: ' + outputFileName);
            Logger.log('PDF is now optimized for web viewing and faster loading');
          } else {
            Logger.log('Warning: Response doesn\'t appear to be a valid PDF');
            Logger.log('First 100 characters: ' + responseText.substring(0, 100));
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
      Logger.log('Timeout: PDF linearization did not complete after multiple retries.');
      
    } else {
      // All other status codes are errors
      Logger.log('Error: Failed to linearize PDF. Status code: ' + code);
      Logger.log('Response text: ' + response.getContentText());
      return;
    }
    
  } catch (e) {
    // Log any exceptions that occur during the process
    Logger.log('Exception: ' + e);
  }
}