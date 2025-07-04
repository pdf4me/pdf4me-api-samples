// Read Barcode From Image - JavaScript Implementation
// Implementation will be added later 

const fs = require('fs');
const path = require('path');

/**
 * Read Barcode From Image using PDF4Me API
 * Detects and reads barcodes from images including QR codes, Code128, etc.
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for reading barcodes from images
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ReadBarcodesFromImage`;

// File paths configuration
const INPUT_IMAGE_PATH = "sample.png";                             // Input image file with barcode
const OUTPUT_JSON_PATH = "barcode_results.json";                   // Output JSON file with results

// Processing configuration
const MAX_RETRIES = 10;                                            // Maximum number of polling retries
const RETRY_DELAY = 10;                                            // Delay between retries in seconds

/**
 * Main function to read barcode from image
 */
async function main() {
    console.log("=== Reading Barcode From Image ===");
    
    try {
        const result = await readBarcodeFromImage(INPUT_IMAGE_PATH);
        
        if (result) {
            console.log(`\n🎉 Barcode reading completed successfully!`);
            console.log(`📁 Output file: ${result}`);
            
            // Read and display barcode results
            const barcodeData = JSON.parse(fs.readFileSync(result, 'utf8'));
            console.log("\n📊 Barcode Results:");
            
            if (barcodeData.barcodes && barcodeData.barcodes.length > 0) {
                barcodeData.barcodes.forEach((barcode, index) => {
                    console.log(`\n  Barcode ${index + 1}:`);
                    console.log(`  • Type: ${barcode.type || 'Unknown'}`);
                    console.log(`  • Value: ${barcode.text || 'No value'}`);
                    console.log(`  • Format: ${barcode.format || 'Unknown'}`);
                });
            } else {
                console.log("  No barcodes detected in the image");
            }
            
            console.log("\n✅ Barcode data has been extracted and saved");
        } else {
            console.log("❌ Barcode reading failed.");
        }
    } catch (error) {
        console.error("❌ Error in main:", error.message);
        process.exit(1);
    }
}

/**
 * Reads barcodes from an image using PDF4Me service
 * @param {string} inputImagePath - Path to the input image file
 * @returns {Promise<string|null>} - Path to the results JSON file, or null if failed
 */
async function readBarcodeFromImage(inputImagePath) {
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
            readMultipleBarcodes: true,                            // Read all barcodes in image
            barcodeTypes: ["All"],                                 // Detect all barcode types
            async: true
        };

        console.log("✅ API request prepared with barcode parameters");
        console.log(`🔍 Reading mode: Multiple barcodes = ${payload.readMultipleBarcodes}`);
        
        // Execute the barcode reading operation
        return await executeBarcodeReading(payload, OUTPUT_JSON_PATH);
        
    } catch (error) {
        console.error("❌ Error in readBarcodeFromImage:", error.message);
        return null;
    }
}

/**
 * Executes the barcode reading operation
 * @param {Object} payload - API request payload
 * @param {string} outputJsonPath - Path where to save the results JSON
 * @returns {Promise<string|null>} - Path to the results file, or null if failed
 */
async function executeBarcodeReading(payload, outputJsonPath) {
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
            
            const resultJson = await response.json();
            fs.writeFileSync(outputJsonPath, JSON.stringify(resultJson, null, 2));
            console.log(`✅ Barcode results saved to: ${outputJsonPath}`);
            console.log("✅ Barcode reading completed successfully");
            
            return outputJsonPath;
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
                    
                    const resultJson = await pollResponse.json();
                    fs.writeFileSync(outputJsonPath, JSON.stringify(resultJson, null, 2));
                    console.log(`✅ Barcode results saved to: ${outputJsonPath}`);
                    console.log("✅ Barcode reading completed successfully");
                    
                    return outputJsonPath;
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
            console.log("❌ Timeout: Barcode reading did not complete after multiple retries.");
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
        console.error("❌ Error in executeBarcodeReading:", error.message);
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

module.exports = { readBarcodeFromImage, executeBarcodeReading }; 