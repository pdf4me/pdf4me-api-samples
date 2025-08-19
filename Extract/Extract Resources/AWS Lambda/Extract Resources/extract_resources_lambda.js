//*******************************************************************************************//
//                                                                                          //
// AWS Lambda Handler for PDF4me Extract Resources                                          //
// Get Your API Key: https://dev.pdf4me.com/dashboard/#/api-keys                            //
// API Documentation: https://developer.pdf4me.com/swagger/index.html?url=/swagger/v2/swagger.json //
//                                                                                          //
// Note: Replace placeholder values in the code with your API Key                           //
//                                                                                          //
//*******************************************************************************************//

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// API Configuration - PDF4me service for extracting resources from PDF
const API_KEY = process.env.PDF4ME_API_KEY || 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';

// API endpoint for extracting resources from PDF
const BASE_URL = 'https://api.pdf4me.com/';
const URL = `${BASE_URL}api/v2/ExtractResources`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";
const OUTPUT_PATH = "Extracted_resources.zip";

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
 * Send PDF to PDF4me API for resource extraction
 * @param {string} pdfBase64 - Base64 encoded PDF content
 * @param {string} filename - Name of the source PDF file
 * @param {Object} extractionConfig - Extraction configuration parameters
 * @returns {Promise<Object>} API response containing the extracted resources or processing status
 * @throws {Error} For API request errors
 */
async function extractResources(pdfBase64, filename, extractionConfig = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`
    };

    const payload = {
        docContent: pdfBase64,                     // Base64 encoded PDF content (Required)
        docName: filename,                         // Output document name (Required)
        extractText: true,                                       // Extract text content from PDF
        extractImages: true,                                      // Extract images from PDF
        async: true                                              // Enable asynchronous processing
    };

    console.log('Sending PDF to PDF4me API for resource extraction...');

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
            console.log('Success! Resource extraction completed successfully!');
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
 * Handle API response and save the extracted resources
 * @param {Object} apiResponse - Response from the PDF4me API
 * @param {string} outputZipPath - Path where to save the extracted resources
 * @returns {Promise<Object>} Object containing output path and status
 */
async function handleAsyncResponse(apiResponse, outputZipPath) {
    try {
        if (apiResponse.binaryContent && apiResponse.status === 'success') {
            console.log('Processing binary resource extraction response directly...');
            fs.writeFileSync(outputZipPath, Buffer.from(apiResponse.binaryContent));
            console.log(`Resources extracted and saved successfully: ${outputZipPath}`);
            console.log(`Output file size: ${apiResponse.binaryContent.length} bytes`);
            return { outputPath: outputZipPath, status: 'success', fileSize: apiResponse.binaryContent.length };
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
                            fs.writeFileSync(outputZipPath, Buffer.from(statusResponse.data));
                            console.log(`Resources extracted and saved successfully: ${outputZipPath}`);
                            console.log(`Output file size: ${statusResponse.data.length} bytes`);
                            return { outputPath: outputZipPath, status: 'success', fileSize: statusResponse.data.length };
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
        console.error(`Error saving extracted resources: ${err.message}`);
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
        console.log('Starting Extract Resources Process in Lambda');
        const inputPdfPath = event.inputPdfPath || 'sample.pdf';
        const outputZipName = event.outputZipName || OUTPUT_PATH;
        const extractionConfig = event.extractionConfig || {};

        console.log(`Input PDF: ${inputPdfPath}`);
        console.log(`Output ZIP: ${outputZipName}`);
        console.log(`Extraction configuration:`, extractionConfig);
        console.log('Operation: Extract Resources');

        const base64Content = readAndEncodePdf(inputPdfPath);
        const apiResponse = await extractResources(base64Content, path.basename(inputPdfPath), extractionConfig);
        const result = await handleAsyncResponse(apiResponse, outputZipName);

        if (result.status === 'success') {
            console.log('Resource extraction completed successfully!');
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Resource extraction completed successfully',
                    outputFileName: outputZipName,
                    fileSize: result.fileSize,
                    extractionConfig: extractionConfig
                })
            };
        } else {
            console.log(`Resource extraction failed: ${result.error}`);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Resource extraction failed',
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
        console.log('Starting Extract Resources Process (Local Test)');
        console.log('=== Extracting Resources From PDF ===');
        
        const inputPdfPath = INPUT_PDF_PATH;
        const outputZipName = OUTPUT_PATH;
        const extractionConfig = {};

        console.log(`Input PDF: ${inputPdfPath}`);
        console.log(`Output ZIP: ${outputZipName}`);
        console.log(`Extraction configuration:`, extractionConfig);
        console.log('Operation: Extract Resources');

        const base64Content = readAndEncodePdf(inputPdfPath);
        const apiResponse = await extractResources(base64Content, path.basename(inputPdfPath), extractionConfig);
        const result = await handleAsyncResponse(apiResponse, outputZipName);

        if (result.status === 'success') {
            console.log('Resource extraction completed successfully!');
            console.log(`Input file: ${inputPdfPath}`);
            console.log(`Output file: ${outputZipName}`);
            console.log(`Extraction configuration used:`, extractionConfig);
        } else {
            console.log(`Resource extraction failed: ${result.error}`);
            console.log('Please check your input file and API configuration');
        }
    } catch (err) {
        console.error(`Resource extraction failed: ${err.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    readAndEncodePdf, 
    extractResources, 
    handleAsyncResponse, 
    main,
    handler 
}; 