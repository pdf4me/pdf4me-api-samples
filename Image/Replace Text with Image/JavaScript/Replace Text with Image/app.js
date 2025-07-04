// Replace Text with Image - JavaScript Implementation
// Replaces text in PDF documents with images using PDF4Me API

const fs = require('fs');
const path = require('path');

/**
 * Replace Text with Image using PDF4Me API
 * Replaces specified text in PDF documents with images
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for replacing text with images
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ReplaceTextWithImage`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                              // Input PDF file
const REPLACEMENT_IMAGE_PATH = "sample.png";                      // Replacement image file
const OUTPUT_PDF_PATH = "Replace_text_with_image_output.pdf";      // Output PDF file with text replaced

// Text replacement configuration
const REPLACE_TEXT = "PDF Document";                              // Text to be replaced with image
const PAGE_SEQUENCE = "all";                                      // Pages to apply replacement (e.g., "all", "1", "1,3,5", "2-5")
const IMAGE_HEIGHT = 50;                                           // Height of the replacement image
const IMAGE_WIDTH = 100;                                           // Width of the replacement image

// Processing configuration
const MAX_RETRIES = 50;                                            // Maximum number of polling retries
const RETRY_DELAY = 10;                                            // Delay between retries in seconds

/**
 * Main function to replace text with image in PDF
 */
async function main() {
    console.log("=== Replace Text with Image ===");
    
    try {
        const result = await replaceTextWithImage(
            INPUT_PDF_PATH,
            REPLACEMENT_IMAGE_PATH,
            REPLACE_TEXT,
            PAGE_SEQUENCE,
            IMAGE_HEIGHT,
            IMAGE_WIDTH
        );
        
        if (result) {
            console.log(`\n🎉 Text replacement completed successfully!`);
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
            
            console.log(`✅ Text "${REPLACE_TEXT}" has been replaced with image`);
        } else {
            console.log("❌ Text replacement failed.");
        }
    } catch (error) {
        console.error("❌ Error in main:", error.message);
        process.exit(1);
    }
}

/**
 * Replaces text in PDF with image using PDF4Me service
 * @param {string} inputPdfPath - Path to the input PDF file
 * @param {string} replacementImagePath - Path to the replacement image file
 * @param {string} replaceText - Text to be replaced with the image
 * @param {string} pageSequence - Pages to apply replacement
 * @param {number} imageHeight - Height of the replacement image
 * @param {number} imageWidth - Width of the replacement image
 * @returns {Promise<string|null>} - Path to the modified PDF file, or null if failed
 */
async function replaceTextWithImage(inputPdfPath, replacementImagePath, replaceText, pageSequence, imageHeight, imageWidth) {
    try {
        // Check if input PDF file exists
        if (!fs.existsSync(inputPdfPath)) {
            console.log(`❌ PDF file not found: ${inputPdfPath}`);
            return null;
        }
        console.log("✅ Input PDF file found");

        // Check if replacement image file exists
        if (!fs.existsSync(replacementImagePath)) {
            console.log(`❌ Replacement image file not found: ${replacementImagePath}`);
            return null;
        }
        console.log("✅ Replacement image file found");

        // Read and encode PDF file
        const pdfBytes = fs.readFileSync(inputPdfPath);
        const pdfBase64 = pdfBytes.toString('base64');
        console.log("✅ PDF file encoded to base64");

        // Read and encode replacement image file
        const imageBytes = fs.readFileSync(replacementImagePath);
        const imageBase64 = imageBytes.toString('base64');
        console.log("✅ Replacement image file encoded to base64");

        // Prepare API request payload (matching Python sample)
        const payload = {
            docContent: pdfBase64,
            docName: path.basename(inputPdfPath),
            replaceText: replaceText,
            pageSequence: pageSequence,
            imageContent: imageBase64,
            imageHeight: imageHeight,
            imageWidth: imageWidth,
            async: true
        };

        console.log("✅ API request prepared");
        console.log(`🔍 Replacing text: "${replaceText}" with image: ${path.basename(replacementImagePath)}`);
        
        // Execute the text replacement operation
        return await executeTextReplacement(payload, OUTPUT_PDF_PATH);
        
    } catch (error) {
        console.error("❌ Error in replaceTextWithImage:", error.message);
        return null;
    }
}

/**
 * Executes the text replacement operation
 * @param {Object} payload - API request payload
 * @param {string} outputPdfPath - Path where to save the modified PDF
 * @returns {Promise<string|null>} - Path to the modified PDF file, or null if failed
 */
async function executeTextReplacement(payload, outputPdfPath) {
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
            console.log(`✅ Modified PDF saved to: ${outputPdfPath}`);
            console.log("✅ Text replacement completed successfully");
            
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
                    console.log(`✅ Modified PDF saved to: ${outputPdfPath}`);
                    console.log("✅ Text replacement completed successfully");
                    
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
            console.log("❌ Timeout: Text replacement did not complete after multiple retries.");
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
        console.error("❌ Error in executeTextReplacement:", error.message);
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

module.exports = { replaceTextWithImage, executeTextReplacement }; 