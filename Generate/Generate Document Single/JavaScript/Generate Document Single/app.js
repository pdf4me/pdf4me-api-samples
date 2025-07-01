const fs = require('fs');
const path = require('path');

/**
 * Generate Document Single using PDF4Me API
 * Generates documents from templates (HTML/Word/PDF) with JSON/XML data
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for generating single documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/GenerateDocumentSingle`;

// File paths configuration
const TEMPLATE_FILE_PATH = "invoice_sample.pdf";      // Path to the template file (HTML/Word/PDF)
const JSON_DATA_PATH = "invoice_sample_data.json";   // Path to the JSON data file
const OUTPUT_PATH = "invoice_sample.generated.pdf";  // Output document file name (auto-determined)

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Read and encode file to base64 string
 * 
 * @param {string} filePath - Path to the file
 * @returns {string} Base64 encoded string of the file
 * @throws {Error} If file doesn't exist or can't be read
 */
function readAndEncodeFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        
        const fileContent = fs.readFileSync(filePath);
        return fileContent.toString('base64');
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`File not found: ${filePath}`);
        }
        throw new Error(`Error reading file: ${error.message}`);
    }
}

/**
 * Read JSON data from file
 * 
 * @param {string} jsonFilePath - Path to the JSON data file
 * @returns {string} JSON data as string
 * @throws {Error} If JSON file doesn't exist or can't be read
 */
function readJsonData(jsonFilePath) {
    try {
        if (!fs.existsSync(jsonFilePath)) {
            throw new Error(`JSON data file not found: ${jsonFilePath}`);
        }
        
        const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
        return jsonContent;
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`JSON data file not found: ${jsonFilePath}`);
        }
        throw new Error(`Error reading JSON data file: ${error.message}`);
    }
}

/**
 * Get file type and extension from file path
 * 
 * @param {string} filePath - Path to the file
 * @returns {Object} Object containing fileType and extension
 */
function getFileTypeAndExtension(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    
    switch (extension) {
        case '.html':
        case '.htm':
            return { fileType: 'html', extension: '.html' };
        case '.docx':
        case '.doc':
            return { fileType: 'Word', extension: '.docx' };
        case '.pdf':
            return { fileType: 'PDF', extension: '.pdf' };
        default:
            throw new Error(`Unsupported file type: ${extension}`);
    }
}

/**
 * Generate single document using PDF4Me API
 * 
 * @param {string} apiKey - API key for authentication
 * @param {string} baseUrl - Base URL for PDF4Me API
 * @param {string} templateFilePath - Path to the template file
 * @param {string} jsonDataPath - Path to the JSON data file
 * @returns {Promise<Response>} Response from the API
 * @throws {Error} For API request errors
 */
async function generateDocumentSingle(apiKey, baseUrl, templateFilePath, jsonDataPath) {
    try {
        // Read and encode the template file
        console.log("Reading and encoding template file...");
        const templateBase64 = readAndEncodeFile(templateFilePath);
        console.log("Template file successfully encoded to base64");

        // Read the JSON data
        console.log("Reading JSON data file...");
        const jsonData = readJsonData(jsonDataPath);
        console.log("JSON data file successfully read");

        // Determine file type and extension
        const { fileType, extension } = getFileTypeAndExtension(templateFilePath);
        const templateFileName = path.basename(templateFilePath);

        // API endpoint for generating single document
        const url = `${baseUrl}api/v2/GenerateDocumentSingle`;

        // Request headers
        const headers = {
            'Authorization': `Basic ${apiKey}`,
            'Content-Type': 'application/json'
        };

        // Request payload - dynamically configured based on input file type
        const payload = {
            "templateFileType": fileType,            // Template file type (Word/HTML/PDF) - auto-detected
            "templateFileName": templateFileName,    // Template file name with proper extension
            "templateFileData": templateBase64,     // Base64 encoded template file content
            "documentDataType": "text",              // Document data type (JSON/XML)
            "outputType": fileType,                  // Output document type (same as input type)
            "documentDataText": jsonData,           // JSON/XML data as text (required if documentDataFile not mapped)
            "async": true                            // For big files and too many calls async is recommended to reduce the server load
        };

        // Alternative payload examples for different scenarios:
        
        // Example 1: Word template with JSON data outputting to PDF
        // const payload = {
        //     "templateFileType": "Word",              // Template file type
        //     "templateFileName": "template.docx",     // Word template file name
        //     "templateFileData": templateBase64,     // Base64 encoded Word template
        //     "documentDataType": "JSON",              // Data type
        //     "outputType": "PDF",                     // Output as PDF
        //     "documentDataText": jsonData,           // JSON data as text
        //     "metaDataJson": "{}",                    // Additional metadata for fields in JSON format
        //     "async": true
        // };
        
        // Example 2: PDF template with XML data outputting to Word
        // const payload = {
        //     "templateFileType": "PDF",               // PDF template file type
        //     "templateFileName": "template.pdf",      // PDF template file name
        //     "templateFileData": templateBase64,     // Base64 encoded PDF template
        //     "documentDataType": "XML",               // XML data type
        //     "outputType": "Word",                    // Output as Word document
        //     "documentDataText": xmlData,            // XML data as text
        //     "metaDataJson": "{}",                    // Additional metadata
        //     "async": true
        // };
        
        // Example 3: HTML template with JSON data outputting to Excel
        // const payload = {
        //     "templateFileType": "HTML",              // HTML template file type
        //     "templateFileName": "template.html",     // HTML template file name
        //     "templateFileData": templateBase64,     // Base64 encoded HTML template
        //     "documentDataType": "JSON",              // JSON data type
        //     "outputType": "Excel",                   // Output as Excel file
        //     "documentDataText": jsonData,           // JSON data as text
        //     "metaDataJson": "{}",                    // Additional metadata
        //     "async": true
        // };
        
        // Example 4: Word template with data file (instead of text)
        // const payload = {
        //     "templateFileType": "Word",              // Template file type
        //     "templateFileName": "template.docx",     // Word template file name
        //     "templateFileData": templateBase64,     // Base64 encoded Word template
        //     "documentDataType": "JSON",              // Data type
        //     "outputType": "PDF",                     // Output as PDF
        //     "documentDataFile": dataFileBase64,     // Base64 encoded data file (alternative to documentDataText)
        //     "metaDataJson": "{}",                    // Additional metadata
        //     "async": true
        // };
        
        // Example 5: Complete payload with all optional parameters
        // const payload = {
        //     "templateFileType": "DOCX",              // Template file type (default: DOCX)
        //     "templateFileName": "invoice.docx",      // Template file name with extension
        //     "templateFileData": templateBase64,     // Base64 encoded template content
        //     "documentDataType": "JSON",              // Data type (default: JSON)
        //     "outputType": "PDF",                     // Output type (default: DOCX)
        //     "documentDataFile": dataFileBase64,     // Base64 encoded data file
        //     "documentDataText": jsonData,           // Manual data entry (use if documentDataFile not mapped)
        //     "fileMetaData": "{}",                    // Any additional metadata for fields
        //     "metaDataJson": "{}",                    // Output metadata in JSON format
        //     "async": true
        // };

        console.log("Sending generate document single request...");
        console.log(`Template file: ${templateFilePath}`);
        console.log(`Template file type: ${fileType}`);
        console.log(`JSON data file: ${jsonDataPath}`);
        console.log(`Output type: ${payload.outputType}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        return response;

    } catch (error) {
        throw new Error(`Error in generate document single request: ${error.message}`);
    }
}

/**
 * Handle API response and save the generated document
 * 
 * @param {Response} response - Response from the generate document single API
 * @param {string} apiKey - API key for authentication  
 * @param {string} outputPath - Path where the generated document will be saved
 * @returns {Promise<boolean>} True if successful, False otherwise
 */
async function handleAsyncResponseAndSave(response, apiKey, outputPath) {
    try {
        if (response.status === 200) {
            // Success: Simple success message + file saved
            console.log("Document generation completed successfully!");
            
            // Save the generated document
            const buffer = await response.arrayBuffer();
            fs.writeFileSync(outputPath, Buffer.from(buffer));
            console.log(`Generated document saved to: ${outputPath}`);
            return true;
            
        } else if (response.status === 202) {
            // Accepted: Asynchronous processing with retry logic
            console.log("Request accepted. Processing asynchronously...");
            
            // Get the location URL for polling
            const locationUrl = response.headers.get('Location');
            if (!locationUrl) {
                console.log("No 'Location' header found in the response.");
                return false;
            }
            
            console.log(`Polling URL: ${locationUrl}`);
            
            // Poll for completion with retry logic
            const headers = {
                'Authorization': `Basic ${apiKey}`
            };
            
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                console.log(`Polling attempt ${attempt}/${MAX_RETRIES}...`);
                
                if (attempt > 1) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                }
                
                const pollResponse = await fetch(locationUrl, {
                    method: 'GET',
                    headers: headers
                });
                
                if (pollResponse.status === 200) {
                    // Processing completed successfully
                    console.log("Document generation completed successfully!");
                    
                    // Save the generated document
                    const buffer = await pollResponse.arrayBuffer();
                    fs.writeFileSync(outputPath, Buffer.from(buffer));
                    console.log(`Generated document saved to: ${outputPath}`);
                    return true;
                    
                } else if (pollResponse.status === 202) {
                    // Still processing, continue polling
                    console.log("Still processing, waiting...");
                    continue;
                    
                } else {
                    // Error in polling
                    console.log(`Polling error: ${pollResponse.status}`);
                    const errorText = await pollResponse.text();
                    console.log(`Response: ${errorText}`);
                    return false;
                }
            }
            
            console.log("Timeout: Document generation did not complete after multiple retries.");
            return false;
            
        } else {
            // Other codes: Error message with status code and response text
            console.log(`Document generation failed with status code: ${response.status}`);
            const errorText = await response.text();
            console.log(`Response: ${errorText}`);
            return false;
        }
        
    } catch (error) {
        console.log(`Error handling response: ${error.message}`);
        return false;
    }
}

/**
 * Main function to generate single document
 * Orchestrates the entire document generation process
 */
async function main() {
    console.log("=== Generating Single Document ===");
    console.log("This generates documents from templates with data");
    console.log("Supports HTML, Word, and PDF templates with JSON/XML data");
    console.log("Output format automatically matches input format");
    console.log("-".repeat(60));

    try {
        // Validate input files exist
        if (!fs.existsSync(TEMPLATE_FILE_PATH)) {
            throw new Error(`Template file not found: ${TEMPLATE_FILE_PATH}`);
        }
        
        if (!fs.existsSync(JSON_DATA_PATH)) {
            throw new Error(`JSON data file not found: ${JSON_DATA_PATH}`);
        }

        // Determine file type and generate appropriate output path
        const { fileType, extension } = getFileTypeAndExtension(TEMPLATE_FILE_PATH);
        const baseName = path.basename(TEMPLATE_FILE_PATH, extension);
        const dynamicOutputPath = `${baseName}.generated${extension}`;

        console.log(`Template file: ${TEMPLATE_FILE_PATH}`);
        console.log(`Template file type: ${fileType}`);
        console.log(`JSON data file: ${JSON_DATA_PATH}`);
        console.log(`Output file: ${dynamicOutputPath}`);

        // Generate single document
        const response = await generateDocumentSingle(API_KEY, BASE_URL, TEMPLATE_FILE_PATH, JSON_DATA_PATH);

        // Handle response and save result
        const success = await handleAsyncResponseAndSave(response, API_KEY, dynamicOutputPath);

        if (success) {
            console.log("Document generation operation completed successfully!");
            console.log(`Generated ${fileType} document: ${dynamicOutputPath}`);
        } else {
            console.log("Document generation operation failed!");
        }
        
    } catch (error) {
        console.error("Error in main execution:", error.message);
        process.exit(1);
    }
}

// Main execution - Run the document generation when script is executed directly
if (require.main === module) {
    main().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = { 
    generateDocumentSingle, 
    handleAsyncResponseAndSave, 
    readAndEncodeFile, 
    readJsonData,
    getFileTypeAndExtension
}; 