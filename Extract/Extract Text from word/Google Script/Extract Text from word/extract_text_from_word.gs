function extractTextFromWord() {
  // Set your PDF4me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  
  // Set the PDF4me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ExtractTextFromWord`;
  
  // Set the folder and file name for the input Word document
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var fileName = 'sample.docx'; // <-- Set your file name here

  //         ===  Set the file ID for the input Word document ===
  // var wordFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q'; // 
  // To get the file ID from Google Drive:
  // 1. Right-click the file in Google Drive and select "Get link".
  // 2. The link will look like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // 3. Copy the long string between '/d/' and '/view' — that's your FILE_ID.
  // Example: For https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
  //          The file ID is: 1A2B3C4D5E6F7G8H9I0J
  //          ===  Set the file ID for the input Word document ===

  // Set the output folder name for extracted text
  var outputFolderName = 'PDF4ME output'; // <-- Set your output folder name here

  // Text extraction parameters
  var startPageNumber = 1; // Starting page number
  var endPageNumber = 3;   // Ending page number
  var removeComments = true;      // Remove comments option
  var removeHeaderFooter = true;  // Remove header/footer option
  var acceptChanges = true;       // Accept tracked changes option
  var async = false;              // Synchronous processing

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
    // var file = DriveApp.getFileById(wordFileId);
    // === File ID as input END ===

    // Get the file as a blob (binary data)
    var wordBlob = file.getBlob();
    Logger.log('File name: ' + file.getName());
    Logger.log('File size: ' + wordBlob.getBytes().length);
    Logger.log('Word file successfully encoded to base64');

    // Encode the Word file as base64 for API transmission
    var wordBase64 = Utilities.base64Encode(wordBlob.getBytes());

    // Prepare the payload for the API request
    // What extracting text from Word does:
    // - Extracts text content from Word documents with various options
    // - Supports page range selection and content filtering
    // - Can remove comments, headers/footers, and accept tracked changes
    // - Useful for content extraction, document analysis, and text processing
    var payload = {
      docContent: wordBase64,                        // Base64 encoded Word document content
      docName: file.getName(),                      // Name of the input Word file
      StartPageNumber: startPageNumber,             // Starting page number
      EndPageNumber: endPageNumber,                 // Ending page number
      RemoveComments: removeComments,               // Remove comments option
      RemoveHeaderFooter: removeHeaderFooter,       // Remove header/footer option
      AcceptChanges: acceptChanges,                 // Accept tracked changes option
      async: async                                  // Processing mode
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

    // Send the initial text extraction request to the API
    Logger.log('Extracting text from pages ' + startPageNumber + '-' + endPageNumber + '...');
    Logger.log('Sending text extraction request to PDF4me API...');
    Logger.log('Processing text extraction: ' + fileName);

    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('Status code: ' + code);
    Logger.log('Response content length: ' + response.getContentText().length);

    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 means "Success" - text extraction completed successfully
      Logger.log('Success! Text extraction from Word completed!');
      
      // Save the extracted text content
      try {
        // Check if response is JSON (structured data) or binary content (text file)
        var contentType = response.getHeaders()['Content-Type'] || response.getHeaders()['content-type'] || '';
        
        if (contentType.indexOf('application/json') !== -1) {
          // Response contains JSON with extracted text data
          var textData = JSON.parse(response.getContentText());
          
          // Process and save extracted text content
          processExtractedTextData(textData, outputFolderName, startPageNumber, endPageNumber);
          
        } else {
          // Response is binary content - likely base64 encoded text
          try {
            // Try to decode as base64 first
            var decodedContent = Utilities.newBlob(Utilities.base64Decode(response.getContentText())).getDataAsString();
            
            // Save as text file
            saveTextContent(decodedContent, outputFolderName, startPageNumber, endPageNumber);
            displayTextSummary(decodedContent, startPageNumber, endPageNumber);
            
          } catch (e) {
            // If base64 decoding fails, try as plain text
            try {
              var textContent = response.getContentText();
              saveTextContent(textContent, outputFolderName, startPageNumber, endPageNumber);
              displayTextSummary(textContent, startPageNumber, endPageNumber);
              
            } catch (e2) {
              // Save as binary file if all else fails
              var outputFolders = DriveApp.getFoldersByName(outputFolderName);
              if (outputFolders.hasNext()) {
                var outputFolder = outputFolders.next();
                var binaryBlob = response.getBlob().setName('extracted_text_raw.bin');
                outputFolder.createFile(binaryBlob);
                Logger.log('Raw content saved: extracted_text_raw.bin');
              }
            }
          }
        }
        
      } catch (e) {
        Logger.log('Error processing extracted text: ' + e);
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
      // 202 means "Accepted" - API is processing the text extraction asynchronously
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

      // Poll the API until text extraction is complete
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
          Logger.log('Success! Text extraction from Word completed!');
          
          // Save the extracted text content
          try {
            // Check if response is JSON (structured data) or binary content (text file)
            var contentType = responseExtraction.getHeaders()['Content-Type'] || responseExtraction.getHeaders()['content-type'] || '';
            
            if (contentType.indexOf('application/json') !== -1) {
              // Response contains JSON with extracted text data
              var textData = JSON.parse(responseExtraction.getContentText());
              
              // Process and save extracted text content
              processExtractedTextData(textData, outputFolderName, startPageNumber, endPageNumber);
              
            } else {
              // Response is binary content - likely base64 encoded text
              try {
                // Try to decode as base64 first
                var decodedContent = Utilities.newBlob(Utilities.base64Decode(responseExtraction.getContentText())).getDataAsString();
                
                // Save as text file
                saveTextContent(decodedContent, outputFolderName, startPageNumber, endPageNumber);
                displayTextSummary(decodedContent, startPageNumber, endPageNumber);
                
              } catch (e) {
                // If base64 decoding fails, try as plain text
                try {
                  var textContent = responseExtraction.getContentText();
                  saveTextContent(textContent, outputFolderName, startPageNumber, endPageNumber);
                  displayTextSummary(textContent, startPageNumber, endPageNumber);
                  
                } catch (e2) {
                  // Save as binary file if all else fails
                  var outputFolders = DriveApp.getFoldersByName(outputFolderName);
                  if (outputFolders.hasNext()) {
                    var outputFolder = outputFolders.next();
                    var binaryBlob = responseExtraction.getBlob().setName('extracted_text_raw.bin');
                    outputFolder.createFile(binaryBlob);
                    Logger.log('Raw content saved: extracted_text_raw.bin');
                  }
                }
              }
            }
            
          } catch (e) {
            Logger.log('Error processing extracted text: ' + e);
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
      Logger.log('Timeout: Text extraction did not complete after multiple retries');
      
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

function processExtractedTextData(textData, outputFolderName, startPage, endPage) {
  // Process and save extracted text data in .txt format
  try {
    var outputFolders = DriveApp.getFoldersByName(outputFolderName);
    if (!outputFolders.hasNext()) {
      Logger.log('Output folder not found: ' + outputFolderName);
      return;
    }
    var outputFolder = outputFolders.next();
    
    // Save complete extraction data as JSON (excluding base64 docData)
    var cleanData = {};
    for (var key in textData) {
      if (key !== 'docData' && key !== 'docContent') {
        cleanData[key] = textData[key];
      }
    }
    var jsonContent = JSON.stringify(cleanData, null, 2);
    var jsonBlob = Utilities.newBlob(jsonContent, 'application/json', 'extracted_text_from_word.json');
    outputFolder.createFile(jsonBlob);
    Logger.log('Extraction metadata saved: extracted_text_from_word.json');
    
    // Handle different response formats
    var extractedText = "";
    
    // Check for text content in response
    if (typeof textData === 'object') {
      // Look for common field names that might contain the extracted text
      var fieldNames = ['text', 'content', 'extractedText', 'textContent', 'result', 'data', 'docData'];
      for (var i = 0; i < fieldNames.length; i++) {
        var fieldName = fieldNames[i];
        if (textData[fieldName]) {
          var content = textData[fieldName];
          
          // If it's base64 encoded, decode it
          if (fieldName === 'docData' || (typeof content === 'string' && content.length > 100 && content.replace(/[+/=]/g, '').match(/^[a-zA-Z0-9]+$/))) {
            try {
              extractedText = Utilities.newBlob(Utilities.base64Decode(content)).getDataAsString();
              break;
            } catch (e) {
              extractedText = content;
              break;
            }
          } else {
            extractedText = content;
            break;
          }
        }
      }
    } else if (typeof textData === 'string') {
      // Direct text content - check if it's base64
      if (textData.length > 100 && textData.replace(/[+/=]/g, '').match(/^[a-zA-Z0-9]+$/)) {
        try {
          extractedText = Utilities.newBlob(Utilities.base64Decode(textData)).getDataAsString();
        } catch (e) {
          extractedText = textData;
        }
      } else {
        extractedText = textData;
      }
    }
    
    // Save extracted text to .txt file
    if (extractedText) {
      saveTextContent(extractedText, outputFolderName, startPage, endPage);
      displayTextSummary(extractedText, startPage, endPage);
    } else {
      Logger.log('No text content found in the response');
      
      // Create empty text file with debug info
      var textContent = 'Text Extraction from Word Document\n' +
                       '===================================\n' +
                       'Pages: ' + startPage + '-' + endPage + '\n' +
                       'Extracted on: ' + new Date().toString() + '\n\n' +
                       'No text content found in the response.\n' +
                       'Response structure: ' + typeof textData + '\n';
      
      if (typeof textData === 'object') {
        textContent += 'Available fields: ' + Object.keys(textData).join(', ') + '\n';
      }
      
      var textBlob = Utilities.newBlob(textContent, 'text/plain', 'extracted_text.txt');
      outputFolder.createFile(textBlob);
      Logger.log('Debug text file created: extracted_text.txt');
    }
    
  } catch (e) {
    Logger.log('Error processing extracted text: ' + e);
    
    // Create error text file
    var errorContent = 'Text Extraction from Word Document\n' +
                      '===================================\n' +
                      'Pages: ' + startPage + '-' + endPage + '\n' +
                      'Extracted on: ' + new Date().toString() + '\n\n' +
                      'Error occurred during text extraction: ' + e + '\n';
    
    var errorBlob = Utilities.newBlob(errorContent, 'text/plain', 'extracted_text.txt');
    var outputFolders = DriveApp.getFoldersByName(outputFolderName);
    if (outputFolders.hasNext()) {
      var outputFolder = outputFolders.next();
      outputFolder.createFile(errorBlob);
      Logger.log('Error text file created: extracted_text.txt');
    }
  }
}

function saveTextContent(textContent, outputFolderName, startPage, endPage) {
  // Save text content to file
  try {
    var outputFolders = DriveApp.getFoldersByName(outputFolderName);
    if (!outputFolders.hasNext()) {
      Logger.log('Output folder not found: ' + outputFolderName);
      return;
    }
    var outputFolder = outputFolders.next();
    
    var content = 'Text Extraction from Word Document\n' +
                 '===================================\n' +
                 'Pages: ' + startPage + '-' + endPage + '\n' +
                 'Extracted on: ' + new Date().toString() + '\n\n' +
                 textContent;
    
    var textBlob = Utilities.newBlob(content, 'text/plain', 'extracted_text.txt');
    outputFolder.createFile(textBlob);
    Logger.log('Text content saved: extracted_text.txt');
    
  } catch (e) {
    Logger.log('Error saving text content: ' + e);
  }
}

function displayTextSummary(textContent, startPage, endPage) {
  // Display summary of text extraction results
  Logger.log('Text Extraction Summary:');
  Logger.log('  Pages processed: ' + startPage + '-' + endPage);
  
  if (textContent && textContent !== "Binary content") {
    var charCount = textContent.length;
    var wordCount = textContent.split(/\s+/).length;
    var lineCount = textContent.split('\n').length;
    
    Logger.log('  Characters extracted: ' + charCount.toLocaleString());
    Logger.log('  Words extracted: ' + wordCount.toLocaleString());
    Logger.log('  Lines extracted: ' + lineCount.toLocaleString());
    
    // Show first few lines of extracted text
    var lines = textContent.split('\n');
    if (lines.length > 0) {
      Logger.log('  First few lines of extracted text:');
      var maxLines = Math.min(lines.length, 3);
      for (var i = 0; i < maxLines; i++) {
        var line = lines[i];
        // Truncate long lines for display
        var displayLine = line.length > 80 ? line.substring(0, 80) + '...' : line;
        if (displayLine.trim()) { // Only show non-empty lines
          Logger.log('    ' + (i + 1) + '. ' + displayLine);
        }
      }
      
      if (lines.length > 3) {
        Logger.log('    ... and ' + (lines.length - 3) + ' more lines');
      }
    }
    
    Logger.log('Text extraction from Word completed successfully!');
  } else {
    Logger.log('  No readable text content was extracted');
  }
} 