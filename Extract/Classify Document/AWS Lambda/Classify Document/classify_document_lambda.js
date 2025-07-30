//*******************************************************************************************//
//                                                                                          //
// AWS Lambda Handler for PDF4me Classify Document                                          //
// Get Your API Key: https://dev.pdf4me.com/dashboard/#/api-keys                            //
// API Documentation: https://developer.pdf4me.com/swagger/index.html?url=/swagger/v2/swagger.json //
//                                                                                          //
// Note: Replace placeholder values in the code with your API Key                           //
//                                                                                          //
//*******************************************************************************************//

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// API Configuration - PDF4me service for classifying documents
const API_KEY = process.env.PDF4ME_API_KEY || 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';

// API endpoint for classifying documents
const BASE_URL = 'https://api.pdf4me.com/';
const URL = `${BASE_URL}api/v2/ClassifyDocument`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";
const OUTPUT_PATH = "Classify_document_output.json";

// Processing configuration
const MAX_RETRIES = 10;
const RETRY_DELAY = 10; // seconds

/**
 * Read PDF file and convert it to base64 encoding
 * @param {string} filePath - Path to the PDF file to be processed
 * @returns {string} Base64 encoded content of the PDF file
 * @throws {Error} If the specified file doesn't exist or reading fails
 */
function readAndEncodePdf(filePath) {
    if (!fs.existsSync(filePath)) {
        const errMsg = `Error: PDF file not found at ${filePath}`;
        console.error(errMsg);
        throw new Error(`PDF file not found: ${filePath}`);
    }
    try {
        const pdfContent = fs.readFileSync(filePath);
        const base64Content = Buffer.from(pdfContent).toString('base64');
        console.log(`PDF file read successfully: ${pdfContent.length} bytes`);
        return base64Content;
    } catch (err) {
        const errMsg = `Error reading PDF file: ${err.message}`;
        console.error(errMsg);
        throw err;
    }
}

/**
 * Send PDF to PDF4me API for document classification
 * @param {string} pdfBase64 - Base64 encoded PDF content
 * @param {string} filename - Name of the source PDF file
 * @param {Object} classificationConfig - Classification configuration parameters
 * @returns {Promise<Object>} API response containing the classification results or processing status
 * @throws {Error} For API request errors
 */
async function classifyDocument(pdfBase64, filename, classificationConfig = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`
    };

    const payload = {
        docContent: pdfBase64,                     // Base64 encoded PDF content (Required)
        docName: filename,                         // Output document name (Required)
        async: true                                // Asynchronous processing as requested
    };

    console.log('Sending PDF to PDF4me API for document classification...');

    try {
        const response = await axios.post(URL, payload, {
            headers,
            timeout: 30000,
            validateStatus: () => true
        });

        console.log(`Response Status Code: ${response.status} (${response.statusText})`);
        console.log('Response Headers:');
        for (const [headerName, headerValue] of Object.entries(response.headers)) {
            console.log(`  ${headerName}: ${headerValue}`);
        }

        if (response.status === 200) {
            console.log('Success! Document classification completed successfully!');
            return { classificationData: response.data, status: 'success' };
        } else if (response.status === 202) {
            console.log('Request accepted. Processing asynchronously...');
            const locationUrl = response.headers['location'];
            console.log(`Location URL: ${locationUrl || 'NOT FOUND'}`);
            return { jobId: null, location: locationUrl, status: 'processing' };
        } else {
            console.log(`Error: ${response.status} - ${JSON.stringify(response.data)}`);
            throw new Error(`API Error: ${response.status} - ${JSON.stringify(response.data)}`);
        }
    } catch (err) {
        if (err.code === 'ECONNABORTED') {
            console.error('Error: Request timeout. The API took too long to respond.');
        } else if (err.response) {
            console.error(`API Request Error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
        } else {
            console.error(`API Request Error: ${err.message}`);
        }
        throw err;
    }
}

/**
 * Handle API response and save the classification results
 * @param {Object} apiResponse - Response from the PDF4me API
 * @param {string} outputJsonPath - Path where to save the classification results
 * @returns {Promise<Object>} Object containing output path and status
 */
async function handleAsyncResponse(apiResponse, outputJsonPath) {
    try {
        if (apiResponse.classificationData && apiResponse.status === 'success') {
            console.log('Processing classification results directly...');
            fs.writeFileSync(outputJsonPath, JSON.stringify(apiResponse.classificationData, null, 2));
            console.log(`Classification results saved successfully: ${outputJsonPath}`);
            return { outputPath: outputJsonPath, status: 'success', classificationData: apiResponse.classificationData };
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
                            validateStatus: () => true
                        });
                        console.log(`Poll response status: ${statusResponse.status} (${statusResponse.statusText})`);
                        if (statusResponse.status === 200) {
                            console.log('Processing completed!');
                            const classificationData = statusResponse.data;
                            fs.writeFileSync(outputJsonPath, JSON.stringify(classificationData, null, 2));
                            console.log(`Classification results saved successfully: ${outputJsonPath}`);
                            return { outputPath: outputJsonPath, status: 'success', classificationData: classificationData };
                        } else if (statusResponse.status === 202) {
                            console.log('Still processing...');
                            continue;
                        } else {
                            console.error(`Error during polling: ${statusResponse.status} - ${JSON.stringify(statusResponse.data)}`);
                            return { status: 'error', error: `Polling failed: ${statusResponse.status} - ${JSON.stringify(statusResponse.data)}` };
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
        console.error(`Error saving classification results: ${err.message}`);
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
        console.log('Starting Classify Document Process in Lambda');
        const inputPdfPath = event.inputPdfPath || 'sample.pdf';
        const outputJsonName = event.outputJsonName || OUTPUT_PATH;
        const classificationConfig = event.classificationConfig || {};

        console.log(`Input PDF: ${inputPdfPath}`);
        console.log(`Output JSON: ${outputJsonName}`);
        console.log(`Classification configuration:`, classificationConfig);
        console.log('Operation: Classify Document');

        const base64Content = readAndEncodePdf(inputPdfPath);
        const apiResponse = await classifyDocument(base64Content, path.basename(inputPdfPath), classificationConfig);
        const result = await handleAsyncResponse(apiResponse, outputJsonName);

        if (result.status === 'success') {
            console.log('Document classification completed successfully!');
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Document classification completed successfully',
                    outputFileName: outputJsonName,
                    classificationData: result.classificationData,
                    classificationConfig: classificationConfig
                })
            };
        } else {
            console.log(`Document classification failed: ${result.error}`);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Document classification failed',
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
        console.log('Starting Classify Document Process (Local Test)');
        console.log('=== Classifying Document ===');
        
        const inputPdfPath = INPUT_PDF_PATH;
        const outputJsonName = OUTPUT_PATH;
        const classificationConfig = {};

        console.log(`Input PDF: ${inputPdfPath}`);
        console.log(`Output JSON: ${outputJsonName}`);
        console.log(`Classification configuration:`, classificationConfig);
        console.log('Operation: Classify Document');

        const base64Content = readAndEncodePdf(inputPdfPath);
        const apiResponse = await classifyDocument(base64Content, path.basename(inputPdfPath), classificationConfig);
        const result = await handleAsyncResponse(apiResponse, outputJsonName);

        if (result.status === 'success') {
            console.log('Document classification completed successfully!');
            console.log(`Input file: ${inputPdfPath}`);
            console.log(`Output file: ${outputJsonName}`);
            console.log(`Classification configuration used:`, classificationConfig);
            console.log('Classification results:', result.classificationData);
        } else {
            console.log(`Document classification failed: ${result.error}`);
            console.log('Please check your input file and API configuration');
        }
    } catch (err) {
        console.error(`Document classification failed: ${err.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    readAndEncodePdf, 
    classifyDocument, 
    handleAsyncResponse, 
    main,
    handler 
}; 