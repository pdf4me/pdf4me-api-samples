// Create Image from PDF - JavaScript Implementation
// Implementation will be added later 

const fs = require('fs');
const path = require('path');

/**
 * Create Image from PDF using PDF4Me API
 * Converts PDF pages to images with control over format, size, and page selection
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for creating images from PDF
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/CreateImages`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                               // Input PDF file to convert
const OUTPUT_FOLDER = "PDF_to_Images_outputs";                     // Output folder for converted images

// Processing configuration
const MAX_RETRIES = 20;                                            // Maximum number of polling retries
const RETRY_DELAY = 10;                                            // Delay between retries in seconds

/**
 * Main function to create images from PDF
 */
async function main() {
    console.log("=== Creating Images from PDF ===");
    
    try {
        const result = await createImagesFromPdf(INPUT_PDF_PATH);
        
        if (result) {
            console.log(`\n🎉 PDF to image conversion completed successfully!`);
            console.log(`📁 Output folder: ${result}`);
            
            // List created files
            const files = fs.readdirSync(result);
            console.log(`📊 Created ${files.length} files:`);
            files.forEach(file => {
                const filePath = path.join(result, file);
                const stats = fs.statSync(filePath);
                console.log(`   - ${file} (${stats.size.toLocaleString()} bytes)`);
            });
            
            console.log("✅ Images have been created and are ready for use");
        } else {
            console.log("❌ PDF to image conversion failed.");
        }
    } catch (error) {
        console.error("❌ Error in main:", error.message);
        process.exit(1);
    }
}

/**
 * Creates images from PDF pages using PDF4Me service
 * @param {string} inputPdfPath - Path to the input PDF file
 * @returns {Promise<string|null>} - Path to the output folder, or null if failed
 */
async function createImagesFromPdf(inputPdfPath) {
    try {
        // Check if input PDF file exists
        if (!fs.existsSync(inputPdfPath)) {
            console.log(`❌ PDF file not found: ${inputPdfPath}`);
            return null;
        }
        console.log("✅ Input PDF file found");

        // Create output folder if it doesn't exist
        if (!fs.existsSync(OUTPUT_FOLDER)) {
            fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
            console.log(`📁 Created output folder: ${OUTPUT_FOLDER}`);
        }

        // Read and encode PDF file
        const pdfBytes = fs.readFileSync(inputPdfPath);
        const pdfBase64 = pdfBytes.toString('base64');
        console.log("✅ PDF file encoded to base64");

        // Prepare API request payload
        const payload = {
            docContent: pdfBase64,
            docname: path.basename(inputPdfPath),
            imageAction: {
                WidthPixel: "800",
                ImageExtension: "jpeg",
                PageSelection: {
                    PageNrs: [1, 2, 3]
                }
            },
            pageNrs: "1-2",
            async: true
        };

        console.log("✅ API request prepared with image creation parameters");
        console.log(`📄 Converting pages 1-2 to JPEG format (800px width)`);
        
        // Execute the PDF to image operation
        return await executePdfToImages(payload, OUTPUT_FOLDER);
        
    } catch (error) {
        console.error("❌ Error in createImagesFromPdf:", error.message);
        return null;
    }
}

/**
 * Executes the PDF to images operation
 * @param {Object} payload - API request payload
 * @param {string} outputFolder - Folder where to save the images
 * @returns {Promise<string|null>} - Path to the output folder, or null if failed
 */
async function executePdfToImages(payload, outputFolder) {
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
            
            const resultData = await response.json();
            return await saveImageResults(resultData, outputFolder);
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
                    
                    const resultData = await pollResponse.json();
                    return await saveImageResults(resultData, outputFolder);
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
            console.log("❌ Timeout: PDF to image conversion did not complete after multiple retries.");
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
        console.error("❌ Error in executePdfToImages:", error.message);
        return null;
    }
}

/**
 * Saves the image results to the output folder
 * @param {Object} resultData - API response data containing images
 * @param {string} outputFolder - Folder where to save the images
 * @returns {Promise<string|null>} - Path to the output folder, or null if failed
 */
async function saveImageResults(resultData, outputFolder) {
    try {
        let imagesToSave = [];
        
        // Handle different response formats
        if (Array.isArray(resultData)) {
            imagesToSave = resultData;
        } else if (resultData.outputDocuments && Array.isArray(resultData.outputDocuments)) {
            imagesToSave = resultData.outputDocuments.map(doc => ({
                docContent: doc.streamFile,
                docName: doc.fileName
            }));
        } else if (resultData.docContent && resultData.docName) {
            imagesToSave = [resultData];
        } else {
            console.log("❌ Unexpected response format");
            fs.writeFileSync(path.join(outputFolder, "raw_response.json"), JSON.stringify(resultData, null, 2));
            console.log(`📄 Raw response saved for debugging: ${outputFolder}/raw_response.json`);
            return null;
        }
        
        // Save each image
        console.log(`💾 Saving ${imagesToSave.length} images...`);
        for (let i = 0; i < imagesToSave.length; i++) {
            const image = imagesToSave[i];
            if (image.docContent && image.docName) {
                const imageContent = Buffer.from(image.docContent, 'base64');
                const outputPath = path.join(outputFolder, image.docName);
                fs.writeFileSync(outputPath, imageContent);
                console.log(`✅ Saved: ${image.docName} (${imageContent.length.toLocaleString()} bytes)`);
            }
        }
        
        console.log(`✅ All images saved to: ${outputFolder}`);
        return outputFolder;
        
    } catch (error) {
        console.error("❌ Error saving images:", error.message);
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

module.exports = { createImagesFromPdf, executePdfToImages, saveImageResults }; 