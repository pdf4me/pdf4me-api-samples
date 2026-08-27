//*******************************************************************************************//
//                                                                                          //
// AWS Lambda Handler for PDF4me Word Document Tracking Changes Disable                    //
// Get Your API Key: https://dev.pdf4me.com/dashboard/#/api-keys                            //
// API Documentation: https://developer.pdf4me.com/swagger/index.html?url=/swagger/v2/swagger.json //
//                                                                                          //
// Note: Replace placeholder values in the code with your API Key                           //
//                                                                                          //
//*******************************************************************************************//

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// API Configuration - PDF4me service for disabling tracking changes in Word documents
const API_KEY = process.env.PDF4ME_API_KEY || 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';

// API endpoint for disabling tracking changes in Word documents
const BASE_URL = 'https://api.pdf4me.com/';
const URL = `${BASE_URL}api/v2/DisableTrackingChangesInWord`;

// File paths configuration
const INPUT_DOCX_PATH = "sample.docx";
const OUTPUT_PATH = "sample.tracking_disabled.docx";

// Processing configuration
const MAX_RETRIES = 10;
const RETRY_DELAY = 10; // seconds

/**
 * Read Word document file and convert it to base64 encoding
 * @param {string} filePath - Path to the Word document file to be processed
 * @returns {string} Base64 encoded content of the Word document file
 * @throws {Error} If the specified file doesn't exist or reading fails
 */
function readAndEncodeDocx(filePath) {
    if (!fs.existsSync(filePath)) {
        const errMsg = `Error: Word document file not found at ${filePath}`;
        console.error(errMsg);
        throw new Error(`Word document file not found: ${filePath}`);
    }
    try {
        const docxContent = fs.readFileSync(filePath);
        const base64Content = Buffer.from(docxContent).toString('base64');
        console.log(`Word document file read successfully: ${docxContent.length} bytes`);
        return base64Content;
    } catch (err) {
        const errMsg = `Error reading Word document file: ${err.message}`;
        console.error(errMsg);
        throw err;
    }
}

/**
 * Send Word document to PDF4me API for disabling tracking changes
 * @param {string} base64Content - Base64 encoded Word document content
 * @param {string} filename - Name of the source Word document file
 * @returns {Promise<Object>} API response containing the processed file or processing status
 * @throws {Error} For API request errors
 */
async function disableTrackingChangesInWord(base64Content, filename) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`
    };

    const payload = {
        docName: "output.docx",
        docContent: base64Content,
        isAsync: true
    };

    console.log('Sending Word document to PDF4me API for disabling tracking changes...');

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
            console.log('Success! Tracking changes disabled in Word document successfully!');
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
 * Handle API response and save the processed Word document file
 * @param {Object} apiResponse - Response from the PDF4me API
 * @param {string} outputDocxPath - Path where to save the processed Word document
 * @returns {Promise<Object>} Object containing output path and status
 */
async function handleAsyncResponse(apiResponse, outputDocxPath) {
    try {
        if (apiResponse.binaryContent && apiResponse.status === 'success') {
            console.log('Processing binary Word document response directly...');
            fs.writeFileSync(outputDocxPath, Buffer.from(apiResponse.binaryContent));
            console.log(`Processed Word document saved successfully: ${outputDocxPath}`);
            console.log(`Output file size: ${apiResponse.binaryContent.length} bytes`);
            return { outputPath: outputDocxPath, status: 'success', fileSize: apiResponse.binaryContent.length };
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
                            fs.writeFileSync(outputDocxPath, Buffer.from(statusResponse.data));
                            console.log(`Processed Word document saved successfully: ${outputDocxPath}`);
                            console.log(`Output file size: ${statusResponse.data.length} bytes`);
                            return { outputPath: outputDocxPath, status: 'success', fileSize: statusResponse.data.length };
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
        console.error(`Error saving processed Word document: ${err.message}`);
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
        console.log('Starting Word Document Tracking Changes Disable Process in Lambda');
        const inputDocxPath = event.inputDocxPath || 'sample.docx';
        const outputDocxName = event.outputDocxName || OUTPUT_PATH;
        const trackingConfig = event.trackingConfig || {};

        console.log(`Input Word document: ${inputDocxPath}`);
        console.log(`Output processed document: ${outputDocxName}`);
        console.log('Operation: Disable tracking changes');

        const base64Content = readAndEncodeDocx(inputDocxPath);
        const apiResponse = await disableTrackingChangesInWord(base64Content, path.basename(inputDocxPath));
        const result = await handleAsyncResponse(apiResponse, outputDocxName);

        if (result.status === 'success') {
            console.log('Word document tracking changes disable completed successfully!');
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Word document tracking changes disable completed successfully',
                    outputFileName: outputDocxName,
                    fileSize: result.fileSize,
                    trackingConfig: trackingConfig
                })
            };
        } else {
            console.log(`Word document tracking changes disable failed: ${result.error}`);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Word document tracking changes disable failed',
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
        console.log('Starting Word Document Tracking Changes Disable Process (Local Test)');
        console.log('=== Disabling Tracking Changes in Word Document ===');
        
        const inputDocxPath = INPUT_DOCX_PATH;
        const outputDocxName = OUTPUT_PATH;
        const trackingConfig = {};

        console.log(`Input Word document: ${inputDocxPath}`);
        console.log(`Output processed document: ${outputDocxName}`);
        console.log('Operation: Disable tracking changes');

        const base64Content = readAndEncodeDocx(inputDocxPath);
        const apiResponse = await disableTrackingChangesInWord(base64Content, path.basename(inputDocxPath));
        const result = await handleAsyncResponse(apiResponse, outputDocxName);

        if (result.status === 'success') {
            console.log('Word document tracking changes disable completed successfully!');
            console.log(`Input file: ${inputDocxPath}`);
            console.log(`Processed file: ${outputDocxName}`);
            console.log('Word document tracking changes have been disabled');
            console.log('The processed document no longer shows tracked changes');
        } else {
            console.log(`Word document tracking changes disable failed: ${result.error}`);
            console.log('Please check your input file and API configuration');
        }
    } catch (err) {
        console.error(`Word document tracking changes disable failed: ${err.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    readAndEncodeDocx, 
    disableTrackingChangesInWord, 
    handleAsyncResponse, 
    main,
    handler 
}; 