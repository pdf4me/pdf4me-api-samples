function convertPdfToPowerpoint() {
  /**
   * Convert a PDF file to PowerPoint format using PDF4Me API
   * Process: Read PDF file → Encode to base64 → Send API request → Poll for completion → Save PowerPoint file
   * PDF to PowerPoint conversion transforms PDF pages into editable presentation slides
   */
  
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ConvertPdfToPowerPoint`;
  
  // Set the folder and file name for the input PDF
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var fileName = 'sample.pdf'; // <-- Set your PDF file name here

//         ===  Alternative: Set the file ID for the input PDF ===
// var pdfFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q'; // 
// To get the file ID from Google Drive:
// 1. Right-click the file in Google Drive and select "Get link".
// 2. The link will look like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
// 3. Copy the long string between '/d/' and '/view' — that's your FILE_ID.
// Example: For https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
//          The file ID is: 1A2B3C4D5E6F7G8H9I0J
//          ===  Set the file ID for the input PDF ===

  // Set the output file name for the converted PowerPoint
  var outputFileName = 'PDF_to_Powerpoint_output.pptx';
  var outputFolderName = 'PDF4ME output'; // <-- Set your output folder name here

  try {
    console.log("Starting PDF to PowerPoint conversion process...");

    // === Folder structure file input START ===

    // Get the folder by name
    var folders = DriveApp.getFoldersByName(folderName);
    if (!folders.hasNext()) {
      console.log('Error: Input folder not found: ' + folderName);
      return;
    }
    // Get the first folder found
    var folder = folders.next();
    // Get the file by name within the folder
    var files = folder.getFilesByName(fileName);
    if (!files.hasNext()) {
      console.log(`Error: Input PDF file not found: ${fileName} in folder: ${folderName}`);
      return;
    }
    // Get the first file found
    var file = files.next();

    // === Folder structure file input END ===

    // === File ID as input START ===
    //var file = DriveApp.getFileById(pdfFileId);
    // === File ID as input END ===

    // Get the PDF file as a blob
    var pdfBlob = file.getBlob();
    console.log('PDF file loaded: ' + file.getName() + ' (' + pdfBlob.getBytes().length + ' bytes)');

    // Get PDF content as bytes and encode to base64
    var pdfContentBytes = pdfBlob.getBytes();
    var pdfBase64 = Utilities.base64Encode(pdfContentBytes);
    console.log('PDF encoded to base64, sending conversion request...');

    // Prepare the payload (data) to send to the API
    // This payload configures the PDF to PowerPoint conversion settings
    var payload = {
      "docContent": pdfBase64,       // Base64 encoded PDF document content
      "docName": "output.pdf",       // Name of the source PDF file for reference
      "qualityType": "Draft",        // Quality setting: Draft (faster) or Quality (better accuracy)
      "language": "English",         // OCR language for text recognition in images/scanned PDFs
      "ocrWhenNeeded": true,         // Use OCR (Optical Character Recognition) for scanned PDFs
      "outputFormat": true,          // Preserve original formatting when possible
      "mergeAllSheets": true,        // Combine content appropriately for presentation format
      "async": true                  // Enable asynchronous processing
    };
    
    // About PDF to PowerPoint conversion features:
    // - qualityType "Draft": Faster conversion, good for simple PDFs with clear content
    // - qualityType "Quality": Slower but more accurate, better for complex layouts
    // - ocrWhenNeeded: Essential for scanned PDFs or PDFs with image-based text
    // - language: Improves OCR accuracy for non-English text recognition
    // - outputFormat: Tries to maintain original fonts, colors, and layout structure
    // - mergeAllSheets: Organizes multiple PDF pages into coherent slide sequence

    // Set the headers for the API request
    // Headers provide authentication and specify the data format being sent
    var headers = {
      'Authorization': 'Basic ' + apiKey,  // Authentication using Basic auth with API key
      'Content-Type': 'application/json'   // We're sending JSON data to the API
    };

    // Set the options for the API request
    var options = {
      method: 'post',
      headers: headers,
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    console.log('Sending PDF to PowerPoint conversion request to PDF4Me API...');
    
    // Send the PDF to the API for conversion
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    console.log('API response received with status code: ' + code);
    
    // Only log response content if there's an error (not for successful PowerPoint data)
    if (code !== 200 && code !== 202) {
      console.log('API response: ' + response.getContentText());
    }

    // Handle different response scenarios based on status code
    if (code === 200) {
      console.log('PDF to PowerPoint conversion completed successfully!');
      
      var pptxBlob = response.getBlob().setName(outputFileName);
      
      // Validate the response contains PowerPoint data
      if (pptxBlob.getBytes().length > 1000) {  // PowerPoint files are typically larger than 1KB
        // Get the output folder by name
        var outputFolders = DriveApp.getFoldersByName(outputFolderName);
        if (!outputFolders.hasNext()) {
          console.log('Output folder not found: ' + outputFolderName);
          return;
        }
        var outputFolder = outputFolders.next();
        outputFolder.createFile(pptxBlob);
        console.log('PowerPoint file saved successfully to: ' + outputFolderName);
      } else {
        console.log('Warning: Response too small, may not be a valid PowerPoint file (' + pptxBlob.getBytes().length + ' bytes)');
      }
      return;
    }
    
    // If conversion is asynchronous, poll for the result
    else if (code === 202) {
      console.log('Request accepted, processing conversion asynchronously...');
      
      // Get the polling URL from the Location header
      var headersAll = response.getAllHeaders();
      var locationUrl = headersAll['Location'] || headersAll['location'];
      console.log('Polling URL obtained, starting conversion monitoring...');
      
      // Verify that we received a polling URL for checking conversion status
      if (!locationUrl) {
        console.log("Error: No polling URL received from API response.");
        return;
      }

      // Retry logic for polling the conversion result
      var maxRetries = 10;    // Maximum number of polling attempts before timeout
      var retryDelay = 10 * 1000; // 10 seconds to wait between each polling attempt

      // Poll the API until conversion is complete or timeout occurs
      for (var i = 0; i < maxRetries; i++) {
        console.log('Checking conversion status... (Attempt ' + (i + 1) + '/' + maxRetries + ')');
        Utilities.sleep(retryDelay);  // Wait before checking status again

        // Check the conversion status by calling the polling URL
        try {
          var pollResponse = UrlFetchApp.fetch(locationUrl, {
            method: 'get',
            headers: headers,
            muteHttpExceptions: true
          });
          var pollCode = pollResponse.getResponseCode();
          
          // If conversion is complete, save the PowerPoint file
          if (pollCode === 200) {
            console.log('PDF to PowerPoint conversion completed successfully!');
            
            var pptxBlob = pollResponse.getBlob().setName(outputFileName);
            
            // Validate the response contains PowerPoint data
            if (pptxBlob.getBytes().length > 1000) {  // PowerPoint files are typically larger than 1KB
              // Get the output folder by name
              var outputFolders = DriveApp.getFoldersByName(outputFolderName);
              if (!outputFolders.hasNext()) {
                console.log('Output folder not found: ' + outputFolderName);
                return;
              }
              var outputFolder = outputFolders.next();
              outputFolder.createFile(pptxBlob);
              console.log('PowerPoint file saved successfully to: ' + outputFolderName);
            } else {
              console.log('Warning: Response too small, may not be a valid PowerPoint file (' + pptxBlob.getBytes().length + ' bytes)');
            }
            return;
          } 

          // If still processing, continue polling
          else if (pollCode === 202) {
            continue;
          } 
          // Error occurred during processing
          else {
            console.log('Error during polling - Status code: ' + pollCode + ' - ' + pollResponse.getContentText());
            return;
          }

        } catch (e) {
          // Handle network or request errors during polling
          console.log('Network error during polling: ' + e.toString());
          if (i < maxRetries - 1) {
            continue;
          } else {
            console.log('Max retries reached due to network errors.');
            return;
          }
        }
      }
      
      // If we reach here, polling timed out
      console.log('Timeout: Conversion did not complete after ' + maxRetries + ' attempts.');
    } 
    // All other status codes are errors
    else {
      console.log('Error: Failed to convert PDF to PowerPoint - Status: ' + code + ' - ' + response.getContentText());
      return;
    }
  } catch (e) {
    // Log any exceptions that occur during the process
    console.log('Exception: ' + e.toString());
    console.log('Stack trace: ' + e.stack);
  }
}