function rotateImage() {
  // Configuration
  var apiKey = 'YOUR_API_KEY_HERE';
  var baseUrl = 'https://api.pdf4me.com/';
  
  // File configuration
  var inputFolderName = 'Input';
  var outputFolderName = 'Output';
  var inputFileName = 'input.jpg';
  var outputFileName = 'rotated.jpg';
  
  // Rotation configuration
  var angle = 90; // Rotation angle in degrees (90, 180, 270, -90, -180, -270)
  
  try {
    // Get input folder
    var inputFolder = DriveApp.getFoldersByName(inputFolderName).next();
    
    // Get input image file
    var inputFile = inputFolder.getFilesByName(inputFileName).next();
    var imageBlob = inputFile.getBlob();
    var imageBase64 = Utilities.base64Encode(imageBlob.getBytes());
    
    // Prepare API request
    var url = `${baseUrl}api/v2/RotateImage`;
    var headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    
    var payload = {
      imageName: outputFileName,
      imageContent: imageBase64,
      angle: angle,
      isAsync: true
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
      var rotatedImageBase64 = responseData.imageContent;
      
      // Save output image
      var outputFolder = DriveApp.getFoldersByName(outputFolderName).next();
      var outputImageBlob = Utilities.newBlob(Utilities.base64Decode(rotatedImageBase64), 'image/jpeg', outputFileName);
      outputFolder.createFile(outputImageBlob);
      
      Logger.log('Image successfully rotated');
      Logger.log('Output file: ' + outputFileName);
      Logger.log('Rotation angle: ' + angle + ' degrees');
      
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
              var rotatedImageBase64 = resultData.imageContent;
              
              // Save output image
              var outputFolder = DriveApp.getFoldersByName(outputFolderName).next();
              var outputImageBlob = Utilities.newBlob(Utilities.base64Decode(rotatedImageBase64), 'image/jpeg', outputFileName);
              outputFolder.createFile(outputImageBlob);
              
              Logger.log('Image successfully rotated');
              Logger.log('Output file: ' + outputFileName);
              Logger.log('Rotation angle: ' + angle + ' degrees');
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