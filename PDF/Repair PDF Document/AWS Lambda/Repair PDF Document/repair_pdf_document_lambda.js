//*******************************************************************************************//
//                                                                                          //
// AWS Lambda Handler for PDF4me PDF Repair                                                //
// Get Your API Key: https://dev.pdf4me.com/dashboard/#/api-keys                            //
// API Documentation: https://developer.pdf4me.com/swagger/index.html?url=/swagger/v2/swagger.json //
//                                                                                          //
// Note: Replace placeholder values in the code with your API Key                           //
//                                                                                          //
//*******************************************************************************************//

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// API Configuration - PDF4me service for repairing PDF documents
const API_KEY = process.env.PDF4ME_API_KEY || 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';

// API endpoint for repairing PDF documents
const BASE_URL = 'https://api.pdf4me.com/';
const URL = `${BASE_URL}api/v2/RepairPdf`;

/**
 * Read PDF file and convert it to base64 encoding
 * Process: Check file existence → Read binary content → Encode to base64
 * 
 * @param {string} filePath - Path to the PDF file to be processed
 * @returns {string} Base64 encoded content of the PDF file
 * @throws {Error} If the specified file doesn't exist or reading fails
 */
function readAndEncodePdf(filePath) {
    // Check if file exists before attempting to read
    if (!fs.existsSync(filePath)) {
        const errMsg = `Error: PDF file not found at ${filePath}`;
        console.error(errMsg);
        throw new Error(`PDF file not found: ${filePath}`);
    }
    
    try {
        // Read the PDF file in binary mode
        const pdfContent = fs.readFileSync(filePath);
        
        // Convert binary content to base64 string
        const base64Content = Buffer.from(pdfContent).toString('base64');
        console.log(`PDF file read successfully: ${pdfContent.length} bytes`);
        
        return base64Content;
    } catch (err) {
        const errMsg = `Error reading PDF file: ${err}`;
        console.error(errMsg);
        throw err;
    }
}

/**
 * Send PDF to PDF4me API for document repair
 * Process: Prepare headers → Build payload → Send POST request → Handle response
 * 
 * @param {string} base64Content - Base64 encoded PDF content
 * @param {string} filename - Name of the source PDF file
 * @returns {Object} API response containing the repaired file or processing status
 * @throws {Error} For API request errors
 */
async function repairPdfDocument(base64Content, filename) {
    // Prepare headers for the API request
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`
    };
    
    // Prepare payload with all required parameters for PDF repair
    const payload = {
        docContent: base64Content,               // Base64 encoded PDF content (Required)
        docName: filename,                       // Output document name (Required)
        async: true                              // Asynchronous processing as requested
    };
    
    console.log('Sending PDF to PDF4me API for document repair...');
    
    try {
        // Send POST request to PDF4me API
        const response = await axios.post(URL, payload, { 
            headers, 
            timeout: 30000,
            validateStatus: () => true // Don't throw on any status code
        });
        
        // Log detailed response information for debugging 
        console.log(`Response Status Code: ${response.status} (${response.statusText})`);
        console.log('Response Headers:');
        for (const [headerName, headerValue] of Object.entries(response.headers)) {
            console.log(`  ${headerName}: ${headerValue}`);
        }
        
        // Handle different response status codes
        if (response.status === 200) {
            console.log('Success! PDF repaired successfully!');
            
            // API returns binary PDF content directly for 200 response
            return { binaryContent: response.data, status: 'success' };
        } else if (response.status === 202) {
            console.log('Request accepted. Processing asynchronously...');
            
            // Get the polling URL from the Location header for checking status
            const locationUrl = response.headers['location'];
            console.log(`Location URL: ${locationUrl || 'NOT FOUND'}`);
            
            // Check if response has content before parsing JSON
            if (response.data && typeof response.data === 'object') {
                return { ...response.data, location: locationUrl, status: 'processing' };
            } else {
                console.log('Empty response body for async request');
                return { jobId: null, location: locationUrl, status: 'processing', rawResponse: response.data };
            }
        } else {
            console.log(`Error: ${response.status} - ${response.data}`);
            throw new Error(`API Error: ${response.status} - ${response.data}`);
        }
    } catch (err) {
        if (err.code === 'ECONNABORTED') {
            console.error('Error: Request timeout. The API took too long to respond.');
        } else if (err.response) {
            console.error(`API Request Error: ${err.response.status} - ${err.response.data}`);
        } else {
            console.error(`API Request Error: ${err.message}`);
        }
        throw err;
    }
}

/**
 * Handle API response and return the repaired PDF content
 * Process: Check response type → Handle sync/async → Return binary content or poll status
 * 
 * @param {Object} apiResponse - Response from the PDF4me API
 * @returns {Object} Object containing binary content and status
 */
async function handleAsyncResponse(apiResponse) {
    try {
        // Handle synchronous response (status 200)
        if (apiResponse.binaryContent && apiResponse.status === 'success') {
            console.log('Processing binary PDF response directly...');
            
            return { 
                binaryContent: apiResponse.binaryContent, 
                status: 'success',
                fileSize: apiResponse.binaryContent.length 
            };
        }
        
        // Handle asynchronous response (status 202)
        else if (apiResponse.jobId || apiResponse.requestId || apiResponse.location) {
            console.log('Handling asynchronous processing...');
            
            // Get job/request ID or location URL for polling
            const jobId = apiResponse.jobId || apiResponse.requestId;
            const locationUrl = apiResponse.location;
            
            if (jobId) {
                console.log(`Job ID: ${jobId}`);
            }
            if (locationUrl) {
                console.log(`Polling URL: ${locationUrl}`);
            }
            
            // If we have a location URL, implement polling
            if (locationUrl) {
                // Prepare headers for polling requests
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${API_KEY}`
                };
                
                // Implement retry logic for async processing
                const maxRetries = 10;
                const retryDelay = 10000; // 10 seconds
                
                for (let attempt = 0; attempt < maxRetries; attempt++) {
                    console.log(`Checking job status... (Attempt ${attempt + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    
                    try {
                        // Poll the location URL for completion
                        const statusResponse = await axios.get(locationUrl, { 
                            headers, 
                            responseType: 'arraybuffer',
                            validateStatus: () => true
                        });
                        console.log(`Poll response status: ${statusResponse.status} (${statusResponse.statusText})`);
                        
                        if (statusResponse.status === 200) {
                            console.log('Processing completed!');
                            
                            return { 
                                binaryContent: statusResponse.data, 
                                status: 'success',
                                fileSize: statusResponse.data.length 
                            };
                        } else if (statusResponse.status === 202) {
                            console.log('Still processing...');
                            continue;
                        } else {
                            console.error(`Error during polling: ${statusResponse.status} - ${statusResponse.data}`);
                            return { status: 'error', error: `Polling failed: ${statusResponse.status}` };
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
        console.error(`Error processing response: ${err.message}`);
        return { status: 'error', error: err.message };
    }
}

/**
 * AWS Lambda handler function
 * 
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} Lambda response object
 */
async function handler(event, context) {
    try {
        console.log('Starting PDF Document Repair Process in Lambda');
        
        // Get input parameters from event
        const inputPdfPath = event.inputPdfPath || 'sample.pdf';
        const outputPdfName = event.outputPdfName || inputPdfPath.replace('.pdf', '.repaired.pdf');
        
        console.log(`Input PDF: ${inputPdfPath}`);
        console.log(`Output PDF name: ${outputPdfName}`);
        
        // Step 1: Read and encode the PDF file
        console.log('Reading and encoding PDF file...');
        const base64Content = readAndEncodePdf(inputPdfPath);
        
        // Step 2: Send to API for document repair
        console.log('Processing PDF repair...');
        const apiResponse = await repairPdfDocument(base64Content, path.basename(inputPdfPath));
        
        // Step 3: Handle response and get repaired content
        console.log('Processing response...');
        const result = await handleAsyncResponse(apiResponse);
        
        // Return Lambda response
        if (result.status === 'success') {
            console.log('PDF repair completed successfully!');
            console.log(`Output file size: ${result.fileSize} bytes`);
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'PDF repair completed successfully',
                    outputFileName: outputPdfName,
                    fileSize: result.fileSize,
                    binaryContent: result.binaryContent.toString('base64') // Return as base64 for Lambda
                })
            };
        } else {
            console.log(`PDF repair failed: ${result.error}`);
            
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'PDF repair failed',
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
};

// For local testing (not used in Lambda)
async function main() {
    try {
        console.log('Starting PDF Document Repair Process (Local Test)');
        
        const inputPdfPath = 'sample.pdf';
        const outputPdfName = inputPdfPath.replace('.pdf', '.repaired.pdf');
        
        console.log(`Input PDF: ${inputPdfPath}`);
        console.log(`Output PDF: ${outputPdfName}`);
        
        // Step 1: Read and encode the PDF file
        console.log('Reading and encoding PDF file...');
        const base64Content = readAndEncodePdf(inputPdfPath);
        
        // Step 2: Send to API for document repair
        console.log('Processing PDF repair...');
        const apiResponse = await repairPdfDocument(base64Content, path.basename(inputPdfPath));
        
        // Step 3: Handle response and save file locally
        console.log('Processing response and saving file...');
        const result = await handleAsyncResponse(apiResponse);
        
        if (result.status === 'success') {
            // Save file locally for testing
            fs.writeFileSync(outputPdfName, result.binaryContent, 'binary');
            console.log(`Repaired PDF saved successfully: ${outputPdfName}`);
            console.log(`Output file size: ${result.fileSize} bytes`);
            console.log('PDF repair completed successfully!');
        } else {
            console.log(`PDF repair failed: ${result.error}`);
        }
    } catch (err) {
        console.error(`PDF repair failed: ${err.message}`);
    }
}

// Run local test if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    readAndEncodePdf, 
    repairPdfDocument, 
    handleAsyncResponse, 
    main,
    handler 
}; 