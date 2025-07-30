//*******************************************************************************************//
//                                                                                          //
// AWS Lambda Handler for PDF4me Convert URL To PDF                                         //
// Get Your API Key: https://dev.pdf4me.com/dashboard/#/api-keys                            //
// API Documentation: https://developer.pdf4me.com/swagger/index.html?url=/swagger/v2/swagger.json //
//                                                                                          //
// Note: Replace placeholder values in the code with your API Key                           //
//                                                                                          //
//*******************************************************************************************//

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// API Configuration - PDF4me service for converting URLs to PDF
const API_KEY = process.env.PDF4ME_API_KEY || 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';

// API endpoint for converting URLs to PDF
const BASE_URL = 'https://api.pdf4me.com/';
const URL = `${BASE_URL}api/v2/ConvertUrlToPdf`;

// File paths configuration
const INPUT_URL = "https://www.example.com";
const OUTPUT_PATH = "URL_to_PDF_output.pdf";

// Processing configuration
const MAX_RETRIES = 10;
const RETRY_DELAY = 10; // seconds

/**
 * Send URL to PDF4me API for PDF conversion
 * @param {string} targetUrl - URL to be converted to PDF
 * @param {string} filename - Name for the output PDF file
 * @param {Object} conversionConfig - Conversion configuration parameters
 * @returns {Promise<Object>} API response containing the processed file or processing status
 * @throws {Error} For API request errors
 */
async function convertUrlToPdf(targetUrl, filename, conversionConfig = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`
    };

    const payload = {
        url: targetUrl,                           // URL to convert to PDF (Required)
        docName: filename,                        // Output document name (Required)
        async: true                               // Asynchronous processing as requested
    };

    console.log('Sending URL to PDF4me API for PDF conversion...');

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
            console.log('Success! URL to PDF conversion completed successfully!');
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
 * Handle API response and save the converted PDF file
 * @param {Object} apiResponse - Response from the PDF4me API
 * @param {string} outputPdfPath - Path where to save the processed PDF
 * @returns {Promise<Object>} Object containing output path and status
 */
async function handleAsyncResponse(apiResponse, outputPdfPath) {
    try {
        if (apiResponse.binaryContent && apiResponse.status === 'success') {
            console.log('Processing binary PDF response directly...');
            fs.writeFileSync(outputPdfPath, Buffer.from(apiResponse.binaryContent));
            console.log(`PDF conversion saved successfully: ${outputPdfPath}`);
            console.log(`Output file size: ${apiResponse.binaryContent.length} bytes`);
            return { outputPath: outputPdfPath, status: 'success', fileSize: apiResponse.binaryContent.length };
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
                            fs.writeFileSync(outputPdfPath, Buffer.from(statusResponse.data));
                            console.log(`PDF conversion saved successfully: ${outputPdfPath}`);
                            console.log(`Output file size: ${statusResponse.data.length} bytes`);
                            return { outputPath: outputPdfPath, status: 'success', fileSize: statusResponse.data.length };
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
        console.error(`Error saving converted PDF: ${err.message}`);
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
        console.log('Starting Convert URL To PDF Process in Lambda');
        const targetUrl = event.targetUrl || 'https://www.example.com';
        const outputPdfName = event.outputPdfName || OUTPUT_PATH;
        const conversionConfig = event.conversionConfig || {};

        console.log(`Target URL: ${targetUrl}`);
        console.log(`Output PDF: ${outputPdfName}`);
        console.log(`Conversion configuration:`, conversionConfig);
        console.log('Operation: Convert URL to PDF');

        const apiResponse = await convertUrlToPdf(targetUrl, outputPdfName, conversionConfig);
        const result = await handleAsyncResponse(apiResponse, outputPdfName);

        if (result.status === 'success') {
            console.log('URL to PDF conversion completed successfully!');
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'URL to PDF conversion completed successfully',
                    outputFileName: outputPdfName,
                    fileSize: result.fileSize,
                    targetUrl: targetUrl,
                    conversionConfig: conversionConfig
                })
            };
        } else {
            console.log(`URL to PDF conversion failed: ${result.error}`);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'URL to PDF conversion failed',
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
        console.log('Starting Convert URL To PDF Process (Local Test)');
        console.log('=== Converting URL to PDF ===');
        
        const targetUrl = INPUT_URL;
        const outputPdfName = OUTPUT_PATH;
        const conversionConfig = {};

        console.log(`Target URL: ${targetUrl}`);
        console.log(`Output PDF: ${outputPdfName}`);
        console.log(`Conversion configuration:`, conversionConfig);
        console.log('Operation: Convert URL to PDF');

        const apiResponse = await convertUrlToPdf(targetUrl, outputPdfName, conversionConfig);
        const result = await handleAsyncResponse(apiResponse, outputPdfName);

        if (result.status === 'success') {
            console.log('URL to PDF conversion completed successfully!');
            console.log(`Target URL: ${targetUrl}`);
            console.log(`Output file: ${outputPdfName}`);
            console.log(`Conversion configuration used:`, conversionConfig);
        } else {
            console.log(`URL to PDF conversion failed: ${result.error}`);
            console.log('Please check your URL and API configuration');
        }
    } catch (err) {
        console.error(`URL to PDF conversion failed: ${err.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    convertUrlToPdf, 
    handleAsyncResponse, 
    main,
    handler 
};