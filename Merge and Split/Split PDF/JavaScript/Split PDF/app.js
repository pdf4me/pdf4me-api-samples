const fs = require('fs');
const path = require('path');

/**
 * Split PDF using PDF4Me API
 * Splits PDF documents into multiple files based on various criteria
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for splitting PDF documents
const API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/SplitPdf`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                               // Input PDF file to process
const OUTPUT_DIR = "Split_PDF_outputs";                            // Output directory for split results

// Split configuration
const SPLIT_ACTION = "SplitAfterPage";                            // Split action type
const SPLIT_ACTION_NUMBER = 1;                                     // Split after every N pages
const FILE_NAMING = "NameAsPerOrder";                              // File naming convention

// Async processing configuration
const MAX_RETRIES = 10;                                            // Maximum retry attempts for async operations
const RETRY_DELAY = 10000;                                         // Delay between retries in milliseconds (10 seconds)

// Debug mode for detailed logging
const DEBUG_MODE = true;

/**
 * Main function to split PDF document
 */
async function main() {
    console.log("=== Splitting PDF Document ===");
    
    try {
        await splitPdf(INPUT_PDF_PATH, OUTPUT_DIR);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        if (DEBUG_MODE) {
            console.error(error.stack);
        }
    }
}

/**
 * Split PDF document
 * @param {string} inputPdfPath - Path to the input PDF file
 * @param {string} outputFolder - Output folder for split results
 */
async function splitPdf(inputPdfPath, outputFolder) {
    try {
        // Validate input file exists
        if (!fs.existsSync(inputPdfPath)) {
            console.error(`❌ PDF file not found: ${inputPdfPath}`);
            return;
        }
        
        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder, { recursive: true });
            console.log(`📁 Created output directory: ${outputFolder}`);
        }
        
        console.log(`📁 Reading PDF: ${inputPdfPath}`);
        const pdfBytes = fs.readFileSync(inputPdfPath);
        const pdfBase64 = pdfBytes.toString('base64');
        console.log(`✅ PDF encoded (${pdfBytes.length} bytes)`);
        
        // Prepare API request payload
        const payload = {
            docContent: pdfBase64,
            docName: "output.pdf",
            splitAction: SPLIT_ACTION,
            splitActionNumber: SPLIT_ACTION_NUMBER,
            fileNaming: FILE_NAMING,
            async: true
        };
        
        console.log("🚀 Sending split request to PDF4Me API...");
        await executeSplit(payload, outputFolder);
        
    } catch (error) {
        console.error(`❌ Error in splitPdf: ${error.message}`);
        if (DEBUG_MODE) {
            console.error(error.stack);
        }
    }
}

/**
 * Execute the split API request
 * @param {Object} payload - API request payload
 * @param {string} outputDir - Output directory for results
 */
async function executeSplit(payload, outputDir) {
    try {
        const jsonPayload = JSON.stringify(payload);
        
        // Make API request
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${API_KEY}`
            },
            body: jsonPayload
        });
        
        console.log(`📡 API Response Status: ${response.status}`);
        
        // Handle immediate success response (200 OK)
        if (response.status === 200) {
            console.log("✅ PDF split completed synchronously");
            const resultBytes = await response.arrayBuffer();
            saveZipResult(resultBytes, outputDir, "split_after_page_result.zip");
        }
        
        // Handle asynchronous processing response (202 Accepted)
        else if (response.status === 202) {
            console.log("⏳ PDF split started asynchronously, polling for completion...");
            
            const locationUrl = response.headers.get('Location');
            if (!locationUrl) {
                console.error("❌ No 'Location' header found in the response.");
                return;
            }
            
            console.log(`📍 Polling URL: ${locationUrl}`);
            
            // Poll for completion with retry logic
            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                console.log(`🔄 Polling attempt ${attempt + 1}/${MAX_RETRIES}...`);
                
                // Wait before polling
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                
                try {
                    const pollResponse = await fetch(locationUrl, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Basic ${API_KEY}`
                        }
                    });
                    
                    console.log(`📡 Poll Response Status: ${pollResponse.status}`);
                    
                    // Handle successful completion
                    if (pollResponse.status === 200) {
                        console.log("✅ PDF split completed asynchronously");
                        const resultBytes = await pollResponse.arrayBuffer();
                        saveZipResult(resultBytes, outputDir, "split_after_page_result.zip");
                        return;
                    }
                    
                    // Continue polling if still processing
                    else if (pollResponse.status === 202) {
                        console.log("⏳ Still processing, continuing to poll...");
                        continue;
                    }
                    
                    // Handle polling errors
                    else {
                        const errorText = await pollResponse.text();
                        console.error(`❌ Polling error: ${pollResponse.status}`);
                        console.error(`📄 Error response: ${errorText}`);
                        return;
                    }
                    
                } catch (pollError) {
                    console.error(`❌ Polling request failed: ${pollError.message}`);
                    if (DEBUG_MODE) {
                        console.error(pollError.stack);
                    }
                }
            }
            
            // Timeout if split doesn't complete within retry limit
            console.error(`❌ Timeout: PDF split did not complete after ${MAX_RETRIES} retries.`);
        }
        
        // Handle other error responses
        else {
            const errorText = await response.text();
            console.error(`❌ Initial request failed: ${response.status}`);
            console.error(`📄 Error response: ${errorText}`);
        }
        
    } catch (error) {
        console.error(`❌ Error in executeSplit: ${error.message}`);
        if (DEBUG_MODE) {
            console.error(error.stack);
        }
    }
}

/**
 * Save the response as a zip file
 * @param {ArrayBuffer} responseBody - Response body containing zip data
 * @param {string} outputDir - Output directory
 * @param {string} zipFileName - Name of the zip file
 */
function saveZipResult(responseBody, outputDir, zipFileName) {
    try {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const outPath = path.join(outputDir, zipFileName);
        fs.writeFileSync(outPath, Buffer.from(responseBody));
        console.log(`💾 Split PDF zip saved: ${outPath} (${responseBody.byteLength} bytes)`);
        
    } catch (error) {
        console.error(`❌ Error in saveZipResult: ${error.message}`);
        if (DEBUG_MODE) {
            console.error(error.stack);
        }
    }
}

// Export functions for programmatic use
module.exports = {
    splitPdf,
    executeSplit,
    saveZipResult
};

// Run the main function if this file is executed directly
if (require.main === module) {
    main();
} 