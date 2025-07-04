// Rotate Image - JavaScript Implementation
// Rotates an image using the PDF4Me API

const fs = require('fs');
const path = require('path');

// API Configuration
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/RotateImage`;

// File paths
const INPUT_IMAGE_PATH = "pdf4me.png";
const OUTPUT_IMAGE_PATH = "pdf4me.rotated.png";

// Rotation configuration
const ROTATION_ANGLE = 90; // Rotation angle in degrees (90, 180, 270)

// Processing configuration
const MAX_RETRIES = 10;
const RETRY_DELAY = 10; // seconds

async function main() {
    console.log("=== Rotate Image ===");
    try {
        const result = await rotateImage(INPUT_IMAGE_PATH, ROTATION_ANGLE);
        if (result) {
            console.log(`\n🎉 Image rotation completed successfully!`);
            console.log(`📁 Output file: ${result}`);
            const stats = fs.statSync(result);
            console.log(`📊 File size: ${stats.size.toLocaleString()} bytes`);
            if (fs.existsSync(INPUT_IMAGE_PATH)) {
                const originalStats = fs.statSync(INPUT_IMAGE_PATH);
                console.log(`📊 Original file size: ${originalStats.size.toLocaleString()} bytes`);
                const sizeDiff = stats.size - originalStats.size;
                console.log(`📊 Size difference: ${sizeDiff > 0 ? '+' : ''}${sizeDiff.toLocaleString()} bytes`);
            }
            console.log(`✅ Image has been rotated by ${ROTATION_ANGLE} degrees`);
        } else {
            console.log("❌ Image rotation failed.");
        }
    } catch (error) {
        console.error("❌ Error in main:", error.message);
        process.exit(1);
    }
}

async function rotateImage(inputImagePath, rotationAngle) {
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
            docContent: imageBase64,
            docName: "output",
            rotationAngle: rotationAngle,
            async: true
        };
        console.log("✅ API request prepared");
        console.log(`🔄 Rotating image by ${rotationAngle} degrees`);
        return await executeRotation(payload, OUTPUT_IMAGE_PATH);
    } catch (error) {
        console.error("❌ Error in rotateImage:", error.message);
        return null;
    }
}

async function executeRotation(payload, outputImagePath) {
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
            console.log(`✅ Rotated image saved to: ${outputImagePath}`);
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
                    console.log(`✅ Rotated image saved to: ${outputImagePath}`);
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
            console.log("❌ Timeout: Image rotation did not complete after multiple retries.");
            return null;
        } else {
            console.log(`❌ Initial request failed: ${response.status}`);
            const errorText = await response.text();
            console.log(`❌ Error details: ${errorText}`);
            return null;
        }
    } catch (error) {
        console.error("❌ Error in executeRotation:", error.message);
        return null;
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error("❌ Unhandled error:", error);
        process.exit(1);
    });
}

module.exports = { rotateImage, executeRotation }; 