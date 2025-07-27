function convertPdfToEditablePdfUsingOcr() {
  // Set your PDF4me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  
  // Set the PDF4me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ConvertOcrPdf`;
  
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

  // Set the output file name for the editable PDF
  var outputFileName = 'editable_PDF_output.pdf';
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
    // What OCR PDF conversion does:
    // - Converts scanned PDFs and image-based PDFs to editable, searchable text
    // - Uses Optical Character Recognition (OCR) technology
    // - Supports multiple languages and quality settings
    // - Useful for digitizing paper documents, scanned forms, and image-based PDFs
    var payload = {
      docContent: pdfBase64,                        // Base64 encoded PDF document content
      docName: file.getName(),                      // Source file name with proper extension
      qualityType: "Draft",                         // Quality type: "Draft" (1 API call) or "High" (2 API calls per page)
      ocrWhenNeeded: "true",                        // OCR Only When Needed: "true" (skip if text exists) or "false" (always OCR)
      language: "English",                          // Language: "English", "Spanish", "French", "German", etc.
      outputFormat: "true",                         // Output Format: "true" (standard output format)
      isAsync: true,                                // Asynchronous processing: true (recommended) or false
      mergeAllSheets: true                          // Merge All Sheets: true (merge sheets) or false (keep separate)
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

    // Send the initial OCR conversion request to the API
    Logger.log('Sending PDF to PDF4me API for OCR conversion...');
    Logger.log('Converting PDF to editable format: ' + fileName + ' → ' + outputFileName);

    
    
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('Status code: ' + code);
    Logger.log('Response content length: ' + response.getContentText().length);

    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 means "Success" - OCR conversion completed successfully
      Logger.log(' Success! PDF converted successfully!');
      
      // Check if response is a binary PDF file
      var contentType = response.getHeaders()['Content-Type'] || response.getHeaders()['content-type'] || '';
      var responseContent = response.getBlob();
      
      if (contentType.startsWith('application/pdf') || 
          contentType === 'application/octet-stream' || 
          response.getContentText().startsWith('%PDF')) {
    
        
        // Get the output folder by name
        var outputFolders = DriveApp.getFoldersByName(outputFolderName);
        if (!outputFolders.hasNext()) {
          Logger.log('Output folder not found: ' + outputFolderName);
          return;
        }
        var outputFolder = outputFolders.next();
        
        var editablePdfBlob = responseContent.setName(outputFileName);
        outputFolder.createFile(editablePdfBlob);
        Logger.log('Editable PDF saved to: ' + outputFileName);
        Logger.log('OCR conversion completed successfully!');
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
            Logger.log('Editable PDF saved to: ' + outputFileName);
            Logger.log('OCR conversion completed successfully!');
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
      // 202 means "Accepted" - API is processing the OCR conversion asynchronously
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
      var retryDelay = 10 * 1000; // 10 seconds between each polling attempt

      // Poll the API until OCR conversion is complete
      for (var attempt = 0; attempt < maxRetries; attempt++) {
        Logger.log('Checking job status... (Attempt ' + (attempt + 1) + '/' + maxRetries + ')');
        Utilities.sleep(retryDelay);  // Wait before next attempt

        // Check the processing status by calling the polling URL
        var responseConversion = UrlFetchApp.fetch(locationUrl, {
          method: 'get',
          headers: headers,
          muteHttpExceptions: true
        });
        
        var pollCode = responseConversion.getResponseCode();

        if (pollCode === 200) {
          // 200 - Success: Processing completed
          Logger.log(' Success! OCR conversion completed!');
          
          // Validate and save the editable PDF
          var responseText = responseConversion.getContentText();
          var responseBlob = responseConversion.getBlob();
          
          // Check if response is direct PDF binary content
          if (responseText.startsWith('%PDF') || responseBlob.getBytes().length > 1000) {
            var editablePdfBlob = responseBlob.setName(outputFileName);
            
            // Get the output folder by name
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (!outputFolders.hasNext()) {
              Logger.log('Output folder not found: ' + outputFolderName);
              return;
            }
            var outputFolder = outputFolders.next();
            
            outputFolder.createFile(editablePdfBlob);
            Logger.log('File saved: ' + outputFileName);
            Logger.log('OCR conversion completed successfully!');
            Logger.log('Your PDF is now editable and searchable!');
          } else {
            // Try to parse as JSON response
            try {
              var pollResult = JSON.parse(responseText);
              if (pollResult.docContent) {
                // Decode base64 content to binary from JSON response
                var decodedContent = Utilities.base64Decode(pollResult.docContent);
                var pdfBlob = Utilities.newBlob(decodedContent, 'application/pdf', outputFileName);
                
                // Get the output folder by name
                var outputFolders = DriveApp.getFoldersByName(outputFolderName);
                if (!outputFolders.hasNext()) {
                  Logger.log('Output folder not found: ' + outputFolderName);
                  return;
                }
                var outputFolder = outputFolders.next();
                
                outputFolder.createFile(pdfBlob);
                Logger.log('File saved: ' + outputFileName);
                Logger.log('OCR conversion completed successfully!');
                Logger.log('Your PDF is now editable and searchable!');
              } else {
                Logger.log('No docContent found in JSON response');
                Logger.log('Response preview: ' + responseText.substring(0, 100) + '...');
              }
            } catch (jsonError) {
              // Try to decode as base64 if it's not JSON
              try {
                var decodedContent = Utilities.base64Decode(responseText);
                var pdfBlob = Utilities.newBlob(decodedContent, 'application/pdf', outputFileName);
                
                // Get the output folder by name
                var outputFolders = DriveApp.getFoldersByName(outputFolderName);
                if (!outputFolders.hasNext()) {
                  Logger.log('Output folder not found: ' + outputFolderName);
                  return;
                }
                var outputFolder = outputFolders.next();
                
                outputFolder.createFile(pdfBlob);
                Logger.log('File saved: ' + outputFileName);
                Logger.log('OCR conversion completed successfully!');
                Logger.log('Your PDF is now editable and searchable!');
              } catch (base64Error) {
                Logger.log('Error decoding response: ' + base64Error);
                Logger.log('Response preview: ' + responseText.substring(0, 100) + '...');
              }
            }
          }
          return;
          
        } else if (pollCode === 202) {
          // Still processing, continue polling
          Logger.log('Still processing...');
          continue;
        } else {
          // Error occurred during processing
          Logger.log('Error during processing: ' + pollCode + ' - ' + responseConversion.getContentText());
          return;
        }
      }

      // If we reach here, polling timed out
      Logger.log('Timeout: Processing did not complete after multiple retries');
      Logger.log('Check your PDF4me dashboard for the completed file');
      
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