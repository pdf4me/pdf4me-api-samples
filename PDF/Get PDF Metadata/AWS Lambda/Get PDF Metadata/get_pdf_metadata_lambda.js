//*******************************************************************************************//
//                                                                                          //
// AWS Lambda Handler for PDF4me PDF Metadata Extraction                                   //
// Get Your API Key: https://dev.pdf4me.com/dashboard/#/api-keys                            //
// API Documentation: https://developer.pdf4me.com/swagger/index.html?url=/swagger/v2/swagger.json //
//                                                                                          //
// Note: Replace placeholder values in the code with your API Key                           //
//                                                                                          //
//*******************************************************************************************//

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// API Configuration - PDF4me service for extracting PDF metadata
const API_KEY = process.env.PDF4ME_API_KEY || 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';

// API endpoint for extracting PDF metadata
const BASE_URL = 'https://api.pdf4me.com/';
const URL = `${BASE_URL}api/v2/GetPdfMetadata`;

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
 * Send PDF to PDF4me API for metadata extraction
 * Process: Prepare headers → Build payload → Send POST request → Handle response
 * 
 * @param {string} base64Content - Base64 encoded PDF content
 * @param {string} filename - Name of the source PDF file
 * @returns {Object} API response containing the metadata or processing status
 * @throws {Error} For API request errors
 */
async function extractPdfMetadata(base64Content, filename) {
    // Prepare headers for the API request
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`
    };
    
    // Prepare payload with all required parameters for metadata extraction (following Python logic)
    const payload = {
        docContent: base64Content,               // Base64 encoded PDF content (Required)
        docName: 'output.pdf',                   // Output document name (Required)
        isAsync: true                              // Asynchronous processing as requested
    };
    
    console.log('Sending PDF to PDF4me API for metadata extraction...');
    
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
            console.log('Success! PDF metadata extracted successfully!');
            
            // Python logic: API returns JSON metadata directly for 200 response
            try {
                const metadataJson = response.data;
                return { metadataContent: metadataJson, status: 'success' };
            } catch (err) {
                // If not JSON, treat as text response
                return { metadataContent: response.data, status: 'success' };
            }
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
 * Handle API response and return the extracted metadata
 * Process: Check response type → Handle sync/async → Return metadata or poll status
 * 
 * @param {Object} apiResponse - Response from the PDF4me API
 * @returns {Object} Object containing metadata and status
 */
async function handleAsyncResponse(apiResponse) {
    try {
        // Handle synchronous response (status 200) - Following Python logic
        if (apiResponse.metadataContent && apiResponse.status === 'success') {
            console.log('Processing metadata JSON response directly...');
            
            return { 
                metadataContent: apiResponse.metadataContent, 
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
                
                // Implement retry logic for async processing (following Python logic)
                const maxRetries = 10;
                const retryDelay = 10000; // 10 seconds
                
                for (let attempt = 0; attempt < maxRetries; attempt++) {
                    console.log(`Checking job status... (Attempt ${attempt + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    
                    try {
                        // Poll the location URL for completion
                        const statusResponse = await axios.get(locationUrl, { 
                            headers, 
                            validateStatus: () => true
                        });
                        console.log(`Poll response status: ${statusResponse.status} (${statusResponse.statusText})`);
                        
                        if (statusResponse.status === 200) {
                            console.log('Processing completed!');
                            
                            // Following Python logic: treat polling response as JSON metadata
                            try {
                                const metadataJson = statusResponse.data;
                                return { 
                                    metadataContent: metadataJson, 
                                    status: 'success'
                                };
                            } catch (err) {
                                // If not JSON, return as text
                                return { 
                                    metadataContent: statusResponse.data, 
                                    status: 'success'
                                };
                            }
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
        console.log('Starting PDF Metadata Extraction Process in Lambda');
        
        // Get input parameters from event
        const inputPdfPath = event.inputPdfPath || 'sample.pdf';
        const outputMetadataName = event.outputMetadataName || inputPdfPath.replace('.pdf', '.metadata.json');
        
        console.log(`Input PDF: ${inputPdfPath}`);
        console.log(`Output metadata file: ${outputMetadataName}`);
        
        // Step 1: Read and encode the PDF file
        console.log('Reading and encoding PDF file...');
        const base64Content = readAndEncodePdf(inputPdfPath);
        
        // Step 2: Send to API for metadata extraction
        console.log('Processing metadata extraction...');
        const apiResponse = await extractPdfMetadata(base64Content, path.basename(inputPdfPath));
        
        // Step 3: Handle response and get metadata
        console.log('Processing response...');
        const result = await handleAsyncResponse(apiResponse);
        
        // Return Lambda response
        if (result.status === 'success') {
            console.log('PDF metadata extraction completed successfully!');
            
            // Display key metadata information
            const metadata = result.metadataContent;
            console.log('\n=== PDF Metadata Summary ===');
            if (metadata.title) console.log(`Title: ${metadata.title}`);
            if (metadata.author) console.log(`Author: ${metadata.author}`);
            if (metadata.subject) console.log(`Subject: ${metadata.subject}`);
            if (metadata.creator) console.log(`Creator: ${metadata.creator}`);
            if (metadata.producer) console.log(`Producer: ${metadata.producer}`);
            if (metadata.pageCount) console.log(`Pages: ${metadata.pageCount}`);
            if (metadata.fileSize) console.log(`File Size: ${metadata.fileSize} bytes`);
            if (metadata.creationDate) console.log(`Created: ${metadata.creationDate}`);
            if (metadata.modificationDate) console.log(`Modified: ${metadata.modificationDate}`);
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'PDF metadata extraction completed successfully',
                    outputFileName: outputMetadataName,
                    metadata: metadata
                })
            };
        } else {
            console.log(`PDF metadata extraction failed: ${result.error}`);
            
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'PDF metadata extraction failed',
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
        console.log('Starting PDF Metadata Extraction Process (Local Test)');
        
        const inputPdfPath = 'sample.pdf';
        const outputMetadataName = inputPdfPath.replace('.pdf', '.metadata.json');
        
        console.log(`Input PDF: ${inputPdfPath}`);
        console.log(`Output metadata file: ${outputMetadataName}`);
        
        // Step 1: Read and encode the PDF file
        console.log('Reading and encoding PDF file...');
        const base64Content = readAndEncodePdf(inputPdfPath);
        
        // Step 2: Send to API for metadata extraction
        console.log('Processing metadata extraction...');
        const apiResponse = await extractPdfMetadata(base64Content, path.basename(inputPdfPath));
        
        // Step 3: Handle response and save metadata file locally
        console.log('Processing response and saving metadata...');
        const result = await handleAsyncResponse(apiResponse);
        
        if (result.status === 'success') {
            // Save metadata locally for testing
            const metadata = result.metadataContent;
            fs.writeFileSync(outputMetadataName, JSON.stringify(metadata, null, 2), 'utf8');
            console.log(`PDF metadata saved successfully: ${outputMetadataName}`);
            
            // Display key metadata information
            console.log('\n=== PDF Metadata Summary ===');
            if (metadata.title) console.log(`Title: ${metadata.title}`);
            if (metadata.author) console.log(`Author: ${metadata.author}`);
            if (metadata.subject) console.log(`Subject: ${metadata.subject}`);
            if (metadata.creator) console.log(`Creator: ${metadata.creator}`);
            if (metadata.producer) console.log(`Producer: ${metadata.producer}`);
            if (metadata.pageCount) console.log(`Pages: ${metadata.pageCount}`);
            if (metadata.fileSize) console.log(`File Size: ${metadata.fileSize} bytes`);
            if (metadata.creationDate) console.log(`Created: ${metadata.creationDate}`);
            if (metadata.modificationDate) console.log(`Modified: ${metadata.modificationDate}`);
            
            console.log('PDF metadata extraction completed successfully!');
        } else {
            console.log(`PDF metadata extraction failed: ${result.error}`);
        }
    } catch (err) {
        console.error(`PDF metadata extraction failed: ${err.message}`);
    }
}

// Run local test if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    readAndEncodePdf, 
    extractPdfMetadata, 
    handleAsyncResponse, 
    main,
    handler 
}; 