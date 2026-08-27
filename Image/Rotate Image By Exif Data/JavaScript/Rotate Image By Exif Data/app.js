// Rotate Image By Exif Data - JavaScript Implementation
// Rotates an image based on EXIF orientation data using the PDF4Me API

const fs = require('fs');
const path = require('path');

// API Configuration
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/RotateImageByExifData`;

// File paths
const INPUT_IMAGE_PATH = "sample.jpg";
const OUTPUT_IMAGE_PATH = "sample.exifrotated.jpg";

// Processing configuration
const MAX_RETRIES = 10;
const RETRY_DELAY = 10; // seconds

async function main() {
    console.log("=== Rotate Image By Exif Data ===");
    try {
        const result = await rotateImageByExifData(INPUT_IMAGE_PATH);
        if (result) {
            console.log(`\n🎉 EXIF-based image rotation completed successfully!`);
            console.log(`📁 Output file: ${result}`);
            const stats = fs.statSync(result);
            console.log(`📊 File size: ${stats.size.toLocaleString()} bytes`);
            if (fs.existsSync(INPUT_IMAGE_PATH)) {
                const originalStats = fs.statSync(INPUT_IMAGE_PATH);
                console.log(`📊 Original file size: ${originalStats.size.toLocaleString()} bytes`);
                const sizeDiff = stats.size - originalStats.size;
                console.log(`📊 Size difference: ${sizeDiff > 0 ? '+' : ''}${sizeDiff.toLocaleString()} bytes`);
            }
            console.log("✅ Image has been rotated based on EXIF orientation data");
        } else {
            console.log("❌ EXIF-based image rotation failed.");
        }
    } catch (error) {
        console.error("❌ Error in main:", error.message);
        process.exit(1);
    }
}

async function rotateImageByExifData(inputImagePath) {
    try {
        if (!fs.existsSync(inputImagePath)) {
            console.log(`❌ Image file not found: ${inputImagePath}`);
            return null;
        }
        console.log("✅ Input image file found");
        const imageBytes = fs.readFileSync(inputImagePath);
        const imageBase64 = imageBytes.toString('base64');
        console.log("✅ Image file encoded to base64");
        
        // Determine image type from file extension
        const imageType = getImageTypeFromExtension(inputImagePath);
        console.log(`📋 Image type detected: ${imageType}`);
        
        const payload = {
            docContent: imageBase64,
            docName: path.basename(inputImagePath),
            imageType: imageType,
            isAsync: true
        };
        console.log("✅ API request prepared");
        console.log("🔄 Rotating image based on EXIF orientation data");
        return await executeExifRotation(payload, OUTPUT_IMAGE_PATH);
    } catch (error) {
        console.error("❌ Error in rotateImageByExifData:", error.message);
        return null;
    }
}

async function executeExifRotation(payload, outputImagePath) {
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
            console.log(`✅ EXIF-rotated image saved to: ${outputImagePath}`);
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
                    console.log(`✅ EXIF-rotated image saved to: ${outputImagePath}`);
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
            console.log("❌ Timeout: EXIF-based image rotation did not complete after multiple retries.");
            return null;
        } else {
            console.log(`❌ Initial request failed: ${response.status}`);
            const errorText = await response.text();
            console.log(`❌ Error details: ${errorText}`);
            return null;
        }
    } catch (error) {
        console.error("❌ Error in executeExifRotation:", error.message);
        return null;
    }
}

function getImageTypeFromExtension(filePath) {
    const extension = path.extname(filePath).toUpperCase();
    switch (extension) {
        case '.JPG':
        case '.JPEG':
            return 'JPG';
        case '.PNG':
            return 'PNG';
        case '.GIF':
            return 'GIF';
        case '.BMP':
            return 'BMP';
        case '.TIFF':
        case '.TIF':
            return 'TIFF';
        case '.WEBP':
            return 'WEBP';
        default:
            return 'JPG'; // Default to JPG for unknown extensions
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error("❌ Unhandled error:", error);
        process.exit(1);
    });
}

module.exports = { rotateImageByExifData, executeExifRotation, getImageTypeFromExtension }; 