const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Read and encode a file to base64
 * @param {string} filePath - Path to the file to encode
 * @returns {string} Base64 encoded file content
 */
function readAndEncodeFile(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath);
        return fileContent.toString('base64');
    } catch (error) {
        throw new Error(`Error reading file ${filePath}: ${error.message}`);
    }
}

/**
 * Add text stamp to PDF using PDF4me API
 * @param {string} pdfBase64 - Base64 encoded PDF content
 * @param {Object} options - Text stamp options
 * @returns {Promise<Object>} API response
 */
async function addTextStampToPdf(pdfBase64, options = {}) {
    const {
        pages = "all",
        text = "CONFIDENTIAL - PDF4me Watermark",
        alignX = "center",
        alignY = "middle",
        marginXInMM = "50",
        marginYInMM = "50",
        marginXInPx = "150",
        marginYInPx = "150",
        opacity = "30",
        fontName = "Arial",
        fontSize = 24,
        fontColor = "#FF0000",
        isBold = true,
        isItalics = false,
        underline = false,
        rotate = 45,
        isBackground = true,
        showOnlyInPrint = false,
        transverse = false,
        fitTextOverPage = false,
        isAsync = true
    } = options;

    const payload = {
        docContent: pdfBase64,
        docName: "output.pdf",
        pages,
        text,
        alignX,
        alignY,
        marginXInMM,
        marginYInMM,
        marginXInPx,
        marginYInPx,
        opacity,
        fontName,
        fontSize,
        fontColor,
        isBold,
        isItalics,
        underline,
        rotate,
        isBackground,
        showOnlyInPrint,
        transverse,
        fitTextOverPage,
        async
    };

    const headers = {
        'Authorization': `Basic ${process.env.PDF4ME_API_KEY}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.post('https://api.pdf4me.com/api/v2/Stamp', payload, { headers });
        return response;
    } catch (error) {
        throw new Error(`API request failed: ${error.message}`);
    }
}

/**
 * Handle asynchronous API response with polling
 * @param {string} locationUrl - Polling URL from Location header
 * @returns {Promise<Buffer>} Processed PDF content
 */
async function handleAsyncResponse(locationUrl) {
    const headers = {
        'Authorization': `Basic ${process.env.PDF4ME_API_KEY}`
    };

    const maxRetries = 10;
    const retryDelay = 10000; // 10 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`Checking status... (Attempt ${attempt}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));

        try {
            const response = await axios.get(locationUrl, { headers });
            
            if (response.status === 200) {
                console.log('Success! Text stamp addition completed!');
                return Buffer.from(response.data, 'binary');
            } else if (response.status === 202) {
                continue; // Still processing
            } else {
                throw new Error(`Unexpected status: ${response.status}`);
            }
        } catch (error) {
            console.log(`Error polling status: ${error.message}`);
            if (attempt === maxRetries) {
                throw new Error(`Polling failed after ${maxRetries} attempts`);
            }
        }
    }

    throw new Error('Timeout: Processing did not complete after multiple retries');
}

/**
 * Main function to add text stamp to PDF
 */
async function main() {
    try {
        const pdfPath = 'sample.pdf';
        
        // Check if PDF file exists
        if (!fs.existsSync(pdfPath)) {
            throw new Error(`PDF file not found at ${pdfPath}`);
        }

        // Read and encode PDF
        console.log('Reading PDF file...');
        const pdfBase64 = readAndEncodeFile(pdfPath);
        console.log(`PDF file read successfully: ${Buffer.from(pdfBase64, 'base64').length} bytes`);

        // Add text stamp to PDF
        console.log('Sending text stamp request to PDF4me API...');
        const response = await addTextStampToPdf(pdfBase64);

        let pdfContent;

        if (response.status === 200) {
            // Synchronous response
            console.log('Success! Text stamp addition completed!');
            pdfContent = Buffer.from(response.data, 'binary');
        } else if (response.status === 202) {
            // Asynchronous response - poll for completion
            console.log('202 - Request accepted. Processing asynchronously...');
            const locationUrl = response.headers.location;
            
            if (!locationUrl) {
                throw new Error('No polling URL found in response');
            }

            pdfContent = await handleAsyncResponse(locationUrl);
        } else {
            throw new Error(`Unexpected response status: ${response.status}`);
        }

        // Save the output PDF
        const outputPath = 'Add_text_stamp_to_PDF_output.pdf';
        fs.writeFileSync(outputPath, pdfContent);
        console.log(`File saved: ${outputPath}`);

        return {
            success: true,
            outputPath,
            message: 'Text stamp addition completed successfully'
        };

    } catch (error) {
        console.error(`Error: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * AWS Lambda handler
 */
exports.handler = async (event, context) => {
    try {
        console.log('Adding text stamp/watermark to PDF...');
        const result = await main();
        
        return {
            statusCode: result.success ? 200 : 500,
            body: JSON.stringify(result),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        console.error('Lambda handler error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};

// For local testing
if (require.main === module) {
    main().catch(console.error);
} 