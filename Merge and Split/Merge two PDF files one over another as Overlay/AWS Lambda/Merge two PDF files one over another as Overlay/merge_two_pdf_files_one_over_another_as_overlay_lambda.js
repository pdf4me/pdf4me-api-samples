//*******************************************************************************************//
//                                                                                          //
// AWS Lambda Handler for PDF4me Merge Two PDF Files as Overlay                            //
// Get Your API Key: https://dev.pdf4me.com/dashboard/#/api-keys                            //
// API Documentation: https://developer.pdf4me.com/swagger/index.html?url=/swagger/v2/swagger.json //
//                                                                                          //
// Note: Replace placeholder values in the code with your API Key                           //
//                                                                                          //
//*******************************************************************************************//

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// API Configuration - PDF4me service for merging PDF documents as overlay
const API_KEY = process.env.PDF4ME_API_KEY || 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';

// API endpoint for merging PDF documents as overlay
const BASE_URL = 'https://api.pdf4me.com/';
const URL = `${BASE_URL}api/v2/MergeOverlay`;

// File paths configuration
const BASE_PDF_PATH = "sample1.pdf";
const LAYER_PDF_PATH = "sample2.pdf";
const OUTPUT_PATH = "Merge_overlay_output.pdf";

// Processing configuration
const MAX_RETRIES = 20;
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
        console.log(`PDF file read successfully: ${filePath} (${pdfContent.length} bytes)`);
        return base64Content;
    } catch (err) {
        const errMsg = `Error reading PDF file: ${err.message}`;
        console.error(errMsg);
        throw err;
    }
}

/**
 * Send PDFs to PDF4me API for overlay merging
 * @param {string} baseDocContent - Base64 encoded base PDF content
 * @param {string} layerDocContent - Base64 encoded layer PDF content
 * @param {string} baseDocName - Name of the base PDF file
 * @param {string} layerDocName - Name of the layer PDF file
 * @returns {Promise<Object>} API response containing the processed file or processing status
 * @throws {Error} For API request errors
 */
async function mergeOverlay(baseDocContent, layerDocContent, baseDocName, layerDocName) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`
    };

    const payload = {
        baseDocContent: baseDocContent,          // Base64 encoded base PDF content
        baseDocName: baseDocName,                // Name of the base PDF file
        layerDocContent: layerDocContent,        // Base64 encoded layer PDF content
        layerDocName: layerDocName,              // Name of the layer PDF file
        isAsync: true                              // Enable asynchronous processing
    };

    console.log('Sending PDF overlay merge request to PDF4me API...');

    try {
        const response = await axios.post(URL, payload, {
            headers,
            timeout: 300000, // 5 minutes
            responseType: 'arraybuffer', // Ensure response is treated as binary
            validateStatus: () => true
        });

        console.log(`Response Status Code: ${response.status} (${response.statusText})`);
        console.log('Response Headers:');
        for (const [headerName, headerValue] of Object.entries(response.headers)) {
            console.log(`  ${headerName}: ${headerValue}`);
        }

        if (response.status === 200) {
            console.log('Success! PDF overlay merging completed!');
            return { binaryContent: response.data, status: 'success' };
        } else if (response.status === 202) {
            console.log('202 - Request accepted. Processing asynchronously...');
            const locationUrl = response.headers['location'];
            console.log(`Location URL: ${locationUrl || 'NOT FOUND'}`);
            return { jobId: null, location: locationUrl, status: 'processing' };
        } else {
            const errorData = Buffer.from(response.data).toString('utf8');
            console.error(`API Error: ${response.status} - ${errorData}`);
            throw new Error(`API request failed with status: ${response.status} - ${errorData}`);
        }
    } catch (error) {
        console.error('Error making API request:', error.message);
        throw error;
    }
}

/**
 * Handle asynchronous API response by polling for completion
 * @param {Object} apiResponse - Response from the API
 * @param {string} outputPdfPath - Path where to save the output PDF
 * @returns {Promise<Object>} Result object with status and file information
 */
async function handleAsyncResponse(apiResponse, outputPdfPath) {
    if (apiResponse.status === 'success') {
        // Save the overlay merged PDF
        fs.writeFileSync(outputPdfPath, apiResponse.binaryContent);
        const fileSize = fs.statSync(outputPdfPath).size;
        console.log(`Overlay merged PDF saved: ${outputPdfPath} (${fileSize} bytes)`);
        
        return {
            status: 'success',
            fileSize: fileSize,
            outputPath: outputPdfPath
        };
    } else if (apiResponse.status === 'processing') {
        console.log('Processing asynchronously, polling for completion...');
        
        const headers = {
            'Authorization': `Basic ${API_KEY}`
        };

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            console.log(`Checking status... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
            
            try {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * 1000));
                
                const pollResponse = await axios.get(apiResponse.location, {
                    headers,
                    timeout: 30000,
                    responseType: 'arraybuffer',
                    validateStatus: () => true
                });

                console.log(`Poll response status: ${pollResponse.status} (${pollResponse.statusText})`);

                if (pollResponse.status === 200) {
                    console.log('Success! PDF overlay merging completed!');
                    
                    // Save the overlay merged PDF
                    fs.writeFileSync(outputPdfPath, pollResponse.data);
                    const fileSize = fs.statSync(outputPdfPath).size;
                    console.log(`Overlay merged PDF saved: ${outputPdfPath} (${fileSize} bytes)`);
                    
                    return {
                        status: 'success',
                        fileSize: fileSize,
                        outputPath: outputPdfPath
                    };
                } else if (pollResponse.status === 202) {
                    console.log('Still processing (202)...');
                    continue;
                } else {
                    const errorData = Buffer.from(pollResponse.data).toString('utf8');
                    console.error(`Error during processing: ${pollResponse.status} - ${errorData}`);
                    return {
                        status: 'error',
                        error: `Processing failed with status: ${pollResponse.status}`
                    };
                }
            } catch (error) {
                console.error('Error polling status:', error.message);
                continue;
            }
        }
        
        return {
            status: 'error',
            error: 'Timeout: Processing did not complete after multiple retries'
        };
    } else {
        return {
            status: 'error',
            error: 'Invalid API response status'
        };
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
        console.log('Starting PDF Overlay Merge Process in Lambda');
        const basePdfPath = event.basePdfPath || BASE_PDF_PATH;
        const layerPdfPath = event.layerPdfPath || LAYER_PDF_PATH;
        const outputPdfName = event.outputPdfName || OUTPUT_PATH;

        console.log(`Base PDF: ${basePdfPath}`);
        console.log(`Layer PDF: ${layerPdfPath}`);
        console.log(`Output overlay PDF: ${outputPdfName}`);
        console.log('Operation: Merge two PDF files as overlay');

        const basePdfContent = readAndEncodePdf(basePdfPath);
        const layerPdfContent = readAndEncodePdf(layerPdfPath);
        
        const apiResponse = await mergeOverlay(
            basePdfContent, 
            layerPdfContent, 
            path.basename(basePdfPath), 
            path.basename(layerPdfPath)
        );
        const result = await handleAsyncResponse(apiResponse, outputPdfName);

        if (result.status === 'success') {
            console.log('PDF overlay merging completed successfully!');
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'PDF overlay merging completed successfully',
                    outputFileName: outputPdfName,
                    fileSize: result.fileSize,
                    basePdf: basePdfPath,
                    layerPdf: layerPdfPath
                })
            };
        } else {
            console.log(`PDF overlay merging failed: ${result.error}`);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'PDF overlay merging failed',
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
        console.log('Starting PDF Overlay Merge Process (Local Test)');
        console.log('=== Merging Two PDF Files as Overlay ===');
        
        const basePdfPath = BASE_PDF_PATH;
        const layerPdfPath = LAYER_PDF_PATH;
        const outputPdfName = OUTPUT_PATH;

        console.log(`Base PDF: ${basePdfPath}`);
        console.log(`Layer PDF: ${layerPdfPath}`);
        console.log(`Output overlay PDF: ${outputPdfName}`);
        console.log('Operation: Merge two PDF files as overlay');

        const basePdfContent = readAndEncodePdf(basePdfPath);
        const layerPdfContent = readAndEncodePdf(layerPdfPath);
        
        const apiResponse = await mergeOverlay(
            basePdfContent, 
            layerPdfContent, 
            path.basename(basePdfPath), 
            path.basename(layerPdfPath)
        );
        const result = await handleAsyncResponse(apiResponse, outputPdfName);

        if (result.status === 'success') {
            console.log('PDF overlay merging completed successfully!');
            console.log(`Base PDF: ${basePdfPath}`);
            console.log(`Layer PDF: ${layerPdfPath}`);
            console.log(`Output file: ${outputPdfName}`);
        } else {
            console.log(`PDF overlay merging failed: ${result.error}`);
            console.log('Please check your input files and API configuration');
        }
    } catch (err) {
        console.error(`PDF overlay merging failed: ${err.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    readAndEncodePdf, 
    mergeOverlay, 
    handleAsyncResponse, 
    main,
    handler 
}; 