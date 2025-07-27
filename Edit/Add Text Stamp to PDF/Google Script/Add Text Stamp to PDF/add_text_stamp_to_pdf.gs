function addTextStampToPdf() {
  // Set your PDF4me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  
  // Set the PDF4me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/Stamp`;
  
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

  // Set the output file name for the PDF with text stamp
  var outputFileName = 'Add_text_stamp_to_PDF_output.pdf';
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
    // What text stamp addition does:
    // - Adds customizable text watermarks to PDF documents
    // - Supports various text formatting and positioning options
    // - Allows precise control over opacity, rotation, and placement
    // - Useful for authorization, piracy prevention, and document branding
    var payload = {
      docContent: pdfBase64,                        // Base64 encoded PDF document content
      docName: 'output.pdf',                        // Output PDF file name
      pages: "all",                                 // Page options: "all", "1", "1,3,5", "2-5", "1,3,7-10", "2-"
      text: "CONFIDENTIAL - PDF4me Watermark",      // Text to be stamped as watermark
      alignX: "center",                             // Horizontal alignment: "left", "center", "right"
      alignY: "middle",                             // Vertical alignment: "top", "middle", "bottom"
      marginXInMM: "50",                            // Horizontal margin from left edge in millimeters
      marginYInMM: "50",                            // Vertical margin from top edge in millimeters
      marginXInPx: "150",                           // Horizontal margin from left edge in pixels
      marginYInPx: "150",                           // Vertical margin from top edge in pixels
      opacity: "30",                                // Opacity (0-100): 0=invisible, 100=fully opaque
      fontName: "Arial",                            // Font options: "Arial", "Times New Roman", "Helvetica", "Courier New"
      fontSize: 24,                                 // Font size (8-72)
      fontColor: "#FF0000",                         // Font color in hex: #000000 (black), #FF0000 (red), #0000FF (blue), #808080 (gray)
      isBold: true,                                 // Make text bold (true/false)
      isItalics: false,                             // Make text italic (true/false)
      underline: false,                             // Underline the text (true/false)
      rotate: 45,                                   // Rotation angle: 0 (horizontal), 45 (diagonal), 90 (vertical), -45 (reverse diagonal)
      isBackground: true,                           // Place stamp in background/foreground (true/false)
      showOnlyInPrint: false,                       // Show stamp in view and print (true/false)
      transverse: false,                            // Transverse positioning (true/false)
      fitTextOverPage: false,                       // Fit text over entire page (true/false)
      async: true                                   // Enable asynchronous processing
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

    // Send the initial text stamp request to the API
    Logger.log('Sending text stamp request to PDF4me API...');
    Logger.log('Adding text stamp to: ' + fileName + ' → ' + outputFileName);

    
    
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('Status code: ' + code);
    Logger.log('Response content length: ' + response.getContentText().length);

    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 means "Success" - text stamp addition completed successfully
      Logger.log(' Success! Text stamp addition completed!');
      
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
        
        var textStampPdfBlob = responseContent.setName(outputFileName);
        outputFolder.createFile(textStampPdfBlob);
        Logger.log('PDF with text stamp saved to: ' + outputFileName);
        Logger.log('Text stamp successfully added to PDF');
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
            Logger.log('PDF with text stamp saved to: ' + outputFileName);
            Logger.log('Text stamp successfully added to PDF');
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
      // 202 means "Accepted" - API is processing the text stamp addition asynchronously
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

      // Poll the API until text stamp addition is complete
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
          Logger.log(' Success! Text stamp addition completed!');
          
          // Validate and save the PDF with text stamp
          var responseText = responseConversion.getContentText();
          if (responseText.startsWith('%PDF') || responseConversion.getBlob().getBytes().length > 1000) {
            var textStampPdfBlob = responseConversion.getBlob().setName(outputFileName);
            
            // Get the output folder by name
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (!outputFolders.hasNext()) {
              Logger.log('Output folder not found: ' + outputFolderName);
              return;
            }
            var outputFolder = outputFolders.next();
            
            outputFolder.createFile(textStampPdfBlob);
            Logger.log('File saved: ' + outputFileName);
            Logger.log('Text stamp successfully added to PDF');
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