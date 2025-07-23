function mergePdfFiles() {
  // Set your PDF4Me API key
  var apiKey = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys'; 
  
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/Merge`;
  
  // Set the folder and file names for the input PDFs
  var folderName = 'PDF4ME input'; // <-- Set your input folder name here
  var pdfFileNames = ['sample1.pdf', 'sample2.pdf']; // <-- Set your PDF file names here
  
  // Set the output file name for the merged PDF
  var outputFileName = 'Merged_pdf_output.pdf';
  var outputFolderName = 'PDF4ME output'; // <-- Set your output folder name here

  //         ===  Alternative: Set file IDs for input PDFs ===
  // var pdfFileIds = ['1A2B3C4D5E6F7G8H9I0J', '1K2L3M4N5O6P7Q8R9S0T']; // 
  // To get file IDs from Google Drive:
  // 1. Right-click each file in Google Drive and select "Get link".
  // 2. The link will look like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // 3. Copy the long string between '/d/' and '/view' — that's your FILE_ID.
  //          ===  Alternative: Set file IDs for input PDFs ===

  try {
    // === Folder structure file input START ===
    
    var pdfContentsBase64 = [];
    var totalBytes = 0;

    // Get the input folder by name
    var folders = DriveApp.getFoldersByName(folderName);
    if (!folders.hasNext()) {
      Logger.log('Input folder not found: ' + folderName);
      return;
    }
    var folder = folders.next();

    // Process each PDF file
    for (var i = 0; i < pdfFileNames.length; i++) {
      var fileName = pdfFileNames[i];
      
      // Get the file by name within the folder
      var files = folder.getFilesByName(fileName);
      if (!files.hasNext()) {
        Logger.log('PDF file not found in folder: ' + fileName);
        return;
      }
      
      // Get the first file found
      var file = files.next();
      
      // Get the file as a blob (binary data)
      var pdfBlob = file.getBlob();
      var fileSize = pdfBlob.getBytes().length;
      totalBytes += fileSize;
      
      Logger.log('PDF file read successfully: ' + fileName + ' (' + fileSize + ' bytes)');
      
      // Encode the PDF file as base64 for API transmission
      var pdfBase64 = Utilities.base64Encode(pdfBlob.getBytes());
      pdfContentsBase64.push(pdfBase64);
    }

    // === Folder structure file input END ===

    // === File ID as input START (Alternative method) ===
    /*
    var pdfContentsBase64 = [];
    var totalBytes = 0;
    
    for (var i = 0; i < pdfFileIds.length; i++) {
      var fileId = pdfFileIds[i];
      var file = DriveApp.getFileById(fileId);
      
      var pdfBlob = file.getBlob();
      var fileSize = pdfBlob.getBytes().length;
      totalBytes += fileSize;
      
      Logger.log('PDF file read successfully: ' + file.getName() + ' (' + fileSize + ' bytes)');
      
      var pdfBase64 = Utilities.base64Encode(pdfBlob.getBytes());
      pdfContentsBase64.push(pdfBase64);
    }
    */
    // === File ID as input END ===

    Logger.log('Total files processed: ' + pdfContentsBase64.length);
    Logger.log('Total size: ' + totalBytes + ' bytes');

    // Prepare the payload for the API request
    // What PDF merging does:
    // - Combines multiple PDF documents into a single consolidated document
    // - Preserves the original formatting and content of each PDF
    // - Maintains proper page order and document structure
    // - Supports various PDF versions and formats
    var payload = {
      docContent: pdfContentsBase64,        // Array of base64 encoded PDF contents
      docName: outputFileName,              // Output merged PDF file name
      async: true                           // Enable asynchronous processing
    };

    // Set the headers for the API request
    var headers = {
      'Authorization': 'Basic ' + apiKey,   // Authentication using Basic auth with API key
      'Content-Type': 'application/json'    // We're sending JSON data
    };

    // Set the options for the API request
    var options = {
      method: 'post',
      headers: headers,
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    // Send the initial PDF merge request to the API
    Logger.log('Sending PDF merge request to PDF4me API...');
    Logger.log('Merging ' + pdfFileNames.length + ' PDF files into: ' + outputFileName);
    
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('Status code: ' + code );

    // Log response headers for debugging
    var responseHeaders = response.getAllHeaders();
    Logger.log('Response Headers:');
    

    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 means "Success" - PDF merging completed successfully
      Logger.log(' Success! PDF merging completed!');
      
      // Get the output folder by name
      var outputFolders = DriveApp.getFoldersByName(outputFolderName);
      if (!outputFolders.hasNext()) {
        Logger.log('Output folder not found: ' + outputFolderName);
        return;
      }
      var outputFolder = outputFolders.next();
      
      // Save the merged PDF
      var mergedPdfBlob = response.getBlob().setName(outputFileName);
      var createdFile = outputFolder.createFile(mergedPdfBlob);
      
      Logger.log('Merged PDF saved: ' + outputFileName);
      Logger.log('File ID: ' + createdFile.getId());
      return;
      
    } else if (code === 202) {
      // 202 means "Accepted" - API is processing the merge asynchronously
      Logger.log('202 - Request accepted. PDF4Me is processing asynchronously...');
      
      // Get the polling URL from the Location header
      var headersAll = response.getAllHeaders();
      var locationUrl = headersAll['Location'] || headersAll['location'];
      Logger.log('Location URL: ' + (locationUrl || 'NOT FOUND'));
      
      if (!locationUrl) {
        Logger.log("Error: No polling URL found in response");
        return;
      }

      // Retry logic for polling the result
      var maxRetries = 20;        // Maximum number of polling attempts
      var retryDelay = 10 * 1000; // 10 seconds between each polling attempt

      // Poll the API until PDF merging is complete
      for (var attempt = 0; attempt < maxRetries; attempt++) {
        Logger.log('Checking status... (Attempt ' + (attempt + 1) + '/' + maxRetries + ')');
        Utilities.sleep(retryDelay);  // Wait before next attempt

        // Check the processing status by calling the polling URL
        try {
          var responseConversion = UrlFetchApp.fetch(locationUrl, {
            method: 'get',
            headers: headers,
            muteHttpExceptions: true
          });
          
          var pollCode = responseConversion.getResponseCode();
          Logger.log('Poll response status: ' + pollCode + ' (' + responseConversion.getHeaders()['Status'] + ')');

          if (pollCode === 200) {
            // 200 - Success: Processing completed
            Logger.log(' Success! PDF merging completed!');
            
            // Get the output folder by name
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (!outputFolders.hasNext()) {
              Logger.log('Output folder not found: ' + outputFolderName);
              return;
            }
            var outputFolder = outputFolders.next();
            
            // Save the merged PDF
            var mergedPdfBlob = responseConversion.getBlob().setName(outputFileName);
            var createdFile = outputFolder.createFile(mergedPdfBlob);
            
            Logger.log('Merged PDF saved: ' + outputFileName);
            Logger.log('File ID: ' + createdFile.getId());
            return;
            
          } else if (pollCode === 202) {
            // Still processing, continue polling
            Logger.log('Still processing (202)...');
            continue;
          } else {
            // Error occurred during processing
            Logger.log('Error during processing: ' + pollCode + ' - ' + responseConversion.getContentText());
            return;
          }
        } catch (e) {
          Logger.log('Error polling status: ' + e);
          continue;
        }
      }

      // If we reach here, polling timed out
      Logger.log('Timeout: Processing did not complete after multiple retries');
      
    } else {
      // All other status codes are errors
      Logger.log('Error: ' + code + ' - ' + response.getContentText());
      return;
    }
    
  } catch (e) {
    // Log any exceptions that occur during the process
    Logger.log('Exception: ' + e);
  }
}
