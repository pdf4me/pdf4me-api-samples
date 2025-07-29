//*******************************************************************************************//
//                                                                                          //
// AWS Lambda Handler for PDF4me PDF Hyperlinks Annotation Update                         //
// Get Your API Key: https://dev.pdf4me.com/dashboard/#/api-keys                            //
// API Documentation: https://developer.pdf4me.com/swagger/index.html?url=/swagger/v2/swagger.json //
//                                                                                          //
// Note: Replace placeholder values in the code with your API Key                           //
//                                                                                          //
//*******************************************************************************************//

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// API Configuration - PDF4me service for updating hyperlinks annotation in PDF documents
const API_KEY = process.env.PDF4ME_API_KEY || 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';

// API endpoint for updating hyperlinks annotation in PDF documents
const BASE_URL = 'https://api.pdf4me.com/';
const URL = `${BASE_URL}api/v2/UpdateHyperlinkAnnotation`;

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
 * Send PDF to PDF4me API for updating hyperlinks annotation
 * Process: Prepare headers → Build payload → Send POST request → Handle response
 * 
 * @param {string} base64Content - Base64 encoded PDF content
 * @param {string} filename - Name of the source PDF file
 * @param {Object} hyperlinkConfig - Hyperlink update configuration
 * @returns {Object} API response containing the updated file or processing status
 * @throws {Error} For API request errors
 */
async function updateHyperlinksAnnotation(base64Content, filename, hyperlinkConfig) {
    // Prepare headers for the API request
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`
    };
    
    // Prepare payload with all required parameters for updating hyperlinks annotation (following Python logic)
    const payload = {
        docName: 'output.pdf',                                   // Name of the file (Required)
        docContent: base64Content,                              // Base64 encoded PDF content (Required)
        updatehyperlinkannotationlist: [                         // List of hyperlink updates (Required)
            {
                SearchOn: hyperlinkConfig.searchOn || 'Text',                                // Search criteria type (Required)
                SearchValue: hyperlinkConfig.searchValue || 'http://www.google.com',       // Search for the hyperlinked text (Required)
                IsExpression: hyperlinkConfig.isExpression !== false,                      // Whether to use expression matching (Required)
                TextCurrentValue: hyperlinkConfig.textCurrentValue || 'http://www.google.com', // Current hyperlinked text to replace (Required)
                TextNewValue: hyperlinkConfig.textNewValue || 'https://pdf4me.com',        // New display text for the hyperlink (Required)
                URLCurrentValue: hyperlinkConfig.urlCurrentValue || 'http://www.google.com', // Current URL destination to replace (Required)
                URLNewValue: hyperlinkConfig.urlNewValue || 'https://pdf4me.com'           // New URL destination (Required)
            }
        ],
        async: true                                              // Asynchronous processing as requested
    };
    
    console.log('Sending PDF to PDF4me API for updating hyperlinks annotation...');
    console.log('Hyperlink Configuration:', JSON.stringify(hyperlinkConfig, null, 2));
    
    try {
        // Send POST request to PDF4me API
        const response = await axios.post(URL, payload, { 
            headers, 
            timeout: 30000,
            responseType: 'arraybuffer', // Ensure response is treated as binary
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
            console.log('Success! Hyperlinks annotation updated successfully!');
            
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
 * Handle API response and return the updated PDF file
 * Process: Check response type → Handle sync/async → Return PDF content or poll status
 * 
 * @param {Object} apiResponse - Response from the PDF4me API
 * @returns {Object} Object containing PDF content and status
 */
async function handleAsyncResponse(apiResponse) {
    try {
        // Handle synchronous response (status 200)
        if (apiResponse.binaryContent && apiResponse.status === 'success') {
            console.log('Processing binary PDF response directly...');
            
            return { 
                binaryContent: apiResponse.binaryContent, 
                status: 'success'
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
                            
                            // Save the binary PDF content directly from polling response
                            return { 
                                binaryContent: statusResponse.data, 
                                status: 'success'
                            };
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
        console.log('Starting Hyperlinks Annotation Update Process in Lambda');
        
        // Get input parameters from event
        const inputPdfPath = event.inputPdfPath || 'sample.pdf';
        const outputPdfName = event.outputPdfName || 'hyperlinks_updated_PDF_output.pdf';
        const hyperlinkConfig = event.hyperlinkConfig || {
            searchOn: 'Text',
            searchValue: 'http://www.google.com',
            isExpression: true,
            textCurrentValue: 'http://www.google.com',
            textNewValue: 'https://pdf4me.com',
            urlCurrentValue: 'http://www.google.com',
            urlNewValue: 'https://pdf4me.com'
        };
        
        console.log(`Input PDF: ${inputPdfPath}`);
        console.log(`Output PDF: ${outputPdfName}`);
        console.log('Hyperlink Updates:');
        console.log(`  Hyperlinked Text: '${hyperlinkConfig.textCurrentValue}' → '${hyperlinkConfig.textNewValue}'`);
        console.log(`  URL Destination: '${hyperlinkConfig.urlCurrentValue}' → '${hyperlinkConfig.urlNewValue}'`);
        
        // Step 1: Read and encode the PDF file
        console.log('Reading and encoding PDF file...');
        const base64Content = readAndEncodePdf(inputPdfPath);
        
        // Step 2: Send to API for updating hyperlinks annotation
        console.log('Processing hyperlinks annotation update...');
        const apiResponse = await updateHyperlinksAnnotation(base64Content, path.basename(inputPdfPath), hyperlinkConfig);
        
        // Step 3: Handle response and get updated PDF
        console.log('Processing response...');
        const result = await handleAsyncResponse(apiResponse);
        
        // Return Lambda response
        if (result.status === 'success') {
            console.log('Hyperlinks annotation update completed successfully!');
            
            // Save the updated PDF locally for Lambda
            fs.writeFileSync(outputPdfName, Buffer.from(result.binaryContent));
            console.log(`Updated PDF saved: ${outputPdfName}`);
            console.log(`File size: ${result.binaryContent.length} bytes`);
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Hyperlinks annotation update completed successfully',
                    outputFileName: outputPdfName,
                    fileSize: result.binaryContent.length,
                    hyperlinkConfig: hyperlinkConfig
                })
            };
        } else {
            console.log(`Hyperlinks annotation update failed: ${result.error}`);
            
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Hyperlinks annotation update failed',
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
        console.log('Starting Hyperlinks Annotation Update Process (Local Test)');
        console.log('=== Updating Hyperlinks Annotation in PDF ===');
        
        const inputPdfPath = 'sample.pdf';
        const outputPdfName = 'hyperlinks_updated_PDF_output.pdf';
        const hyperlinkConfig = {
            searchOn: 'Text',
            searchValue: 'http://www.google.com',
            isExpression: true,
            textCurrentValue: 'http://www.google.com',
            textNewValue: 'https://pdf4me.com',
            urlCurrentValue: 'http://www.google.com',
            urlNewValue: 'https://pdf4me.com'
        };
        
        console.log(`Input PDF: ${inputPdfPath}`);
        console.log(`Output PDF: ${outputPdfName}`);
        console.log('Hyperlink Updates:');
        console.log(`  Hyperlinked Text: '${hyperlinkConfig.textCurrentValue}' → '${hyperlinkConfig.textNewValue}'`);
        console.log(`  URL Destination: '${hyperlinkConfig.urlCurrentValue}' → '${hyperlinkConfig.urlNewValue}'`);
        
        // Step 1: Read and encode the PDF file
        console.log('Reading and encoding PDF file...');
        const base64Content = readAndEncodePdf(inputPdfPath);
        
        // Step 2: Send to API for updating hyperlinks annotation
        console.log('Processing hyperlinks annotation update...');
        const apiResponse = await updateHyperlinksAnnotation(base64Content, path.basename(inputPdfPath), hyperlinkConfig);
        
        // Step 3: Handle response and save updated file locally
        console.log('Processing response and saving file...');
        const result = await handleAsyncResponse(apiResponse);
        
        if (result.status === 'success') {
            // Save the updated PDF locally
            fs.writeFileSync(outputPdfName, Buffer.from(result.binaryContent));
            console.log(`Updated PDF saved successfully: ${outputPdfName}`);
            console.log(`File size: ${result.binaryContent.length} bytes`);
            
            console.log('Hyperlinks annotation update completed successfully!');
            console.log(`Input file: ${inputPdfPath}`);
            console.log(`Updated file: ${outputPdfName}`);
            console.log('PDF hyperlinks have been updated with new text and URLs');
        } else {
            console.log(`Hyperlinks annotation update failed: ${result.error}`);
        }
    } catch (err) {
        console.error(`Hyperlinks annotation update failed: ${err.message}`);
    }
}

// Run local test if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    readAndEncodePdf, 
    updateHyperlinksAnnotation, 
    handleAsyncResponse, 
    main,
    handler 
}; 