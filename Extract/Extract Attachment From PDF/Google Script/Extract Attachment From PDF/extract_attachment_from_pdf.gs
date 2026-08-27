function extractAttachmentFromPdf() {
  // Set your PDF4me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  
  // Set the PDF4me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ExtractAttachmentFromPdf`;
  
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

  // Set the output folder name for extracted attachments
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
    // What extracting attachments does:
    // - Extracts all file attachments embedded within PDF documents
    // - Supports various attachment types (documents, images, files, etc.)
    // - Provides metadata about extracted attachments
    // - Useful for document analysis, content extraction, and file recovery
    var payload = {
      docName: file.getName(),                      // Source PDF file name with .pdf extension
      docContent: pdfBase64,                        // Base64 encoded PDF document content
      isAsync: true                                   // Asynchronous processing
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

    // Send the initial attachment extraction request to the API
    Logger.log('Sending attachment extraction request to PDF4me API...');
    Logger.log('Processing attachment extraction: ' + fileName);

    
    
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('Status code: ' + code);
    Logger.log('Response content length: ' + response.getContentText().length);

    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 means "Success" - attachment extraction completed successfully
      Logger.log(' Success! Attachment extraction completed!');
      
      // Save the extracted attachments
      try {
        // Check if response is JSON (metadata) or binary (ZIP file)
        var contentType = response.getHeaders()['Content-Type'] || response.getHeaders()['content-type'] || '';
        
        if (contentType.indexOf('application/json') !== -1) {
          // Response contains JSON metadata about attachments
          var attachmentData = JSON.parse(response.getContentText());
          
          // Process and save extracted attachments
          processAttachmentData(attachmentData, outputFolderName);
          
        } else {
          // Response is likely a ZIP file or binary content
          var outputFolders = DriveApp.getFoldersByName(outputFolderName);
          if (!outputFolders.hasNext()) {
            Logger.log('Output folder not found: ' + outputFolderName);
            return;
          }
          var outputFolder = outputFolders.next();
          
          var zipBlob = response.getBlob().setName('extracted_attachments.zip');
          outputFolder.createFile(zipBlob);
          Logger.log('Extracted attachments saved: extracted_attachments.zip');
          
          // Note: Google Apps Script doesn't have built-in ZIP extraction
          // The ZIP file is saved and can be manually extracted or processed further
          Logger.log('ZIP file saved. Manual extraction may be required.');
        }
        
      } catch (e) {
        Logger.log('Error processing extracted attachments: ' + e);
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
      // 202 means "Accepted" - API is processing the attachment extraction asynchronously
      Logger.log('202 - Request accepted. Processing asynchronously...');
      
      // Get the polling URL from the Location header
      var headersAll = response.getAllHeaders();
      var locationUrl = headersAll['Location'] || headersAll['location'];
      if (!locationUrl) {
        Logger.log("Error: No polling URL found in response");
        return;
      }

      // Retry logic for polling the result
      var maxRetries = 15;    // Maximum number of polling attempts
      var retryDelay = 10 * 1000; // 10 seconds between each polling attempt

      // Poll the API until attachment extraction is complete
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
          Logger.log(' Success! Attachment extraction completed!');
          
          // Save the extracted attachments
          try {
            // Check if response is JSON (metadata) or binary (ZIP file)
            var contentType = responseExtraction.getHeaders()['Content-Type'] || responseExtraction.getHeaders()['content-type'] || '';
            
            if (contentType.indexOf('application/json') !== -1) {
              // Response contains JSON metadata about attachments
              var attachmentData = JSON.parse(responseExtraction.getContentText());
              
              // Process and save extracted attachments
              processAttachmentData(attachmentData, outputFolderName);
              
            } else {
              // Response is likely a ZIP file or binary content
              var outputFolders = DriveApp.getFoldersByName(outputFolderName);
              if (!outputFolders.hasNext()) {
                Logger.log('Output folder not found: ' + outputFolderName);
                return;
              }
              var outputFolder = outputFolders.next();
              
              var zipBlob = responseExtraction.getBlob().setName('extracted_attachments.zip');
              outputFolder.createFile(zipBlob);
              Logger.log('Extracted attachments saved: extracted_attachments.zip');
              
              // Note: Google Apps Script doesn't have built-in ZIP extraction
              // The ZIP file is saved and can be manually extracted or processed further
              Logger.log('ZIP file saved. Manual extraction may be required.');
            }
            
          } catch (e) {
            Logger.log('Error processing extracted attachments: ' + e);
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
      Logger.log('Timeout: Attachment extraction did not complete after multiple retries');
      
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

function processAttachmentData(attachmentData, outputFolderName) {
  // Process and save extracted attachment data in .txt format
  try {
    var attachmentsFound = 0;
    var outputFolders = DriveApp.getFoldersByName(outputFolderName);
    if (!outputFolders.hasNext()) {
      Logger.log('Output folder not found: ' + outputFolderName);
      return;
    }
    var outputFolder = outputFolders.next();
    
    // Check for outputDocuments structure
    if (typeof attachmentData === 'object' && attachmentData.outputDocuments) {
      var outputDocs = attachmentData.outputDocuments;
      
      if (Array.isArray(outputDocs)) {
        for (var i = 0; i < outputDocs.length; i++) {
          var doc = outputDocs[i];
          if (typeof doc === 'object') {
            // Extract file information
            var filename = doc.fileName || 'attachment_' + (i + 1) + '.txt';
            var streamFile = doc.streamFile || '';
            var barcodeText = doc.barcodeText || null;
            var docText = doc.docText || null;
            
            var baseName = filename.replace(/\.[^/.]+$/, '');
            
            // Process streamFile content
            if (streamFile) {
              try {
                // Decode base64 content
                var decodedContent = Utilities.newBlob(Utilities.base64Decode(streamFile)).getDataAsString();
                
                // Create output filename with .txt extension
                var outputFilename = baseName + '_extracted.txt';
                var content = 'Extracted Attachment Content\n' +
                             '============================\n' +
                             'Original filename: ' + filename + '\n' +
                             'Extracted on: ' + new Date().toString() + '\n\n' +
                             decodedContent;
                
                var textBlob = Utilities.newBlob(content, 'text/plain', outputFilename);
                outputFolder.createFile(textBlob);
                Logger.log('Attachment content saved: ' + outputFilename);
                attachmentsFound++;
                
              } catch (e) {
                Logger.log('Error decoding attachment ' + (i + 1) + ': ' + e);
              }
            }
            
            // Process barcodeText content
            if (barcodeText && barcodeText !== 'null' && barcodeText.toString().trim()) {
              try {
                var contentToSave = barcodeText;
                
                // Check if it's base64 encoded
                if (typeof barcodeText === 'string' && barcodeText.length > 10) {
                  try {
                    // Try to decode as base64
                    var decodedBarcode = Utilities.newBlob(Utilities.base64Decode(barcodeText)).getDataAsString();
                    contentToSave = decodedBarcode;
                  } catch (e) {
                    // If not base64, use as is
                    contentToSave = barcodeText;
                  }
                }
                
                // Save barcode text file
                var barcodeFilename = baseName + '_barcode.txt';
                var barcodeContent = 'Extracted Barcode Text\n' +
                                   '======================\n' +
                                   'Source filename: ' + filename + '\n' +
                                   'Extracted on: ' + new Date().toString() + '\n\n' +
                                   contentToSave;
                
                var barcodeBlob = Utilities.newBlob(barcodeContent, 'text/plain', barcodeFilename);
                outputFolder.createFile(barcodeBlob);
                Logger.log('Barcode text saved: ' + barcodeFilename);
                attachmentsFound++;
                
              } catch (e) {
                Logger.log('Error processing barcode text: ' + e);
              }
            } else {
              // Create file showing null barcode
              var barcodeFilename = baseName + '_barcode.txt';
              var barcodeContent = 'Extracted Barcode Text\n' +
                                 '======================\n' +
                                 'Source filename: ' + filename + '\n' +
                                 'Extracted on: ' + new Date().toString() + '\n\n' +
                                 'null';
              
              var barcodeBlob = Utilities.newBlob(barcodeContent, 'text/plain', barcodeFilename);
              outputFolder.createFile(barcodeBlob);
              Logger.log('Barcode file created (null): ' + barcodeFilename);
            }
            
            // Process docText content
            if (docText && docText !== 'null' && docText.toString().trim()) {
              try {
                var contentToSave = docText;
                
                // Check if it's base64 encoded
                if (typeof docText === 'string' && docText.length > 10) {
                  try {
                    // Try to decode as base64
                    var decodedDocText = Utilities.newBlob(Utilities.base64Decode(docText)).getDataAsString();
                    contentToSave = decodedDocText;
                  } catch (e) {
                    // If not base64, use as is
                    contentToSave = docText;
                  }
                }
                
                // Save doc text file
                var docTextFilename = baseName + '_doctext.txt';
                var docTextContent = 'Extracted Document Text\n' +
                                   '=======================\n' +
                                   'Source filename: ' + filename + '\n' +
                                   'Extracted on: ' + new Date().toString() + '\n\n' +
                                   contentToSave;
                
                var docTextBlob = Utilities.newBlob(docTextContent, 'text/plain', docTextFilename);
                outputFolder.createFile(docTextBlob);
                Logger.log('Document text saved: ' + docTextFilename);
                attachmentsFound++;
                
              } catch (e) {
                Logger.log('Error processing document text: ' + e);
              }
            } else {
              // Create file showing null docText
              var docTextFilename = baseName + '_doctext.txt';
              var docTextContent = 'Extracted Document Text\n' +
                                 '=======================\n' +
                                 'Source filename: ' + filename + '\n' +
                                 'Extracted on: ' + new Date().toString() + '\n\n' +
                                 'null';
              
              var docTextBlob = Utilities.newBlob(docTextContent, 'text/plain', docTextFilename);
              outputFolder.createFile(docTextBlob);
              Logger.log('Document text file created (null): ' + docTextFilename);
            }
          }
        }
      }
    }
    
    // Check for legacy attachments structure
    else if (typeof attachmentData === 'object' && attachmentData.attachments) {
      var attachments = attachmentData.attachments;
      
      if (Array.isArray(attachments)) {
        for (var i = 0; i < attachments.length; i++) {
          var attachment = attachments[i];
          if (typeof attachment === 'object' && attachment.docContent) {
            try {
              // Decode base64 content and save attachment
              var attachmentContent = Utilities.base64Decode(attachment.docContent);
              var attachmentFilename = attachment.docName || 'attachment_' + (i + 1);
              
              // Determine if content is text or binary
              try {
                // Try to decode as text
                var textContent = Utilities.newBlob(attachmentContent).getDataAsString();
                
                // Save as text file
                var baseName = attachmentFilename.replace(/\.[^/.]+$/, '');
                var outputFilename = baseName + '_extracted.txt';
                var content = 'Extracted Attachment Content\n' +
                             '============================\n' +
                             'Original filename: ' + attachmentFilename + '\n' +
                             'Extracted on: ' + new Date().toString() + '\n\n' +
                             textContent;
                
                var textBlob = Utilities.newBlob(content, 'text/plain', outputFilename);
                outputFolder.createFile(textBlob);
                Logger.log('Attachment content saved: ' + outputFilename);
                attachmentsFound++;
                
              } catch (e) {
                // Save as binary file if not text
                var binaryBlob = Utilities.newBlob(attachmentContent).setName(attachmentFilename);
                outputFolder.createFile(binaryBlob);
                Logger.log('Binary attachment saved: ' + attachmentFilename);
                attachmentsFound++;
              }
              
            } catch (e) {
              Logger.log('Error saving attachment ' + (i + 1) + ': ' + e);
            }
          }
        }
      }
    }
    
    // Summary
    if (attachmentsFound > 0) {
      Logger.log('\n--- Attachment Extraction Summary ---');
      Logger.log('Total attachments extracted: ' + attachmentsFound);
      Logger.log('Attachment extraction completed successfully!');
    } else {
      Logger.log('No attachments found in the PDF');
      
      // Create info file
      var infoContent = 'Attachment Extraction Results\n' +
                       '=============================\n' +
                       'Extracted on: ' + new Date().toString() + '\n\n' +
                       'No attachments were found in the PDF document.\n';
      if (typeof attachmentData === 'object') {
        infoContent += 'Response structure: ' + Object.keys(attachmentData).join(', ') + '\n';
      }
      
      var infoBlob = Utilities.newBlob(infoContent, 'text/plain', 'extraction_info.txt');
      outputFolder.createFile(infoBlob);
      Logger.log('Extraction info saved: extraction_info.txt');
    }
    
  } catch (e) {
    Logger.log('Error processing attachment data: ' + e);
    
    // Create error file
    var errorContent = 'Attachment Extraction Error\n' +
                      '===========================\n' +
                      'Error occurred on: ' + new Date().toString() + '\n\n' +
                      'Error details: ' + e + '\n';
    
    var errorBlob = Utilities.newBlob(errorContent, 'text/plain', 'extraction_error.txt');
    var outputFolders = DriveApp.getFoldersByName(outputFolderName);
    if (outputFolders.hasNext()) {
      var outputFolder = outputFolders.next();
      outputFolder.createFile(errorBlob);
      Logger.log('Error info saved: extraction_error.txt');
    }
  }
} 