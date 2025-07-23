function convertPdfToPdfA() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/PdfA`;
  
  // Set the folder and file name for the input PDF
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var fileName = 'sample.pdf'; // <-- Set your file name here

//         ===  Alternative: Set the file ID for the input PDF ===
// var pdfFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q'; // 
// To get the file ID from Google Drive:
// 1. Right-click the file in Google Drive and select "Get link".
// 2. The link will look like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
// 3. Copy the long string between '/d/' and '/view' — that's your FILE_ID.
// Example: For https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
//          The file ID is: 1A2B3C4D5E6F7G8H9I0J
//          ===  Set the file ID for the input PDF ===

  // Set the output file name for the converted PDF/A document
  var outputFileName = 'PDF_to_PDF_A_output.pdf';
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
    //var file = DriveApp.getFileById(pdfFileId);
    // === File ID as input END ===

    // Get the file as a blob
    var pdfBlob = file.getBlob();
    Logger.log('File name: ' + file.getName());
    Logger.log('File size: ' + pdfBlob.getBytes().length);

    // Get PDF content as string and encode to base64
    var pdfContentBytes = pdfBlob.getBytes();
    var pdfBase64 = Utilities.base64Encode(pdfContentBytes);
    Logger.log('PDF file successfully encoded to base64');

    // Prepare the payload for the API request
    // This payload configures the PDF to PDF/A conversion settings
    var payload = {
      "docContent": pdfBase64,       // Base64 encoded PDF document content
      "docName": "output",           // Name for the output file
      "compliance": "PdfA1b",        // PDF/A level: PdfA1a/PdfA1b/PdfA2a/PdfA2b/PdfA2u/PdfA3a/PdfA3b/PdfA3u
      "allowUpgrade": true,          // Allow upgrading to higher compliance (true/false)
      "allowDowngrade": true,        // Allow downgrading to lower compliance (true/false)
      "async": true                  // Enable asynchronous processing
    };

    // Available PDF/A compliance options:
    // - "PdfA1b": PDF/A-1b (Level B basic conformance) - Most common
    // - "PdfA1a": PDF/A-1a (Level A accessible conformance) - Includes accessibility features
    // - "PdfA2b": PDF/A-2b (Part 2 basic compliance) - Supports newer PDF features
    // - "PdfA2u": PDF/A-2u (Part 2 with Unicode mapping)
    // - "PdfA2a": PDF/A-2a (Part 2 accessible compliance)
    // - "PdfA3b": PDF/A-3b (Part 3 basic - allows file embedding)
    // - "PdfA3u": PDF/A-3u (Part 3 with Unicode mapping)
    // - "PdfA3a": PDF/A-3a (Part 3 accessible compliance)

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

    Logger.log('Sending PDF to PDF/A conversion request to PDF4Me API...');
    Logger.log('Converting: ' + fileName + ' → ' + outputFileName);
    

    // Send the PDF to the API for conversion
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('API response code: ' + code);
    
    // Only log response content for debugging if there's an error
    if (code !== 200 && code !== 202) {
      Logger.log('API response: ' + response.getContentText());
    }

    // If conversion is synchronous and successful
    if (code === 200) {
      Logger.log('PDF/A conversion completed successfully!');
      
      // Check if response is a direct PDF file
      var contentType = response.getHeaders()['content-type'] || response.getHeaders()['Content-Type'] || '';
      var responseBytes = response.getBlob().getBytes();
      
      if (contentType.indexOf('application/pdf') !== -1 || 
          contentType.indexOf('application/octet-stream') !== -1 || 
          responseBytes.length > 4 && 
          responseBytes[0] === 0x25 && responseBytes[1] === 0x50 && 
          responseBytes[2] === 0x44 && responseBytes[3] === 0x46) { // %PDF signature
        
        
        var pdfBlob = response.getBlob().setName(outputFileName);
        
        // Get the output folder by name
        var outputFolders = DriveApp.getFoldersByName(outputFolderName);
        if (!outputFolders.hasNext()) {
          Logger.log('Output folder not found: ' + outputFolderName);
          return;
        }
        var outputFolder = outputFolders.next();
        outputFolder.createFile(pdfBlob);
        Logger.log('PDF/A file saved to folder: ' + outputFolderName);
        Logger.log('File is now compliant with PDF/A archival standards');
        return;
      }
      
      // Try to parse JSON response if it's not a binary PDF
      try {
        var result = JSON.parse(response.getContentText());
        Logger.log('Successfully parsed JSON response');
        
        // Look for PDF data in different possible JSON locations
        var pdfBase64Result = null;
        if (result.document && result.document.docData) {
          pdfBase64Result = result.document.docData;  // Common location 1
        } else if (result.docData) {
          pdfBase64Result = result.docData;           // Common location 2
        } else if (result.data) {
          pdfBase64Result = result.data;              // Alternative location
        }
        
        if (pdfBase64Result) {
          try {
            // Decode base64 PDF data and save to file
            var pdfBytes = Utilities.base64Decode(pdfBase64Result);
            var pdfBlob = Utilities.newBlob(pdfBytes, 'application/pdf', outputFileName);
            
            // Get the output folder by name
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (!outputFolders.hasNext()) {
              Logger.log('Output folder not found: ' + outputFolderName);
              return;
            }
            var outputFolder = outputFolders.next();
            outputFolder.createFile(pdfBlob);
            Logger.log('PDF/A file saved to folder: ' + outputFolderName);
            Logger.log('File is now compliant with PDF/A archival standards');
          } catch (e) {
            Logger.log('Error saving PDF: ' + e.toString());
          }
        } else {
          Logger.log('No PDF data found in the response.');
          Logger.log('Full response: ' + JSON.stringify(result));
        }
        
      } catch (e) {
        Logger.log('Failed to parse JSON response: ' + e.toString());
        var responseText = response.getContentText();
        Logger.log('Raw response text: ' + responseText.substring(0, 500) + '...');  // Show first 500 characters
      }
      return;
    }
    
    // If conversion is asynchronous, poll for the result
    else if (code === 202) {
      Logger.log('Request accepted. PDF4Me is processing the conversion asynchronously...');
      
      // Get the polling URL from the Location header
      var headersAll = response.getAllHeaders();
      var locationUrl = headersAll['Location'] || headersAll['location'];
      if (!locationUrl) {
        Logger.log("No 'Location' header found in the response.");
        Logger.log("Cannot proceed without polling URL for checking conversion status.");
        return;
      }
      
      // Poll the API until the conversion is complete or times out
      var maxRetries = 10;    // Maximum number of polling attempts before timeout
      var retryDelay = 10 * 1000; // 10 seconds to wait between each polling attempt
      
      for (var i = 0; i < maxRetries; i++) {
        Logger.log('Waiting for conversion result... (Attempt ' + (i + 1) + '/' + maxRetries + ')');
        Logger.log('Processing PDF and converting to PDF/A archival format...');
        Utilities.sleep(retryDelay);
        
        // Poll the conversion status
        var pollResponse = UrlFetchApp.fetch(locationUrl, {
          method: 'get',
          headers: headers,
          muteHttpExceptions: true
        });
        var pollCode = pollResponse.getResponseCode();
        
        // If conversion is complete, save the PDF/A file
        if (pollCode === 200) {
          Logger.log('PDF/A conversion completed successfully!');
          
          // Validate and save the PDF/A file
          var responseBytes = pollResponse.getBlob().getBytes();
          if ((responseBytes.length > 4 && 
               responseBytes[0] === 0x25 && responseBytes[1] === 0x50 && 
               responseBytes[2] === 0x44 && responseBytes[3] === 0x46) || // %PDF signature
              responseBytes.length > 1000) { // PDF files are typically larger than 1KB
            
            var pdfBlob = pollResponse.getBlob().setName(outputFileName);
            
            // Get the output folder by name
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (!outputFolders.hasNext()) {
              Logger.log('Output folder not found: ' + outputFolderName);
              return;
            }
            var outputFolder = outputFolders.next();
            outputFolder.createFile(pdfBlob);
            Logger.log('PDF/A file saved successfully to folder: ' + outputFolderName);
            Logger.log('File is now compliant with PDF/A archival standards');
          } else {
            Logger.log('Warning: Response doesn\'t appear to be a valid PDF');
            Logger.log('Response size: ' + responseBytes.length + ' bytes');
            if (responseBytes.length > 0) {
              Logger.log('First few bytes: ' + responseBytes.slice(0, Math.min(20, responseBytes.length)));
            }
          }
          return;
        } 

        // If still processing, continue polling
        else if (pollCode === 202) {
          Logger.log('Conversion still in progress...');
          continue;
        } 
        // If error during polling, log and exit
        else {
          Logger.log('Error during polling. Status: ' + pollCode);
          Logger.log('Response: ' + pollResponse.getContentText());
          return;
        }
      }
      
      // If polling times out, log a timeout message
      Logger.log('Timeout: PDF/A conversion did not complete after multiple retries.');
      Logger.log('The conversion may be taking longer due to PDF complexity or server load.');
    } 
    // If initial API call fails, log the error
    else {
      Logger.log('Error: Failed to convert PDF to PDF/A. Status code: ' + code);
      Logger.log('Error details: ' + response.getContentText());
    }
  } catch (e) {
    // Log any exceptions that occur during the process
    Logger.log('Exception: ' + e.toString());
    Logger.log('Stack trace: ' + e.stack);
  }
}