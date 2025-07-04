// Resize Image - JavaScript Implementation
// Resizes an image using the PDF4Me API

const fs = require('fs');
const path = require('path');

// API Configuration
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ResizeImage?schemaVal=Percentange`;

// File paths
const INPUT_IMAGE_PATH = "sample.jpg";
const OUTPUT_IMAGE_PATH = "sample.resized.jpg";

// Resize configuration
const IMAGE_RESIZE_TYPE = "Percentage"; // or "Pixel"
const RESIZE_PERCENTAGE = "20.1010";    // as string, e.g., "20.1010"
const WIDTH = 60;                       // Target width in pixels
const HEIGHT = 60;                      // Target height in pixels
const MAINTAIN_ASPECT_RATIO = true;

// Processing configuration
const MAX_RETRIES = 10;
const RETRY_DELAY = 10; // seconds

async function main() {
    console.log("=== Resize Image ===");
    try {
        const result = await resizeImage(INPUT_IMAGE_PATH);
        if (result) {
            console.log(`\n🎉 Image resizing completed successfully!`);
            console.log(`📁 Output file: ${result}`);
            const stats = fs.statSync(result);
            console.log(`📊 File size: ${stats.size.toLocaleString()} bytes`);
            if (fs.existsSync(INPUT_IMAGE_PATH)) {
                const originalStats = fs.statSync(INPUT_IMAGE_PATH);
                console.log(`📊 Original file size: ${originalStats.size.toLocaleString()} bytes`);
                const sizeDiff = stats.size - originalStats.size;
                console.log(`📊 Size difference: ${sizeDiff > 0 ? '+' : ''}${sizeDiff.toLocaleString()} bytes`);
            }
            console.log("✅ Image has been resized");
        } else {
            console.log("❌ Image resizing failed.");
        }
    } catch (error) {
        console.error("❌ Error in main:", error.message);
        process.exit(1);
    }
}

async function resizeImage(inputImagePath) {
    try {
        if (!fs.existsSync(inputImagePath)) {
            console.log(`❌ Image file not found: ${inputImagePath}`);
            return null;
        }
        console.log("✅ Input image file found");
        const imageBytes = fs.readFileSync(inputImagePath);
        const imageBase64 = imageBytes.toString('base64');
        console.log("✅ Image file encoded to base64");
        const payload = {
            docName: path.basename(inputImagePath),
            docContent: imageBase64,
            ImageResizeType: IMAGE_RESIZE_TYPE,
            ResizePercentage: RESIZE_PERCENTAGE,
            Width: WIDTH,
            Height: HEIGHT,
            MaintainAspectRatio: MAINTAIN_ASPECT_RATIO,
            async: true
        };
        console.log("✅ API request prepared");
        return await executeResize(payload, OUTPUT_IMAGE_PATH);
    } catch (error) {
        console.error("❌ Error in resizeImage:", error.message);
        return null;
    }
}

async function executeResize(payload, outputImagePath) {
    try {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${API_KEY}`
            },
            body: JSON.stringify(payload)
        };
        const response = await fetch(API_ENDPOINT, requestOptions);
        if (response.status === 200) {
            console.log("✅ Immediate success response (200 OK)");
            const resultBytes = await response.arrayBuffer();
            fs.writeFileSync(outputImagePath, Buffer.from(resultBytes));
            console.log(`✅ Resized image saved to: ${outputImagePath}`);
            return outputImagePath;
        } else if (response.status === 202) {
            console.log("⏳ Asynchronous processing started (202 Accepted)");
            const locationUrl = response.headers.get('Location');
            if (!locationUrl) {
                console.log("❌ No 'Location' header found in the response.");
                return null;
            }
            console.log(`🔄 Polling URL: ${locationUrl}`);
            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                console.log(`⏳ Polling attempt ${attempt + 1}/${MAX_RETRIES}...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * 1000));
                const pollOptions = {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${API_KEY}`
                    }
                };
                const pollResponse = await fetch(locationUrl, pollOptions);
                if (pollResponse.status === 200) {
                    console.log("✅ Polling successful (200 OK)");
                    const resultBytes = await pollResponse.arrayBuffer();
                    fs.writeFileSync(outputImagePath, Buffer.from(resultBytes));
                    console.log(`✅ Resized image saved to: ${outputImagePath}`);
                    return outputImagePath;
                } else if (pollResponse.status === 202) {
                    console.log("⏳ Still processing, continuing to poll...");
                    continue;
                } else {
                    console.log(`❌ Polling error: ${pollResponse.status}`);
                    const errorText = await pollResponse.text();
                    console.log(`❌ Error details: ${errorText}`);
                    return null;
                }
            }
            console.log("❌ Timeout: Image resizing did not complete after multiple retries.");
            return null;
        } else {
            console.log(`❌ Initial request failed: ${response.status}`);
            const errorText = await response.text();
            console.log(`❌ Error details: ${errorText}`);
            return null;
        }
    } catch (error) {
        console.error("❌ Error in executeResize:", error.message);
        return null;
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error("❌ Unhandled error:", error);
        process.exit(1);
    });
}

module.exports = { resizeImage, executeResize }; 