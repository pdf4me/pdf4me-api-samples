function convertVisioToPdf() {
  // Set your PDF4Me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  // Set the PDF4Me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ConvertVisio?schemaVal=PDF`;
  
  // Set the folder and file name for the input Visio file
  var folderName = 'PDF4ME input'; // <-- Set your folder name here
  var fileName = 'E-Commerce.vsdx'; // <-- Set your Visio file name here (.vsdx, .vsd, .vsdm)

//         ===  Alternative: Set the file ID for the input Visio file ===
// var visioFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q'; // 
// To get the file ID from Google Drive:
// 1. Right-click the file in Google Drive and select "Get link".
// 2. The link will look like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
// 3. Copy the long string between '/d/' and '/view' — that's your FILE_ID.
// Example: For https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
//          The file ID is: 1A2B3C4D5E6F7G8H9I0J
//          ===  Set the file ID for the input Visio file ===

  // Set the output file name for the converted PDF document
  var outputFileName = 'VISIO_to_PDF_output.pdf';
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
    //var file = DriveApp.getFileById(visioFileId);
    // === File ID as input END ===

    // Get the file as a blob
    var visioBlob = file.getBlob();
    Logger.log('File name: ' + file.getName());
    Logger.log('File size: ' + visioBlob.getBytes().length);

    // Get Visio content as bytes and encode to base64
    var visioContentBytes = visioBlob.getBytes();
    var visioBase64 = Utilities.base64Encode(visioContentBytes);
    Logger.log('Visio file successfully encoded to base64');

    // Prepare the payload for the API request
    // This payload is specifically for PDF output format
    var payload = {
      "docContent": visioBase64,           // Base64 encoded file content
      "docName": "output",                 // Name for the output file
      "OutputFormat": "PDF",               // Desired output format (PDF/JPG/PNG/TIFF)
      "IsPdfCompliant": true,              // Make PDF compliant with standards
      "PageIndex": 0,                      // Start from first page (0-indexed)
      "PageCount": 5,                      // Number of pages to convert (1-100)
      "IncludeHiddenPages": true,          // Include hidden pages (true/false)
      "SaveForegroundPage": true,          // Save foreground elements (true/false)
      "SaveToolBar": true,                 // Include toolbar (true/false)
      "AutoFit": true,                     // Auto-fit content to page (true/false)
      "async": true                        // Enable asynchronous processing
    };

    // Alternative payload examples for other output formats:
    
    // For JPG Output - Image format with quality settings
    // var payload = {
    //     "docContent": visioBase64,
    //     "docName": "output",
    //     "OutputFormat": "JPG",               // JPEG image format
    //     "PageIndex": 0,
    //     "PageCount": 5,
    //     "JpegQuality": 80,                   // Image quality (0-100, higher = better quality)
    //     "ImageBrightness": 1.0,              // Brightness adjustment (1.0 = normal)
    //     "ImageContrast": 1.0,                // Contrast adjustment (1.0 = normal)
    //     "ImageColorMode": "RGB",             // Color mode: RGB or Grayscale
    //     "CompositingQuality": "HighQuality", // Quality of image compositing
    //     "InterpolationMode": "High",         // Image scaling quality
    //     "PixelOffsetMode": "HighQuality",    // Pixel rendering quality
    //     "Resolution": 300,                   // DPI resolution (300 = high quality)
    //     "Scale": 1.0,                        // Scaling factor (1.0 = original size)
    //     "SmoothingMode": "HighQuality",      // Anti-aliasing quality
    //     "AutoFit": true
    // };

    // For PNG Output - Lossless image format with transparency support
    // var payload = {
    //     "docContent": visioBase64,
    //     "docName": "output",
    //     "OutputFormat": "PNG",               // PNG image format (supports transparency)
    //     "PageIndex": 0,
    //     "PageCount": 5,
    //     "ImageBrightness": 1.0,
    //     "ImageContrast": 1.0,
    //     "ImageColorMode": "RGBA",            // RGBA (with alpha/transparency) or RGB
    //     "CompositingQuality": "HighQuality",
    //     "InterpolationMode": "High",
    //     "PixelOffsetMode": "HighQuality",
    //     "Resolution": 300,
    //     "Scale": 1.0,
    //     "SmoothingMode": "HighQuality",
    //     "AutoFit": true
    // };

    // For TIFF Output - High-quality format often used for archival/printing
    // var payload = {
    //     "docContent": visioBase64,
    //     "docName": "output",
    //     "OutputFormat": "TIFF",              // TIFF image format
    //     "PageIndex": 0,
    //     "PageCount": 5,
    //     "ImageBrightness": 1.0,
    //     "ImageContrast": 1.0,
    //     "ImageColorMode": "Grayscale",       // Grayscale or RGB
    //     "TiffCompression": "LZW",            // Compression: LZW, None, or CCITT4
    //     "Resolution": 300,
    //     "Scale": 1.0,
    //     "SmoothingMode": "HighQuality",
    //     "AutoFit": true
    // };

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

    Logger.log('Sending Visio to PDF conversion request to PDF4Me API...');

    // Send the Visio file to the API for conversion
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('API response code: ' + code);
    
    // Only log response content if there's an error (not for successful PDF data)
    if (code !== 200 && code !== 202) {
      Logger.log('API response: ' + response.getContentText());
    }

    // If conversion is synchronous and successful
    if (code === 200) {
      Logger.log('Visio to PDF conversion completed successfully!');
      
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
        Logger.log('Visio diagrams have been converted to PDF format');
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
        Logger.log('Processing Visio diagrams and converting to PDF format...');
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
          Logger.log('Visio to PDF conversion completed successfully!');
          
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
      Logger.log('Timeout: Visio to PDF conversion did not complete after multiple retries.');
      Logger.log('The conversion may be taking longer due to Visio file complexity or server load.');
    } 
    // If initial API call fails, log the error
    else {
      Logger.log('Error: Failed to convert Visio to PDF. Status code: ' + code);
      Logger.log('Error details: ' + response.getContentText());
    }
  } catch (e) {
    // Log any exceptions that occur during the process
    Logger.log('Exception: ' + e.toString());
    Logger.log('Stack trace: ' + e.stack);
  }
}