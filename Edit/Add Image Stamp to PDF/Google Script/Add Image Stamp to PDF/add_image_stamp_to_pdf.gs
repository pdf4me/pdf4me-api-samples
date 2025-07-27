function addImageStampToPdf() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ImageStamp`;
  
  // Set the folder and file names for the input files
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var pdfFileName = 'sample.pdf'; // <-- Set your PDF file name here
  var imageFileName = 'pdf4me.png'; // <-- Set your image file name here

  //         ===  Set the file ID for the input files ===
  // var pdfFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q'; // 
  // var imageFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q'; // 
  // To get the file ID from Google Drive:
  // 1. Right-click the file in Google Drive and select "Get link".
  // 2. The link will look like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // 3. Copy the long string between '/d/' and '/view' — that's your FILE_ID.
  // Example: For https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
  //          The file ID is: 1A2B3C4D5E6F7G8H9I0J
  //          ===  Set the file ID for the input files ===

  // Set the output file name for the PDF with image stamp
  var outputFileName = 'Add_image_stamp_to_PDF_output.pdf';
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
    
    // Get the PDF file by name within the folder
    var pdfFiles = folder.getFilesByName(pdfFileName);
    if (!pdfFiles.hasNext()) {
      Logger.log('PDF file not found in folder: ' + pdfFileName);
      return;
    }
    // Get the first PDF file found
    var pdfFile = pdfFiles.next();

    // Get the image file by name within the folder
    var imageFiles = folder.getFilesByName(imageFileName);
    if (!imageFiles.hasNext()) {
      Logger.log('Image file not found in folder: ' + imageFileName);
      return;
    }
    // Get the first image file found
    var imageFile = imageFiles.next();

    // === Folder structure file input END ===

    // === File ID as input START ===
    // var pdfFile = DriveApp.getFileById(pdfFileId);
    // var imageFile = DriveApp.getFileById(imageFileId);
    // === File ID as input END ===

    // Get the files as blobs (binary data)
    var pdfBlob = pdfFile.getBlob();
    var imageBlob = imageFile.getBlob();
    
    Logger.log('PDF file name: ' + pdfFile.getName());
    Logger.log('PDF file size: ' + pdfBlob.getBytes().length);
    Logger.log('Image file name: ' + imageFile.getName());
    Logger.log('Image file size: ' + imageBlob.getBytes().length);
    Logger.log('Files successfully encoded to base64');

    // Encode the files as base64 for API transmission
    var pdfBase64 = Utilities.base64Encode(pdfBlob.getBytes());
    var imageBase64 = Utilities.base64Encode(imageBlob.getBytes());

    // Prepare the payload for the API request
    // What image stamp addition does:
    // - Adds image watermarks/stamps to PDF documents
    // - Supports various image formats: PNG, JPG, JPEG, GIF, BMP
    // - Allows precise positioning, sizing, and opacity control
    // - Can add stamps to specific pages or all pages
    // - Supports background/foreground placement
    var payload = {
      docContent: pdfBase64,                    // Base64 encoded PDF document content
      docName: 'output.pdf',                    // Output PDF file name
      alignX: 'Center',                         // Horizontal alignment: "Left", "Center", "Right"
      alignY: 'Middle',                         // Vertical alignment: "Top", "Middle", "Bottom"
      imageFile: imageBase64,                   // Base64 encoded image content
      imageName: imageFile.getName(),           // Image file name with extension
      pages: "",                                // Page options: "", "1", "1,3,5", "2-5", "1,3,7-10", "2-"
      heightInMM: "30",                         // Image height in millimeters (10-200)
      widthInMM: "30",                          // Image width in millimeters (10-200)
      heightInPx: "85",                         // Image height in pixels (20-600)
      widthInPx: "85",                          // Image width in pixels (20-600)
      marginXInMM: "10",                        // Horizontal margin in millimeters (0-100)
      marginYInMM: "10",                        // Vertical margin in millimeters (0-100)
      marginXInPx: "28",                        // Horizontal margin in pixels (0-300)
      marginYInPx: "28",                        // Vertical margin in pixels (0-300)
      opacity: 50,                              // Opacity (0-100): 0=invisible, 100=fully opaque
      isBackground: true,                       // Place stamp in background/foreground (true/false)
      showOnlyInPrint: false,                   // Show in view and print (true/false)
      async: true                               // Enable asynchronous processing
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

    // Send the initial image stamp addition request to the API
    Logger.log('Sending image stamp request to PDF4Me API...');
    Logger.log('Adding image stamp to: ' + pdfFileName + ' → ' + outputFileName);

    
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('Status code: ' + code);
    Logger.log('Response content length: ' + response.getContentText().length);

    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 means "Success" - image stamp addition completed successfully
      Logger.log(' Success! Image stamp addition completed!');
      
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
        
        var imageStampPdfBlob = responseContent.setName(outputFileName);
        outputFolder.createFile(imageStampPdfBlob);
        Logger.log('PDF with image stamp saved to: ' + outputFileName);
        Logger.log('Image stamp successfully added to PDF');
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
            Logger.log('PDF with image stamp saved to: ' + outputFileName);
            Logger.log('Image stamp successfully added to PDF');
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
      // 202 means "Accepted" - API is processing the image stamp addition asynchronously
      Logger.log('202 - Request accepted. Processing asynchronously...');
      
      // Get the polling URL from the Location header
      var headersAll = response.getAllHeaders();
      var locationUrl = headersAll['Location'] || headersAll['location'];
      if (!locationUrl) {
        Logger.log("Error: No polling URL found in response");
        return;
      }

      // Retry logic for polling the result
      var maxRetries = 10;    // Maximum number of polling attempts
      var retryDelay = 10 * 1000; // 10 seconds between each polling attempt

      // Poll the API until image stamp addition is complete
      for (var attempt = 0; attempt < maxRetries; attempt++) {
        Logger.log('Checking status... (Attempt ' + (attempt + 1) + '/' + maxRetries + ')');
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
          Logger.log(' Success! Image stamp addition completed!');
          
          // Validate and save the PDF with image stamp
          var responseText = responseConversion.getContentText();
          if (responseText.startsWith('%PDF') || responseConversion.getBlob().getBytes().length > 1000) {
            var imageStampPdfBlob = responseConversion.getBlob().setName(outputFileName);
            
            // Get the output folder by name
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (!outputFolders.hasNext()) {
              Logger.log('Output folder not found: ' + outputFolderName);
              return;
            }
            var outputFolder = outputFolders.next();
            
            outputFolder.createFile(imageStampPdfBlob);
            Logger.log('File saved: ' + outputFileName);
            Logger.log('Image stamp successfully added to PDF');
          } else {
            Logger.log('Warning: Response doesn\'t appear to be a valid PDF');
            Logger.log('First 100 characters: ' + responseText.substring(0, 100));
          }
          return;
          
        } else if (pollCode === 202) {
          // Still processing, continue polling
          continue;
        } else {
          // Error occurred during processing
          Logger.log('Error during processing: ' + pollCode + ' - ' + responseConversion.getContentText());
          return;
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