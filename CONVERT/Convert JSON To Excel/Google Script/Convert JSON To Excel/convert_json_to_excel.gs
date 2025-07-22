function convertJsonToExcel() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ConvertJsonToExcel`;
  
  // Set the folder and file name for the input JSON
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var fileName = 'row.json'; // <-- Set your file name here

//         ===  Set the file ID for the input JSON ===
// var jsonFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q'; // 
// To get the file ID from Google Drive:
// 1. Right-click the file in Google Drive and select "Get link".
// 2. The link will look like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
// 3. Copy the long string between '/d/' and '/view' — that's your FILE_ID.
// Example: For https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
//          The file ID is: 1A2B3C4D5E6F7G8H9I0J
//          ===  Set the file ID for the input JSON ===

  // Set the output file name for the converted Excel document
  var outputFileName = 'JSON_to_EXCEL_output.xlsx';//Set your file name here
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
             //var file = DriveApp.getFileById(jsonFileId);
    // === File ID as input END ===

    // Get the file as a blob and parse JSON content
    var jsonBlob = file.getBlob();
    Logger.log('File name: ' + file.getName());
    Logger.log('File size: ' + jsonBlob.getBytes().length);

    // Get JSON content as string and parse it
    var jsonContentString = jsonBlob.getDataAsString();
    var jsonData;
    try {
      jsonData = JSON.parse(jsonContentString);
      Logger.log('JSON parsed successfully');
    } catch (parseError) {
      Logger.log('Error: Invalid JSON format - ' + parseError.toString());
      return;
    }

    // Prepare the payload for the API request
// Base64 encode the JSON string
var jsonBase64 = Utilities.base64Encode(jsonContentString);

// Prepare the payload for the API request
var payload = {
    docContent: jsonBase64,           // Base64-encoded JSON string
    docName: outputFileName.replace('.xlsx', ''),
    worksheetName: "Sheet1",
    isTitleWrapText: true,
    isTitleBold: true,
    convertNumberAndDate: false,
    numberFormat: "11",
    dateFormat: "01/01/2025",
    ignoreNullValues: false,
    firstRow: 1,
    firstColumn: 1,
    async: true
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

    // Send the JSON to the API for conversion
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('API response code: ' + code);
    
    // Only log response content if there's an error (not for successful Excel data)
    if (code !== 200 && code !== 202) {
      Logger.log('API response: ' + response.getContentText());
    }

    // If conversion is synchronous and successful
    if (code === 200) {
      var excelBlob = response.getBlob().setName(outputFileName);
        // Get the output folder by name
        var outputFolders = DriveApp.getFoldersByName(outputFolderName);
        if (!outputFolders.hasNext()) {
          Logger.log('Output folder not found: ' + outputFolderName);
          return;
        }
        var outputFolder = outputFolders.next();
        outputFolder.createFile(excelBlob);
        Logger.log('Excel document saved to folder: ' + outputFolderName);
          return;
        }
    // If conversion is asynchronous, poll for the result
    else if (code === 202) {
      // Get the polling URL from the Location header
      var headersAll = response.getAllHeaders();
      var locationUrl = headersAll['Location'] || headersAll['location'];
      if (!locationUrl) {
        Logger.log("No 'Location' header found in the response.");
        return;
      }
      // Poll the API until the conversion is complete or times out
      var maxRetries = 10;
      var retryDelay = 10 * 1000; // 10 seconds
      for (var i = 0; i < maxRetries; i++) {
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
          var excelBlob = pollResponse.getBlob().setName(outputFileName);

        // Get the output folder by name
        var outputFolders = DriveApp.getFoldersByName(outputFolderName);
        if (!outputFolders.hasNext()) {
          Logger.log('Output folder not found: ' + outputFolderName);
          return;
        }
        var outputFolder = outputFolders.next();
        outputFolder.createFile(excelBlob);
        Logger.log('Excel document saved to folder: ' + outputFolderName);
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
      Logger.log('Timeout: Conversion did not complete after multiple retries.');
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