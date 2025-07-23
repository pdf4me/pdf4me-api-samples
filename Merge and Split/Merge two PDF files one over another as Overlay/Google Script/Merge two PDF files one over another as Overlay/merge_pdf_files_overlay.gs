function mergeOverlayPdfFiles() {
  // Set your PDF4Me API key
  var apiKey = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys'; 
  
  // Set the PDF4Me API endpoint URL for overlay merging
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/MergeOverlay`;
  
  // Set the folder and file names for the input PDFs
  var folderName = 'PDF4ME input'; // <-- Set your input folder name here
  var basePdfFileName = 'sample1.pdf'; // <-- Set your base PDF file name (first layer)
  var layerPdfFileName = 'sample2.pdf'; // <-- Set your layer PDF file name (second layer)
  
  // Set the output file name for the overlay merged PDF
  var outputFileName = 'Merge_overlay_output.pdf';
  var outputFolderName = 'PDF4ME output'; // <-- Set your output folder name here

  //         ===  Alternative: Set file IDs for input PDFs ===
  // var basePdfFileId = '1A2B3C4D5E6F7G8H9I0J'; // Base PDF file ID
  // var layerPdfFileId = '1K2L3M4N5O6P7Q8R9S0T'; // Layer PDF file ID
  // To get file IDs from Google Drive:
  // 1. Right-click each file in Google Drive and select "Get link".
  // 2. The link will look like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // 3. Copy the long string between '/d/' and '/view' — that's your FILE_ID.
  //          ===  Alternative: Set file IDs for input PDFs ===

  try {
    // === Folder structure file input START ===
    
    var basePdfBase64, layerPdfBase64;
    var totalBytes = 0;

    // Get the input folder by name
    var folders = DriveApp.getFoldersByName(folderName);
    if (!folders.hasNext()) {
      Logger.log('Input folder not found: ' + folderName);
      return;
    }
    var folder = folders.next();

    // Process base PDF file (first layer)
    var baseFiles = folder.getFilesByName(basePdfFileName);
    if (!baseFiles.hasNext()) {
      Logger.log('Base PDF file not found in folder: ' + basePdfFileName);
      return;
    }
    
    var baseFile = baseFiles.next();
    var basePdfBlob = baseFile.getBlob();
    var baseFileSize = basePdfBlob.getBytes().length;
    totalBytes += baseFileSize;
    
    Logger.log('Base PDF file read successfully: ' + basePdfFileName + ' (' + baseFileSize + ' bytes)');
    basePdfBase64 = Utilities.base64Encode(basePdfBlob.getBytes());

    // Process layer PDF file (second layer)
    var layerFiles = folder.getFilesByName(layerPdfFileName);
    if (!layerFiles.hasNext()) {
      Logger.log('Layer PDF file not found in folder: ' + layerPdfFileName);
      return;
    }
    
    var layerFile = layerFiles.next();
    var layerPdfBlob = layerFile.getBlob();
    var layerFileSize = layerPdfBlob.getBytes().length;
    totalBytes += layerFileSize;
    
    Logger.log('Layer PDF file read successfully: ' + layerPdfFileName + ' (' + layerFileSize + ' bytes)');
    layerPdfBase64 = Utilities.base64Encode(layerPdfBlob.getBytes());

    // === Folder structure file input END ===

    // === File ID as input START (Alternative method) ===
    /*
    var basePdfBase64, layerPdfBase64;
    var totalBytes = 0;
    
    // Process base PDF file using file ID
    var baseFile = DriveApp.getFileById(basePdfFileId);
    var basePdfBlob = baseFile.getBlob();
    var baseFileSize = basePdfBlob.getBytes().length;
    totalBytes += baseFileSize;
    
    Logger.log('Base PDF file read successfully: ' + baseFile.getName() + ' (' + baseFileSize + ' bytes)');
    basePdfBase64 = Utilities.base64Encode(basePdfBlob.getBytes());
    
    // Process layer PDF file using file ID
    var layerFile = DriveApp.getFileById(layerPdfFileId);
    var layerPdfBlob = layerFile.getBlob();
    var layerFileSize = layerPdfBlob.getBytes().length;
    totalBytes += layerFileSize;
    
    Logger.log('Layer PDF file read successfully: ' + layerFile.getName() + ' (' + layerFileSize + ' bytes)');
    layerPdfBase64 = Utilities.base64Encode(layerPdfBlob.getBytes());
    */
    // === File ID as input END ===

    Logger.log('Total files processed: 2 (base + layer)');
    Logger.log('Total size: ' + totalBytes + ' bytes');

    // Prepare the payload for the API request
    // What PDF overlay merging does:
    // - Overlays one PDF document on top of another with precision content integration
    // - Combines content from both PDFs where the layer PDF appears over the base PDF
    // - Preserves transparency and blending where applicable
    // - Maintains proper page alignment and document structure
    var payload = {
      baseDocContent: basePdfBase64,           // Base64 encoded base PDF content (first layer)
      baseDocName: basePdfFileName,            // Name of the base PDF file
      layerDocContent: layerPdfBase64,         // Base64 encoded layer PDF content (second layer)
      layerDocName: layerPdfFileName,          // Name of the layer PDF file
      async: true                              // Enable asynchronous processing
    };

    // Set the headers for the API request
    var headers = {
      'Authorization': 'Basic ' + apiKey,      // Authentication using Basic auth with API key
      'Content-Type': 'application/json'       // We're sending JSON data
    };

    // Set the options for the API request
    var options = {
      method: 'post',
      headers: headers,
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    // Send the initial PDF overlay merge request to the API
    Logger.log('Sending PDF overlay merge request to PDF4me API...');
    Logger.log('Merging ' + basePdfFileName + ' (base) with ' + layerPdfFileName + ' (layer) into: ' + outputFileName);
    
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('Response Status Code: ' + code );

    // Log response headers for debugging
    var responseHeaders = response.getAllHeaders();
    Logger.log('Response Headers:');


    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 means "Success" - PDF overlay merging completed immediately
      Logger.log(' Success! PDF overlay merging completed!');
      
      // Get the output folder by name
      var outputFolders = DriveApp.getFoldersByName(outputFolderName);
      if (!outputFolders.hasNext()) {
        Logger.log('Output folder not found: ' + outputFolderName);
        return;
      }
      var outputFolder = outputFolders.next();
      
      // Save the overlay merged PDF
      var overlayMergedPdfBlob = response.getBlob().setName(outputFileName);
      var createdFile = outputFolder.createFile(overlayMergedPdfBlob);
      
      Logger.log('Overlay merged PDF saved: ' + outputFileName);
      Logger.log('File ID: ' + createdFile.getId());
      return;
      
    } else if (code === 202) {
      // 202 means "Accepted" - API is processing the request asynchronously
      Logger.log('202 - Request accepted. Processing asynchronously...');
      
      // Get the polling URL from the Location header for checking status
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

      // Poll the API until PDF overlay merging is complete
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
            Logger.log(' Success! PDF overlay merging completed!');
            
            // Get the output folder by name
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (!outputFolders.hasNext()) {
              Logger.log('Output folder not found: ' + outputFolderName);
              return;
            }
            var outputFolder = outputFolders.next();
            
            // Save the overlay merged PDF
            var overlayMergedPdfBlob = responseConversion.getBlob().setName(outputFileName);
            var createdFile = outputFolder.createFile(overlayMergedPdfBlob);
            
            Logger.log('Overlay merged PDF saved: ' + outputFileName);
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
      // Other status codes - Error
      Logger.log('Error: ' + code + ' - ' + response.getContentText());
      return;
    }
    
  } catch (e) {
    // Log any exceptions that occur during the process
    Logger.log('Exception: ' + e);
  }
}