const fs = require('fs');
const path = require('path');

/**
 * PDF Hyperlinks Annotation Update using PDF4Me API
 * Updates hyperlinks annotation in PDF documents
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for updating hyperlinks annotation
const API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/UpdateHyperlinkAnnotation`;

// File paths configuration
const PDF_FILE_PATH = "sample.pdf";                                    // Path to input PDF file
const OUTPUT_PATH = "hyperlinks_updated_PDF_output.pdf";              // Output updated PDF file name

// Processing configuration
const MAX_RETRIES = 10;                                               // Maximum number of polling retries
const RETRY_DELAY = 10;                                               // Delay between retries in seconds

/**
 * Main function to update hyperlinks annotation
 */
async function main() {
    console.log("=== Updating Hyperlinks Annotation ===");
    
    try {
        const result = await updateHyperlinksAnnotation(PDF_FILE_PATH);
        
        if (result) {
            console.log(`\n🎉 Hyperlinks annotation update completed successfully!`);
            console.log(`📁 Output file: ${result}`);
            
            // Get file stats for additional info
            const stats = fs.statSync(result);
            console.log(`📊 File size: ${stats.size.toLocaleString()} bytes`);
        } else {
            console.log("❌ Hyperlinks annotation update failed.");
        }
    } catch (error) {
        console.error("❌ Error in main:", error.message);
        process.exit(1);
    }
}

/**
 * Updates hyperlinks annotation in PDF document
 * @param {string} inputPdfPath - Path to the input PDF file
 * @returns {Promise<string|null>} - Path to the updated PDF file, or null if failed
 */
async function updateHyperlinksAnnotation(inputPdfPath) {
    try {
        // Validate input file exists
        if (!fs.existsSync(inputPdfPath)) {
            console.log(`❌ PDF file not found: ${inputPdfPath}`);
            return null;
        }
        console.log("✅ File validation passed");

        // Read and encode PDF file
        const pdfBytes = fs.readFileSync(inputPdfPath);
        const pdfBase64 = pdfBytes.toString('base64');
        console.log(`✅ PDF read and base64 encoded successfully (${pdfBytes.length.toLocaleString()} bytes)`);

        // Prepare API request payload
        const payload = {
            docName: "output.pdf",
            docContent: pdfBase64,
            updatehyperlinkannotationlist: [
                {
                    SearchOn: "Text",
                    SearchValue: "http://www.google.com",
                    IsExpression: true,
                    TextCurrentValue: "http://www.google.com",
                    TextNewValue: "https://pdf4me.com",
                    URLCurrentValue: "http://www.google.com",
                    URLNewValue: "https://pdf4me.com"
                }
            ],
            async: true  // For big files and too many calls async is recommended to reduce the server load
        };

        console.log("✅ API request sent with hyperlinks update parameters");
        
        // Execute the hyperlinks annotation update operation
        return await executeHyperlinksUpdate(payload, OUTPUT_PATH);
        
    } catch (error) {
        console.error("❌ Error in updateHyperlinksAnnotation:", error.message);
        return null;
    }
}

/**
 * Executes the hyperlinks annotation update operation
 * @param {Object} payload - API request payload
 * @param {string} outputPdfPath - Path where to save the updated PDF
 * @returns {Promise<string|null>} - Path to the updated PDF file, or null if failed
 */
async function executeHyperlinksUpdate(payload, outputPdfPath) {
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
            console.log(`✅ Updated PDF saved to: ${outputPdfPath}`);
            console.log("✅ Hyperlinks annotation updated successfully");
            
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
                    console.log(`✅ Updated PDF saved to: ${outputPdfPath}`);
                    console.log("✅ Hyperlinks annotation updated successfully");
                    
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
            console.log("❌ Timeout: Hyperlinks annotation update did not complete after multiple retries.");
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
        console.error("❌ Error in executeHyperlinksUpdate:", error.message);
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

module.exports = { updateHyperlinksAnnotation, executeHyperlinksUpdate }; 