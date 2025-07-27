function extractFormDataFromPdf() {
  // Set your PDF4me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  
  // Set the PDF4me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ExtractPdfFormData`;
  
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

  // Set the output folder name for extracted form data
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
    // What extracting form data does:
    // - Extracts all form field data and values from PDF documents containing fillable forms
    // - Provides field names, types, and values in structured format
    // - Useful for form processing, data extraction, and document analysis
    var payload = {
      docName: file.getName(),                      // Source PDF file name with .pdf extension
      docContent: pdfBase64,                        // Base64 encoded PDF document content
      async: true                                   // Asynchronous processing
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

    // Send the initial form data extraction request to the API
    Logger.log('Sending form data extraction request to PDF4me API...');
    Logger.log('Processing form data extraction: ' + fileName);

    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('Status code: ' + code);
    Logger.log('Response content length: ' + response.getContentText().length);

    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 means "Success" - form data extraction completed successfully
      Logger.log('Success! Form data extraction completed!');
      
      // Save the extracted form data
      try {
        // Check if response is JSON (form data) or binary content
        var contentType = response.getHeaders()['Content-Type'] || response.getHeaders()['content-type'] || '';
        
        if (contentType.indexOf('application/json') !== -1) {
          // Response contains JSON form data
          var formData = JSON.parse(response.getContentText());
          
          // Process and save extracted form data
          processFormData(formData, outputFolderName);
          
        } else {
          // Response is likely binary content
          var outputFolders = DriveApp.getFoldersByName(outputFolderName);
          if (!outputFolders.hasNext()) {
            Logger.log('Output folder not found: ' + outputFolderName);
            return;
          }
          var outputFolder = outputFolders.next();
          
          var binaryBlob = response.getBlob().setName('form_data.bin');
          outputFolder.createFile(binaryBlob);
          Logger.log('Binary form data saved: form_data.bin');
        }
        
      } catch (e) {
        Logger.log('Error processing extracted form data: ' + e);
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
      // 202 means "Accepted" - API is processing the form data extraction asynchronously
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

      // Poll the API until form data extraction is complete
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
          Logger.log('Success! Form data extraction completed!');
          
          // Save the extracted form data
          try {
            // Check if response is JSON (form data) or binary content
            var contentType = responseExtraction.getHeaders()['Content-Type'] || responseExtraction.getHeaders()['content-type'] || '';
            
            if (contentType.indexOf('application/json') !== -1) {
              // Response contains JSON form data
              var formData = JSON.parse(responseExtraction.getContentText());
              
              // Process and save extracted form data
              processFormData(formData, outputFolderName);
              
            } else {
              // Response is likely binary content
              var outputFolders = DriveApp.getFoldersByName(outputFolderName);
              if (!outputFolders.hasNext()) {
                Logger.log('Output folder not found: ' + outputFolderName);
                return;
              }
              var outputFolder = outputFolders.next();
              
              var binaryBlob = responseExtraction.getBlob().setName('form_data.bin');
              outputFolder.createFile(binaryBlob);
              Logger.log('Binary form data saved: form_data.bin');
            }
            
          } catch (e) {
            Logger.log('Error processing extracted form data: ' + e);
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
      Logger.log('Timeout: Form data extraction did not complete after multiple retries');
      
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

function processFormData(formData, outputFolderName) {
  // Process and save extracted form data in JSON format
  try {
    var outputFolders = DriveApp.getFoldersByName(outputFolderName);
    if (!outputFolders.hasNext()) {
      Logger.log('Output folder not found: ' + outputFolderName);
      return;
    }
    var outputFolder = outputFolders.next();
    
    // Save form data as JSON file
    var jsonContent = JSON.stringify(formData, null, 2);
    var jsonBlob = Utilities.newBlob(jsonContent, 'application/json', 'extracted_form_data.json');
    outputFolder.createFile(jsonBlob);
    Logger.log('Form data saved: extracted_form_data.json');
    
    // Display extracted form data summary
    if (typeof formData === 'object') {
      Logger.log('Extracted Form Data:');
      if (formData.formFields) {
        var fields = formData.formFields;
        Logger.log('Found ' + fields.length + ' form fields:');
        
        // Show first 10 fields
        var maxFields = Math.min(fields.length, 10);
        for (var i = 0; i < maxFields; i++) {
          var field = fields[i];
          var fieldName = field.name || 'Unknown';
          var fieldValue = field.value || 'Empty';
          var fieldType = field.type || 'Unknown';
          Logger.log('  ' + (i + 1) + '. ' + fieldName + ' (' + fieldType + '): ' + fieldValue);
        }
        
        if (fields.length > 10) {
          Logger.log('  ... and ' + (fields.length - 10) + ' more fields');
        }
      } else {
        // Display top-level data if no formFields structure
        var keys = Object.keys(formData);
        var maxKeys = Math.min(keys.length, 5);
        for (var i = 0; i < maxKeys; i++) {
          var key = keys[i];
          var value = formData[key];
          Logger.log('  ' + key + ': ' + value);
        }
        
        if (keys.length > 5) {
          Logger.log('  ... and ' + (keys.length - 5) + ' more entries');
        }
      }
      
      // Create a summary text file
      var summaryContent = 'Form Data Extraction Summary\n' +
                          '============================\n' +
                          'Extracted on: ' + new Date().toString() + '\n\n';
      
      if (formData.formFields) {
        summaryContent += 'Total form fields found: ' + formData.formFields.length + '\n\n';
        summaryContent += 'Form Fields:\n';
        summaryContent += '============\n';
        
        for (var i = 0; i < formData.formFields.length; i++) {
          var field = formData.formFields[i];
          var fieldName = field.name || 'Unknown';
          var fieldValue = field.value || 'Empty';
          var fieldType = field.type || 'Unknown';
          summaryContent += (i + 1) + '. ' + fieldName + ' (' + fieldType + '): ' + fieldValue + '\n';
        }
      } else {
        summaryContent += 'No formFields structure found in response.\n';
        summaryContent += 'Response structure: ' + Object.keys(formData).join(', ') + '\n';
      }
      
      var summaryBlob = Utilities.newBlob(summaryContent, 'text/plain', 'form_data_summary.txt');
      outputFolder.createFile(summaryBlob);
      Logger.log('Form data summary saved: form_data_summary.txt');
      
    } else {
      Logger.log('No form data found in the PDF');
      
      // Create info file
      var infoContent = 'Form Data Extraction Results\n' +
                       '============================\n' +
                       'Extracted on: ' + new Date().toString() + '\n\n' +
                       'No form data was found in the PDF document.\n';
      
      var infoBlob = Utilities.newBlob(infoContent, 'text/plain', 'extraction_info.txt');
      outputFolder.createFile(infoBlob);
      Logger.log('Extraction info saved: extraction_info.txt');
    }
    
  } catch (e) {
    Logger.log('Error processing form data: ' + e);
    
    // Create error file
    var errorContent = 'Form Data Extraction Error\n' +
                      '==========================\n' +
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