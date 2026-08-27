function extractTableFromPdf() {
  // Set your PDF4me API key
  var apiKey = 'Get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/'; 
  
  // Set the PDF4me API endpoint URL
  var baseUrl = "https://api.pdf4me.com/";
  var url = `${baseUrl}api/v2/ExtractTableFromPdf`;
  
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

  // Set the output folder name for extracted tables
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
    // What extracting tables does:
    // - Extracts table structures and data from PDF documents
    // - Provides structured table data in JSON format
    // - Useful for data extraction, analysis, and spreadsheet processing
    var payload = {
      docName: file.getName(),                      // Name of the input PDF file
      docContent: pdfBase64,                        // Base64 encoded PDF document content
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

    // Send the initial table extraction request to the API
    Logger.log('Sending table extraction request to PDF4me API...');
    Logger.log('Processing table extraction: ' + fileName);

    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    Logger.log('Status code: ' + code);
    Logger.log('Response content length: ' + response.getContentText().length);

    // Handle different response scenarios based on status code
    if (code === 200) {
      // 200 means "Success" - table extraction completed successfully
      Logger.log('Success! Table extraction completed!');
      
      // Save the extracted table data
      try {
        // Check if response is JSON (table data) or binary content
        var contentType = response.getHeaders()['Content-Type'] || response.getHeaders()['content-type'] || '';
        
        if (contentType.indexOf('application/json') !== -1) {
          // Response contains JSON with extracted table data
          var tableData = JSON.parse(response.getContentText());
          
          // Process and save extracted table data
          processTableData(tableData, outputFolderName);
          
        } else {
          // Response is likely binary content (possibly Excel or CSV)
          var outputFolders = DriveApp.getFoldersByName(outputFolderName);
          if (!outputFolders.hasNext()) {
            Logger.log('Output folder not found: ' + outputFolderName);
            return;
          }
          var outputFolder = outputFolders.next();
          
          var outputExtension = determineFileExtension(response.getHeaders());
          var binaryBlob = response.getBlob().setName('extracted_tables' + outputExtension);
          outputFolder.createFile(binaryBlob);
          Logger.log('Table data saved: extracted_tables' + outputExtension);
        }
        
      } catch (e) {
        Logger.log('Error processing extracted table data: ' + e);
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
      // 202 means "Accepted" - API is processing the table extraction asynchronously
      Logger.log('202 - Request accepted. Processing asynchronously...');
      
      // Get the polling URL from the Location header
      var headersAll = response.getAllHeaders();
      var locationUrl = headersAll['Location'] || headersAll['location'];
      if (!locationUrl) {
        Logger.log("Error: No polling URL found in response");
        return;
      }

      // Retry logic for polling the result
      var maxRetries = 15;    // Maximum number of polling attempts
      var retryDelay = 12 * 1000; // 12 seconds between each polling attempt

      // Poll the API until table extraction is complete
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
          Logger.log('Success! Table extraction completed!');
          
          // Save the extracted table data
          try {
            // Check if response is JSON (table data) or binary content
            var contentType = responseExtraction.getHeaders()['Content-Type'] || responseExtraction.getHeaders()['content-type'] || '';
            
            if (contentType.indexOf('application/json') !== -1) {
              // Response contains JSON with extracted table data
              var tableData = JSON.parse(responseExtraction.getContentText());
              
              // Process and save extracted table data
              processTableData(tableData, outputFolderName);
              
            } else {
              // Response is likely binary content (possibly Excel or CSV)
              var outputFolders = DriveApp.getFoldersByName(outputFolderName);
              if (!outputFolders.hasNext()) {
                Logger.log('Output folder not found: ' + outputFolderName);
                return;
              }
              var outputFolder = outputFolders.next();
              
              var outputExtension = determineFileExtension(responseExtraction.getHeaders());
              var binaryBlob = responseExtraction.getBlob().setName('extracted_tables' + outputExtension);
              outputFolder.createFile(binaryBlob);
              Logger.log('Table data saved: extracted_tables' + outputExtension);
            }
            
          } catch (e) {
            Logger.log('Error processing extracted table data: ' + e);
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
      Logger.log('Timeout: Table extraction did not complete after multiple retries');
      
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

function processTableData(tableData, outputFolderName) {
  // Process and save extracted table data in JSON and CSV formats
  try {
    var outputFolders = DriveApp.getFoldersByName(outputFolderName);
    if (!outputFolders.hasNext()) {
      Logger.log('Output folder not found: ' + outputFolderName);
      return;
    }
    var outputFolder = outputFolders.next();
    
    // Save complete table data as JSON
    var jsonContent = JSON.stringify(tableData, null, 2);
    var jsonBlob = Utilities.newBlob(jsonContent, 'application/json', 'extracted_tables.json');
    outputFolder.createFile(jsonBlob);
    Logger.log('Table metadata saved: extracted_tables.json');
    
    var tableCount = 0;
    var totalRows = 0;
    
    // Process and save individual tables
    if (typeof tableData === 'object' && tableData.tables) {
      var tables = tableData.tables;
      if (tables && Array.isArray(tables)) {
        Logger.log('Found ' + tables.length + ' tables');
        tableCount = tables.length;
        
        for (var i = 0; i < tables.length; i++) {
          var table = tables[i];
          try {
            // Save each table as separate JSON file
            var tableJsonContent = JSON.stringify(table, null, 2);
            var tableJsonBlob = Utilities.newBlob(tableJsonContent, 'application/json', 'table_' + (i + 1) + '.json');
            outputFolder.createFile(tableJsonBlob);
            Logger.log('Table ' + (i + 1) + ' saved: table_' + (i + 1) + '.json');
            
            // Convert table to CSV if possible
            if (typeof table === 'object' && table.rows) {
              var csvContent = convertTableToCsv(table.rows);
              var csvBlob = Utilities.newBlob(csvContent, 'text/csv', 'table_' + (i + 1) + '.csv');
              outputFolder.createFile(csvBlob);
              Logger.log('Table ' + (i + 1) + ' CSV saved: table_' + (i + 1) + '.csv');
              
              if (Array.isArray(table.rows)) {
                totalRows += table.rows.length;
              }
            } else if (Array.isArray(table)) {
              var csvContent = convertTableToCsv(table);
              var csvBlob = Utilities.newBlob(csvContent, 'text/csv', 'table_' + (i + 1) + '.csv');
              outputFolder.createFile(csvBlob);
              Logger.log('Table ' + (i + 1) + ' CSV saved: table_' + (i + 1) + '.csv');
              
              totalRows += table.length;
            }
            
          } catch (e) {
            Logger.log('Error saving table ' + (i + 1) + ': ' + e);
          }
        }
      } else {
        Logger.log('No tables found in response');
      }
    }
    
    // Handle single table response
    else if (Array.isArray(tableData)) {
      // Direct table array
      tableCount = 1;
      totalRows = tableData.length;
      
      var csvContent = convertTableToCsv(tableData);
      var csvBlob = Utilities.newBlob(csvContent, 'text/csv', 'extracted_table.csv');
      outputFolder.createFile(csvBlob);
      Logger.log('Single table saved: extracted_table.csv');
    }
    
    // Display table summary
    displayTableSummary(tableCount, totalRows);
    
    // Create a summary text file
    var summaryContent = 'Table Extraction Summary\n' +
                        '========================\n' +
                        'Extracted on: ' + new Date().toString() + '\n\n' +
                        'Total tables extracted: ' + tableCount + '\n' +
                        'Total rows: ' + totalRows + '\n\n';
    
    if (tableCount > 0) {
      summaryContent += 'Table extraction completed successfully!\n';
    } else {
      summaryContent += 'No tables were found in the PDF\n';
    }
    
    var summaryBlob = Utilities.newBlob(summaryContent, 'text/plain', 'table_extraction_summary.txt');
    outputFolder.createFile(summaryBlob);
    Logger.log('Table extraction summary saved: table_extraction_summary.txt');
    
  } catch (e) {
    Logger.log('Error processing table data: ' + e);
    
    // Create error file
    var errorContent = 'Table Extraction Error\n' +
                      '=====================\n' +
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

function convertTableToCsv(tableRows) {
  // Convert table data to CSV format
  try {
    var csvContent = '';
    
    if (tableRows && Array.isArray(tableRows)) {
      if (tableRows.length > 0) {
        if (Array.isArray(tableRows[0])) {
          // Table is list of lists (rows with cells)
          for (var i = 0; i < tableRows.length; i++) {
            var row = tableRows[i];
            var csvRow = '';
            for (var j = 0; j < row.length; j++) {
              var cell = String(row[j] || '');
              // Escape quotes and wrap in quotes if contains comma or quote
              if (cell.indexOf(',') !== -1 || cell.indexOf('"') !== -1) {
                cell = '"' + cell.replace(/"/g, '""') + '"';
              }
              csvRow += (j > 0 ? ',' : '') + cell;
            }
            csvContent += csvRow + '\n';
          }
        } else if (typeof tableRows[0] === 'object') {
          // Table is list of dictionaries
          var fieldnames = Object.keys(tableRows[0]);
          // Write header
          csvContent += fieldnames.join(',') + '\n';
          // Write data rows
          for (var i = 0; i < tableRows.length; i++) {
            var row = tableRows[i];
            var csvRow = '';
            for (var j = 0; j < fieldnames.length; j++) {
              var cell = String(row[fieldnames[j]] || '');
              // Escape quotes and wrap in quotes if contains comma or quote
              if (cell.indexOf(',') !== -1 || cell.indexOf('"') !== -1) {
                cell = '"' + cell.replace(/"/g, '""') + '"';
              }
              csvRow += (j > 0 ? ',' : '') + cell;
            }
            csvContent += csvRow + '\n';
          }
        }
      }
    }
    
    return csvContent;
  } catch (e) {
    Logger.log('Error converting table to CSV: ' + e);
    return '';
  }
}

function determineFileExtension(headers) {
  // Determine file extension based on content type
  var contentType = (headers['Content-Type'] || headers['content-type'] || '').toLowerCase();
  if (contentType.indexOf('excel') !== -1 || contentType.indexOf('spreadsheet') !== -1) {
    return '.xlsx';
  } else if (contentType.indexOf('csv') !== -1) {
    return '.csv';
  } else {
    return '.bin';
  }
}

function displayTableSummary(tableCount, totalRows) {
  // Display summary of extracted tables
  Logger.log('Table Extraction Summary:');
  Logger.log('  Total tables extracted: ' + tableCount);
  Logger.log('  Total rows: ' + totalRows);
  
  if (tableCount > 0) {
    Logger.log('Table extraction completed successfully!');
  } else {
    Logger.log('No tables were found in the PDF');
  }
} 