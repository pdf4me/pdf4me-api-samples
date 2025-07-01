const fs = require('fs');
const path = require('path');

/**
 * Repair PDF Document using PDF4Me API
 * Repairs corrupted or damaged PDF documents
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for repairing PDF documents
const API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/RepairPdf`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                               // Input corrupted PDF file to repair
const OUTPUT_PDF_PATH = "sample.repaired.pdf";                     // Output repaired PDF file name

// Processing configuration
const MAX_RETRIES = 10;                                            // Maximum number of polling retries
const RETRY_DELAY = 10;                                            // Delay between retries in seconds

/**
 * Main function to repair PDF document
 */
async function main() {
    console.log("=== Repairing PDF Document ===");
    
    try {
        const result = await repairPdfDocument(INPUT_PDF_PATH);
        
        if (result) {
            console.log(`\n🎉 PDF repair completed successfully!`);
            console.log(`📁 Output file: ${result}`);
            
            // Get file stats for additional info
            const stats = fs.statSync(result);
            console.log(`📊 File size: ${stats.size.toLocaleString()} bytes`);
            
            // Compare with original file size if it exists
            if (fs.existsSync(INPUT_PDF_PATH)) {
                const originalStats = fs.statSync(INPUT_PDF_PATH);
                console.log(`📊 Original file size: ${originalStats.size.toLocaleString()} bytes`);
                const sizeDiff = stats.size - originalStats.size;
                console.log(`📊 Size difference: ${sizeDiff > 0 ? '+' : ''}${sizeDiff.toLocaleString()} bytes`);
            }
            
            console.log("✅ PDF document has been repaired and is ready for use");
        } else {
            console.log("❌ PDF repair failed.");
        }
    } catch (error) {
        console.error("❌ Error in main:", error.message);
        process.exit(1);
    }
}

/**
 * Repairs a PDF document using PDF4Me service
 * @param {string} inputPdfPath - Path to the input corrupted PDF file
 * @returns {Promise<string|null>} - Path to the repaired PDF file, or null if failed
 */
async function repairPdfDocument(inputPdfPath) {
    try {
        // Check if input PDF file exists
        if (!fs.existsSync(inputPdfPath)) {
            console.log(`❌ PDF file not found: ${inputPdfPath}`);
            return null;
        }
        console.log("✅ Input PDF file found");

        // Read and encode PDF file
        const pdfBytes = fs.readFileSync(inputPdfPath);
        const pdfBase64 = pdfBytes.toString('base64');
        console.log("✅ PDF file encoded to base64");

        // Prepare API request payload
        const payload = {
            docContent: pdfBase64,                                 // Base64 encoded PDF content
            docName: "sample.pdf",                                 // Output document name
            async: true                                            // For big files and too many calls async is recommended to reduce the server load
        };

        console.log("✅ API request prepared with PDF repair parameters");
        
        // Execute the PDF repair operation
        return await executePdfRepair(payload, OUTPUT_PDF_PATH);
        
    } catch (error) {
        console.error("❌ Error in repairPdfDocument:", error.message);
        return null;
    }
}

/**
 * Executes the PDF repair operation
 * @param {Object} payload - API request payload
 * @param {string} outputPdfPath - Path where to save the repaired PDF
 * @returns {Promise<string|null>} - Path to the repaired PDF file, or null if failed
 */
async function executePdfRepair(payload, outputPdfPath) {
    try {
        // Prepare HTTP request
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${API_KEY}`
            },
            body: JSON.stringify(payload)
        };

        // Send initial request
        const response = await fetch(API_ENDPOINT, requestOptions);
        
        // Handle immediate success response (200 OK)
        if (response.status === 200) {
            console.log("✅ Immediate success response (200 OK)");
            
            const resultBytes = await response.arrayBuffer();
            fs.writeFileSync(outputPdfPath, Buffer.from(resultBytes));
            console.log(`✅ Repaired PDF saved to: ${outputPdfPath}`);
            console.log("✅ PDF repair completed successfully");
            
            return outputPdfPath;
        }
        
        // Handle asynchronous processing response (202 Accepted)
        else if (response.status === 202) {
            console.log("⏳ Asynchronous processing started (202 Accepted)");
            
            // Extract polling URL from response headers
            const locationUrl = response.headers.get('Location');
            if (!locationUrl) {
                console.log("❌ No 'Location' header found in the response.");
                return null;
            }

            console.log(`🔄 Polling URL: ${locationUrl}`);
            
            // Poll for completion with retry logic
            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                console.log(`⏳ Polling attempt ${attempt + 1}/${MAX_RETRIES}...`);
                
                // Wait before polling
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * 1000));
                
                // Create polling request
                const pollOptions = {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${API_KEY}`
                    }
                };

                const pollResponse = await fetch(locationUrl, pollOptions);

                // Handle successful completion
                if (pollResponse.status === 200) {
                    console.log("✅ Polling successful (200 OK)");
                    
                    const resultBytes = await pollResponse.arrayBuffer();
                    fs.writeFileSync(outputPdfPath, Buffer.from(resultBytes));
                    console.log(`✅ Repaired PDF saved to: ${outputPdfPath}`);
                    console.log("✅ PDF repair completed successfully");
                    
                    return outputPdfPath;
                }
                
                // Continue polling if still processing
                else if (pollResponse.status === 202) {
                    console.log("⏳ Still processing, continuing to poll...");
                    continue;
                }
                
                // Handle polling errors
                else {
                    console.log(`❌ Polling error: ${pollResponse.status}`);
                    const errorText = await pollResponse.text();
                    console.log(`❌ Error details: ${errorText}`);
                    return null;
                }
            }
            
            // Timeout if processing doesn't complete within retry limit
            console.log("❌ Timeout: PDF repair did not complete after multiple retries.");
            return null;
        }
        
        // Handle other error responses
        else {
            console.log(`❌ Initial request failed: ${response.status}`);
            const errorText = await response.text();
            console.log(`❌ Error details: ${errorText}`);
            return null;
        }
        
    } catch (error) {
        console.error("❌ Error in executePdfRepair:", error.message);
        return null;
    }
}

// Run the main function if this file is executed directly
if (require.main === module) {
    main().catch(error => {
        console.error("❌ Unhandled error:", error);
        process.exit(1);
    });
}

module.exports = { repairPdfDocument, executePdfRepair }; 