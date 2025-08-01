function getImageMetadata() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/GetImageMetadata`;
  
  // Set the folder and file name for the input image
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var fileName = 'sample.jpg'; // <-- Set your image file name here

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

    // Get the file as a blob (binary data)
    var imageBlob = file.getBlob();
    Logger.log('Image file name: ' + file.getName());
    Logger.log('Image file size: ' + imageBlob.getBytes().length);

    // Encode the file as base64 for API transmission
    var imageBase64 = Utilities.base64Encode(imageBlob.getBytes());

    // Prepare the payload for the API request
    var payload = {
        imageContent: imageBase64        // Base64 encoded image content
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

    // Send the image to the API for metadata extraction
    Logger.log('Sending get image metadata request...');
    Logger.log('Input image file: ' + fileName);
    Logger.log('Extracting image metadata...');
    
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('API response code: ' + code);
    
    // Only log response content if there's an error (not for successful binary data)
    if (code !== 200 && code !== 202) {
      Logger.log('API response: ' + response.getContentText());
    }

    // If processing is successful
    if (code === 200) {
      Logger.log('Image metadata extraction completed successfully!');
      // Read the metadata from the response
      var responseText = response.getContentText();
      var metadata = JSON.parse(responseText);
      
      // Log metadata information
      Logger.log('Image Metadata:');
      Logger.log('File Name: ' + fileName);
      
      if (metadata.width) {
        Logger.log('Width: ' + metadata.width + ' pixels');
      }
      
      if (metadata.height) {
        Logger.log('Height: ' + metadata.height + ' pixels');
      }
      
      if (metadata.format) {
        Logger.log('Format: ' + metadata.format);
      }
      
      if (metadata.fileSize) {
        Logger.log('File Size: ' + metadata.fileSize + ' bytes');
      }
      
      if (metadata.colorSpace) {
        Logger.log('Color Space: ' + metadata.colorSpace);
      }
      
      if (metadata.dpi) {
        Logger.log('DPI: ' + metadata.dpi);
      }
      
      if (metadata.exifData) {
        Logger.log('EXIF Data:');
        for (var key in metadata.exifData) {
          Logger.log('  ' + key + ': ' + metadata.exifData[key]);
        }
      }
      
      if (metadata.iccProfile) {
        Logger.log('ICC Profile: ' + metadata.iccProfile);
      }
      
      if (metadata.compression) {
        Logger.log('Compression: ' + metadata.compression);
      }
      
      if (metadata.bitDepth) {
        Logger.log('Bit Depth: ' + metadata.bitDepth);
      }
      
      if (metadata.channels) {
        Logger.log('Channels: ' + metadata.channels);
      }
      
      Logger.log('Metadata extraction completed successfully');
      return;
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