//*******************************************************************************************//
//                                                                                          //
// AWS Lambda Handler for PDF4me PDF Splitting by Barcode                                  //
// Get Your API Key: https://dev.pdf4me.com/dashboard/#/api-keys                            //
// API Documentation: https://developer.pdf4me.com/swagger/index.html?url=/swagger/v2/swagger.json //
//                                                                                          //
// Note: Replace placeholder values in the code with your API Key                           //
//                                                                                          //
//*******************************************************************************************//

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// API Configuration - PDF4me service for splitting PDF documents by barcode
const API_KEY = process.env.PDF4ME_API_KEY || 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';

// API endpoint for splitting PDF documents by barcode
const BASE_URL = 'https://api.pdf4me.com/';
const URL = `${BASE_URL}api/v2/SplitPdfByBarcode_old`;

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
 * Send PDF to PDF4me API for splitting by barcode
 * Process: Prepare headers → Build payload → Send POST request → Handle response
 * 
 * @param {string} base64Content - Base64 encoded PDF content
 * @param {string} filename - Name of the source PDF file
 * @param {Object} barcodeConfig - Barcode configuration parameters
 * @returns {Object} API response containing the split files or processing status
 * @throws {Error} For API request errors
 */
async function splitPdfByBarcode(base64Content, filename, barcodeConfig) {
    // Prepare headers for the API request
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`
    };
    
    // Prepare payload with all required parameters for PDF splitting by barcode (following Python logic)
    const payload = {
        docContent: base64Content,                              // Base64 encoded PDF content (Required)
        docName: 'output.pdf',                                  // Output document name (Required)
        barcodeString: barcodeConfig.barcodeString || 'hello', // Barcode string to search for
        barcodeFilter: barcodeConfig.barcodeFilter || 'startsWith', // Filter type for barcode matching
        barcodeType: barcodeConfig.barcodeType || 'qrcode',    // Type of barcode (qrcode, code128, code39)
        splitBarcodePage: barcodeConfig.splitBarcodePage || 'before', // Where to split relative to barcode
        combinePagesWithSameConsecutiveBarcodes: barcodeConfig.combinePagesWithSameConsecutiveBarcodes !== false, // Whether to combine pages
        pdfRenderDpi: barcodeConfig.pdfRenderDpi || '1',       // DPI for PDF rendering
        isAsync: true                                             // Asynchronous processing as requested
    };
    
    console.log('Sending PDF to PDF4me API for splitting by barcode...');
    console.log('Barcode Configuration:', JSON.stringify(barcodeConfig, null, 2));
    
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
            console.log('Success! PDF split by barcode successfully!');
            
            // Check if response is binary or JSON
            if (response.headers['content-type'] && response.headers['content-type'].includes('application/json')) {
                // JSON response - this might be an error or status response
                console.log('Received JSON response instead of binary content');
                return { jsonContent: response.data, status: 'success' };
            } else {
                // Binary response - this is the expected ZIP content
                return { binaryContent: response.data, status: 'success' };
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
 * Handle API response and return the split PDF files
 * Process: Check response type → Handle sync/async → Return ZIP content or poll status
 * 
 * @param {Object} apiResponse - Response from the PDF4me API
 * @returns {Object} Object containing ZIP content and status
 */
async function handleAsyncResponse(apiResponse) {
    try {
        // Handle synchronous response (status 200) - Following Python logic
        if (apiResponse.binaryContent && apiResponse.status === 'success') {
            console.log('Processing binary ZIP response directly...');
            
            return { 
                binaryContent: apiResponse.binaryContent, 
                status: 'success'
            };
        } else if (apiResponse.jsonContent && apiResponse.status === 'success') {
            console.log('Processing JSON response...');
            
            return { 
                jsonContent: apiResponse.jsonContent, 
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
                            responseType: 'arraybuffer',
                            validateStatus: () => true
                        });
                        console.log(`Poll response status: ${statusResponse.status} (${statusResponse.statusText})`);
                        
                        if (statusResponse.status === 200) {
                            console.log('Processing completed!');
                            
                            // Following Python logic: treat polling response as binary ZIP content
                            return { 
                                binaryContent: statusResponse.data, 
                                status: 'success'
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
        console.log('Starting PDF Splitting by Barcode Process in Lambda');
        
        // Get input parameters from event
        const inputPdfPath = event.inputPdfPath || 'sample.pdf';
        const outputZipName = event.outputZipName || 'swiss_qr_split_result.zip';
        const barcodeConfig = event.barcodeConfig || {
            barcodeString: 'hello',
            barcodeFilter: 'startsWith',
            barcodeType: 'qrcode',
            splitBarcodePage: 'before',
            combinePagesWithSameConsecutiveBarcodes: true,
            pdfRenderDpi: '1'
        };
        
        console.log(`Input PDF: ${inputPdfPath}`);
        console.log(`Output ZIP: ${outputZipName}`);
        console.log('Barcode Configuration:', JSON.stringify(barcodeConfig, null, 2));
        
        // Step 1: Read and encode the PDF file
        console.log('Reading and encoding PDF file...');
        const base64Content = readAndEncodePdf(inputPdfPath);
        
        // Step 2: Send to API for splitting by barcode
        console.log('Processing PDF splitting by barcode...');
        const apiResponse = await splitPdfByBarcode(base64Content, path.basename(inputPdfPath), barcodeConfig);
        
        // Step 3: Handle response and get split files
        console.log('Processing response...');
        const result = await handleAsyncResponse(apiResponse);
        
        // Return Lambda response
        if (result.status === 'success') {
            console.log('PDF splitting by barcode completed successfully!');
            
            if (result.binaryContent) {
                // Create output directory structure
                const outputDir = path.join(path.dirname(inputPdfPath) || '.', 'swiss_qr_split_output');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
                
                const fullOutputPath = path.join(outputDir, outputZipName);
                
                // Save the ZIP file locally for Lambda
                fs.writeFileSync(fullOutputPath, result.binaryContent, 'binary');
                console.log(`Split PDF archive saved: ${fullOutputPath}`);
                console.log(`Archive size: ${result.binaryContent.length} bytes`);
                
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        success: true,
                        message: 'PDF splitting by barcode completed successfully',
                        outputFileName: outputZipName,
                        outputPath: fullOutputPath,
                        archiveSize: result.binaryContent.length,
                        barcodeConfig: barcodeConfig
                    })
                };
            } else if (result.jsonContent) {
                // Handle JSON response with base64-encoded PDF data
                console.log('Processing JSON response with split PDF data...');
                
                // Create output directory structure
                const outputDir = path.join(path.dirname(inputPdfPath) || '.', 'swiss_qr_split_output');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
                
                // Extract and save individual PDF files from the JSON response
                const savedFiles = [];
                if (result.jsonContent.splitedDocuments && Array.isArray(result.jsonContent.splitedDocuments)) {
                    for (let i = 0; i < result.jsonContent.splitedDocuments.length; i++) {
                        const doc = result.jsonContent.splitedDocuments[i];
                        if (doc.streamFile) {
                            try {
                                // Decode base64 content to binary
                                const pdfBuffer = Buffer.from(doc.streamFile, 'base64');
                                const fileName = doc.fileName || `split_${i + 1}.pdf`;
                                const filePath = path.join(outputDir, fileName);
                                
                                // Save the PDF file
                                fs.writeFileSync(filePath, pdfBuffer);
                                savedFiles.push({
                                    fileName: fileName,
                                    filePath: filePath,
                                    size: pdfBuffer.length
                                });
                                
                                console.log(`Saved split PDF: ${fileName} (${pdfBuffer.length} bytes)`);
                            } catch (err) {
                                console.error(`Error saving PDF file ${i + 1}:`, err.message);
                            }
                        }
                    }
                }
                
                console.log(`Successfully saved ${savedFiles.length} split PDF files`);
                
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        success: true,
                        message: 'PDF splitting by barcode completed successfully',
                        splitFiles: savedFiles,
                        totalFiles: savedFiles.length,
                        barcodeConfig: barcodeConfig,
                        responseData: result.jsonContent
                    })
                };
            }
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'PDF splitting by barcode completed successfully',
                    outputFileName: outputZipName,
                    outputPath: fullOutputPath,
                    archiveSize: result.binaryContent.length,
                    barcodeConfig: barcodeConfig
                })
            };
        } else {
            console.log(`PDF splitting by barcode failed: ${result.error}`);
            
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'PDF splitting by barcode failed',
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
        console.log('Starting PDF Splitting by Barcode Process (Local Test)');
        console.log('=== Splitting PDF by QR Code Barcode ===');
        
        const inputPdfPath = 'sample.pdf';
        const outputZipName = 'swiss_qr_split_result.zip';
        const barcodeConfig = {
            barcodeString: 'hello',
            barcodeFilter: 'startsWith',
            barcodeType: 'qrcode',
            splitBarcodePage: 'before',
            combinePagesWithSameConsecutiveBarcodes: true,
            pdfRenderDpi: '1'
        };
        
        console.log(`Input PDF: ${inputPdfPath}`);
        console.log(`Output archive: ${outputZipName}`);
        console.log(`Barcode type: QR Code`);
        console.log(`Search string: '${barcodeConfig.barcodeString}' (${barcodeConfig.barcodeFilter})`);
        
        // Step 1: Read and encode the PDF file
        console.log('Reading and encoding PDF file...');
        const base64Content = readAndEncodePdf(inputPdfPath);
        
        // Step 2: Send to API for splitting by barcode
        console.log('Processing PDF splitting by barcode...');
        const apiResponse = await splitPdfByBarcode(base64Content, path.basename(inputPdfPath), barcodeConfig);
        
        // Step 3: Handle response and save split files archive locally
        console.log('Processing response and saving archive...');
        const result = await handleAsyncResponse(apiResponse);
        
        if (result.status === 'success') {
            if (result.binaryContent) {
                // Create output directory structure
                const outputDir = path.join(path.dirname(inputPdfPath) || '.', 'swiss_qr_split_output');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
                
                const fullOutputPath = path.join(outputDir, outputZipName);
                
                // Save the ZIP file locally
                fs.writeFileSync(fullOutputPath, result.binaryContent, 'binary');
                console.log(`Split PDF archive saved successfully: ${fullOutputPath}`);
                console.log(`Archive size: ${result.binaryContent.length} bytes`);
                
                console.log('PDF splitting by barcode completed successfully!');
                console.log(`Input file: ${inputPdfPath}`);
                console.log(`Split files archive: ${outputZipName}`);
                console.log('PDF has been split by barcode and saved as ZIP archive');
                console.log('Extract the ZIP file to access individual split PDF documents');
            } else if (result.jsonContent) {
                console.log('Processing JSON response with split PDF data...');
                
                // Create output directory structure
                const outputDir = path.join(path.dirname(inputPdfPath) || '.', 'swiss_qr_split_output');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
                
                // Extract and save individual PDF files from the JSON response
                const savedFiles = [];
                if (result.jsonContent.splitedDocuments && Array.isArray(result.jsonContent.splitedDocuments)) {
                    for (let i = 0; i < result.jsonContent.splitedDocuments.length; i++) {
                        const doc = result.jsonContent.splitedDocuments[i];
                        if (doc.streamFile) {
                            try {
                                // Decode base64 content to binary
                                const pdfBuffer = Buffer.from(doc.streamFile, 'base64');
                                const fileName = doc.fileName || `split_${i + 1}.pdf`;
                                const filePath = path.join(outputDir, fileName);
                                
                                // Save the PDF file
                                fs.writeFileSync(filePath, pdfBuffer);
                                savedFiles.push({
                                    fileName: fileName,
                                    filePath: filePath,
                                    size: pdfBuffer.length
                                });
                                
                                console.log(`Saved split PDF: ${fileName} (${pdfBuffer.length} bytes)`);
                            } catch (err) {
                                console.error(`Error saving PDF file ${i + 1}:`, err.message);
                            }
                        }
                    }
                }
                
                console.log(`Successfully saved ${savedFiles.length} split PDF files`);
                console.log('PDF splitting by barcode completed successfully!');
                console.log(`Input file: ${inputPdfPath}`);
                console.log(`Split files saved to: ${outputDir}`);
                console.log('Individual PDF files have been extracted and saved');
            }
        } else {
            console.log(`PDF splitting by barcode failed: ${result.error}`);
        }
    } catch (err) {
        console.error(`PDF splitting by barcode failed: ${err.message}`);
    }
}

// Run local test if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    readAndEncodePdf, 
    splitPdfByBarcode, 
    handleAsyncResponse, 
    main,
    handler 
}; 