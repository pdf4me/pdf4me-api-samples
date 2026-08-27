function extractResources() {
  // Set your PDF4me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  
  // Set the PDF4me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ExtractResources`;
  
  // Set the folder and file name for the input PDF
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var fileName = 'sample.pdf'; // <-- Set your file name here

  //         ===  Set the file ID for the input PDF ===
  // var pdfFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q'; // 
  // To get the file ID from Google Drive:
  // 1. Right-click the file in Google Drive and select "Get link".
  // 2. The link will look like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // 3. Copy the long string between '/d/' and '/view' — that's your FILE_ID.
  // Example: For https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
  //          The file ID is: 1A2B3C4D5E6F7G8H9I0J
  //          ===  Set the file ID for the input PDF ===

  // Set the output folder name for extracted resources
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
    // var file = DriveApp.getFileById(pdfFileId);
    // === File ID as input END ===

    // Get the file as a blob (binary data)
    var pdfBlob = file.getBlob();
    Logger.log('File name: ' + file.getName());
    Logger.log('File size: ' + pdfBlob.getBytes().length);
    Logger.log('PDF file successfully encoded to base64');

    // Encode the PDF file as base64 for API transmission
    var pdfBase64 = Utilities.base64Encode(pdfBlob.getBytes());

    // Prepare the payload for the API request
    // What extracting resources does:
    // - Extracts all text content and embedded images from PDF documents
    // - Provides structured data with text sections and image data
    // - Useful for content analysis, data extraction, and document processing
    var payload = {
      docContent: pdfBase64,                        // Base64 encoded PDF document content
      docName: file.getName(),                      // Name of the input PDF file
      extractText: true,                            // Extract text content from PDF
      extractImages: true,                           // Extract images from PDF
      isAsync: true                                   // Asynchronous processing
    };

    // Set the headers for the API request
    var headers = {
      'Authorization': 'Basic ' + apiKey,  // Authentication using Basic auth with API key
      'Content-Type': 'application/json'   // We're sending JSON data
    };

    // Set the options for the API request
    var options = {
      method: 'post',
      headers: headers,
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    // Send the initial resource extraction request to the API
    Logger.log('Sending resource extraction request to PDF4me API...');
    Logger.log('Processing resource extraction: ' + fileName);

    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('Status code: ' + code);
    Logger.log('Response content length: ' + response.getContentText().length);

    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 means "Success" - resource extraction completed successfully
      Logger.log('Success! Resource extraction completed!');
      
      // Save the extracted resources
      try {
        // Check if response is JSON (extracted data) or binary content
        var contentType = response.getHeaders()['Content-Type'] || response.getHeaders()['content-type'] || '';
        
        if (contentType.indexOf('application/json') !== -1) {
          // Response contains JSON with extracted text and images
          var resourceData = JSON.parse(response.getContentText());
          
          // Process and save extracted resources
          processResourceData(resourceData, outputFolderName);
          
        } else {
          // Response is likely binary content
          var outputFolders = DriveApp.getFoldersByName(outputFolderName);
          if (!outputFolders.hasNext()) {
            Logger.log('Output folder not found: ' + outputFolderName);
            return;
          }
          var outputFolder = outputFolders.next();
          
          var binaryBlob = response.getBlob().setName('extracted_resources.bin');
          outputFolder.createFile(binaryBlob);
          Logger.log('Binary resource data saved: extracted_resources.bin');
        }
        
      } catch (e) {
        Logger.log('Error processing extracted resources: ' + e);
        // Save raw response content as fallback
        var outputFolders = DriveApp.getFoldersByName(outputFolderName);
        if (outputFolders.hasNext()) {
          var outputFolder = outputFolders.next();
          var rawBlob = Utilities.newBlob(response.getContentText(), 'text/plain', 'raw_response.txt');
          outputFolder.createFile(rawBlob);
          Logger.log('Raw response saved: raw_response.txt');
        }
      }
      
    } else if (code === 202) {
      // 202 means "Accepted" - API is processing the resource extraction asynchronously
      Logger.log('202 - Request accepted. Processing asynchronously...');
      
      // Get the polling URL from the Location header
      var headersAll = response.getAllHeaders();
      var locationUrl = headersAll['Location'] || headersAll['location'];
      if (!locationUrl) {
        Logger.log("Error: No polling URL found in response");
        return;
      }

      // Retry logic for polling the result
      var maxRetries = 20;    // Maximum number of polling attempts (increased for resource extraction)
      var retryDelay = 15 * 1000; // 15 seconds between each polling attempt (increased for resource extraction)

      // Poll the API until resource extraction is complete
      for (var attempt = 0; attempt < maxRetries; attempt++) {
        Logger.log('Checking status... (Attempt ' + (attempt + 1) + '/' + maxRetries + ')');
        Utilities.sleep(retryDelay);  // Wait before next attempt

        // Check the processing status by calling the polling URL
        var responseExtraction = UrlFetchApp.fetch(locationUrl, {
          method: 'get',
          headers: headers,
          muteHttpExceptions: true
        });
        
        var pollCode = responseExtraction.getResponseCode();

        if (pollCode === 200) {
          // 200 - Success: Processing completed
          Logger.log('Success! Resource extraction completed!');
          
          // Save the extracted resources
          try {
            // Check if response is JSON (extracted data) or binary content
            var contentType = responseExtraction.getHeaders()['Content-Type'] || responseExtraction.getHeaders()['content-type'] || '';
            
            if (contentType.indexOf('application/json') !== -1) {
              // Response contains JSON with extracted text and images
              var resourceData = JSON.parse(responseExtraction.getContentText());
              
              // Process and save extracted resources
              processResourceData(resourceData, outputFolderName);
              
            } else {
              // Response is likely binary content
              var outputFolders = DriveApp.getFoldersByName(outputFolderName);
              if (!outputFolders.hasNext()) {
                Logger.log('Output folder not found: ' + outputFolderName);
                return;
              }
              var outputFolder = outputFolders.next();
              
              var binaryBlob = responseExtraction.getBlob().setName('extracted_resources.bin');
              outputFolder.createFile(binaryBlob);
              Logger.log('Binary resource data saved: extracted_resources.bin');
            }
            
          } catch (e) {
            Logger.log('Error processing extracted resources: ' + e);
            // Save raw response content as fallback
            var outputFolders = DriveApp.getFoldersByName(outputFolderName);
            if (outputFolders.hasNext()) {
              var outputFolder = outputFolders.next();
              var rawBlob = Utilities.newBlob(responseExtraction.getContentText(), 'text/plain', 'raw_response.txt');
              outputFolder.createFile(rawBlob);
              Logger.log('Raw response saved: raw_response.txt');
            }
          }
          return;
          
        } else if (pollCode === 202) {
          // Still processing, continue polling
          Logger.log('Still processing...');
          continue;
        } else {
          // Error occurred during processing
          Logger.log('Error during processing: ' + pollCode + ' - ' + responseExtraction.getContentText());
          return;
        }
      }

      // If we reach here, polling timed out
      Logger.log('Timeout: Resource extraction did not complete after multiple retries');
      
    } else {
      // Other status codes - Error
      Logger.log('Error: ' + code + ' - ' + response.getContentText());
      return;
    }
    
  } catch (e) {
    // Log any exceptions that occur during the process
    Logger.log('Exception: ' + e);
  }
}

function processResourceData(resourceData, outputFolderName) {
  // Process and save extracted resource data (text and images)
  try {
    var outputFolders = DriveApp.getFoldersByName(outputFolderName);
    if (!outputFolders.hasNext()) {
      Logger.log('Output folder not found: ' + outputFolderName);
      return;
    }
    var outputFolder = outputFolders.next();
    
    // Save complete resource data as JSON
    var jsonContent = JSON.stringify(resourceData, null, 2);
    var jsonBlob = Utilities.newBlob(jsonContent, 'application/json', 'extracted_resources.json');
    outputFolder.createFile(jsonBlob);
    Logger.log('Resource metadata saved: extracted_resources.json');
    
    var textCount = 0;
    var imageCount = 0;
    
    // Process extracted text
    if (typeof resourceData === 'object' && resourceData.texts) {
      var extractedText = resourceData.texts;
      if (extractedText) {
        var textContent = '';
        if (Array.isArray(extractedText)) {
          textContent = extractedText.join('\n');
          textCount = extractedText.length;
        } else {
          textContent = String(extractedText);
          textCount = 1;
        }
        
        var textBlob = Utilities.newBlob(textContent, 'text/plain', 'extracted_text.txt');
        outputFolder.createFile(textBlob);
        Logger.log('Extracted text saved: extracted_text.txt');
        Logger.log('Text preview: ' + textContent.substring(0, 200) + '...');
      } else {
        Logger.log('No text content found in PDF');
      }
    }
    
    // Process extracted images
    Logger.log('Response keys: ' + (typeof resourceData === 'object' ? Object.keys(resourceData).join(', ') : 'Not a dict'));
    
    // Try different possible field names for images
    var imageFields = ['images', 'Images', 'imageData', 'extractedImages', 'img', 'pictures'];
    var imagesFound = false;
    
    for (var i = 0; i < imageFields.length; i++) {
      var fieldName = imageFields[i];
      if (typeof resourceData === 'object' && resourceData[fieldName]) {
        var images = resourceData[fieldName];
        Logger.log('Found \'' + fieldName + '\' field with data type: ' + typeof images);
        
        if (images) {
          if (Array.isArray(images)) {
            Logger.log('Found ' + images.length + ' images in \'' + fieldName + '\' field');
            for (var j = 0; j < images.length; j++) {
              var imageData = images[j];
              Logger.log('Processing image ' + (j + 1) + ', type: ' + typeof imageData);
              
              var imageSaved = false;
              
              if (typeof imageData === 'object') {
                // Try different possible content field names
                var contentFields = ['content', 'data', 'base64', 'imageData', 'docContent'];
                for (var k = 0; k < contentFields.length; k++) {
                  var contentField = contentFields[k];
                  if (imageData[contentField]) {
                    Logger.log('Found image content in \'' + contentField + '\' field');
                    try {
                      var imageContent = Utilities.base64Decode(imageData[contentField]);
                      var imageName = imageData.name || imageData.docName || 'extracted_image_' + (j + 1) + '.png';
                      var imageBlob = Utilities.newBlob(imageContent).setName(imageName);
                      outputFolder.createFile(imageBlob);
                      Logger.log('Image saved: ' + imageName + ' (' + imageContent.length + ' bytes)');
                      imagesFound = true;
                      imageSaved = true;
                      imageCount++;
                      break;
                    } catch (e) {
                      Logger.log('Error decoding image from \'' + contentField + '\': ' + e);
                    }
                  }
                }
              } else if (typeof imageData === 'string' && imageData.length > 100) {
                // Likely base64 string
                Logger.log('Processing direct base64 string (length: ' + imageData.length + ')');
                try {
                  var imageContent = Utilities.base64Decode(imageData);
                  var imageName = 'extracted_image_' + (j + 1) + '.png';
                  var imageBlob = Utilities.newBlob(imageContent).setName(imageName);
                  outputFolder.createFile(imageBlob);
                  Logger.log('Image saved: ' + imageName + ' (' + imageContent.length + ' bytes)');
                  imagesFound = true;
                  imageSaved = true;
                  imageCount++;
                } catch (e) {
                  Logger.log('Error decoding direct base64: ' + e);
                }
              }
              
              if (!imageSaved) {
                Logger.log('Could not extract image ' + (j + 1) + '. Data structure:');
                if (typeof imageData === 'object') {
                  Logger.log('  Keys: ' + Object.keys(imageData).join(', '));
                  for (var key in imageData) {
                    var value = imageData[key];
                    Logger.log('  ' + key + ': ' + typeof value + ' (length: ' + (value ? String(value).length : 0) + ')');
                  }
                } else {
                  Logger.log('  Type: ' + typeof imageData + ', Length: ' + String(imageData).length);
                }
              }
            }
          } else if (typeof images === 'object') {
            // Single image object
            Logger.log('Single image object found in \'' + fieldName + '\'');
            try {
              var contentFields = ['content', 'data', 'base64', 'imageData', 'docContent'];
              for (var k = 0; k < contentFields.length; k++) {
                var contentField = contentFields[k];
                if (images[contentField]) {
                  var imageContent = Utilities.base64Decode(images[contentField]);
                  var imageName = images.name || images.docName || 'extracted_image.png';
                  var imageBlob = Utilities.newBlob(imageContent).setName(imageName);
                  outputFolder.createFile(imageBlob);
                  Logger.log('Single image saved: ' + imageName + ' (' + imageContent.length + ' bytes)');
                  imagesFound = true;
                  imageCount++;
                  break;
                }
              }
            } catch (e) {
              Logger.log('Error processing single image: ' + e);
            }
          } else if (typeof images === 'string' && images.length > 100) {
            // Direct base64 string
            Logger.log('Direct base64 string found in \'' + fieldName + '\' (length: ' + images.length + ')');
            try {
              var imageContent = Utilities.base64Decode(images);
              var imageName = 'extracted_image_' + fieldName + '.png';
              var imageBlob = Utilities.newBlob(imageContent).setName(imageName);
              outputFolder.createFile(imageBlob);
              Logger.log('Image saved: ' + imageName + ' (' + imageContent.length + ' bytes)');
              imagesFound = true;
              imageCount++;
            } catch (e) {
              Logger.log('Error decoding ' + fieldName + ' as base64: ' + e);
            }
          }
        } else {
          Logger.log('\'' + fieldName + '\' field is empty');
        }
        break; // Found the field, no need to check others
      }
    }
    
    if (!imagesFound) {
      Logger.log('No images found in PDF response');
      Logger.log('Full response preview: ' + String(resourceData).substring(0, 1000) + '...');
    } else {
      Logger.log('Successfully extracted images from PDF');
    }
    
    // Display summary
    Logger.log('Extraction Summary:');
    Logger.log('  Text sections: ' + textCount);
    Logger.log('  Images: ' + imageCount);
    
    // Create a summary text file
    var summaryContent = 'Resource Extraction Summary\n' +
                        '===========================\n' +
                        'Extracted on: ' + new Date().toString() + '\n\n' +
                        'Text sections: ' + textCount + '\n' +
                        'Images: ' + imageCount + '\n\n';
    
    if (resourceData.texts) {
      summaryContent += 'Text Content:\n';
      summaryContent += '=============\n';
      if (Array.isArray(resourceData.texts)) {
        for (var i = 0; i < resourceData.texts.length; i++) {
          summaryContent += 'Section ' + (i + 1) + ':\n' + resourceData.texts[i] + '\n\n';
        }
      } else {
        summaryContent += resourceData.texts + '\n\n';
      }
    }
    
    var summaryBlob = Utilities.newBlob(summaryContent, 'text/plain', 'resource_extraction_summary.txt');
    outputFolder.createFile(summaryBlob);
    Logger.log('Resource extraction summary saved: resource_extraction_summary.txt');
    
  } catch (e) {
    Logger.log('Error processing resource data: ' + e);
    
    // Create error file
    var errorContent = 'Resource Extraction Error\n' +
                      '=========================\n' +
                      'Error occurred on: ' + new Date().toString() + '\n\n' +
                      'Error details: ' + e + '\n';
    
    var errorBlob = Utilities.newBlob(errorContent, 'text/plain', 'extraction_error.txt');
    var outputFolders = DriveApp.getFoldersByName(outputFolderName);
    if (outputFolders.hasNext()) {
      var outputFolder = outputFolders.next();
      outputFolder.createFile(errorBlob);
      Logger.log('Error info saved: extraction_error.txt');
    }
  }
} 