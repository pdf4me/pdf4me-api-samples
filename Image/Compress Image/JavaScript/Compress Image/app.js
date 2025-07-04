// Compress Image - JavaScript Implementation
// Implementation will be added later 

const fs = require('fs');
const path = require('path');

/**
 * Compress Image using PDF4Me API
 * Compresses images with control over output format and compression level
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for compressing images
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/CompressImage`;

// File paths configuration
const INPUT_IMAGE_PATH = "sample.jpg";                       // Input image file to compress
const OUTPUT_IMAGE_PATH = "Compress_image_output.jpg";        // Output compressed image file

// Processing configuration
const MAX_RETRIES = 10;                                            // Maximum number of polling retries
const RETRY_DELAY = 10;                                            // Delay between retries in seconds

/**
 * Main function to compress image
 */
async function main() {
    console.log("=== Compressing Image ===");
    
    try {
        const result = await compressImage(INPUT_IMAGE_PATH);
        
        if (result) {
            console.log(`\n🎉 Image compression completed successfully!`);
            console.log(`📁 Output file: ${result}`);
            
            // Get file stats for additional info
            const stats = fs.statSync(result);
            console.log(`📊 File size: ${stats.size.toLocaleString()} bytes`);
            
            // Compare with original file size if it exists
            if (fs.existsSync(INPUT_IMAGE_PATH)) {
                const originalStats = fs.statSync(INPUT_IMAGE_PATH);
                console.log(`📊 Original file size: ${originalStats.size.toLocaleString()} bytes`);
                const sizeDiff = stats.size - originalStats.size;
                console.log(`📊 Size difference: ${sizeDiff > 0 ? '+' : ''}${sizeDiff.toLocaleString()} bytes`);
            }
            
            console.log("✅ Image has been compressed and is ready for use");
        } else {
            console.log("❌ Image compression failed.");
        }
    } catch (error) {
        console.error("❌ Error in main:", error.message);
        process.exit(1);
    }
}

/**
 * Compresses an image using PDF4Me service
 * @param {string} inputImagePath - Path to the input image file
 * @returns {Promise<string|null>} - Path to the compressed image file, or null if failed
 */
async function compressImage(inputImagePath) {
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
            imageType: "JPG",
            compressionLevel: "Medium",
            async: true
        };

        console.log("✅ API request prepared with compression parameters");
        
        // Execute the image compression operation
        return await executeImageCompression(payload, OUTPUT_IMAGE_PATH);
        
    } catch (error) {
        console.error("❌ Error in compressImage:", error.message);
        return null;
    }
}

/**
 * Executes the image compression operation
 * @param {Object} payload - API request payload
 * @param {string} outputImagePath - Path where to save the compressed image
 * @returns {Promise<string|null>} - Path to the compressed image file, or null if failed
 */
async function executeImageCompression(payload, outputImagePath) {
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
            fs.writeFileSync(outputImagePath, Buffer.from(resultBytes));
            console.log(`✅ Compressed image saved to: ${outputImagePath}`);
            console.log("✅ Image compression completed successfully");
            
            return outputImagePath;
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
                    fs.writeFileSync(outputImagePath, Buffer.from(resultBytes));
                    console.log(`✅ Compressed image saved to: ${outputImagePath}`);
                    console.log("✅ Image compression completed successfully");
                    
                    return outputImagePath;
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
            console.log("❌ Timeout: Image compression did not complete after multiple retries.");
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
        console.error("❌ Error in executeImageCompression:", error.message);
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

module.exports = { compressImage, executeImageCompression }; 