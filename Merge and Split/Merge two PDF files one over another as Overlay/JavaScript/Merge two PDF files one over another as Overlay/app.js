const fs = require('fs');
const path = require('path');

/**
 * Merge Two PDF Files One Over Another as Overlay using PDF4Me API
 * Overlays two PDF documents, placing one on top of the other
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for merging PDFs as overlay
const API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/MergeOverlay`;

// File paths configuration
const BASE_PDF_PATH = "sample1.pdf";                               // Base PDF file to process
const LAYER_PDF_PATH = "sample2.pdf";                              // Layer PDF file to overlay
const OUTPUT_PDF_PATH = "Merge_overlay_output.pdf";                // Output PDF file path

// Async processing configuration
const MAX_RETRIES = 10;                                            // Maximum retry attempts for async operations
const RETRY_DELAY = 10000;                                         // Delay between retries in milliseconds (10 seconds)

// Debug mode for detailed logging
const DEBUG_MODE = true;

/**
 * Main function to merge two PDF files as overlay
 */
async function main() {
    console.log("=== Merging Two PDF Files as Overlay ===");
    
    try {
        const result = await mergeOverlay(BASE_PDF_PATH, LAYER_PDF_PATH);
        
        if (result) {
            console.log(`✅ Overlay merged PDF saved to: ${result}`);
        } else {
            console.log("❌ PDF overlay merge failed.");
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        if (DEBUG_MODE) {
            console.error(error.stack);
        }
    }
}

/**
 * Merge two PDF files as overlay
 * @param {string} basePdfPath - Path to the base PDF file
 * @param {string} layerPdfPath - Path to the layer PDF file
 * @returns {Promise<string|null>} - Path to the output PDF file or null if failed
 */
async function mergeOverlay(basePdfPath, layerPdfPath) {
    try {
        // Validate input files exist
        if (!fs.existsSync(basePdfPath)) {
            console.error(`❌ Base PDF file not found: ${basePdfPath}`);
            return null;
        }
        
        if (!fs.existsSync(layerPdfPath)) {
            console.error(`❌ Layer PDF file not found: ${layerPdfPath}`);
            return null;
        }
        
        console.log(`📁 Reading base PDF: ${basePdfPath}`);
        const basePdfBytes = fs.readFileSync(basePdfPath);
        const basePdfBase64 = basePdfBytes.toString('base64');
        console.log(`✅ Base PDF encoded (${basePdfBytes.length} bytes)`);
        
        console.log(`📁 Reading layer PDF: ${layerPdfPath}`);
        const layerPdfBytes = fs.readFileSync(layerPdfPath);
        const layerPdfBase64 = layerPdfBytes.toString('base64');
        console.log(`✅ Layer PDF encoded (${layerPdfBytes.length} bytes)`);
        
        // Prepare API request payload
        const payload = {
            baseDocContent: basePdfBase64,
            baseDocName: path.basename(basePdfPath),
            layerDocContent: layerPdfBase64,
            layerDocName: path.basename(layerPdfPath),
            async: true
        };
        
        console.log("🚀 Sending overlay merge request to PDF4Me API...");
        return await executeOverlayMerge(payload, OUTPUT_PDF_PATH);
        
    } catch (error) {
        console.error(`❌ Error in mergeOverlay: ${error.message}`);
        if (DEBUG_MODE) {
            console.error(error.stack);
        }
        return null;
    }
}

/**
 * Execute the overlay merge API request
 * @param {Object} payload - API request payload
 * @param {string} outputPdfPath - Output PDF file path
 * @returns {Promise<string|null>} - Path to the output PDF file or null if failed
 */
async function executeOverlayMerge(payload, outputPdfPath) {
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
            console.log("✅ Overlay merge completed synchronously");
            const resultBytes = await response.arrayBuffer();
            fs.writeFileSync(outputPdfPath, Buffer.from(resultBytes));
            console.log(`💾 Output PDF saved: ${outputPdfPath} (${resultBytes.byteLength} bytes)`);
            return outputPdfPath;
        }
        
        // Handle asynchronous processing response (202 Accepted)
        else if (response.status === 202) {
            console.log("⏳ Overlay merge started asynchronously, polling for completion...");
            
            const locationUrl = response.headers.get('Location');
            if (!locationUrl) {
                console.error("❌ No 'Location' header found in the response.");
                return null;
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
                        console.log("✅ Overlay merge completed asynchronously");
                        const resultBytes = await pollResponse.arrayBuffer();
                        fs.writeFileSync(outputPdfPath, Buffer.from(resultBytes));
                        console.log(`💾 Output PDF saved: ${outputPdfPath} (${resultBytes.byteLength} bytes)`);
                        return outputPdfPath;
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
                        return null;
                    }
                    
                } catch (pollError) {
                    console.error(`❌ Polling request failed: ${pollError.message}`);
                    if (DEBUG_MODE) {
                        console.error(pollError.stack);
                    }
                }
            }
            
            // Timeout if overlay doesn't complete within retry limit
            console.error(`❌ Timeout: Overlay merge did not complete after ${MAX_RETRIES} retries.`);
            return null;
        }
        
        // Handle other error responses
        else {
            const errorText = await response.text();
            console.error(`❌ Initial request failed: ${response.status}`);
            console.error(`📄 Error response: ${errorText}`);
            return null;
        }
        
    } catch (error) {
        console.error(`❌ Error in executeOverlayMerge: ${error.message}`);
        if (DEBUG_MODE) {
            console.error(error.stack);
        }
        return null;
    }
}

// Export functions for programmatic use
module.exports = {
    mergeOverlay,
    executeOverlayMerge
};

// Run the main function if this file is executed directly
if (require.main === module) {
    main();
} 