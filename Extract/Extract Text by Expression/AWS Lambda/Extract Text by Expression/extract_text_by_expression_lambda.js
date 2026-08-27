//*******************************************************************************************//
//                                                                                          //
// AWS Lambda Handler for PDF4me Extract Text by Expression                                 //
// Get Your API Key: https://dev.pdf4me.com/dashboard/#/api-keys                            //
// API Documentation: https://developer.pdf4me.com/swagger/index.html?url=/swagger/v2/swagger.json //
//                                                                                          //
// Note: Replace placeholder values in the code with your API Key                           //
//                                                                                          //
//*******************************************************************************************//

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// API Configuration - PDF4me service for extracting text by expression from PDF
const API_KEY = process.env.PDF4ME_API_KEY || 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';

// API endpoint for extracting text by expression from PDF
const BASE_URL = 'https://api.pdf4me.com/';
const URL = `${BASE_URL}api/v2/ExtractTextByExpression`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";
const OUTPUT_PATH = "Extracted_text_by_expression.json";

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
 * Send PDF to PDF4me API for text extraction by expression
 * @param {string} pdfBase64 - Base64 encoded PDF content
 * @param {string} filename - Name of the source PDF file
 * @param {Object} extractionConfig - Extraction configuration parameters including expression
 * @returns {Promise<Object>} API response containing the extracted text or processing status
 * @throws {Error} For API request errors
 */
async function extractTextByExpression(pdfBase64, filename, extractionConfig = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`
    };

    const payload = {
        docContent: pdfBase64,                     // Base64 encoded PDF content (Required)
        docName: filename,                         // Output document name (Required)
        expression: extractionConfig.expression || ".*", // Regular expression pattern (Required)
        isAsync: true                                // Asynchronous processing as requested
    };

    console.log('Sending PDF to PDF4me API for text extraction by expression...');

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
            console.log('Success! Text extraction by expression completed successfully!');
            return { extractedText: response.data, status: 'success' };
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
 * Handle API response and save the extracted text
 * @param {Object} apiResponse - Response from the PDF4me API
 * @param {string} outputJsonPath - Path where to save the extracted text
 * @returns {Promise<Object>} Object containing output path and status
 */
async function handleAsyncResponse(apiResponse, outputJsonPath) {
    try {
        if (apiResponse.extractedText && apiResponse.status === 'success') {
            console.log('Processing text extraction results directly...');
            fs.writeFileSync(outputJsonPath, JSON.stringify(apiResponse.extractedText, null, 2));
            console.log(`Text extracted and saved successfully: ${outputJsonPath}`);
            return { outputPath: outputJsonPath, status: 'success', extractedText: apiResponse.extractedText };
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
                            const extractedText = statusResponse.data;
                            fs.writeFileSync(outputJsonPath, JSON.stringify(extractedText, null, 2));
                            console.log(`Text extracted and saved successfully: ${outputJsonPath}`);
                            return { outputPath: outputJsonPath, status: 'success', extractedText: extractedText };
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
        console.error(`Error saving extracted text: ${err.message}`);
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
        console.log('Starting Extract Text by Expression Process in Lambda');
        const inputPdfPath = event.inputPdfPath || 'sample.pdf';
        const outputJsonName = event.outputJsonName || OUTPUT_PATH;
        const extractionConfig = event.extractionConfig || { expression: ".*" };

        console.log(`Input PDF: ${inputPdfPath}`);
        console.log(`Output JSON: ${outputJsonName}`);
        console.log(`Extraction configuration:`, extractionConfig);
        console.log('Operation: Extract Text by Expression');

        const base64Content = readAndEncodePdf(inputPdfPath);
        const apiResponse = await extractTextByExpression(base64Content, path.basename(inputPdfPath), extractionConfig);
        const result = await handleAsyncResponse(apiResponse, outputJsonName);

        if (result.status === 'success') {
            console.log('Text extraction by expression completed successfully!');
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Text extraction by expression completed successfully',
                    outputFileName: outputJsonName,
                    extractedText: result.extractedText,
                    extractionConfig: extractionConfig
                })
            };
        } else {
            console.log(`Text extraction by expression failed: ${result.error}`);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Text extraction by expression failed',
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
        console.log('Starting Extract Text by Expression Process (Local Test)');
        console.log('=== Extracting Text by Expression From PDF ===');
        
        const inputPdfPath = INPUT_PDF_PATH;
        const outputJsonName = OUTPUT_PATH;
        const extractionConfig = { expression: ".*" };

        console.log(`Input PDF: ${inputPdfPath}`);
        console.log(`Output JSON: ${outputJsonName}`);
        console.log(`Extraction configuration:`, extractionConfig);
        console.log('Operation: Extract Text by Expression');

        const base64Content = readAndEncodePdf(inputPdfPath);
        const apiResponse = await extractTextByExpression(base64Content, path.basename(inputPdfPath), extractionConfig);
        const result = await handleAsyncResponse(apiResponse, outputJsonName);

        if (result.status === 'success') {
            console.log('Text extraction by expression completed successfully!');
            console.log(`Input file: ${inputPdfPath}`);
            console.log(`Output file: ${outputJsonName}`);
            console.log(`Extraction configuration used:`, extractionConfig);
            console.log('Extracted text:', result.extractedText);
        } else {
            console.log(`Text extraction by expression failed: ${result.error}`);
            console.log('Please check your input file and API configuration');
        }
    } catch (err) {
        console.error(`Text extraction by expression failed: ${err.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    readAndEncodePdf, 
    extractTextByExpression, 
    handleAsyncResponse, 
    main,
    handler 
}; 