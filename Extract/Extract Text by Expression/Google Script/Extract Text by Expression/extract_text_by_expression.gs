function extractTextByExpression() {
  // Set your PDF4me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  
  // Set the PDF4me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ExtractTextByExpression`;
  
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

  // Set the output folder name for extracted text
  var outputFolderName = 'PDF4ME output'; // <-- Set your output folder name here

  // Text extraction parameters
  var expression = "%"; // Regular expression pattern to search for (example: %, US, email patterns, etc.)
  var pageSequence = "1-3"; // Page range: "1-" for all pages, "1,2,3" for specific pages, "1-5" for range

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
    // What extracting text by expression does:
    // - Extracts specific text from PDF documents using regular expressions
    // - Searches for patterns like percentages, emails, phone numbers, etc.
    // - Processes specific page ranges or entire documents
    // - Useful for data extraction, pattern matching, and content analysis
    var payload = {
      docContent: pdfBase64,                        // Base64 encoded PDF document content
      docName: file.getName(),                      // Name of the input PDF file
      expression: expression,                       // Regular expression pattern to search for
      pageSequence: pageSequence,                   // Page range to process
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

    // Send the initial text extraction request to the API
    Logger.log('Extracting text matching pattern \'' + expression + '\' from pages ' + pageSequence + '...');
    Logger.log('Sending text extraction request to PDF4me API...');
    Logger.log('Processing text extraction: ' + fileName);

    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('Status code: ' + code);
    Logger.log('Response content length: ' + response.getContentText().length);

    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 means "Success" - text extraction completed successfully
      Logger.log('Success! Text extraction by expression completed!');
      
      // Save the extracted text data
      try {
        // Parse the JSON response containing extracted text
        var textData = JSON.parse(response.getContentText());
        
        // Process and save extracted text matches
        processExtractedText(textData, outputFolderName, expression, pageSequence);
        
      } catch (e) {
        Logger.log('Error processing extracted text data: ' + e);
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
      var retryDelay = 8 * 1000; // 8 seconds between each polling attempt

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
          Logger.log('Success! Text extraction by expression completed!');
          
          // Save the extracted text data
          try {
            // Parse the JSON response containing extracted text
            var textData = JSON.parse(responseExtraction.getContentText());
            
            // Process and save extracted text matches
            processExtractedText(textData, outputFolderName, expression, pageSequence);
            
          } catch (e) {
            Logger.log('Error processing extracted text data: ' + e);
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

function processExtractedText(textData, outputFolderName, expression, pageSequence) {
  // Process and save extracted text matches in multiple formats
  try {
    var outputFolders = DriveApp.getFoldersByName(outputFolderName);
    if (!outputFolders.hasNext()) {
      Logger.log('Output folder not found: ' + outputFolderName);
      return;
    }
    var outputFolder = outputFolders.next();
    
    // Save complete extraction data as JSON
    var jsonContent = JSON.stringify(textData, null, 2);
    var jsonBlob = Utilities.newBlob(jsonContent, 'application/json', 'extracted_text_by_expression.json');
    outputFolder.createFile(jsonBlob);
    Logger.log('Extraction metadata saved: extracted_text_by_expression.json');
    
    // Handle different response formats
    var textMatches = [];
    
    // Check for text list in response
    if (typeof textData === 'object') {
      // Look for common field names that might contain the extracted text
      var fieldNames = ['textList', 'text_list', 'texts', 'matches', 'results', 'data'];
      for (var i = 0; i < fieldNames.length; i++) {
        var fieldName = fieldNames[i];
        if (textData[fieldName]) {
          textMatches = textData[fieldName];
          break;
        }
      }
      
      // If no specific field found, check if the whole response is the text list
      if (!textMatches && String(textData).indexOf('expression') !== -1) {
        // Might be a structured response, look for text values
        for (var key in textData) {
          var value = textData[key];
          if (Array.isArray(value) && value.length > 0) {
            textMatches = value;
            break;
          }
        }
      }
    } else if (Array.isArray(textData)) {
      // Direct text list
      textMatches = textData;
    }
    
    // Save individual matches as text file
    if (textMatches && textMatches.length > 0) {
      // Save all matches in a single text file
      var textContent = 'Text Extraction Results\n' +
                       '======================\n' +
                       'Expression: ' + expression + '\n' +
                       'Pages: ' + pageSequence + '\n' +
                       'Total Matches: ' + textMatches.length + '\n\n';
      
      for (var i = 0; i < textMatches.length; i++) {
        textContent += 'Match ' + (i + 1) + ': ' + textMatches[i] + '\n';
      }
      
      var textBlob = Utilities.newBlob(textContent, 'text/plain', 'extracted_matches.txt');
      outputFolder.createFile(textBlob);
      Logger.log('Text matches saved: extracted_matches.txt');
      
      // Save matches as CSV for easy analysis
      saveMatchesAsCsv(textMatches, outputFolder, expression, pageSequence);
      
      // Display extraction summary
      displayExtractionSummary(textMatches, expression, pageSequence);
      
    } else {
      Logger.log('No text matches found for the specified expression');
      
      // Add debug information to the main JSON file
      if (typeof textData === 'object') {
        textData.message = 'No matches found';
        textData.expression = expression;
        textData.page_sequence = pageSequence;
        textData.response_structure = typeof textData;
        
        // Save updated JSON
        var updatedJsonContent = JSON.stringify(textData, null, 2);
        var updatedJsonBlob = Utilities.newBlob(updatedJsonContent, 'application/json', 'extracted_text_by_expression.json');
        outputFolder.createFile(updatedJsonBlob);
        Logger.log('Debug information added to main JSON file');
      }
    }
    
    // Create a summary text file
    var summaryContent = 'Text Extraction Summary\n' +
                        '======================\n' +
                        'Extracted on: ' + new Date().toString() + '\n\n' +
                        'Expression: ' + expression + '\n' +
                        'Pages processed: ' + pageSequence + '\n' +
                        'Total matches found: ' + (textMatches ? textMatches.length : 0) + '\n\n';
    
    if (textMatches && textMatches.length > 0) {
      summaryContent += 'Text extraction by expression completed successfully!\n\n';
      summaryContent += 'First few matches:\n';
      var maxMatches = Math.min(textMatches.length, 5);
      for (var i = 0; i < maxMatches; i++) {
        var displayMatch = textMatches[i].length > 50 ? textMatches[i].substring(0, 50) + '...' : textMatches[i];
        summaryContent += '  ' + (i + 1) + '. ' + displayMatch + '\n';
      }
      
      if (textMatches.length > 5) {
        summaryContent += '  ... and ' + (textMatches.length - 5) + ' more matches\n';
      }
      
      // Show unique matches if there are duplicates
      var uniqueMatches = [];
      for (var i = 0; i < textMatches.length; i++) {
        if (uniqueMatches.indexOf(textMatches[i]) === -1) {
          uniqueMatches.push(textMatches[i]);
        }
      }
      if (uniqueMatches.length < textMatches.length) {
        summaryContent += 'Unique matches: ' + uniqueMatches.length + '\n';
      }
    } else {
      summaryContent += 'No matches were found for the specified expression.\n';
    }
    
    var summaryBlob = Utilities.newBlob(summaryContent, 'text/plain', 'text_extraction_summary.txt');
    outputFolder.createFile(summaryBlob);
    Logger.log('Text extraction summary saved: text_extraction_summary.txt');
    
  } catch (e) {
    Logger.log('Error processing extracted text: ' + e);
    
    // Create error file
    var errorContent = 'Text Extraction Error\n' +
                      '====================\n' +
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

function saveMatchesAsCsv(textMatches, outputFolder, expression, pageSequence) {
  // Save text matches as CSV format
  try {
    var csvContent = 'Match_Number,Extracted_Text,Expression_Used,Pages_Processed\n';
    
    for (var i = 0; i < textMatches.length; i++) {
      var match = String(textMatches[i]);
      // Escape quotes and wrap in quotes if contains comma or quote
      if (match.indexOf(',') !== -1 || match.indexOf('"') !== -1) {
        match = '"' + match.replace(/"/g, '""') + '"';
      }
      csvContent += (i + 1) + ',' + match + ',' + expression + ',' + pageSequence + '\n';
    }
    
    var csvBlob = Utilities.newBlob(csvContent, 'text/csv', 'extracted_matches.csv');
    outputFolder.createFile(csvBlob);
    Logger.log('CSV file saved: extracted_matches.csv');
    
  } catch (e) {
    Logger.log('Error saving CSV: ' + e);
  }
}

function displayExtractionSummary(textMatches, expression, pageSequence) {
  // Display summary of text extraction results
  Logger.log('Text Extraction Summary:');
  Logger.log('  Expression: \'' + expression + '\'');
  Logger.log('  Pages processed: ' + pageSequence);
  Logger.log('  Total matches found: ' + textMatches.length);
  
  if (textMatches && textMatches.length > 0) {
    Logger.log('  First few matches:');
    var maxMatches = Math.min(textMatches.length, 5);
    for (var i = 0; i < maxMatches; i++) {
      var displayMatch = textMatches[i].length > 50 ? textMatches[i].substring(0, 50) + '...' : textMatches[i];
      Logger.log('    ' + (i + 1) + '. ' + displayMatch);
    }
    
    if (textMatches.length > 5) {
      Logger.log('    ... and ' + (textMatches.length - 5) + ' more matches');
    }
    
    // Show unique matches if there are duplicates
    var uniqueMatches = [];
    for (var i = 0; i < textMatches.length; i++) {
      if (uniqueMatches.indexOf(textMatches[i]) === -1) {
        uniqueMatches.push(textMatches[i]);
      }
    }
    if (uniqueMatches.length < textMatches.length) {
      Logger.log('  Unique matches: ' + uniqueMatches.length);
    }
  }
  
  Logger.log('Text extraction by expression completed successfully!');
} 