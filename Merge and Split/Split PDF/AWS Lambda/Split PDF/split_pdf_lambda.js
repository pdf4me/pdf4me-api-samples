//*******************************************************************************************//
//                                                                                          //
// AWS Lambda Handler for PDF4me Split PDF Documents                                       //
// Get Your API Key: https://dev.pdf4me.com/dashboard/#/api-keys                            //
// API Documentation: https://developer.pdf4me.com/swagger/index.html?url=/swagger/v2/swagger.json //
//                                                                                          //
// Note: Replace placeholder values in the code with your API Key                           //
//                                                                                          //
//*******************************************************************************************//

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// API Configuration - PDF4me service for splitting PDF documents
const API_KEY = process.env.PDF4ME_API_KEY || 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';

// API endpoint for splitting PDF documents
const BASE_URL = 'https://api.pdf4me.com/';
const URL = `${BASE_URL}api/v2/SplitPdf`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";
const OUTPUT_FOLDER = "Split_PDF_outputs";

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
 * Send PDF to PDF4me API for splitting
 * @param {string} base64Content - Base64 encoded PDF content
 * @param {string} filename - Name of the source PDF file
 * @param {string} splitAction - Split action type
 * @param {number} splitActionNumber - Split action number
 * @param {Array} splitSequence - Split sequence array
 * @param {string} splitRanges - Split ranges string
 * @returns {Promise<Object>} API response containing the processed files or processing status
 * @throws {Error} For API request errors
 */
async function splitPdf(base64Content, filename, splitAction = 'SplitAfterPage', splitActionNumber = 1, splitSequence = null, splitRanges = null) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`
    };

    const payload = {
        docContent: base64Content,               // Base64 encoded PDF content
        docName: filename,                       // Name of the input PDF file
        splitAction: splitAction,                // Split action type
        fileNaming: 'NameAsPerOrder',           // File naming convention
        isAsync: true                              // Enable asynchronous processing
    };

    // Add specific parameters based on split action
    if (splitAction === 'SplitAfterPage' || splitAction === 'RecurringSplitAfterPage') {
        payload.splitActionNumber = splitActionNumber;
    } else if (splitAction === 'SplitSequence') {
        payload.splitSequence = splitSequence;
    } else if (splitAction === 'SplitRanges') {
        payload.splitRanges = splitRanges;
    }

    console.log('Sending PDF split request to PDF4me API...');

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
            console.log('Success! PDF splitting completed!');
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
 * @param {string} outputFolder - Folder where to save the split PDFs
 * @returns {Promise<Object>} Result object with status and file information
 */
async function handleAsyncResponse(apiResponse, outputFolder) {
    if (apiResponse.status === 'success') {
        // Handle split documents response
        const splitDocuments = apiResponse.binaryContent;
        const results = [];
        
        if (Array.isArray(splitDocuments)) {
            for (let i = 0; i < splitDocuments.length; i++) {
                const document = splitDocuments[i];
                if (document.docContent && document.docName) {
                    const pdfContent = Buffer.from(document.docContent, 'base64');
                    const outputPath = path.join(outputFolder, document.docName);
                    
                    // Create output folder if it doesn't exist
                    if (!fs.existsSync(outputFolder)) {
                        fs.mkdirSync(outputFolder, { recursive: true });
                    }
                    
                    fs.writeFileSync(outputPath, pdfContent);
                    results.push({
                        fileName: document.docName,
                        filePath: outputPath,
                        size: pdfContent.length
                    });
                    console.log(`Split PDF saved: ${outputPath} (${pdfContent.length} bytes)`);
                }
            }
        }
        
        return {
            status: 'success',
            splitDocuments: results,
            totalDocuments: results.length
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
                    console.log('Success! PDF splitting completed!');
                    
                    // Handle split documents response
                    const splitDocuments = pollResponse.data;
                    const results = [];
                    
                    if (Array.isArray(splitDocuments)) {
                        for (let i = 0; i < splitDocuments.length; i++) {
                            const document = splitDocuments[i];
                            if (document.docContent && document.docName) {
                                const pdfContent = Buffer.from(document.docContent, 'base64');
                                const outputPath = path.join(outputFolder, document.docName);
                                
                                // Create output folder if it doesn't exist
                                if (!fs.existsSync(outputFolder)) {
                                    fs.mkdirSync(outputFolder, { recursive: true });
                                }
                                
                                fs.writeFileSync(outputPath, pdfContent);
                                results.push({
                                    fileName: document.docName,
                                    filePath: outputPath,
                                    size: pdfContent.length
                                });
                                console.log(`Split PDF saved: ${outputPath} (${pdfContent.length} bytes)`);
                            }
                        }
                    }
                    
                    return {
                        status: 'success',
                        splitDocuments: results,
                        totalDocuments: results.length
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
        console.log('Starting PDF Split Process in Lambda');
        const inputPdfPath = event.inputPdfPath || INPUT_PDF_PATH;
        const outputFolder = event.outputFolder || OUTPUT_FOLDER;
        const splitAction = event.splitAction || 'SplitAfterPage';
        const splitActionNumber = event.splitActionNumber || 1;
        const splitSequence = event.splitSequence || null;
        const splitRanges = event.splitRanges || null;

        console.log(`Input PDF: ${inputPdfPath}`);
        console.log(`Output folder: ${outputFolder}`);
        console.log(`Split action: ${splitAction}`);
        console.log('Operation: Split PDF document');

        const base64Content = readAndEncodePdf(inputPdfPath);
        const apiResponse = await splitPdf(base64Content, path.basename(inputPdfPath), splitAction, splitActionNumber, splitSequence, splitRanges);
        const result = await handleAsyncResponse(apiResponse, outputFolder);

        if (result.status === 'success') {
            console.log('PDF splitting completed successfully!');
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'PDF splitting completed successfully',
                    splitDocuments: result.splitDocuments,
                    totalDocuments: result.totalDocuments,
                    outputFolder: outputFolder
                })
            };
        } else {
            console.log(`PDF splitting failed: ${result.error}`);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'PDF splitting failed',
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
        console.log('Starting PDF Split Process (Local Test)');
        console.log('=== Splitting PDF Document ===');
        
        const inputPdfPath = INPUT_PDF_PATH;
        const outputFolder = OUTPUT_FOLDER;
        const splitAction = 'SplitAfterPage';
        const splitActionNumber = 1;

        console.log(`Input PDF: ${inputPdfPath}`);
        console.log(`Output folder: ${outputFolder}`);
        console.log(`Split action: ${splitAction}`);
        console.log('Operation: Split PDF document');

        const base64Content = readAndEncodePdf(inputPdfPath);
        const apiResponse = await splitPdf(base64Content, path.basename(inputPdfPath), splitAction, splitActionNumber);
        const result = await handleAsyncResponse(apiResponse, outputFolder);

        if (result.status === 'success') {
            console.log('PDF splitting completed successfully!');
            console.log(`Input file: ${inputPdfPath}`);
            console.log(`Output folder: ${outputFolder}`);
            console.log(`Total split documents: ${result.totalDocuments}`);
        } else {
            console.log(`PDF splitting failed: ${result.error}`);
            console.log('Please check your input file and API configuration');
        }
    } catch (err) {
        console.error(`PDF splitting failed: ${err.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    readAndEncodePdf, 
    splitPdf, 
    handleAsyncResponse, 
    main,
    handler 
}; 