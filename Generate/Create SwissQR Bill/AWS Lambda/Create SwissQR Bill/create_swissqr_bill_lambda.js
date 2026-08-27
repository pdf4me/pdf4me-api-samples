// =============================================================================
// AWS Lambda Handler for PDF4me Create SwissQR Bill                               //
// =============================================================================

const axios = require('axios');
const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3();

// Configuration
const API_KEY = process.env.PDF4ME_API_KEY;
const API_URL = 'https://api.pdf4me.com/api/v2/CreateSwissQrBill';
const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;

/**
 * AWS Lambda handler function
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} Lambda response
 */
exports.handler = async (event, context) => {
    console.log('=== Create SwissQR Bill Lambda Function ===');

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

            // For S3 events, we need to provide Swiss QR Bill configuration
            // This is a simplified example - in practice, you might want to
            // read configuration from another file or environment variables
            inputData = {
                docContent: s3Object.Body.toString('base64'),
                docName: key,
                iban: process.env.IBAN || "CH0200700110003765824",
                crName: process.env.CR_NAME || "Test AG",
                crAddressType: process.env.CR_ADDRESS_TYPE || "S",
                crStreetOrAddressLine1: process.env.CR_STREET || "Test Strasse",
                crStreetOrAddressLine2: process.env.CR_STREET_NUMBER || "1",
                crPostalCode: process.env.CR_POSTAL_CODE || "8000",
                crCity: process.env.CR_CITY || "Zurich",
                amount: process.env.AMOUNT || "1000",
                currency: process.env.CURRENCY || "CHF",
                udName: process.env.UD_NAME || "Test Debt AG",
                udAddressType: process.env.UD_ADDRESS_TYPE || "S",
                udStreetOrAddressLine1: process.env.UD_STREET || "Test Deb Strasse",
                udStreetOrAddressLine2: process.env.UD_STREET_NUMBER || "2",
                udPostalCode: process.env.UD_POSTAL_CODE || "8000",
                udCity: process.env.UD_CITY || "Zurich",
                referenceType: process.env.REFERENCE_TYPE || "NON",
                languageType: process.env.LANGUAGE_TYPE || "English",
                seperatorLine: process.env.SEPERATOR_LINE || "LineWithScissor",
                isAsync: true
            };
        } else {
            // Direct invocation
            console.log('Processing direct invocation');
            inputData = event;
        }

        // Validate input
        if (!inputData.docContent) {
            throw new Error('Missing docContent in input data');
        }
        if (!inputData.iban) {
            throw new Error('Missing iban in input data');
        }
        if (!inputData.crName) {
            throw new Error('Missing crName in input data');
        }
        if (!inputData.amount) {
            throw new Error('Missing amount in input data');
        }

        // Create Swiss QR Bill
        const result = await createSwissQrBill(inputData);

        // Save result to S3 if output bucket is configured
        if (OUTPUT_BUCKET && result) {
            const outputKey = `swissqr-bill-${Date.now()}.pdf`;
            await s3.putObject({
                Bucket: OUTPUT_BUCKET,
                Key: outputKey,
                Body: Buffer.from(result, 'base64'),
                ContentType: 'application/pdf'
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
                message: 'Swiss QR Bill created successfully',
                outputLocation: OUTPUT_BUCKET ? `s3://${OUTPUT_BUCKET}/swissqr-bill-${Date.now()}.pdf` : null
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
 * Create Swiss QR Bill using PDF4me API
 * @param {Object} inputData - Input data containing document content and Swiss QR Bill parameters
 * @returns {Promise<string>} Swiss QR Bill PDF content as base64
 */
async function createSwissQrBill(inputData) {
    try {
        console.log('Sending request to PDF4me API...');
        console.log(`Creating Swiss QR Bill for amount: ${inputData.amount} ${inputData.currency}`);

        const response = await axios.post(API_URL, inputData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${API_KEY}`
            },
            timeout: 30000
        });

        console.log(`API Response Status: ${response.status}`);

        if (response.status === 200) {
            console.log('Swiss QR Bill creation completed immediately');
            return handleSwissQrBillResult(response.data);
        } else if (response.status === 202) {
            console.log('Swiss QR Bill creation started asynchronously, polling for completion...');
            const locationUrl = response.headers.location;
            if (!locationUrl) {
                throw new Error('No polling URL received from API');
            }

            return await pollForCompletion(locationUrl);
        } else {
            throw new Error(`API request failed with status ${response.status}: ${response.data}`);
        }

    } catch (error) {
        console.error('Error in createSwissQrBill:', error.message);
        throw error;
    }
}

/**
 * Poll for completion of asynchronous Swiss QR Bill creation
 * @param {string} locationUrl - Polling URL
 * @returns {Promise<string>} Swiss QR Bill PDF content as base64
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
                console.log('Swiss QR Bill creation completed successfully');
                return handleSwissQrBillResult(response.data);
            } else if (response.status === 202) {
                console.log('Still processing, continuing to poll...');
                continue;
            } else {
                throw new Error(`Polling failed with status ${response.status}: ${response.data}`);
            }

        } catch (error) {
            console.error(`Error in polling attempt ${attempt}:`, error.message);
            if (attempt === maxAttempts) {
                throw new Error(`Swiss QR Bill creation timed out after ${maxAttempts} attempts`);
            }
        }
    }

    throw new Error(`Swiss QR Bill creation timed out after ${maxAttempts} polling attempts`);
}

/**
 * Handle the Swiss QR Bill creation result from API response
 * @param {Object} responseData - API response data
 * @returns {string} Swiss QR Bill PDF content as base64
 */
function handleSwissQrBillResult(responseData) {
    try {
        console.log('Processing Swiss QR Bill creation result...');

        // Check if response contains PDF data
        if (responseData.docData) {
            console.log('Successfully received Swiss QR Bill PDF data');
            return responseData.docData;
        } else if (responseData.data && responseData.data.docData) {
            console.log('Successfully received Swiss QR Bill PDF data from nested structure');
            return responseData.data.docData;
        } else {
            throw new Error('No PDF data found in API response');
        }

    } catch (error) {
        console.error('Error handling Swiss QR Bill result:', error.message);
        throw new Error('Failed to process Swiss QR Bill creation result');
    }
} 