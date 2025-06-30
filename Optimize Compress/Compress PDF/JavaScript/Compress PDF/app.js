const fs = require('fs');
const path = require('path');

/**
 * Compress PDF using PDF4Me API
 * Compresses and optimizes PDF documents for reduced file size
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for compressing and optimizing PDF documents
const API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/Optimize`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                               // Input PDF file to process
const OUTPUT_PDF_PATH = "compress_PDF_output.pdf";                 // Output PDF file name

// Processing configuration
const OPTIMIZE_PROFILE = "Web";                                    // Options: Web, Print, Screen
const ASYNC_PROCESSING = true;                                     // Enable async processing for large files
const MAX_RETRIES = 10;                                            // Maximum polling attempts for async operations
const RETRY_INTERVAL = 10;                                         // Seconds between polling attempts

/**
 * Main function to compress PDF document
 */
async function compressPdf() {
    console.log("=== Compressing PDF Document ===");
    
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
            optimizeProfile: OPTIMIZE_PROFILE,                      // Optimization profile
            async: ASYNC_PROCESSING                                 // Enable async processing
        };

        // Execute the PDF compression
        const result = await executeOptimization(payload);
        
        if (result) {
            console.log(`Output saved: ${result}`);
            return result;
        } else {
            console.log("PDF compression failed.");
            return null;
        }
    } catch (error) {
        console.error(`Error in compressPdf: ${error.message}`);
        return null;
    }
}

/**
 * Execute the PDF optimization operation
 */
async function executeOptimization(payload) {
    try {
        const jsonPayload = JSON.stringify(payload);
        
        // Set up headers for the API request
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': API_KEY
        };

        console.log("Sending PDF compression request to PDF4me API...");
        
        // Make the API request
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: headers,
            body: jsonPayload
        });

        // Handle different response scenarios based on status code
        if (response.status === 200) {
            // 200 - Success: PDF compression completed immediately
            console.log("Success: PDF compressed successfully!");
            
            // Save the output PDF file
            const resultBytes = await response.arrayBuffer();
            fs.writeFileSync(OUTPUT_PDF_PATH, Buffer.from(resultBytes));
            console.log(`Output saved as: ${OUTPUT_PDF_PATH}`);
            return OUTPUT_PDF_PATH;
            
        } else if (response.status === 202) {
            // 202 - Accepted: API is processing the request asynchronously
            console.log("202 - Request accepted. Processing asynchronously...");
            
            // Get the polling URL from the Location header
            const locationUrl = response.headers.get('Location');
            if (!locationUrl) {
                console.log("No 'Location' header found in the response.");
                return null;
            }
            
            console.log(`Location URL: ${locationUrl}`);
            
            // Poll the API until processing is complete
            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                console.log(`Checking job status... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
                
                // Wait before polling
                await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL * 1000));
                
                // Check job status
                const statusResponse = await fetch(locationUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': API_KEY
                    }
                });

                if (statusResponse.status === 200) {
                    // Processing completed successfully
                    console.log("Processing completed!");
                    const resultBytes = await statusResponse.arrayBuffer();
                    fs.writeFileSync(OUTPUT_PDF_PATH, Buffer.from(resultBytes));
                    console.log(`Output saved as: ${OUTPUT_PDF_PATH}`);
                    return OUTPUT_PDF_PATH;
                } else if (statusResponse.status === 202) {
                    // Still processing, continue polling
                    console.log("Still processing...");
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
            console.log(`Timeout: PDF optimization did not complete after multiple retries.`);
            return null;
            
        } else {
            // Other status codes - Error
            console.log(`Error: ${response.status}`);
            const errorBody = await response.text();
            console.log(`Response: ${errorBody}`);
            return null;
        }
    } catch (error) {
        console.error(`Error in executeOptimization: ${error.message}`);
        return null;
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        console.log("Starting PDF Compression and Optimization Process");
        console.log(`Optimization profile: ${OPTIMIZE_PROFILE}`);
        
        const result = await compressPdf();
        if (result) {
            console.log(`PDF compression completed successfully!`);
            console.log(`Input file: ${INPUT_PDF_PATH}`);
            console.log(`Output file: ${result}`);
            console.log(`Optimization profile used: ${OPTIMIZE_PROFILE}`);
        } else {
            console.log("PDF compression failed.");
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
    compressPdf,
    executeOptimization
}; 