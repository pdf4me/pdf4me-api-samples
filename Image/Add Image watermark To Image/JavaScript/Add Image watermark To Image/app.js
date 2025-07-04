// Add Image watermark To Image - JavaScript Implementation
// Implementation will be added later 

const fs = require('fs');
const path = require('path');

/**
 * Add Image Watermark To Image using PDF4Me API
 * Adds image watermarks to images with control over position, opacity, and rotation
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for adding image watermark to images
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/AddImageWatermarkToImage`;

// File paths configuration
const INPUT_IMAGE_PATH = "sample_image.jpg";                       // Input image file to watermark
const WATERMARK_IMAGE_PATH = "pdf4me.png";                         // Watermark image file
const OUTPUT_IMAGE_PATH = "Add_image_watermark_to_image_output.jpg"; // Output watermarked image file

// Processing configuration
const MAX_RETRIES = 10;                                            // Maximum number of polling retries
const RETRY_DELAY = 10;                                            // Delay between retries in seconds

/**
 * Main function to add image watermark to image
 */
async function main() {
    console.log("=== Adding Image Watermark To Image ===");
    
    try {
        const result = await addImageWatermarkToImage(INPUT_IMAGE_PATH, WATERMARK_IMAGE_PATH);
        
        if (result) {
            console.log(`\n🎉 Image watermark addition completed successfully!`);
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
            
            console.log("✅ Image has been watermarked and is ready for use");
        } else {
            console.log("❌ Image watermark addition failed.");
        }
    } catch (error) {
        console.error("❌ Error in main:", error.message);
        process.exit(1);
    }
}

/**
 * Adds image watermark to an image using PDF4Me service
 * @param {string} inputImagePath - Path to the input image file
 * @param {string} watermarkImagePath - Path to the watermark image file
 * @returns {Promise<string|null>} - Path to the watermarked image file, or null if failed
 */
async function addImageWatermarkToImage(inputImagePath, watermarkImagePath) {
    try {
        // Check if input image file exists
        if (!fs.existsSync(inputImagePath)) {
            console.log(`❌ Image file not found: ${inputImagePath}`);
            return null;
        }
        if (!fs.existsSync(watermarkImagePath)) {
            console.log(`❌ Watermark image file not found: ${watermarkImagePath}`);
            return null;
        }
        console.log("✅ Input image and watermark files found");

        // Read and encode image files
        const imageBytes = fs.readFileSync(inputImagePath);
        const imageBase64 = imageBytes.toString('base64');
        const watermarkBytes = fs.readFileSync(watermarkImagePath);
        const watermarkBase64 = watermarkBytes.toString('base64');
        console.log("✅ Image and watermark files encoded to base64");

        // Prepare API request payload
        const payload = {
            docName: path.basename(inputImagePath),
            docContent: imageBase64,
            WatermarkFileName: path.basename(watermarkImagePath),
            WatermarkFileContent: watermarkBase64,
            Position: "topright",
            Opacity: 1,
            HorizontalOffset: 0,
            VerticalOffset: 0,
            PositionX: 0.0,
            PositionY: 0.0,
            Rotation: 0.0,
            async: true
        };

        console.log("✅ API request prepared with image watermark parameters");
        
        // Execute the image watermark operation
        return await executeImageWatermark(payload, OUTPUT_IMAGE_PATH);
        
    } catch (error) {
        console.error("❌ Error in addImageWatermarkToImage:", error.message);
        return null;
    }
}

/**
 * Executes the image watermark operation
 * @param {Object} payload - API request payload
 * @param {string} outputImagePath - Path where to save the watermarked image
 * @returns {Promise<string|null>} - Path to the watermarked image file, or null if failed
 */
async function executeImageWatermark(payload, outputImagePath) {
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
            console.log(`✅ Watermarked image saved to: ${outputImagePath}`);
            console.log("✅ Image watermark addition completed successfully");
            
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
                    console.log(`✅ Watermarked image saved to: ${outputImagePath}`);
                    console.log("✅ Image watermark addition completed successfully");
                    
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
            console.log("❌ Timeout: Image watermark addition did not complete after multiple retries.");
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
        console.error("❌ Error in executeImageWatermark:", error.message);
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

module.exports = { addImageWatermarkToImage, executeImageWatermark }; 