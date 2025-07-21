function convertUrlToPdf() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ConvertUrlToPdf`;
  
  // Set the target web page to convert and output configuration
  var targetUrl = "https://en.wikipedia.org/wiki/Microsoft_Power_Automate";  // Web page URL to convert
  var outputFileName = 'URL_to_PDF_output.pdf';  // Output PDF file name
  var outputFolderName = 'PDF4ME output'; // <-- Set your output folder name here

  try {
    Logger.log('Target URL: ' + targetUrl);
    Logger.log('Output file name: ' + outputFileName);
    Logger.log('Starting URL to PDF conversion process...');

    // Prepare the payload for the API request
    // This payload configures the URL to PDF conversion settings according to API documentation
    var payload = {
      "webUrl": targetUrl,           // Web URL of the page to be converted to PDF
      "authType": "NoAuth",          // Authentication type for URL website (NoAuth, Basic, etc.)
      "username": "",                // Username if authentication is required (empty for NoAuth)
      "password": "",                // Password if authentication is required (empty for NoAuth)
      "docContent": "",              // Base64 PDF content (empty for URL conversion)
      "docName": outputFileName,     // Output PDF file name with extension
      "layout": "portrait",          // Page orientation: "portrait" or "landscape"
      "format": "A4",                // Page format: A0-A8, Tabloid, Legal, Statement, Executive
      "scale": 1.0,                  // Scale factor for the web page (decimal format, e.g., 0.8 = 80%)
      "topMargin": "20px",           // Top margin of PDF (string format with px unit)
      "leftMargin": "20px",          // Left margin of PDF (string format with px unit)
      "rightMargin": "20px",         // Right margin of PDF (string format with px unit)
      "bottomMargin": "20px",        // Bottom margin of PDF (string format with px unit)
      "printBackground": true,       // Include background colors and images (boolean)
      "displayHeaderFooter": false,  // Show header and footer in PDF (boolean)
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

    Logger.log('Sending URL to PDF conversion request to PDF4Me API...');

    // Send the URL to the API for conversion
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('API response code: ' + code);
    
    // Only log response content if there's an error (not for successful PDF data)
    if (code !== 200 && code !== 202) {
      Logger.log('API response: ' + response.getContentText());
    }

    // If conversion is synchronous and successful
    if (code === 200) {
      Logger.log('URL to PDF conversion completed successfully!');
      
      var pdfBlob = response.getBlob().setName(outputFileName);
      
      // Validate the response contains PDF data
      if (pdfBlob.getBytes().length > 1000) { // PDF files are typically larger than 1KB
        // Get the output folder by name
        var outputFolders = DriveApp.getFoldersByName(outputFolderName);
        if (!outputFolders.hasNext()) {
          Logger.log('Output folder not found: ' + outputFolderName);
          return;
        }
        var outputFolder = outputFolders.next();
        outputFolder.createFile(pdfBlob);
        Logger.log('PDF file saved successfully to folder: ' + outputFolderName);
        Logger.log('Web page has been converted to PDF format with all styling and layout preserved');
      } else {
        Logger.log('Warning: Response seems too small to be a valid PDF file');
        Logger.log('Response size: ' + pdfBlob.getBytes().length + ' bytes');
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
        Logger.log('Processing web page content and generating PDF...');
        Utilities.sleep(retryDelay);
        
        // Poll the conversion status
        var pollResponse = UrlFetchApp.fetch(locationUrl, {
          method: 'get',
          headers: headers,
          muteHttpExceptions: true
        });
        var pollCode = pollResponse.getResponseCode();
        
        // If conversion is complete, save the PDF file
        if (pollCode === 200) {
          Logger.log('URL to PDF conversion completed successfully!');
          
          var pdfBlob = pollResponse.getBlob().setName(outputFileName);
          
          // Validate the response contains PDF data
          if (pdfBlob.getBytes().length > 1000) { // PDF files are typically larger than 1KB
            // Get the output folder by name
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (!outputFolders.hasNext()) {
              Logger.log('Output folder not found: ' + outputFolderName);
              return;
            }
            var outputFolder = outputFolders.next();
            outputFolder.createFile(pdfBlob);
            Logger.log('PDF file saved successfully to folder: ' + outputFolderName);
            Logger.log('Web page has been converted to PDF format with all styling and layout preserved');
          } else {
            Logger.log('Warning: Response seems too small to be a valid PDF file');
            Logger.log('Response size: ' + pdfBlob.getBytes().length + ' bytes');
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
      Logger.log('Timeout: URL to PDF conversion did not complete after multiple retries.');
      Logger.log('The conversion may be taking longer due to web page complexity or server load.');
    } 
    // If initial API call fails, log the error
    else {
      Logger.log('Error: Failed to convert URL to PDF. Status code: ' + code);
      Logger.log('Error details: ' + response.getContentText());
    }
  } catch (e) {
    // Log any exceptions that occur during the process
    Logger.log('Exception: ' + e.toString());
    Logger.log('Stack trace: ' + e.stack);
  }
}