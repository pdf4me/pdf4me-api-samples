// Image Extract Text - JavaScript Implementation
// Implementation will be added later 

const fs = require('fs');
const path = require('path');

/**
 * Extract Text from Image using PDF4Me API
 * Performs OCR (Optical Character Recognition) on images to extract text content
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for extracting text from images
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ImageExtractText`;

// File paths configuration
const INPUT_IMAGE_PATH = "sample.png";                             // Input image file with text
const OUTPUT_TEXT_PATH = "extracted_text.txt";                     // Output text file

// Processing configuration
const MAX_RETRIES = 10;                                            // Maximum number of polling retries
const RETRY_DELAY = 10;                                            // Delay between retries in seconds

/**
 * Main function to extract text from image
 */
async function main() {
    console.log("=== Extracting Text from Image ===");
    
    try {
        const result = await extractTextFromImage(INPUT_IMAGE_PATH);
        
        if (result) {
            console.log(`\n🎉 Text extraction completed successfully!`);
            console.log(`📁 Output file: ${result}`);
            
            // Read and display extracted text
            const extractedText = fs.readFileSync(result, 'utf8');
            console.log("\n📄 Extracted Text:");
            console.log("─".repeat(50));
            console.log(extractedText || "(No text found in image)");
            console.log("─".repeat(50));
            
            // Get file stats
            const stats = fs.statSync(result);
            console.log(`\n📊 Text file size: ${stats.size.toLocaleString()} bytes`);
            console.log(`📊 Character count: ${extractedText.length.toLocaleString()}`);
            
            console.log("\n✅ Text has been extracted and saved");
        } else {
            console.log("❌ Text extraction failed.");
        }
    } catch (error) {
        console.error("❌ Error in main:", error.message);
        process.exit(1);
    }
}

/**
 * Extracts text from an image using PDF4Me service
 * @param {string} inputImagePath - Path to the input image file
 * @returns {Promise<string|null>} - Path to the extracted text file, or null if failed
 */
async function extractTextFromImage(inputImagePath) {
    try {
        // Check if input image file exists
        if (!fs.existsSync(inputImagePath)) {
            console.log(`❌ Image file not found: ${inputImagePath}`);
            return null;
        }
        console.log("✅ Input image file found");

        // Read and encode image file
        const imageBytes = fs.readFileSync(inputImagePath);
        const imageBase64 = imageBytes.toString('base64');
        console.log("✅ Image file encoded to base64");

        // Prepare API request payload
        const payload = {
            docContent: imageBase64,
            docName: path.basename(inputImagePath),
            language: "eng",                                       // OCR language (English)
            async: true
        };

        console.log("✅ API request prepared with OCR parameters");
        console.log(`🔤 OCR Language: ${payload.language}`);
        
        // Execute the text extraction operation
        return await executeTextExtraction(payload, OUTPUT_TEXT_PATH);
        
    } catch (error) {
        console.error("❌ Error in extractTextFromImage:", error.message);
        return null;
    }
}

/**
 * Executes the text extraction operation
 * @param {Object} payload - API request payload
 * @param {string} outputTextPath - Path where to save the extracted text
 * @returns {Promise<string|null>} - Path to the text file, or null if failed
 */
async function executeTextExtraction(payload, outputTextPath) {
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
            
            const resultText = await response.text();
            fs.writeFileSync(outputTextPath, resultText);
            console.log(`✅ Extracted text saved to: ${outputTextPath}`);
            console.log("✅ Text extraction completed successfully");
            
            return outputTextPath;
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
                    
                    const resultText = await pollResponse.text();
                    fs.writeFileSync(outputTextPath, resultText);
                    console.log(`✅ Extracted text saved to: ${outputTextPath}`);
                    console.log("✅ Text extraction completed successfully");
                    
                    return outputTextPath;
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
            console.log("❌ Timeout: Text extraction did not complete after multiple retries.");
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
        console.error("❌ Error in executeTextExtraction:", error.message);
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

module.exports = { extractTextFromImage, executeTextExtraction }; 