const fs = require('fs');
const path = require('path');

/**
 * Split PDF by Barcode using PDF4Me API
 * Splits PDF documents based on barcode detection
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for splitting PDF by barcode
const API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/SplitPdfByBarcode_old`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                               // Input PDF file to process
const OUTPUT_DIR = "sample_barcode_split_output";                  // Output directory for split results

// Barcode split configuration
const BARCODE_STRING = "hello";                                    // Barcode string to search for
const BARCODE_FILTER = "startsWith";                               // Barcode filter type
const BARCODE_TYPE = "qrcode";                                     // Barcode type
const SPLIT_BARCODE_PAGE = "before";                               // Split before or after barcode
const COMBINE_PAGES_WITH_SAME_CONSECUTIVE_BARCODES = true;         // Combine pages with same consecutive barcodes
const PDF_RENDER_DPI = "1";                                        // PDF render DPI

// Async processing configuration
const MAX_RETRIES = 10;                                            // Maximum retry attempts for async operations
const RETRY_DELAY = 10000;                                         // Delay between retries in milliseconds (10 seconds)

// Debug mode for detailed logging
const DEBUG_MODE = true;

/**
 * Main function to split PDF by barcode
 */
async function main() {
    console.log("=== Splitting PDF by Barcode ===");
    
    try {
        await splitPdfByBarcode(
            INPUT_PDF_PATH, 
            OUTPUT_DIR,
            BARCODE_STRING,
            BARCODE_FILTER,
            BARCODE_TYPE,
            SPLIT_BARCODE_PAGE,
            COMBINE_PAGES_WITH_SAME_CONSECUTIVE_BARCODES,
            PDF_RENDER_DPI
        );
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        if (DEBUG_MODE) {
            console.error(error.stack);
        }
    }
}

/**
 * Split PDF by barcode
 * @param {string} inputPdfPath - Path to the input PDF file
 * @param {string} outputFolder - Output folder for split results
 * @param {string} barcodeString - Barcode string to search for
 * @param {string} barcodeFilter - Barcode filter type
 * @param {string} barcodeType - Barcode type
 * @param {string} splitBarcodePage - Split before or after barcode
 * @param {boolean} combinePagesWithSameConsecutiveBarcodes - Combine pages with same consecutive barcodes
 * @param {string} pdfRenderDpi - PDF render DPI
 */
async function splitPdfByBarcode(inputPdfPath, outputFolder, barcodeString, barcodeFilter, barcodeType, splitBarcodePage, combinePagesWithSameConsecutiveBarcodes, pdfRenderDpi) {
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
            barcodeString: barcodeString,
            barcodeFilter: barcodeFilter,
            barcodeType: barcodeType,
            splitBarcodePage: splitBarcodePage,
            combinePagesWithSameConsecutiveBarcodes: combinePagesWithSameConsecutiveBarcodes,
            pdfRenderDpi: pdfRenderDpi,
            async: true
        };
        
        console.log("🚀 Sending barcode split request to PDF4Me API...");
        await executeSplitByBarcode(payload, outputFolder);
        
    } catch (error) {
        console.error(`❌ Error in splitPdfByBarcode: ${error.message}`);
        if (DEBUG_MODE) {
            console.error(error.stack);
        }
    }
}

/**
 * Execute the barcode split API request
 * @param {Object} payload - API request payload
 * @param {string} outputDir - Output directory for results
 */
async function executeSplitByBarcode(payload, outputDir) {
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
            console.log("✅ PDF barcode split completed synchronously");
            const resultBytes = await response.arrayBuffer();
            saveZipResult(resultBytes, outputDir, "barcode_split_result.zip");
        }
        
        // Handle asynchronous processing response (202 Accepted)
        else if (response.status === 202) {
            console.log("⏳ PDF barcode split started asynchronously, polling for completion...");
            
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
                        console.log("✅ PDF barcode split completed asynchronously");
                        const resultBytes = await pollResponse.arrayBuffer();
                        saveZipResult(resultBytes, outputDir, "barcode_split_result.zip");
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
            console.error(`❌ Timeout: PDF barcode split did not complete after ${MAX_RETRIES} retries.`);
        }
        
        // Handle other error responses
        else {
            const errorText = await response.text();
            console.error(`❌ Initial request failed: ${response.status}`);
            console.error(`📄 Error response: ${errorText}`);
        }
        
    } catch (error) {
        console.error(`❌ Error in executeSplitByBarcode: ${error.message}`);
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
        console.log(`💾 Split by barcode zip saved: ${outPath} (${responseBody.byteLength} bytes)`);
        
    } catch (error) {
        console.error(`❌ Error in saveZipResult: ${error.message}`);
        if (DEBUG_MODE) {
            console.error(error.stack);
        }
    }
}

// Export functions for programmatic use
module.exports = {
    splitPdfByBarcode,
    executeSplitByBarcode,
    saveZipResult
};

// Run the main function if this file is executed directly
if (require.main === module) {
    main();
} 