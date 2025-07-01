const fs = require('fs');
const path = require('path');

/**
 * Merge Multiple PDF Files into Single PDF using PDF4Me API
 * Merges multiple PDF documents into a single PDF file
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for merging multiple PDFs
const API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/Merge`;

// File paths configuration
const INPUT_PDF_PATHS = ["sample1.pdf", "sample2.pdf"];            // Input PDF files to merge
const OUTPUT_PDF_PATH = "Merged_pdf_output.pdf";                   // Output PDF file path

// Async processing configuration
const MAX_RETRIES = 10;                                            // Maximum retry attempts for async operations
const RETRY_DELAY = 10000;                                         // Delay between retries in milliseconds (10 seconds)

// Debug mode for detailed logging
const DEBUG_MODE = true;

/**
 * Main function to merge multiple PDF files
 */
async function main() {
    console.log("=== Merging Multiple PDF Files into Single PDF ===");
    
    try {
        const result = await mergeMultiplePdfs(INPUT_PDF_PATHS);
        
        if (result) {
            console.log(`✅ Merged PDF saved to: ${result}`);
        } else {
            console.log("❌ PDF merge failed.");
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        if (DEBUG_MODE) {
            console.error(error.stack);
        }
    }
}

/**
 * Merge multiple PDF files into a single PDF
 * @param {string[]} pdfPaths - Array of PDF file paths to merge
 * @returns {Promise<string|null>} - Path to the output PDF file or null if failed
 */
async function mergeMultiplePdfs(pdfPaths) {
    try {
        const pdfBase64List = [];
        
        // Read and encode all PDF files
        for (const pdfPath of pdfPaths) {
            if (!fs.existsSync(pdfPath)) {
                console.error(`❌ PDF file not found: ${pdfPath}`);
                return null;
            }
            
            console.log(`📁 Reading PDF: ${pdfPath}`);
            const pdfBytes = fs.readFileSync(pdfPath);
            const pdfBase64 = pdfBytes.toString('base64');
            pdfBase64List.push(pdfBase64);
            console.log(`✅ PDF encoded (${pdfBytes.length} bytes)`);
        }
        
        console.log(`📊 Total PDFs to merge: ${pdfBase64List.length}`);
        
        // Prepare API request payload
        const payload = {
            docContent: pdfBase64List,
            docName: path.basename(OUTPUT_PDF_PATH),
            async: true
        };
        
        console.log("🚀 Sending merge request to PDF4Me API...");
        return await executeMerge(payload, OUTPUT_PDF_PATH);
        
    } catch (error) {
        console.error(`❌ Error in mergeMultiplePdfs: ${error.message}`);
        if (DEBUG_MODE) {
            console.error(error.stack);
        }
        return null;
    }
}

/**
 * Execute the merge API request
 * @param {Object} payload - API request payload
 * @param {string} outputPdfPath - Output PDF file path
 * @returns {Promise<string|null>} - Path to the output PDF file or null if failed
 */
async function executeMerge(payload, outputPdfPath) {
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
            console.log("✅ PDF merge completed synchronously");
            const resultBytes = await response.arrayBuffer();
            fs.writeFileSync(outputPdfPath, Buffer.from(resultBytes));
            console.log(`💾 Output PDF saved: ${outputPdfPath} (${resultBytes.byteLength} bytes)`);
            return outputPdfPath;
        }
        
        // Handle asynchronous processing response (202 Accepted)
        else if (response.status === 202) {
            console.log("⏳ PDF merge started asynchronously, polling for completion...");
            
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
                        console.log("✅ PDF merge completed asynchronously");
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
            
            // Timeout if merge doesn't complete within retry limit
            console.error(`❌ Timeout: PDF merge did not complete after ${MAX_RETRIES} retries.`);
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
        console.error(`❌ Error in executeMerge: ${error.message}`);
        if (DEBUG_MODE) {
            console.error(error.stack);
        }
        return null;
    }
}

// Export functions for programmatic use
module.exports = {
    mergeMultiplePdfs,
    executeMerge
};

// Run the main function if this file is executed directly
if (require.main === module) {
    main();
} 