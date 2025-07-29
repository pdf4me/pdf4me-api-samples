//*******************************************************************************************//
//                                                                                          //
// Get Your API Key: https://dev.pdf4me.com/dashboard/#/api-keys                            //
// API Documentation: https://developer.pdf4me.com/swagger/index.html?url=/swagger/v2/swagger.json //
//                                                                                          //
// Note: Replace placeholder values in the code with your API Key                           //
// and file paths (if applicable)                                                           //
//                                                                                          //
//*******************************************************************************************//

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// The authentication key (API Key).
// Get your own by registering at https://dev.pdf4me.com/dashboard/#/api-keys
const API_KEY = 'get the API key from https://dev.pdf4me.com/dashboard/#/api-keys'; // <-- Replace with your PDF4me API key

// Input and output file paths
const PDF_FILE_PATH = 'sample.pdf'; // Path to the main PDF file
const OUTPUT_PATH = 'output_with_barcode.pdf'; // Output PDF file name

// API endpoint for adding barcodes to PDF documents
const URL = 'https://api.pdf4me.com/api/v2/addbarcode';

// Prepare the payload (data) to send to the API
function createPayload(pdfBase64) {
    return {
        docContent: pdfBase64,                        // Base64 encoded PDF document content
        docName: 'output.pdf',                        // Output PDF file name
        text: 'PDF4me Barcode Sample',                // Text to encode in barcode
        barcodeType: 'qrCode',                        // Barcode types: qrCode, code128, dataMatrix, aztec, hanXin, pdf417, etc.
        pages: '1-3',                                 // Page options: '', '1', '1,3,5', '2-5', '1,3,7-10', '2-' (empty = all pages)
        alignX: 'Right',                              // Horizontal alignment: 'Left', 'Center', 'Right'
        alignY: 'Bottom',                             // Vertical alignment: 'Top', 'Middle', 'Bottom'
        heightInMM: '40',                             // Height in millimeters (string, '0' for auto-detect)
        widthInMM: '40',                              // Width in millimeters (string, '0' for auto-detect)
        marginXInMM: '20',                            // Horizontal margin in millimeters (string)
        marginYInMM: '20',                            // Vertical margin in millimeters (string)
        heightInPt: '113',                            // Height in points (string, '0' for auto-detect)
        widthInPt: '113',                             // Width in points (string, '0' for auto-detect)
        marginXInPt: '57',                            // Horizontal margin in points (string)
        marginYInPt: '57',                            // Vertical margin in points (string)
        opacity: 100,                                 // Opacity (0-100): 0=transparent, 100=opaque
        displayText: 'below',                         // Text display: 'above', 'below'
        hideText: false,                              // Hide barcode text (true/false)
        showOnlyInPrint: false,                       // Show only in print (true/false)
        isTextAbove: false,                           // Text position above barcode (true/false)
        async: true                                   // Enable asynchronous processing
    };
}

// Set up HTTP headers for the API request
function getHeaders(apiKey) {
    return {
        'Authorization': `Basic ${apiKey}`,
        'Content-Type': 'application/json'
    };
}

// Main function to add barcode to PDF
async function addBarcodeToPdf() {
    // Check if the input PDF file exists before proceeding
    if (!fs.existsSync(PDF_FILE_PATH)) {
        const errMsg = `Error: PDF file not found at ${PDF_FILE_PATH}`;
        console.error(errMsg);
        return;
    }

    // Read the PDF file and convert it to base64 encoding
    let pdfContent;
    try {
        pdfContent = fs.readFileSync(PDF_FILE_PATH);
        console.log(`PDF file read successfully: ${pdfContent.length} bytes`);
    } catch (err) {
        const errMsg = `Error reading PDF file: ${err}`;
        console.error(errMsg);
        return;
    }
    const pdfBase64 = Buffer.from(pdfContent).toString('base64');

    // Create payload and headers
    const payload = createPayload(pdfBase64);
    const headers = getHeaders(API_KEY);

    console.log('Sending barcode addition request to PDF4me API...');

    let response;
    try {
        response = await axios.post(URL, payload, { headers, responseType: 'arraybuffer', validateStatus: () => true });
    } catch (err) {
        const errMsg = `Error making API request: ${err}`;
        console.error(errMsg);
        return;
    }

    if (response.status === 200) {
        // 200 - Success: barcode addition completed immediately
        console.log('✓ Success! Barcode addition completed!');
        fs.writeFileSync(OUTPUT_PATH, response.data, 'binary');
        console.log(`File saved: ${OUTPUT_PATH}`);
    } else if (response.status === 202) {
        // 202 - Accepted: API is processing the request asynchronously
        console.log('202 - Request accepted. Processing asynchronously...');
        const locationUrl = response.headers['location'];
        if (!locationUrl) {
            const errMsg = 'Error: No polling URL found in response';
            console.error(errMsg);
            return;
        }
        // Retry logic for polling the result
        const maxRetries = 10;
        const retryDelay = 10000; // 10 seconds
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            console.log(`Checking status... (Attempt ${attempt + 1}/${maxRetries})`);
            await new Promise(res => setTimeout(res, retryDelay));
            let pollResponse;
            try {
                pollResponse = await axios.get(locationUrl, { headers, responseType: 'arraybuffer', validateStatus: () => true });
            } catch (err) {
                console.error(`Error polling status: ${err}`);
                continue;
            }
            if (pollResponse.status === 200) {
                console.log('✓ Success! Barcode addition completed!');
                fs.writeFileSync(OUTPUT_PATH, pollResponse.data, 'binary');
                console.log(`File saved: ${OUTPUT_PATH}`);
                return;
            } else if (pollResponse.status === 202) {
                // Still processing, continue polling
                continue;
            } else {
                const errMsg = `Error during processing: ${pollResponse.status} - ${pollResponse.statusText}`;
                console.error(errMsg);
                return;
            }
        }
        const errMsg = 'Timeout: Processing did not complete after multiple retries';
        console.error(errMsg);
    } else {
        // Other status codes - Error
        const errMsg = `Error: ${response.status} - ${response.statusText}`;
        console.error(errMsg);
    }
}

// Run the function if this file is executed directly
if (require.main === module) {
    addBarcodeToPdf().catch(console.error);
}

module.exports = { addBarcodeToPdf }; 