const fs = require('fs');
const path = require('path');

/**
 * Rotate Document using PDF4Me API
 * Rotates entire PDF documents
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for rotating documents
const API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/Rotate`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                               // Input PDF file to process
const OUTPUT_PDF_PATH = "Rotate_document_PDF_output.pdf";          // Output PDF file name

// Processing configuration
const ROTATION_TYPE = "UpsideDown";                                // Options: Clockwise, CounterClockwise, UpsideDown
const ASYNC_PROCESSING = true;                                     // Enable async processing for large files
const MAX_RETRIES = 30;                                            // Maximum polling attempts for async operations
const RETRY_INTERVAL = 2;                                          // Seconds between polling attempts

/**
 * Main function to rotate PDF document
 */
async function rotateDocument() {
    console.log("=== Rotating PDF Document ===");
    
    try {
        // Check if input file exists
        if (!fs.existsSync(INPUT_PDF_PATH)) {
            console.log(`PDF not found: ${INPUT_PDF_PATH}`);
            return null;
        }

        // Read and encode the PDF file to base64
        console.log("Reading PDF file...");
        const pdfBytes = fs.readFileSync(INPUT_PDF_PATH);
        const pdfBase64 = pdfBytes.toString('base64');
        
        console.log(`PDF file read successfully: ${INPUT_PDF_PATH} (${pdfBytes.length} bytes)`);

        // Prepare the API request payload
        const payload = {
            docContent: pdfBase64,                                  // Base64 encoded PDF content
            docName: "output.pdf",                                  // Output PDF file name
            rotationType: ROTATION_TYPE,                            // Rotation type
            async: ASYNC_PROCESSING                                 // Enable async processing
        };

        // Execute the document rotation
        const result = await executeDocumentRotation(payload);
        
        if (result) {
            console.log(`Output saved: ${result}`);
            return result;
        } else {
            console.log("Document rotation failed.");
            return null;
        }
    } catch (error) {
        console.error(`Error in rotateDocument: ${error.message}`);
        return null;
    }
}

/**
 * Execute the document rotation operation
 */
async function executeDocumentRotation(payload) {
    try {
        const jsonPayload = JSON.stringify(payload);
        
        // Set up headers for the API request
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': API_KEY
        };

        console.log("Sending PDF rotation request to PDF4me API...");
        
        // Make the API request
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: headers,
            body: jsonPayload
        });

        // Handle different response scenarios based on status code
        if (response.status === 200) {
            // 200 - Success: Document rotation completed immediately
            console.log("Success: Document rotated successfully!");
            
            // Save the output PDF file
            const resultBytes = await response.arrayBuffer();
            fs.writeFileSync(OUTPUT_PDF_PATH, Buffer.from(resultBytes));
            console.log(`Output saved as: ${OUTPUT_PDF_PATH}`);
            return OUTPUT_PDF_PATH;
            
        } else if (response.status === 202) {
            // 202 - Accepted: API is processing the request asynchronously
            console.log("202 - Request accepted. Processing asynchronously...");
            
            const responseBody = await response.text();
            console.log(`Response body: ${responseBody}`);
            
            // Parse response to get job ID
            const jobId = extractJobId(responseBody);
            if (jobId) {
                console.log(`Job ID: ${jobId}`);
                
                // Poll the API until processing is complete
                for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                    if (attempt === 0 || attempt === MAX_RETRIES - 1) {
                        console.log(`Processing... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
                    }
                    
                    // Check job status
                    const statusUrl = `${BASE_URL}api/v2/JobStatus/${jobId}`;
                    const statusResponse = await fetch(statusUrl, {
                        method: 'GET',
                        headers: {
                            'Authorization': API_KEY
                        }
                    });

                    if (statusResponse.status === 200) {
                        // Processing completed successfully
                        console.log("Processing completed.");
                        const resultBytes = await statusResponse.arrayBuffer();
                        fs.writeFileSync(OUTPUT_PDF_PATH, Buffer.from(resultBytes));
                        console.log(`Output saved as: ${OUTPUT_PDF_PATH}`);
                        return OUTPUT_PDF_PATH;
                    } else if (statusResponse.status === 202) {
                        // Still processing, wait and try again
                        await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL * 1000));
                        continue;
                    } else {
                        // Error in status check
                        console.log(`Status check error: ${statusResponse.status}`);
                        const errorBody = await statusResponse.text();
                        console.log(errorBody);
                        return null;
                    }
                }
                
                // If we reach here, polling timed out
                console.log(`Processing timeout. Check your account or use job ID ${jobId}.`);
                return null;
            } else {
                console.log("No job ID received in response");
                return null;
            }
            
        } else {
            // Other status codes - Error
            console.log(`Error: ${response.status}`);
            const errorBody = await response.text();
            console.log(`Response: ${errorBody}`);
            return null;
        }
    } catch (error) {
        console.error(`Error in executeDocumentRotation: ${error.message}`);
        return null;
    }
}

/**
 * Extract job ID from response body
 */
function extractJobId(responseBody) {
    try {
        // Simple JSON parsing to extract jobId
        if (responseBody.includes('"jobId"')) {
            const startIndex = responseBody.indexOf('"jobId"') + 8;
            const endIndex = responseBody.indexOf('"', startIndex);
            if (endIndex > startIndex) {
                return responseBody.substring(startIndex, endIndex);
            }
        }
    } catch (error) {
        console.error(`Error extracting job ID: ${error.message}`);
    }
    return null;
}

/**
 * Main execution
 */
async function main() {
    try {
        const result = await rotateDocument();
        if (result) {
            console.log(`Output saved: ${result}`);
        } else {
            console.log("Document rotation failed.");
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

// Run the application
if (require.main === module) {
    main();
}

module.exports = {
    rotateDocument,
    executeDocumentRotation,
    extractJobId
}; 