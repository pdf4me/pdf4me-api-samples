//*******************************************************************************************//
//                                                                                          //
// AWS Lambda Handler for PDF4me Create Barcode                                            //
// Get Your API Key: https://dev.pdf4me.com/dashboard/#/api-keys                            //
// API Documentation: https://developer.pdf4me.com/swagger/index.html?url=/swagger/v2/swagger.json //
//                                                                                          //
// Note: Replace placeholder values in the code with your API Key                           //
//                                                                                          //
//*******************************************************************************************//

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// API Configuration - PDF4me service for creating barcodes
const API_KEY = process.env.PDF4ME_API_KEY || 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';

// API endpoint for creating barcodes
const BASE_URL = 'https://api.pdf4me.com/';
const URL = `${BASE_URL}api/v2/CreateBarcode`;

// File paths configuration
const OUTPUT_PATH = "Barcode_create_output.png";

// Processing configuration
const MAX_RETRIES = 10;
const RETRY_DELAY = 10; // seconds

/**
 * Send barcode creation request to PDF4me API
 * @param {Object} barcodeConfig - Barcode configuration parameters
 * @returns {Promise<Object>} API response containing the barcode image or processing status
 * @throws {Error} For API request errors
 */
async function createBarcode(barcodeConfig = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`
    };

    const payload = {
        text: barcodeConfig.text || "PDF4me Create Barcode Sample", // Text to encode in barcode
        barcodeType: barcodeConfig.barcodeType || "qrCode", // Barcode types: qrCode, code128, dataMatrix, aztec, hanXin, pdf417, etc.
        hideText: barcodeConfig.hideText || false, // Hide barcode text: true=hide, false=show text alongside barcode
        async: true // Enable asynchronous processing
    };

    console.log('Sending barcode creation request to PDF4me API...');

    try {
        const response = await axios.post(URL, payload, {
            headers,
            timeout: 30000,
            responseType: 'arraybuffer', // Ensure response is treated as binary
            validateStatus: () => true
        });

        console.log(`Response Status Code: ${response.status} (${response.statusText})`);
        console.log('Response Headers:');
        for (const [headerName, headerValue] of Object.entries(response.headers)) {
            console.log(`  ${headerName}: ${headerValue}`);
        }

        if (response.status === 200) {
            console.log('Success! Barcode creation completed successfully!');
            return { binaryContent: response.data, status: 'success' };
        } else if (response.status === 202) {
            console.log('Request accepted. Processing asynchronously...');
            const locationUrl = response.headers['location'];
            console.log(`Location URL: ${locationUrl || 'NOT FOUND'}`);
            return { jobId: null, location: locationUrl, status: 'processing' };
        } else {
            const errorData = Buffer.from(response.data).toString('utf8');
            console.log(`Error: ${response.status} - ${errorData}`);
            throw new Error(`API Error: ${response.status} - ${errorData}`);
        }
    } catch (err) {
        if (err.code === 'ECONNABORTED') {
            console.error('Error: Request timeout. The API took too long to respond.');
        } else if (err.response) {
            const errorData = Buffer.from(err.response.data).toString('utf8');
            console.error(`API Request Error: ${err.response.status} - ${errorData}`);
        } else {
            console.error(`API Request Error: ${err.message}`);
        }
        throw err;
    }
}

/**
 * Handle API response and save the barcode image file
 * @param {Object} apiResponse - Response from the PDF4me API
 * @param {string} outputImagePath - Path where to save the barcode image
 * @returns {Promise<Object>} Object containing output path and status
 */
async function handleAsyncResponse(apiResponse, outputImagePath) {
    try {
        if (apiResponse.binaryContent && apiResponse.status === 'success') {
            console.log('Processing binary image response directly...');
            fs.writeFileSync(outputImagePath, Buffer.from(apiResponse.binaryContent));
            console.log(`Barcode image saved successfully: ${outputImagePath}`);
            console.log(`Output file size: ${apiResponse.binaryContent.length} bytes`);
            return { outputPath: outputImagePath, status: 'success', fileSize: apiResponse.binaryContent.length };
        } else if (apiResponse.jobId || apiResponse.requestId || apiResponse.location) {
            console.log('Handling asynchronous processing...');
            const locationUrl = apiResponse.location;
            if (locationUrl) {
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${API_KEY}`
                };
                for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                    console.log(`Checking job status... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * 1000));
                    try {
                        const statusResponse = await axios.get(locationUrl, {
                            headers,
                            responseType: 'arraybuffer', // Expect binary response
                            validateStatus: () => true
                        });
                        console.log(`Poll response status: ${statusResponse.status} (${statusResponse.statusText})`);
                        if (statusResponse.status === 200) {
                            console.log('Processing completed!');
                            fs.writeFileSync(outputImagePath, Buffer.from(statusResponse.data));
                            console.log(`Barcode image saved successfully: ${outputImagePath}`);
                            console.log(`Output file size: ${statusResponse.data.length} bytes`);
                            return { outputPath: outputImagePath, status: 'success', fileSize: statusResponse.data.length };
                        } else if (statusResponse.status === 202) {
                            console.log('Still processing...');
                            continue;
                        } else {
                            const errorData = Buffer.from(statusResponse.data).toString('utf8');
                            console.error(`Error during polling: ${statusResponse.status} - ${errorData}`);
                            return { status: 'error', error: `Polling failed: ${statusResponse.status} - ${errorData}` };
                        }
                    } catch (err) {
                        console.error(`Error polling status: ${err.message}`);
                        continue;
                    }
                }
                console.log('Timeout: Processing did not complete after multiple retries');
                return { status: 'timeout', error: 'Processing timeout' };
            } else {
                console.log('No polling URL available for async job');
                return { status: 'no-polling-url', error: 'No polling URL available' };
            }
        } else {
            console.error('Error: Invalid API response format');
            return { status: 'error', error: 'Invalid API response format' };
        }
    } catch (err) {
        console.error(`Error saving barcode image: ${err.message}`);
        return { status: 'error', error: err.message };
    }
}

/**
 * AWS Lambda handler function
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} Lambda response object
 */
async function handler(event, context) {
    try {
        console.log('Starting Create Barcode Process in Lambda');
        const outputImageName = event.outputImageName || OUTPUT_PATH;
        const barcodeConfig = event.barcodeConfig || {};

        console.log(`Output barcode image: ${outputImageName}`);
        console.log(`Barcode configuration:`, barcodeConfig);
        console.log('Operation: Create standalone barcode');

        const apiResponse = await createBarcode(barcodeConfig);
        const result = await handleAsyncResponse(apiResponse, outputImageName);

        if (result.status === 'success') {
            console.log('Barcode creation completed successfully!');
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Barcode creation completed successfully',
                    outputFileName: outputImageName,
                    fileSize: result.fileSize,
                    barcodeConfig: barcodeConfig
                })
            };
        } else {
            console.log(`Barcode creation failed: ${result.error}`);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Barcode creation failed',
                    error: result.error
                })
            };
        }
    } catch (err) {
        console.error(`Lambda execution failed: ${err.message}`);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                message: 'Lambda execution failed',
                error: err.message
            })
        };
    }
}

// For local testing (not used in Lambda)
async function main() {
    try {
        console.log('Starting Create Barcode Process (Local Test)');
        console.log('=== Creating Standalone Barcode ===');
        
        const outputImageName = OUTPUT_PATH;
        const barcodeConfig = {
            text: "PDF4me Create Barcode Sample",
            barcodeType: "qrCode",
            hideText: false
        };

        console.log(`Output barcode image: ${outputImageName}`);
        console.log(`Barcode configuration:`, barcodeConfig);
        console.log('Operation: Create standalone barcode');

        const apiResponse = await createBarcode(barcodeConfig);
        const result = await handleAsyncResponse(apiResponse, outputImageName);

        if (result.status === 'success') {
            console.log('Barcode creation completed successfully!');
            console.log(`Output file: ${outputImageName}`);
            console.log(`Barcode configuration used:`, barcodeConfig);
        } else {
            console.log(`Barcode creation failed: ${result.error}`);
            console.log('Please check your API configuration');
        }
    } catch (err) {
        console.error(`Barcode creation failed: ${err.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    createBarcode, 
    handleAsyncResponse, 
    main,
    handler 
}; 