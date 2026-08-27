function addAttachmentToPdf() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/AddAttachmentToPdf`;
  
  // Set the folder and file names for the input files
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var pdfFileName = 'sample.pdf'; // <-- Set your PDF file name here
  var attachmentFileName = 'sample.txt'; // <-- Set your attachment file name here

  //         ===  Set the file ID for the input PDF ===
  // var pdfFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q'; // 
  // To get the file ID from Google Drive:
  // 1. Right-click the file in Google Drive and select "Get link".
  // 2. The link will look like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // 3. Copy the long string between '/d/' and '/view' — that's your FILE_ID.
  // Example: For https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
  //          The file ID is: 1A2B3C4D5E6F7G8H9I0J
  //          ===  Set the file ID for the input PDF ===

  // Set the output file name for the PDF with attachment
  var outputFileName = 'Add_attachment_to_PDF_output.pdf';
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

    // Get the attachment file by name within the folder
    var attachmentFiles = folder.getFilesByName(attachmentFileName);
    if (!attachmentFiles.hasNext()) {
      Logger.log('Attachment file not found in folder: ' + attachmentFileName);
      return;
    }
    // Get the first attachment file found
    var attachmentFile = attachmentFiles.next();

    // === Folder structure file input END ===

    // === File ID as input START ===
    // var pdfFile = DriveApp.getFileById(pdfFileId);
    // var attachmentFile = DriveApp.getFileById(attachmentFileId);
    // === File ID as input END ===

    // Get the files as blobs (binary data)
    var pdfBlob = pdfFile.getBlob();
    var attachmentBlob = attachmentFile.getBlob();
    
    Logger.log('PDF file name: ' + pdfFile.getName());
    Logger.log('PDF file size: ' + pdfBlob.getBytes().length);
    Logger.log('Attachment file name: ' + attachmentFile.getName());
    Logger.log('Attachment file size: ' + attachmentBlob.getBytes().length);
    Logger.log('Files successfully encoded to base64');

    // Encode the files as base64 for API transmission
    var pdfBase64 = Utilities.base64Encode(pdfBlob.getBytes());
    var attachmentBase64 = Utilities.base64Encode(attachmentBlob.getBytes());

    // Prepare the payload for the API request
    // What attachment addition does:
    // - Adds file attachments to PDF documents
    // - Supports various file types: .txt, .doc, .jpg, .png, etc.
    // - Allows multiple attachments to be added to a single PDF
    // - Attachments can be accessed through PDF viewers' attachment panels
    var payload = {
      docName: 'output.pdf',                          // Output PDF file name
      docContent: pdfBase64,                          // Base64 encoded PDF document content
      attachments: [                                  // Array of attachments to add to the PDF
        {
          docName: attachmentFile.getName(),          // Attachment file name with extension
          docContent: attachmentBase64                // Base64 encoded attachment content
        }
      ],
      isAsync: true                                     // Enable asynchronous processing
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

    // Send the initial attachment addition request to the API
    Logger.log('Sending attachment request to PDF4Me API...');
    Logger.log('Adding attachment to: ' + pdfFileName + ' → ' + outputFileName);
    Logger.log('Attachment: ' + attachmentFileName);
    
    
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('Status code: ' + code);
    Logger.log('Response content length: ' + response.getContentText().length);

    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 means "Success" - attachment addition completed successfully
      Logger.log(' Success! Attachment addition completed!');
      
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
        
        var attachmentPdfBlob = responseContent.setName(outputFileName);
        outputFolder.createFile(attachmentPdfBlob);
        Logger.log('PDF with attachment saved to: ' + outputFileName);
        Logger.log('Attachment successfully added to PDF');
        Logger.log(' To access the attachment, open the PDF in a PDF viewer and look for the attachment panel');
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
            Logger.log('PDF with attachment saved to: ' + outputFileName);
            Logger.log('Attachment successfully added to PDF');
            Logger.log(' To access the attachment, open the PDF in a PDF viewer and look for the attachment panel');
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
      // 202 means "Accepted" - API is processing the attachment addition asynchronously
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

      // Poll the API until attachment addition is complete
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
          Logger.log(' Success! Attachment addition completed!');
          
          // Validate and save the PDF with attachment
          var responseText = responseConversion.getContentText();
          if (responseText.startsWith('%PDF') || responseConversion.getBlob().getBytes().length > 1000) {
            var attachmentPdfBlob = responseConversion.getBlob().setName(outputFileName);
            
            // Get the output folder by name
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (!outputFolders.hasNext()) {
              Logger.log('Output folder not found: ' + outputFolderName);
              return;
            }
            var outputFolder = outputFolders.next();
            
            outputFolder.createFile(attachmentPdfBlob);
            Logger.log('File saved: ' + outputFileName);
            Logger.log('Attachment successfully added to PDF');
            Logger.log(' To access the attachment, open the PDF in a PDF viewer and look for the attachment panel');
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