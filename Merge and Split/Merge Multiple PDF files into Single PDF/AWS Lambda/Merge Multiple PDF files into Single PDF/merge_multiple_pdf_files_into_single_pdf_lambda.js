//*******************************************************************************************//
//                                                                                          //
// AWS Lambda Handler for PDF4me Merge Multiple PDF Files into Single PDF                  //
// Get Your API Key: https://dev.pdf4me.com/dashboard/#/api-keys                            //
// API Documentation: https://developer.pdf4me.com/swagger/index.html?url=/swagger/v2/swagger.json //
//                                                                                          //
// Note: Replace placeholder values in the code with your API Key                           //
//                                                                                          //
//*******************************************************************************************//

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// API Configuration - PDF4me service for merging multiple PDF documents
const API_KEY = process.env.PDF4ME_API_KEY || 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys';

// API endpoint for merging PDF documents
const BASE_URL = 'https://api.pdf4me.com/';
const URL = `${BASE_URL}api/v2/Merge`;

// File paths configuration
const INPUT_PDF_PATHS = ["sample1.pdf", "sample2.pdf"];
const OUTPUT_PATH = "Merged_pdf_output.pdf";

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
 * Read multiple PDF files and convert them to base64 encoding
 * @param {Array<string>} filePaths - Array of paths to PDF files
 * @returns {Array<string>} Array of base64 encoded PDF contents
 */
function readAndEncodeMultiplePdfs(filePaths) {
    const pdfContentsBase64 = [];
    
    for (const pdfFile of filePaths) {
        try {
            const base64Content = readAndEncodePdf(pdfFile);
            pdfContentsBase64.push(base64Content);
        } catch (error) {
            console.error(`Error reading PDF file ${pdfFile}:`, error);
            throw new Error(`Failed to read PDF file: ${pdfFile}`);
        }
    }
    
    return pdfContentsBase64;
}

/**
 * Send PDFs to PDF4me API for merging
 * @param {Array<string>} base64Contents - Array of base64 encoded PDF contents
 * @param {string} outputFilename - Name of the output PDF file
 * @returns {Promise<Object>} API response containing the processed file or processing status
 * @throws {Error} For API request errors
 */
async function mergePdfs(base64Contents, outputFilename) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`
    };

    const payload = {
        docContent: base64Contents,              // Array of base64 encoded PDF contents
        docName: outputFilename,                 // Output PDF file name
        async: true                              // Enable asynchronous processing
    };

    console.log('Sending PDF merge request to PDF4me API...');

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
            console.log('Success! PDF merging completed!');
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
        // Save the merged PDF
        fs.writeFileSync(outputPdfPath, apiResponse.binaryContent);
        const fileSize = fs.statSync(outputPdfPath).size;
        console.log(`Merged PDF saved: ${outputPdfPath} (${fileSize} bytes)`);
        
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
                    console.log('Success! PDF merging completed!');
                    
                    // Save the merged PDF
                    fs.writeFileSync(outputPdfPath, pollResponse.data);
                    const fileSize = fs.statSync(outputPdfPath).size;
                    console.log(`Merged PDF saved: ${outputPdfPath} (${fileSize} bytes)`);
                    
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
        console.log('Starting PDF Merge Process in Lambda');
        const inputPdfPaths = event.inputPdfPaths || INPUT_PDF_PATHS;
        const outputPdfName = event.outputPdfName || OUTPUT_PATH;

        console.log(`Input PDFs: ${inputPdfPaths.join(', ')}`);
        console.log(`Output merged PDF: ${outputPdfName}`);
        console.log('Operation: Merge multiple PDF files into single PDF');

        const base64Contents = readAndEncodeMultiplePdfs(inputPdfPaths);
        const apiResponse = await mergePdfs(base64Contents, path.basename(outputPdfName));
        const result = await handleAsyncResponse(apiResponse, outputPdfName);

        if (result.status === 'success') {
            console.log('PDF merging completed successfully!');
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'PDF merging completed successfully',
                    outputFileName: outputPdfName,
                    fileSize: result.fileSize,
                    inputFiles: inputPdfPaths
                })
            };
        } else {
            console.log(`PDF merging failed: ${result.error}`);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'PDF merging failed',
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
        console.log('Starting PDF Merge Process (Local Test)');
        console.log('=== Merging Multiple PDF Files into Single PDF ===');
        
        const inputPdfPaths = INPUT_PDF_PATHS;
        const outputPdfName = OUTPUT_PATH;

        console.log(`Input PDFs: ${inputPdfPaths.join(', ')}`);
        console.log(`Output merged PDF: ${outputPdfName}`);
        console.log('Operation: Merge multiple PDF files into single PDF');

        const base64Contents = readAndEncodeMultiplePdfs(inputPdfPaths);
        const apiResponse = await mergePdfs(base64Contents, path.basename(outputPdfName));
        const result = await handleAsyncResponse(apiResponse, outputPdfName);

        if (result.status === 'success') {
            console.log('PDF merging completed successfully!');
            console.log(`Input files: ${inputPdfPaths.join(', ')}`);
            console.log(`Output file: ${outputPdfName}`);
        } else {
            console.log(`PDF merging failed: ${result.error}`);
            console.log('Please check your input files and API configuration');
        }
    } catch (err) {
        console.error(`PDF merging failed: ${err.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { 
    readAndEncodePdf, 
    readAndEncodeMultiplePdfs,
    mergePdfs, 
    handleAsyncResponse, 
    main,
    handler 
}; 