const fs = require('fs');
const path = require('path');

/**
 * PDF Document Unlock using PDF4Me API
 * Unlocks password-protected PDF documents by removing password protection
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for unlocking PDF documents
const API_KEY = "Please get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/Unlock`;

// File paths configuration
const PDF_FILE_PATH = "sample.protected.pdf";                    // Path to input protected PDF file
const OUTPUT_PATH = "sample.protected.unlocked.pdf";            // Output unlocked PDF file name

// Processing configuration
const MAX_RETRIES = 10;                                         // Maximum number of polling retries
const RETRY_DELAY = 10;                                         // Delay between retries in seconds
const PASSWORD = "1234";                                        // Password for the protected PDF

/**
 * Main function to unlock PDF document
 */
async function main() {
    console.log("=== Unlocking PDF Document ===");
    
    try {
        const result = await unlockPdf(PDF_FILE_PATH);
        
        if (result) {
            console.log(`\n🎉 PDF unlocking completed successfully!`);
            console.log(`📁 Output file: ${result}`);
            
            // Get file stats for additional info
            const stats = fs.statSync(result);
            console.log(`📊 File size: ${stats.size.toLocaleString()} bytes`);
            console.log(`🔓 Password: ${PASSWORD}`);
        } else {
            console.log("❌ PDF unlocking failed.");
        }
    } catch (error) {
        console.error("❌ Error in main:", error.message);
        process.exit(1);
    }
}

/**
 * Unlocks password-protected PDF document
 * @param {string} inputPdfPath - Path to the input protected PDF file
 * @returns {Promise<string|null>} - Path to the unlocked PDF file, or null if failed
 */
async function unlockPdf(inputPdfPath) {
    try {
        // Validate input file exists
        if (!fs.existsSync(inputPdfPath)) {
            console.log(`❌ PDF file not found: ${inputPdfPath}`);
            return null;
        }
        console.log("✅ File validation passed");

        // Generate output path
        const outputPdfPath = inputPdfPath.replace('.pdf', '.unlocked.pdf');
        
        // Read and encode PDF file
        const pdfBytes = fs.readFileSync(inputPdfPath);
        const pdfBase64 = pdfBytes.toString('base64');
        console.log(`✅ PDF read and base64 encoded successfully (${pdfBytes.length.toLocaleString()} bytes)`);

        // Prepare API request payload
        const payload = {
            docName: "output.pdf",
            docContent: pdfBase64,
            password: PASSWORD,
            async: true  // For big files and too many calls async is recommended to reduce the server load
        };

        console.log("✅ API request sent with unlock parameters");
        
        // Execute the PDF unlock operation
        return await executePdfUnlock(payload, outputPdfPath);
        
    } catch (error) {
        console.error("❌ Error in unlockPdf:", error.message);
        return null;
    }
}

/**
 * Executes the PDF unlock operation
 * @param {Object} payload - API request payload
 * @param {string} outputPdfPath - Path where to save the unlocked PDF
 * @returns {Promise<string|null>} - Path to the unlocked PDF file, or null if failed
 */
async function executePdfUnlock(payload, outputPdfPath) {
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
            console.log(`✅ Unlocked PDF saved to: ${outputPdfPath}`);
            console.log("✅ Password protection removed successfully");
            
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
                    console.log(`✅ Unlocked PDF saved to: ${outputPdfPath}`);
                    console.log("✅ Password protection removed successfully");
                    
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
            console.log("❌ Timeout: PDF unlocking did not complete after multiple retries.");
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
        console.error("❌ Error in executePdfUnlock:", error.message);
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

module.exports = { unlockPdf, executePdfUnlock }; 