function generateDocumentSingle() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/GenerateDocumentSingle`;
  
  // Set the folder and file names for the input files
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var templateFileName = 'invoice_sample.html'; // <-- Set your template file name here
  var jsonDataFileName = 'invoice_sample_data.json'; // <-- Set your JSON data file name here

  // Set the output file name for the generated document
  var outputFileName = 'invoice_sample.generated.html';
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
    
    // Get the template file by name within the folder
    var templateFiles = folder.getFilesByName(templateFileName);
    if (!templateFiles.hasNext()) {
      Logger.log('Template file not found in folder: ' + templateFileName);
      return;
    }
    var templateFile = templateFiles.next();

    // Get the JSON data file by name within the folder
    var jsonDataFiles = folder.getFilesByName(jsonDataFileName);
    if (!jsonDataFiles.hasNext()) {
      Logger.log('JSON data file not found in folder: ' + jsonDataFileName);
      return;
    }
    var jsonDataFile = jsonDataFiles.next();

    // === Folder structure file input END ===

    // Get the template file as a blob (binary data)
    var templateBlob = templateFile.getBlob();
    Logger.log('Template file name: ' + templateFile.getName());
    Logger.log('Template file size: ' + templateBlob.getBytes().length);

    // Get the JSON data file content
    var jsonDataContent = jsonDataFile.getBlob().getDataAsString();
    Logger.log('JSON data file name: ' + jsonDataFile.getName());
    Logger.log('JSON data content length: ' + jsonDataContent.length);

    // Encode the template file as base64 for API transmission
    var templateBase64 = Utilities.base64Encode(templateBlob.getBytes());

    // Prepare the payload for the API request
    var payload = {
        templateFileType: "html",              // Template file type (Word/HTML/PDF)
        templateFileName: "invoice_template.html",  // Template file name with proper extension
        templateFileData: templateBase64,     // Base64 encoded template file content
        documentDataType: "text",              // Document data type (JSON/XML)
        outputType: "html",                    // Output document type (PDF/Word/Excel/HTML)
        documentDataText: jsonDataContent,           // JSON/XML data as text (required if documentDataFile not mapped)
        isAsync: true                            // For big files and too many calls async is recommended to reduce the server load
    };

    // Alternative payload examples for different scenarios:
    
    // Example 1: Word template with JSON data outputting to PDF
    // payload = {
    //     templateFileType: "Word",              // Template file type
    //     templateFileName: "template.docx",     // Word template file name
    //     templateFileData: templateBase64,     // Base64 encoded Word template
    //     documentDataType: "JSON",              // Data type
    //     outputType: "PDF",                     // Output as PDF
    //     documentDataText: jsonDataContent,           // JSON data as text
    //     metaDataJson: "{}",                    // Additional metadata for fields in JSON format
    //     isAsync: true
    // };
    
    // Example 2: PDF template with XML data outputting to Word
    // payload = {
    //     templateFileType: "PDF",               // PDF template file type
    //     templateFileName: "template.pdf",      // PDF template file name
    //     templateFileData: templateBase64,     // Base64 encoded PDF template
    //     documentDataType: "XML",               // XML data type
    //     outputType: "Word",                    // Output as Word document
    //     documentDataText: xmlData,            // XML data as text
    //     metaDataJson: "{}",                    // Additional metadata
    //     isAsync: true
    // };
    
    // Example 3: HTML template with JSON data outputting to Excel
    // payload = {
    //     templateFileType: "HTML",              // HTML template file type
    //     templateFileName: "template.html",     // HTML template file name
    //     templateFileData: templateBase64,     // Base64 encoded HTML template
    //     documentDataType: "JSON",              // JSON data type
    //     outputType: "Excel",                   // Output as Excel file
    //     documentDataText: jsonDataContent,           // JSON data as text
    //     metaDataJson: "{}",                    // Additional metadata
    //     isAsync: true
    // };

    // Set the headers for the API request
    var headers = {
      'Authorization': 'Basic ' + apiKey,
      'Content-Type': 'application/json'
    };

    // Set the options for the API request
    var options = {
      method: 'post',
      headers: headers,
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    // Send the template and data to the API for document generation
    Logger.log('Sending generate document single request...');
    Logger.log('Template file: ' + templateFileName);
    Logger.log('JSON data file: ' + jsonDataFileName);
    Logger.log('Output file: ' + outputFileName);
    
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('API response code: ' + code);
    
    // Only log response content if there's an error (not for successful document data)
    if (code !== 200 && code !== 202) {
      Logger.log('API response: ' + response.getContentText());
    }

    // If generation is synchronous and successful
    if (code === 200) {
      Logger.log('Document generation completed successfully!');
      var documentBlob = response.getBlob().setName(outputFileName);
        // Get the output folder by name
        var outputFolders = DriveApp.getFoldersByName(outputFolderName);
        if (!outputFolders.hasNext()) {
          Logger.log('Output folder not found: ' + outputFolderName);
          return;
        }
        var outputFolder = outputFolders.next();
        outputFolder.createFile(documentBlob);
        Logger.log('Generated document saved to folder: ' + outputFolderName);
          return;
        }
    // If generation is asynchronous, poll for the result
    else if (code === 202) {
      Logger.log('Request accepted. Processing asynchronously...');
      // Get the polling URL from the Location header
      var headersAll = response.getAllHeaders();
      var locationUrl = headersAll['Location'] || headersAll['location'];
      if (!locationUrl) {
        Logger.log("No 'Location' header found in the response.");
        return;
      }
      Logger.log('Polling URL: ' + locationUrl);
      // Poll the API until the generation is complete or times out
      var maxRetries = 20;
      var retryDelay = 10 * 1000; // 10 seconds
      for (var i = 0; i < maxRetries; i++) {
        Utilities.sleep(retryDelay);
        // Poll the generation status
        var pollResponse = UrlFetchApp.fetch(locationUrl, {
          method: 'get',
          headers: headers,
          muteHttpExceptions: true
        });
        var pollCode = pollResponse.getResponseCode();
        // If generation is complete, save the document file
        if (pollCode === 200) {
          Logger.log('Document generation completed successfully!');
          var documentBlob = pollResponse.getBlob().setName(outputFileName);

        // Get the output folder by name
        var outputFolders = DriveApp.getFoldersByName(outputFolderName);
        if (!outputFolders.hasNext()) {
          Logger.log('Output folder not found: ' + outputFolderName);
          return;
        }
        var outputFolder = outputFolders.next();
        outputFolder.createFile(documentBlob);
        Logger.log('Generated document saved to folder: ' + outputFolderName);
          return;
        } 

        // If still processing, continue polling
        else if (pollCode === 202) {
          Logger.log('Still processing, waiting...');
          continue;
        } 
        // If error during polling, log and exit
        else {
          Logger.log('Error during polling. Status: ' + pollCode);
          Logger.log(pollResponse.getContentText());
          return;
        }
      }
      // If polling times out, log a timeout message
      Logger.log('Timeout: Document generation did not complete after multiple retries.');
    } 
    // If initial API call fails, log the error
    else {
      Logger.log('Error response code: ' + code);
      Logger.log('Error details: ' + response.getContentText());
    }
  } catch (e) {
    // Log any exceptions that occur during the process
    Logger.log('Exception: ' + e);
  }
} 