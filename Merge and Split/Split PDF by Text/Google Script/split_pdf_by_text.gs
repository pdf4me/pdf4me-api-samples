
  
  function splitPdfByText() {
  /**
   * Split a PDF file by text using PDF4Me API
   * Process: Read PDF file → Encode to base64 → Send API request → Poll for completion → Save split PDF files
   * PDF text splitting divides PDF documents at specified text locations
   */
  
  // API Configuration - PDF4me service for splitting PDF by text
  var apiKey = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';

  // Set the PDF4Me API endpoint URL
    var baseUrl = "https://api.pdf4me.com/";
  var url = baseUrl + "api/v2/SplitByText";
  
  // Set the folder and file name for the input PDF
  var folderName = 'PDF4ME input'; // <-- Set your input folder name here
  var fileName = 'sample.pdf'; // <-- Set your PDF file name here
  
  // Set the output folder name for split PDF files
  var outputFolderName = 'Split_PDF_Text_outputs'; // <-- Set your output folder name here
  var parentFolderName = 'PDF4ME output'; // <-- Set your parent folder name here

  //         ===  Alternative: Set the file ID for the input PDF ===
  // var pdfFileId = '1Py5fWBBgk0gmRRfZnrSyYUOOZEsUkk8q'; // 
  // To get the file ID from Google Drive:
  // 1. Right-click the file in Google Drive and select "Get link".
  // 2. The link will look like: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // 3. Copy the long string between '/d/' and '/view' — that's your FILE_ID.

  try {
    console.log("Splitting PDF by text...");

    // === Folder structure file input START ===
    // Check if the input PDF file exists before proceeding
    var folders = DriveApp.getFoldersByName(folderName);
    if (!folders.hasNext()) {
      console.log('Error: Input folder not found: ' + folderName);
      console.log('Error: PDF file not found at ' + folderName + '/' + fileName);
      return;
    }
    
    // Get the first folder found
    var folder = folders.next();
    
    // Get the file by name within the folder
    var files = folder.getFilesByName(fileName);
    if (!files.hasNext()) {
      console.log('Error: Input PDF file not found: ' + fileName + ' in folder: ' + folderName);
      console.log('Error: PDF file not found at ' + folderName + '/' + fileName);
      return;
    }
    
    // Get the first file found
    var file = files.next();
    // === Folder structure file input END ===

    // === Alternative File ID as input START ===
    // var file = DriveApp.getFileById(pdfFileId);
    // === Alternative File ID as input END ===

    // Create output folder if it doesn't exist
    var outputFolder;
    
    // Method 1: Using parent folder name
    var parentFolders = DriveApp.getFoldersByName(parentFolderName);
    if (!parentFolders.hasNext()) {
      console.log('Error: Parent folder not found: ' + parentFolderName);
      console.log('Creating parent folder: ' + parentFolderName);
      var parentFolder = DriveApp.createFolder(parentFolderName);
    } else {
      var parentFolder = parentFolders.next();
      console.log('Found parent folder: ' + parentFolderName);
    }
    
    // Method 2: Alternative - Using parent folder ID (more reliable)
    // var parentFolder = DriveApp.getFolderById(parentFolderId);
    
    // Check if output folder already exists in the parent folder
    var existingOutputFolders = parentFolder.getFoldersByName(outputFolderName);
    if (!existingOutputFolders.hasNext()) {
      outputFolder = parentFolder.createFolder(outputFolderName);
      console.log('Created output folder: ' + outputFolderName + ' in parent folder: ' + parentFolderName);
    } else {
      outputFolder = existingOutputFolders.next();
      console.log('Using existing output folder: ' + outputFolderName + ' in parent folder: ' + parentFolderName);
    }

    // Read and encode the PDF file to base64 format
    try {
      var pdfBlob = file.getBlob();
      var pdfContent = Utilities.base64Encode(pdfBlob.getBytes());
      console.log('PDF file loaded: ' + folderName + '/' + fileName + ' (Base64 length: ' + pdfContent.length + ' characters)');
    } catch (e) {
      console.log('Error reading PDF file: ' + e.toString());
      return;
    }

    // Request headers with authentication
    var headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + apiKey
    };
    
    // Request payload with PDF content and text split parameters
    var payload = {
      "docContent": pdfContent,                           // Base64 encoded PDF content
      "docName": file.getName(),                          // Source PDF file name with extension
      "text": "page 1, line 10.",                        // Text to search for splitting
      "splitTextPage": "after",                          // Split position: before, after
      "fileNaming": "NameAsPerOrder",                    // File naming convention
      "async": true                                      // Enable asynchronous processing
    };

    console.log("Sending PDF text split request to PDF4me API...");
    
    // Set the options for the API request
    var options = {
      method: 'post',
      headers: headers,
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    // Make the API request to split PDF by text
    try {
      var response = UrlFetchApp.fetch(url, options);
      var code = response.getResponseCode();
      
      // Log detailed response information for debugging 
      console.log('Response Status Code: ' + code );
      var allHeaders = response.getAllHeaders();
     
      
    } catch (e) {
      console.log('Error making API request: ' + e.toString());
      return;
    }

    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 - Success: PDF splitting completed immediately
      console.log(" Success PDF text splitting completed!");
      console.log("Parsing API response...");
      
      // Parse JSON response to get split PDF documents
      try {
        var splitData = JSON.parse(response.getContentText());
        console.log('Response type: ' + typeof splitData);
        
        if (Array.isArray(splitData)) {
          console.log('Found ' + splitData.length + ' split PDF documents in response');
          // Handle array of split documents
          for (var i = 0; i < splitData.length; i++) {
            var document = splitData[i];
            console.log('Processing document ' + (i + 1) + '...');
            
            if (typeof document === 'object' && document.docContent && document.docName) {
              // Decode base64 content and save each PDF
              var base64Content = document.docContent;
              console.log('Base64 content length: ' + base64Content.length + ' characters');
              
              try {
                var pdfContentBytes = Utilities.base64Decode(base64Content);
                console.log('Decoded PDF content length: ' + pdfContentBytes.length + ' bytes');
                
                var outputBlob = Utilities.newBlob(pdfContentBytes, 'application/pdf', document.docName);
                outputFolder.createFile(outputBlob);
                console.log(' Split PDF ' + (i + 1) + ' saved: ' + document.docName + ' (' + pdfContentBytes.length + ' bytes)');
                
              } catch (decodeError) {
                console.log('Error decoding base64 for document ' + (i + 1) + ': ' + decodeError.toString());
                // Save base64 content as text file for debugging
                var debugBlob = Utilities.newBlob(base64Content, 'text/plain', 'debug_doc_' + (i + 1) + '_base64.txt');
                outputFolder.createFile(debugBlob);
                console.log('Base64 content saved for debugging: debug_doc_' + (i + 1) + '_base64.txt');
              }
            } else {
              console.log('Document ' + (i + 1) + ' missing required fields (docContent/docName)');
              console.log('Available fields: ' + (typeof document === 'object' ? Object.keys(document).join(', ') : 'Not an object'));
            }
          }
          
          console.log(' All ' + splitData.length + ' split PDF documents processed in folder: ' + outputFolderName);
        } else {

          if (typeof splitData === 'object' && splitData.splitedDocuments) {
            // Handle splitedDocuments structure
            console.log("Found splitedDocuments structure in response");
            var splitDocuments = splitData.splitedDocuments;
            
            if (Array.isArray(splitDocuments) && splitDocuments.length > 0) {
              console.log('Found ' + splitDocuments.length + ' split PDF documents in response');
              // Handle array of split documents
              for (var i = 0; i < splitDocuments.length; i++) {
                var document = splitDocuments[i];
                console.log('Processing document ' + (i + 1) + '...');
                
                if (typeof document === 'object' && document.streamFile && document.fileName) {
                  // Decode base64 content and save each PDF
                  var base64Content = document.streamFile;
                  console.log('Base64 content length: ' + base64Content.length + ' characters');
                  
                  try {
                    var pdfContentBytes = Utilities.base64Decode(base64Content);
                    console.log('Decoded PDF content length: ' + pdfContentBytes.length + ' bytes');
                    
                    var outputBlob = Utilities.newBlob(pdfContentBytes, 'application/pdf', document.fileName);
                    outputFolder.createFile(outputBlob);
                    console.log(' Split PDF ' + (i + 1) + ' saved: ' + document.fileName + ' (' + pdfContentBytes.length + ' bytes)');
                    
                  } catch (decodeError) {
                    console.log('Error decoding base64 for document ' + (i + 1) + ': ' + decodeError.toString());
                    // Save base64 content as text file for debugging
                    var debugBlob = Utilities.newBlob(base64Content, 'text/plain', 'debug_doc_' + (i + 1) + '_base64.txt');
                    outputFolder.createFile(debugBlob);
                    console.log('Base64 content saved for debugging: debug_doc_' + (i + 1) + '_base64.txt');
                  }
                } else {
                  console.log('Document ' + (i + 1) + ' missing required fields (streamFile/fileName)');
                  console.log('Available fields: ' + (typeof document === 'object' ? Object.keys(document).join(', ') : 'Not an object'));
                }
              }
              
              console.log('All ' + splitDocuments.length + ' split PDF documents processed in folder: ' + outputFolderName);
            } else {
              console.log("splitedDocuments is empty or not a list");
              var rawResponseBlob = Utilities.newBlob(JSON.stringify(splitData, null, 2), 'application/json', 'raw_response.json');
              outputFolder.createFile(rawResponseBlob);
              console.log('Raw JSON response saved to: raw_response.json');
            }
          }
          
          else if (typeof splitData === 'object' && splitData.docContent && splitData.docName) {
            // Handle single document response
            console.log("Found single document in response");
            var base64Content = splitData.docContent;
            var pdfContentBytes = Utilities.base64Decode(base64Content);
            var outputBlob = Utilities.newBlob(pdfContentBytes, 'application/pdf', splitData.docName);
            outputFolder.createFile(outputBlob);
            console.log('Single PDF saved: ' + splitData.docName + ' (' + pdfContentBytes.length + ' bytes)');
          } else {
            console.log("Unexpected response format - saving raw response for analysis");
            var rawResponseBlob = Utilities.newBlob(JSON.stringify(splitData, null, 2), 'application/json', 'raw_response.json');
            outputFolder.createFile(rawResponseBlob);
            console.log('Raw JSON response saved to: raw_response.json');
          }
        }
                    
      } catch (e) {
        console.log('Error parsing split PDF documents: ' + e.toString());
        // Save raw response as fallback
        var rawResponseBlob = Utilities.newBlob(response.getContent(), 'application/octet-stream', 'raw_response.bin');
        outputFolder.createFile(rawResponseBlob);
        console.log('Raw response saved to: raw_response.bin');
      }
      
      return;
    }
        
    else if (code === 202) {
      // 202 - Accepted: API is processing the request asynchronously
      console.log("202 - Request accepted. Processing asynchronously...");
      
      // Get the polling URL from the Location header for checking status
      var allHeaders = response.getAllHeaders();
      var locationUrl = allHeaders['Location'] || allHeaders['location'];
      console.log('Location URL: ' + (locationUrl ? locationUrl : 'NOT FOUND'));
      
      if (!locationUrl) {
        console.log("Error: No polling URL found in response");
        return;
      }

      // Retry logic for polling the result
      var maxRetries = 20;
      var retryDelay = 10 * 1000; // 10 seconds

      // Poll the API until PDF text splitting is complete
      for (var attempt = 0; attempt < maxRetries; attempt++) {
        console.log('Checking status... (Attempt ' + (attempt + 1) + '/' + maxRetries + ')');
        Utilities.sleep(retryDelay);

        // Check the processing status by calling the polling URL
        try {
          var responseSplit = UrlFetchApp.fetch(locationUrl, {
            method: 'get',
            headers: headers,
            muteHttpExceptions: true
          });
          var pollCode = responseSplit.getResponseCode();
          console.log('Poll response status: ' + pollCode);
        } catch (e) {
          console.log('Error polling status: ' + e.toString());
          continue;
        }

        if (pollCode === 200) {
          // 200 - Success: Processing completed
          console.log("Success PDF text splitting completed!");
          
          // Parse JSON response to get split PDF documents
          try {
            console.log("Parsing polling response...");
            var splitData = JSON.parse(responseSplit.getContentText());
            console.log('Response type: ' + typeof splitData);
            
            if (Array.isArray(splitData)) {
              console.log('Found ' + splitData.length + ' split PDF documents in response');
              // Handle array of split documents
              for (var i = 0; i < splitData.length; i++) {
                var document = splitData[i];
                console.log('Processing document ' + (i + 1) + '...');
              
                
                if (typeof document === 'object' && document.docContent && document.docName) {
                  // Decode base64 content and save each PDF
                  var base64Content = document.docContent;
                  console.log('Base64 content length: ' + base64Content.length + ' characters');
                  
                  try {
                    var pdfContentBytes = Utilities.base64Decode(base64Content);
                    console.log('Decoded PDF content length: ' + pdfContentBytes.length + ' bytes');
                    
                    var outputBlob = Utilities.newBlob(pdfContentBytes, 'application/pdf', document.docName);
                    outputFolder.createFile(outputBlob);
                    console.log('Split PDF ' + (i + 1) + ' saved: ' + document.docName + ' (' + pdfContentBytes.length + ' bytes)');
                    
                  } catch (decodeError) {
                    console.log('Error decoding base64 for document ' + (i + 1) + ': ' + decodeError.toString());
                    // Save base64 content as text file for debugging
                    var debugBlob = Utilities.newBlob(base64Content, 'text/plain', 'debug_doc_' + (i + 1) + '_base64.txt');
                    outputFolder.createFile(debugBlob);
                    console.log('Base64 content saved for debugging: debug_doc_' + (i + 1) + '_base64.txt');
                  }
                } else {
                  console.log('Document ' + (i + 1) + ' missing required fields (docContent/docName)');
                  console.log('Available fields: ' + (typeof document === 'object' ? Object.keys(document).join(', ') : 'Not an object'));
                }
              }
              
              console.log('All ' + splitData.length + ' split PDF documents processed in folder: ' + outputFolderName);
            } else {
             
              if (typeof splitData === 'object' && splitData.splitedDocuments) {
                // Handle splitedDocuments structure
                console.log("Found splitedDocuments structure in response");
                var splitDocuments = splitData.splitedDocuments;
                
                if (Array.isArray(splitDocuments) && splitDocuments.length > 0) {
                  console.log('Found ' + splitDocuments.length + ' split PDF documents in response');
                  // Handle array of split documents
                  for (var i = 0; i < splitDocuments.length; i++) {
                    var document = splitDocuments[i];
                    console.log('Processing document ' + (i + 1) + '...');
               
                    
                    if (typeof document === 'object' && document.streamFile && document.fileName) {
                      // Decode base64 content and save each PDF
                      var base64Content = document.streamFile;
                      console.log('Base64 content length: ' + base64Content.length + ' characters');
                      
                      try {
                        var pdfContentBytes = Utilities.base64Decode(base64Content);
                        console.log('Decoded PDF content length: ' + pdfContentBytes.length + ' bytes');
                        
                        var outputBlob = Utilities.newBlob(pdfContentBytes, 'application/pdf', document.fileName);
                        outputFolder.createFile(outputBlob);
                        console.log('Split PDF ' + (i + 1) + ' saved: ' + document.fileName + ' (' + pdfContentBytes.length + ' bytes)');
                        
                      } catch (decodeError) {
                        console.log('Error decoding base64 for document ' + (i + 1) + ': ' + decodeError.toString());
                        // Save base64 content as text file for debugging
                        var debugBlob = Utilities.newBlob(base64Content, 'text/plain', 'debug_doc_' + (i + 1) + '_base64.txt');
                        outputFolder.createFile(debugBlob);
                        console.log('Base64 content saved for debugging: debug_doc_' + (i + 1) + '_base64.txt');
                      }
                    } else {
                      console.log('Document ' + (i + 1) + ' missing required fields (streamFile/fileName)');
                      console.log('Available fields: ' + (typeof document === 'object' ? Object.keys(document).join(', ') : 'Not an object'));
                    }
                  }
                  
                  console.log('All ' + splitDocuments.length + ' split PDF documents processed in folder: ' + outputFolderName);
                } else {
                  console.log("splitedDocuments is empty or not a list");
                  var rawResponseBlob = Utilities.newBlob(JSON.stringify(splitData, null, 2), 'application/json', 'raw_response.json');
                  outputFolder.createFile(rawResponseBlob);
                  console.log('Raw JSON response saved to: raw_response.json');
                }
              }
              
              else if (typeof splitData === 'object' && splitData.docContent && splitData.docName) {
                // Handle single document response
                console.log("Found single document in response");
                var base64Content = splitData.docContent;
                var pdfContentBytes = Utilities.base64Decode(base64Content);
                var outputBlob = Utilities.newBlob(pdfContentBytes, 'application/pdf', splitData.docName);
                outputFolder.createFile(outputBlob);
                console.log('Single PDF saved: ' + splitData.docName + ' (' + pdfContentBytes.length + ' bytes)');
              } else {
                console.log("Unexpected response format - saving raw response for analysis");
                var rawResponseBlob = Utilities.newBlob(JSON.stringify(splitData, null, 2), 'application/json', 'raw_response.json');
                outputFolder.createFile(rawResponseBlob);
                console.log('Raw JSON response saved to: raw_response.json');
              }
            }
                        
          } catch (e) {
            console.log('Error parsing split PDF documents: ' + e.toString());
            // Save raw response as fallback
            var rawResponseBlob = Utilities.newBlob(responseSplit.getContent(), 'application/octet-stream', 'raw_response.bin');
            outputFolder.createFile(rawResponseBlob);
            console.log('Raw response saved to: raw_response.bin');
          }
          
          return;
        }
                
        else if (pollCode === 202) {
          // Still processing, continue polling
          console.log("Still processing (202)...");
          continue;
        } else {
          // Error occurred during processing
          console.log('Error during processing: ' + pollCode + ' - ' + responseSplit.getContentText());
          return;
        }
      }

      // If we reach here, polling timed out
      console.log("Timeout: Processing did not complete after multiple retries");
    } 
    
    else {
      // Other status codes - Error
      console.log('Error: ' + code + ' - ' + response.getContentText());
    }

  } catch (e) {
    // Log any exceptions that occur during the process
    console.log('Exception: ' + e.toString());
    console.log('Stack trace: ' + e.stack);
  }
}

// Main execution function - equivalent to Python's if __name__ == "__main__"
function main() {
  console.log("Splitting PDF by text...");
  splitPdfByText();
}