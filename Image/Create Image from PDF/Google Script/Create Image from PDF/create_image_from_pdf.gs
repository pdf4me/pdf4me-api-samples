function createImageFromPdf() {
  // Configuration
  var apiKey = 'YOUR_API_KEY_HERE';
  var baseUrl = 'https://api.pdf4me.com/';
  
  // File configuration
  var inputFolderName = 'Input';
  var outputFolderName = 'Output';
  var inputFileName = 'input.pdf';
  var outputFileName = 'output.jpg';
  
  // PDF to Image configuration
  var pageNumber = 1; // Page number to convert (1-based)
  var imageFormat = 'jpg'; // Output format: jpg, png, gif, bmp, tiff
  var quality = 90; // Image quality (1-100)
  var maxWidth = 1920; // Maximum width in pixels
  var maxHeight = 1080; // Maximum height in pixels
  
  try {
    // Get input folder
    var inputFolder = DriveApp.getFoldersByName(inputFolderName).next();
    
    // Get input PDF file
    var inputFile = inputFolder.getFilesByName(inputFileName).next();
    var pdfBlob = inputFile.getBlob();
    var pdfBase64 = Utilities.base64Encode(pdfBlob.getBytes());
    
    // Prepare API request
    var url = `${baseUrl}api/v2/CreateImageFromPdf`;
    var headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    
    var payload = {
      imageName: outputFileName,
      pdfContent: pdfBase64,
      pageNumber: pageNumber,
      imageFormat: imageFormat,
      quality: quality,
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      async: true
    };
    
    // Make API request
    var response = UrlFetchApp.fetch(url, {
      method: 'POST',
      headers: headers,
      payload: JSON.stringify(payload)
    });
    
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();
    
    if (responseCode === 200) {
      // Synchronous response
      var responseData = JSON.parse(responseText);
      var imageBase64 = responseData.imageContent;
      
      // Save output image
      var outputFolder = DriveApp.getFoldersByName(outputFolderName).next();
      var imageBlob = Utilities.newBlob(Utilities.base64Decode(imageBase64), 'image/' + imageFormat, outputFileName);
      outputFolder.createFile(imageBlob);
      
      Logger.log('PDF page successfully converted to image');
      Logger.log('Output file: ' + outputFileName);
      
    } else if (responseCode === 202) {
      // Asynchronous response
      var locationHeader = response.getHeaders()['Location'];
      if (locationHeader) {
        var jobId = locationHeader.split('/').pop();
        Logger.log('Processing started asynchronously. Job ID: ' + jobId);
        
        // Poll for completion
        var maxAttempts = 30;
        var attempt = 0;
        var completed = false;
        
        while (attempt < maxAttempts && !completed) {
          Utilities.sleep(2000); // Wait 2 seconds between polls
          
          var statusResponse = UrlFetchApp.fetch(`${baseUrl}api/v2/Job/${jobId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`
            }
          });
          
          var statusCode = statusResponse.getResponseCode();
          if (statusCode === 200) {
            var statusData = JSON.parse(statusResponse.getContentText());
            
            if (statusData.status === 'completed') {
              // Get the result
              var resultResponse = UrlFetchApp.fetch(`${baseUrl}api/v2/Job/${jobId}/result`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${apiKey}`
                }
              });
              
              var resultData = JSON.parse(resultResponse.getContentText());
              var imageBase64 = resultData.imageContent;
              
              // Save output image
              var outputFolder = DriveApp.getFoldersByName(outputFolderName).next();
              var imageBlob = Utilities.newBlob(Utilities.base64Decode(imageBase64), 'image/' + imageFormat, outputFileName);
              outputFolder.createFile(imageBlob);
              
              Logger.log('PDF page successfully converted to image');
              Logger.log('Output file: ' + outputFileName);
              completed = true;
              
            } else if (statusData.status === 'failed') {
              Logger.log('Processing failed: ' + statusData.error);
              break;
            }
          }
          
          attempt++;
        }
        
        if (!completed) {
          Logger.log('Processing timed out after ' + maxAttempts + ' attempts');
        }
      }
    } else {
      Logger.log('Error: ' + responseCode + ' - ' + responseText);
    }
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
  }
} 