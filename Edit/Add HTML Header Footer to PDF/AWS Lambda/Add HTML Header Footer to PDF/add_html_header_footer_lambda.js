//*******************************************************************************************//
//                                                                                          //
// AWS Lambda Handler for PDF4me Add HTML Header Footer to PDF                              //
// Get Your API Key: https://dev.pdf4me.com/dashboard/#/api-keys                            //
// API Documentation: https://developer.pdf4me.com/swagger/index.html?url=/swagger/v2/swagger.json //
//                                                                                          //
// Note: Replace placeholder values in the code with your API Key                           //
//                                                                                          //
//*******************************************************************************************//

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// API Configuration - PDF4me service for adding HTML headers/footers to PDF documents
const API_KEY = process.env.PDF4ME_API_KEY || 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';

// API endpoint for adding HTML headers/footers to PDF documents
const BASE_URL = 'https://api.pdf4me.com/';
const URL = `${BASE_URL}api/v2/AddHtmlHeaderFooter`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";
const OUTPUT_PATH = "Add_header_footer_to_PDF_output.pdf";

// Processing configuration
const MAX_RETRIES = 10;
const RETRY_DELAY = 10; // seconds

/**
 * Read PDF file and convert it to base64 encoding
 * @param {string} pdfPath - Path to the PDF file to be processed
 * @returns {string} Base64 encoded content of the PDF file
 * @throws {Error} If the specified file doesn't exist or reading fails
 */
function readAndEncodePdf(pdfPath) {
    if (!fs.existsSync(pdfPath)) {
        const errMsg = `Error: PDF file not found at ${pdfPath}`;
        console.error(errMsg);
        throw new Error(`PDF file not found: ${pdfPath}`);
    }
    try {
        const pdfContent = fs.readFileSync(pdfPath);
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
 * Send PDF to PDF4me API for HTML header/footer addition
 * @param {string} pdfBase64 - Base64 encoded PDF content
 * @param {Object} htmlConfig - HTML header/footer configuration
 * @returns {Promise<Object>} API response containing the processed file or processing status
 * @throws {Error} For API request errors
 */
async function addHtmlHeaderFooter(pdfBase64, htmlConfig = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`
    };

    const payload = {
        docContent: pdfBase64,                        // Base64 encoded PDF document content
        docName: "output.pdf",                        // Output PDF file name
        htmlContent: htmlConfig.htmlContent || "<div style='text-align: center; font-family: Arial; font-size: 12px; color: #FF0000;'>Document Header PDF4me </div>",  // HTML content (plain HTML, not base64)
        pages: htmlConfig.pages || "",                // Page options: "", "1", "1,3,5", "2-5", "1,3,7-10", "2-" (empty string = all pages)
        location: htmlConfig.location || "Header",    // Location options: "Header", "Footer", "Both"
        skipFirstPage: htmlConfig.skipFirstPage || false,  // Skip first page (true/false)
        marginLeft: htmlConfig.marginLeft || 20.0,    // Left margin in pixels (double)
        marginRight: htmlConfig.marginRight || 20.0,  // Right margin in pixels (double)
        marginTop: htmlConfig.marginTop || 50.0,      // Top margin in pixels (double)
        marginBottom: htmlConfig.marginBottom || 50.0, // Bottom margin in pixels (double)
        async: true                                   // Enable asynchronous processing
    };

    console.log('Sending HTML header/footer request to PDF4me API...');

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
            console.log('Success! HTML header/footer addition completed successfully!');
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
 * Handle API response and save the PDF file with HTML header/footer
 * @param {Object} apiResponse - Response from the PDF4me API
 * @param {string} outputPdfPath - Path where to save the processed PDF
 * @returns {Promise<Object>} Object containing output path and status
 */
async function handleAsyncResponse(apiResponse, outputPdfPath) {
    try {
        if (apiResponse.binaryContent && apiResponse.status === 'success') {
            console.log('Processing binary PDF response directly...');
            fs.writeFileSync(outputPdfPath, Buffer.from(apiResponse.binaryContent));
            console.log(`PDF with HTML header/footer saved successfully: ${outputPdfPath}`);
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
                            console.log(`PDF with HTML header/footer saved successfully: ${outputPdfPath}`);
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
        console.error(`Error saving processed PDF: ${err.message}`);
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
        console.log('Starting Add HTML Header Footer to PDF Process in Lambda');
        const inputPdfPath = event.inputPdfPath || INPUT_PDF_PATH;
        const outputPdfName = event.outputPdfName || OUTPUT_PATH;
        const htmlConfig = event.htmlConfig || {};

        console.log(`Input PDF: ${inputPdfPath}`);
        console.log(`Output PDF with HTML header/footer: ${outputPdfName}`);
        console.log(`HTML configuration:`, htmlConfig);
        console.log('Operation: Add HTML header/footer to PDF');

        const pdfBase64 = readAndEncodePdf(inputPdfPath);
        const apiResponse = await addHtmlHeaderFooter(pdfBase64, htmlConfig);
        const result = await handleAsyncResponse(apiResponse, outputPdfName);

        if (result.status === 'success') {
            console.log('HTML header/footer addition completed successfully!');
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'HTML header/footer addition completed successfully',
                    outputFileName: outputPdfName,
                    fileSize: result.fileSize,
                    inputPdf: inputPdfPath,
                    htmlConfig: htmlConfig
                })
            };
        } else {
            console.log(`HTML header/footer addition failed: ${result.error}`);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'HTML header/footer addition failed',
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
        console.log('Starting Add HTML Header Footer to PDF Process (Local Test)');
        console.log('=== Adding HTML Header/Footer to PDF Document ===');
        
        const inputPdfPath = INPUT_PDF_PATH;
        const outputPdfName = OUTPUT_PATH;
        const htmlConfig = {
            htmlContent: "<div style='text-align: center; font-family: Arial; font-size: 12px; color: #FF0000;'>Document Header PDF4me </div>",
            location: "Header",
            skipFirstPage: false,
            marginLeft: 20.0,
            marginRight: 20.0,
            marginTop: 50.0,
            marginBottom: 50.0
        };

        console.log(`Input PDF: ${inputPdfPath}`);
        console.log(`Output PDF with HTML header/footer: ${outputPdfName}`);
        console.log(`HTML configuration:`, htmlConfig);
        console.log('Operation: Add HTML header/footer to PDF');

        const pdfBase64 = readAndEncodePdf(inputPdfPath);
        const apiResponse = await addHtmlHeaderFooter(pdfBase64, htmlConfig);
        const result = await handleAsyncResponse(apiResponse, outputPdfName);

        if (result.status === 'success') {
            console.log('HTML header/footer addition completed successfully!');
            console.log(`Input PDF: ${inputPdfPath}`);
            console.log(`Output file: ${outputPdfName}`);
            console.log(`HTML configuration used:`, htmlConfig);
        } else {
            console.log(`HTML header/footer addition failed: ${result.error}`);
            console.log('Please check your input files and API configuration');
        }
    } catch (err) {
        console.error(`HTML header/footer addition failed: ${err.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    readAndEncodePdf, 
    addHtmlHeaderFooter, 
    handleAsyncResponse, 
    main,
    handler 
}; 