// =============================================================================
// AWS Lambda Handler for PDF4me Read Barcode From Image                            //
// =============================================================================

const axios = require('axios');
const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3();

// Configuration
const API_KEY = process.env.PDF4ME_API_KEY;
const API_URL = 'https://api.pdf4me.com/api/v2/ReadBarcodeFromImage';
const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;

/**
 * AWS Lambda handler function
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} Lambda response
 */
exports.handler = async (event, context) => {
    console.log('=== Read Barcode From Image Lambda Function ===');

    try {
        let inputData;

        // Handle different event types
        if (event.httpMethod) {
            // HTTP API Gateway event
            console.log('Processing HTTP API Gateway event');
            inputData = JSON.parse(event.body || '{}');
        } else if (event.Records && event.Records[0].s3) {
            // S3 event
            console.log('Processing S3 event');
            const s3Record = event.Records[0].s3;
            const bucketName = s3Record.bucket.name;
            const key = decodeURIComponent(s3Record.object.key);

            console.log(`Processing file: ${bucketName}/${key}`);

            // Download file from S3
            const s3Object = await s3.getObject({
                Bucket: bucketName,
                Key: key
            }).promise();

            // For S3 events, we need to provide barcode reading configuration
            inputData = {
                imageName: key,
                imageData: s3Object.Body.toString('base64'),
                barcodeTypes: process.env.BARCODE_TYPES || "All", // All, QR, Code128, Code39, EAN13, etc.
                maxBarcodes: process.env.MAX_BARCODES || 10, // Maximum number of barcodes to detect
                confidence: process.env.CONFIDENCE || 0.8, // Minimum confidence threshold
                outputFormat: process.env.OUTPUT_FORMAT || "JSON", // JSON, XML, Text
                includeBarcodeImage: process.env.INCLUDE_BARCODE_IMAGE || false, // Include barcode image in result
                async: true
            };
        } else {
            // Direct invocation
            console.log('Processing direct invocation');
            inputData = event;
        }

        // Validate input
        if (!inputData.imageData) {
            throw new Error('Missing imageData in input data');
        }
        if (!inputData.imageName) {
            throw new Error('Missing imageName in input data');
        }

        // Read barcode from image
        const result = await readBarcodeFromImage(inputData);

        // Save result to S3 if output bucket is configured
        if (OUTPUT_BUCKET && result) {
            const outputKey = `barcode-result-${Date.now()}.${inputData.outputFormat?.toLowerCase() || 'json'}`;
            const outputContent = inputData.outputFormat === 'JSON' ? JSON.stringify(result, null, 2) : result;
            const contentType = inputData.outputFormat === 'JSON' ? 'application/json' : 'text/plain';
            
            await s3.putObject({
                Bucket: OUTPUT_BUCKET,
                Key: outputKey,
                Body: outputContent,
                ContentType: contentType
            }).promise();

            console.log(`Result saved to S3: ${OUTPUT_BUCKET}/${outputKey}`);
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                message: 'Barcode read from image successfully',
                barcodeData: result,
                outputLocation: OUTPUT_BUCKET ? `s3://${OUTPUT_BUCKET}/barcode-result-${Date.now()}.${inputData.outputFormat?.toLowerCase() || 'json'}` : null
            })
        };

    } catch (error) {
        console.error('Error in Lambda handler:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};

/**
 * Read barcode from image using PDF4me API
 * @param {Object} inputData - Input data containing image and barcode reading configuration
 * @returns {Promise<Object>} Barcode data
 */
async function readBarcodeFromImage(inputData) {
    try {
        console.log('Sending request to PDF4me API...');
        console.log(`Reading barcode from image: ${inputData.imageName}`);
        console.log(`Barcode types: ${inputData.barcodeTypes}`);
        console.log(`Max barcodes: ${inputData.maxBarcodes}`);
        console.log(`Output format: ${inputData.outputFormat}`);

        const response = await axios.post(API_URL, inputData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${API_KEY}`
            },
            timeout: 30000
        });

        console.log(`API Response Status: ${response.status}`);

        if (response.status === 200) {
            console.log('Barcode reading completed immediately');
            return handleBarcodeResult(response.data);
        } else if (response.status === 202) {
            console.log('Barcode reading started asynchronously, polling for completion...');
            const locationUrl = response.headers.location;
            if (!locationUrl) {
                throw new Error('No polling URL received from API');
            }

            return await pollForCompletion(locationUrl);
        } else {
            throw new Error(`API request failed with status ${response.status}: ${response.data}`);
        }

    } catch (error) {
        console.error('Error in readBarcodeFromImage:', error.message);
        throw error;
    }
}

/**
 * Poll for completion of asynchronous barcode reading operation
 * @param {string} locationUrl - Polling URL
 * @returns {Promise<Object>} Barcode data
 */
async function pollForCompletion(locationUrl) {
    const maxAttempts = 10;
    const delayMs = 10000; // 10 seconds

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`Polling attempt ${attempt}/${maxAttempts}...`);

        try {
            await new Promise(resolve => setTimeout(resolve, delayMs));

            const response = await axios.get(locationUrl, {
                headers: {
                    'Authorization': `Basic ${API_KEY}`
                },
                timeout: 30000
            });

            if (response.status === 200) {
                console.log('Barcode reading completed successfully');
                return handleBarcodeResult(response.data);
            } else if (response.status === 202) {
                console.log('Still processing, continuing to poll...');
                continue;
            } else {
                throw new Error(`Polling failed with status ${response.status}: ${response.data}`);
            }

        } catch (error) {
            console.error(`Error in polling attempt ${attempt}:`, error.message);
            if (attempt === maxAttempts) {
                throw new Error(`Barcode reading timed out after ${maxAttempts} attempts`);
            }
        }
    }

    throw new Error(`Barcode reading timed out after ${maxAttempts} polling attempts`);
}

/**
 * Handle the barcode reading result from API response
 * @param {Object} responseData - API response data
 * @returns {Object} Barcode data
 */
function handleBarcodeResult(responseData) {
    try {
        console.log('Processing barcode reading result...');

        // Check if response contains barcode data
        if (responseData.barcodeData) {
            console.log('Successfully received barcode data');
            return responseData.barcodeData;
        } else if (responseData.data && responseData.data.barcodeData) {
            console.log('Successfully received barcode data from nested structure');
            return responseData.data.barcodeData;
        } else if (responseData.barcodes) {
            console.log('Successfully received barcode data in barcodes field');
            return responseData.barcodes;
        } else if (responseData.result) {
            console.log('Successfully received barcode data in result field');
            return responseData.result;
        } else {
            throw new Error('No barcode data found in API response');
        }

    } catch (error) {
        console.error('Error handling barcode reading result:', error.message);
        throw new Error('Failed to process barcode reading result');
    }
} 