//*******************************************************************************************//
//                                                                                          //
// AWS Lambda Handler for PDF4me Convert Markdown to PDF                                   //
// Get Your API Key: https://dev.pdf4me.com/dashboard/#/api-keys                            //
// API Documentation: https://developer.pdf4me.com/swagger/index.html?url=/swagger/v2/swagger.json //
//                                                                                          //
// Note: Replace placeholder values in the code with your API Key                           //
//                                                                                          //
//*******************************************************************************************//

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// API Configuration - PDF4me service for converting Markdown to PDF
const API_KEY = process.env.PDF4ME_API_KEY || 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';

// API endpoint for converting Markdown to PDF
const BASE_URL = 'https://api.pdf4me.com/';
const URL = `${BASE_URL}api/v2/ConvertMdToPdf`;

// File paths configuration
const INPUT_MARKDOWN_PATH = "sample.md";
const OUTPUT_PATH = "Markdown_to_PDF_output.pdf";

// Processing configuration
const MAX_RETRIES = 10;
const RETRY_DELAY = 10; // seconds

/**
 * Read Markdown file and convert it to base64 encoding
 * @param {string} filePath - Path to the Markdown file to be processed
 * @returns {string} Base64 encoded content of the Markdown file
 * @throws {Error} If the specified file doesn't exist or reading fails
 */
function readAndEncodeMarkdown(filePath) {
    if (!fs.existsSync(filePath)) {
        const errMsg = `Error: Markdown file not found at ${filePath}`;
        console.error(errMsg);
        throw new Error(`Markdown file not found: ${filePath}`);
    }
    try {
        const markdownContent = fs.readFileSync(filePath);
        const base64Content = Buffer.from(markdownContent).toString('base64');
        console.log(`Markdown file read successfully: ${markdownContent.length} bytes`);
        return base64Content;
    } catch (err) {
        const errMsg = `Error reading Markdown file: ${err.message}`;
        console.error(errMsg);
        throw err;
    }
}

/**
 * Send Markdown to PDF4me API for PDF conversion
 * @param {string} markdownBase64 - Base64 encoded Markdown content
 * @param {string} filename - Name of the source Markdown file
 * @param {Object} conversionConfig - Conversion configuration parameters
 * @returns {Promise<Object>} API response containing the processed file or processing status
 * @throws {Error} For API request errors
 */
async function convertMarkdownToPdf(markdownBase64, filename, conversionConfig = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`
    };

    const payload = {
        docContent: markdownBase64,                // Base64 encoded Markdown content (Required)
        docName: filename,                         // Output document name (Required)
        async: true                                // Asynchronous processing as requested
    };

    console.log('Sending Markdown to PDF4me API for PDF conversion...');

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
            console.log('Success! Markdown to PDF conversion completed successfully!');
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
        console.log('Starting Convert Markdown to PDF Process in Lambda');
        const inputMarkdownPath = event.inputMarkdownPath || 'sample.md';
        const outputPdfName = event.outputPdfName || OUTPUT_PATH;
        const conversionConfig = event.conversionConfig || {};

        console.log(`Input Markdown: ${inputMarkdownPath}`);
        console.log(`Output PDF: ${outputPdfName}`);
        console.log(`Conversion configuration:`, conversionConfig);
        console.log('Operation: Convert Markdown to PDF');

        const base64Content = readAndEncodeMarkdown(inputMarkdownPath);
        const apiResponse = await convertMarkdownToPdf(base64Content, path.basename(inputMarkdownPath), conversionConfig);
        const result = await handleAsyncResponse(apiResponse, outputPdfName);

        if (result.status === 'success') {
            console.log('Markdown to PDF conversion completed successfully!');
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Markdown to PDF conversion completed successfully',
                    outputFileName: outputPdfName,
                    fileSize: result.fileSize,
                    conversionConfig: conversionConfig
                })
            };
        } else {
            console.log(`Markdown to PDF conversion failed: ${result.error}`);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Markdown to PDF conversion failed',
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
        console.log('Starting Convert Markdown to PDF Process (Local Test)');
        console.log('=== Converting Markdown Document to PDF ===');
        
        const inputMarkdownPath = INPUT_MARKDOWN_PATH;
        const outputPdfName = OUTPUT_PATH;
        const conversionConfig = {};

        console.log(`Input Markdown: ${inputMarkdownPath}`);
        console.log(`Output PDF: ${outputPdfName}`);
        console.log(`Conversion configuration:`, conversionConfig);
        console.log('Operation: Convert Markdown to PDF');

        const base64Content = readAndEncodeMarkdown(inputMarkdownPath);
        const apiResponse = await convertMarkdownToPdf(base64Content, path.basename(inputMarkdownPath), conversionConfig);
        const result = await handleAsyncResponse(apiResponse, outputPdfName);

        if (result.status === 'success') {
            console.log('Markdown to PDF conversion completed successfully!');
            console.log(`Input file: ${inputMarkdownPath}`);
            console.log(`Output file: ${outputPdfName}`);
            console.log(`Conversion configuration used:`, conversionConfig);
        } else {
            console.log(`Markdown to PDF conversion failed: ${result.error}`);
            console.log('Please check your input file and API configuration');
        }
    } catch (err) {
        console.error(`Markdown to PDF conversion failed: ${err.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    readAndEncodeMarkdown, 
    convertMarkdownToPdf, 
    handleAsyncResponse, 
    main,
    handler 
};