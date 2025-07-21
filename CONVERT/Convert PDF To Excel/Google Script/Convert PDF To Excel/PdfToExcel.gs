function convertPdfToExcel() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ConvertPdfToExcel`;
  
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

  // Set the output file name for the converted Excel document
  var outputFileName = 'PDF_to_EXCEL_output.xlsx';
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
    // This payload configures the PDF to Excel conversion settings
    var payload = {
      "docContent": pdfBase64,       // Base64 encoded PDF document content
      "docName": "output.pdf",       // Name of the source PDF file for reference
      "qualityType": "Draft",        // Quality setting: Draft (faster) or Quality (better accuracy)
      "mergeAllSheets": true,        // Combine all Excel sheets into one (true) or separate sheets (false)
      "language": "English",         // OCR language for text recognition in images/scanned PDFs
      "outputFormat": true,          // Preserve original formatting when possible
      "ocrWhenNeeded": true,         // Use OCR (Optical Character Recognition) for scanned PDFs
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

    Logger.log('Sending PDF to Excel conversion request to PDF4Me API...');

    // Send the PDF to the API for conversion
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('API response code: ' + code);
    
    // Only log response content if there's an error (not for successful Excel data)
    if (code !== 200 && code !== 202) {
      Logger.log('API response: ' + response.getContentText());
    }

    // If conversion is synchronous and successful
    if (code === 200) {
      Logger.log('PDF to Excel conversion completed successfully!');
      
      var excelBlob = response.getBlob().setName(outputFileName);
      
      // Validate the response contains Excel data
      if (excelBlob.getBytes().length > 1000) { // Excel files are typically larger than 1KB
        // Get the output folder by name
        var outputFolders = DriveApp.getFoldersByName(outputFolderName);
        if (!outputFolders.hasNext()) {
          Logger.log('Output folder not found: ' + outputFolderName);
          return;
        }
        var outputFolder = outputFolders.next();
        outputFolder.createFile(excelBlob);
        Logger.log('Excel file saved successfully to folder: ' + outputFolderName);
        Logger.log('PDF data has been extracted and converted to Excel spreadsheet format');
      } else {
        Logger.log('Warning: Response seems too small to be a valid Excel file');
        Logger.log('Response size: ' + excelBlob.getBytes().length + ' bytes');
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
        Logger.log('Processing PDF content and extracting data into Excel format...');
        Utilities.sleep(retryDelay);
        
        // Poll the conversion status
        var pollResponse = UrlFetchApp.fetch(locationUrl, {
          method: 'get',
          headers: headers,
          muteHttpExceptions: true
        });
        var pollCode = pollResponse.getResponseCode();
        
        // If conversion is complete, save the Excel file
        if (pollCode === 200) {
          Logger.log('PDF to Excel conversion completed successfully!');
          
          var excelBlob = pollResponse.getBlob().setName(outputFileName);
          
          // Validate the response contains Excel data
          if (excelBlob.getBytes().length > 1000) { // Excel files are typically larger than 1KB
            // Get the output folder by name
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (!outputFolders.hasNext()) {
              Logger.log('Output folder not found: ' + outputFolderName);
              return;
            }
            var outputFolder = outputFolders.next();
            outputFolder.createFile(excelBlob);
            Logger.log('Excel file saved successfully to folder: ' + outputFolderName);
          } else {
            Logger.log('Warning: Response seems too small to be a valid Excel file');
            Logger.log('Response size: ' + excelBlob.getBytes().length + ' bytes');
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
          Logger.log(pollResponse.getContentText());
          return;
        }
      }
      
      // If polling times out, log a timeout message
      Logger.log('Timeout: PDF to Excel conversion did not complete after multiple retries.');
      Logger.log('The conversion may be taking longer due to PDF complexity or server load.');
    } 
    // If initial API call fails, log the error
    else {
      Logger.log('Error: Failed to convert PDF to Excel. Status code: ' + code);
      Logger.log('Error details: ' + response.getContentText());
    }
  } catch (e) {
    // Log any exceptions that occur during the process
    Logger.log('Exception: ' + e.toString());
    Logger.log('Stack trace: ' + e.stack);
  }
}