function convertWordToPdfForm() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ConvertWordToPdfForm`;
  
  // Set the folder and file name for the input Word document
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var fileName = 'sample.docx'; // <-- Set your file name here

//         ===  Alternative: Set the file ID for the input Word document ===
// var wordFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q'; // 
// To get the file ID from Google Drive:
// 1. Right-click the file in Google Drive and select "Get link".
// 2. The link will look like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
// 3. Copy the long string between '/d/' and '/view' — that's your FILE_ID.
// Example: For https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
//          The file ID is: 1A2B3C4D5E6F7G8H9I0J
//          ===  Set the file ID for the input Word document ===

  // Set the output file name for the converted PDF form
  var outputFileName = 'Word_to_PDF_Form_output.pdf';
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
    //var file = DriveApp.getFileById(wordFileId);
    // === File ID as input END ===

    // Get the file as a blob
    var wordBlob = file.getBlob();
    Logger.log('File name: ' + file.getName());
    Logger.log('File size: ' + wordBlob.getBytes().length);

    // Get Word content as string and encode to base64
    var wordContentBytes = wordBlob.getBytes();
    var wordBase64 = Utilities.base64Encode(wordContentBytes);
    Logger.log('Word file successfully encoded to base64');

    // Prepare the payload for the API request
    // This is the minimal payload required for Word to PDF form conversion
    var payload = {
      "docContent": wordBase64,      // Base64 encoded Word document content
      "docName": "output.pdf",       // Name for the output PDF file
      "async": true                  // Enable asynchronous processing
    };

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

    Logger.log('Sending Word to PDF form conversion request to PDF4Me API...');
    Logger.log('Converting: ' + fileName + ' → ' + outputFileName);

    // Send the Word document to the API for conversion
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('API response code: ' + code);
    
    // Display debug information about the API response
   
    Logger.log('Response content length: ' + response.getBlob().getBytes().length);

    // If conversion is synchronous and successful
    if (code === 200) {
      Logger.log('Word to PDF form conversion completed successfully!');
      
      var responseContent = response.getBlob().getBytes();
      
      // Check if response is a binary PDF file
      var responseHeaders = response.getAllHeaders();
      var contentType = responseHeaders['content-type'] || responseHeaders['Content-Type'] || '';
      var isPdfResponse = contentType.startsWith('application/pdf') || 
                         contentType === 'application/octet-stream' || 
                         (responseContent.length > 4 && 
                          responseContent[0] === 37 && responseContent[1] === 80 && 
                          responseContent[2] === 68 && responseContent[3] === 70); // %PDF
      
      if (isPdfResponse) {
        var pdfBlob = response.getBlob().setName(outputFileName);
        
        // Get the output folder by name
        var outputFolders = DriveApp.getFoldersByName(outputFolderName);
        if (!outputFolders.hasNext()) {
          Logger.log('Output folder not found: ' + outputFolderName);
          return;
        }
        var outputFolder = outputFolders.next();
        outputFolder.createFile(pdfBlob);
        Logger.log('PDF form saved to ' + outputFileName);
        return;
      }
      
      // Try to parse JSON response if it's not a binary PDF
      try {
        var result = JSON.parse(response.getContentText());
        Logger.log('Successfully parsed JSON response');
        
        // Look for PDF data in different possible JSON locations
        var pdfBase64 = null;
        if (result.document && result.document.docData) {
          pdfBase64 = result.document.docData;  // Common location 1
        } else if (result.docData) {
          pdfBase64 = result.docData;           // Common location 2
        } else if (result.data) {
          pdfBase64 = result.data;              // Alternative location
        }
        
        if (pdfBase64) {
          try {
            // Decode base64 PDF data and save to file
            var pdfBytes = Utilities.base64Decode(pdfBase64);
            var pdfBlob = Utilities.newBlob(pdfBytes, 'application/pdf', outputFileName);
            
            // Get the output folder by name
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (!outputFolders.hasNext()) {
              Logger.log('Output folder not found: ' + outputFolderName);
              return;
            }
            var outputFolder = outputFolders.next();
            outputFolder.createFile(pdfBlob);
            Logger.log('PDF form saved to ' + outputFileName);
          } catch (e) {
            Logger.log('Error saving PDF: ' + e.toString());
          }
        } else {
          Logger.log('No PDF data found in the response.');
          Logger.log('Full response: ' + JSON.stringify(result));
        }
        
      } catch (e) {
        Logger.log('Failed to parse JSON response: ' + e.toString());
        Logger.log('Raw response text: ' + response.getContentText().substring(0, 500) + '...'); // Show first 500 characters
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
        Logger.log('Waiting for result... (Attempt ' + (i + 1) + '/' + maxRetries + ')');
        Logger.log('Converting Word document to PDF form with fillable fields...');
        Utilities.sleep(retryDelay);
        
        // Check the conversion status by calling the polling URL
        var pollResponse = UrlFetchApp.fetch(locationUrl, {
          method: 'get',
          headers: headers,
          muteHttpExceptions: true
        });
        var pollCode = pollResponse.getResponseCode();
        
        // If conversion is complete, save the PDF form
        if (pollCode === 200) {
          Logger.log('Word to PDF form conversion completed successfully!');
          
          var pdfBlob = pollResponse.getBlob().setName(outputFileName);
          
          // Validate and save the PDF form
          var responseBytes = pdfBlob.getBytes();
          var isValidPdf = (responseBytes.length > 1000 && 
                           responseBytes[0] === 37 && responseBytes[1] === 80 && 
                           responseBytes[2] === 68 && responseBytes[3] === 70); // %PDF
          
          if (isValidPdf) {
            // Get the output folder by name
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (!outputFolders.hasNext()) {
              Logger.log('Output folder not found: ' + outputFolderName);
              return;
            }
            var outputFolder = outputFolders.next();
            outputFolder.createFile(pdfBlob);
            Logger.log('PDF form saved successfully to: ' + outputFileName);
          } else {
            Logger.log('Warning: Response doesn\'t appear to be a valid PDF');
            Logger.log('First 100 bytes: ' + responseBytes.slice(0, 100));
          }
          return;
        } 

        // If still processing, continue polling
        else if (pollCode === 202) {
          Logger.log('Still processing...');
          continue;
        } 
        // If error during polling, log and exit
        else {
          Logger.log('Error during polling. Status code: ' + pollCode);
          Logger.log('Response text: ' + pollResponse.getContentText());
          return;
        }
      }
      
      // If polling times out, log a timeout message
      Logger.log('Timeout: Word to PDF form conversion did not complete after multiple retries.');
    } 
    // If initial API call fails, log the error
    else {
      Logger.log('Error: Failed to convert Word to PDF form. Status code: ' + code);
      Logger.log('Response text: ' + response.getContentText());
    }
  } catch (e) {
    // Log any exceptions that occur during the process
    Logger.log('Exception: ' + e.toString());
    Logger.log('Stack trace: ' + e.stack);
  }
}
