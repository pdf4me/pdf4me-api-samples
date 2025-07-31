// =============================================================================
// AWS Lambda Handler for PDF4me Get Tracking Changes In Word                     //
// =============================================================================

const axios = require('axios');
const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3();

// Configuration
const API_KEY = process.env.PDF4ME_API_KEY;
const API_URL = 'https://api.pdf4me.com/api/v2/GetTrackingChangesInWord';
const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;

/**
 * AWS Lambda handler function
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} Lambda response
 */
exports.handler = async (event, context) => {
    console.log('=== Get Tracking Changes In Word Lambda Function ===');

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

            inputData = {
                docName: key,
                docContent: s3Object.Body.toString('base64'),
                async: true
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
        if (!inputData.docName) {
            throw new Error('Missing docName in input data');
        }

        // Get tracking changes from Word document
        const result = await getTrackingChangesInWord(inputData);

        // Save result to S3 if output bucket is configured
        if (OUTPUT_BUCKET && result) {
            const outputKey = `tracking-changes-${Date.now()}.json`;
            await s3.putObject({
                Bucket: OUTPUT_BUCKET,
                Key: outputKey,
                Body: JSON.stringify(result, null, 2),
                ContentType: 'application/json'
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
                message: 'Tracking changes retrieved successfully',
                trackingChanges: result,
                outputLocation: OUTPUT_BUCKET ? `s3://${OUTPUT_BUCKET}/tracking-changes-${Date.now()}.json` : null
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
 * Get tracking changes from Word document using PDF4me API
 * @param {Object} inputData - Input data containing document content
 * @returns {Promise<Object>} Tracking changes data
 */
async function getTrackingChangesInWord(inputData) {
    try {
        console.log('Sending request to PDF4me API...');
        console.log(`Getting tracking changes for document: ${inputData.docName}`);

        const response = await axios.post(API_URL, inputData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${API_KEY}`
            },
            timeout: 30000
        });

        console.log(`API Response Status: ${response.status}`);

        if (response.status === 200) {
            console.log('Tracking changes retrieved immediately');
            return handleTrackingChangesResult(response.data);
        } else if (response.status === 202) {
            console.log('Tracking changes retrieval started asynchronously, polling for completion...');
            const locationUrl = response.headers.location;
            if (!locationUrl) {
                throw new Error('No polling URL received from API');
            }

            return await pollForCompletion(locationUrl);
        } else {
            throw new Error(`API request failed with status ${response.status}: ${response.data}`);
        }

    } catch (error) {
        console.error('Error in getTrackingChangesInWord:', error.message);
        throw error;
    }
}

/**
 * Poll for completion of asynchronous tracking changes retrieval
 * @param {string} locationUrl - Polling URL
 * @returns {Promise<Object>} Tracking changes data
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
                console.log('Tracking changes retrieved successfully');
                return handleTrackingChangesResult(response.data);
            } else if (response.status === 202) {
                console.log('Still processing, continuing to poll...');
                continue;
            } else {
                throw new Error(`Polling failed with status ${response.status}: ${response.data}`);
            }

        } catch (error) {
            console.error(`Error in polling attempt ${attempt}:`, error.message);
            if (attempt === maxAttempts) {
                throw new Error(`Tracking changes retrieval timed out after ${maxAttempts} attempts`);
            }
        }
    }

    throw new Error(`Tracking changes retrieval timed out after ${maxAttempts} polling attempts`);
}

/**
 * Handle the tracking changes result from API response
 * @param {Object} responseData - API response data
 * @returns {Object} Tracking changes data
 */
function handleTrackingChangesResult(responseData) {
    try {
        console.log('Processing tracking changes result...');

        // Check if response contains tracking changes data
        if (responseData.trackingChanges) {
            console.log('Successfully received tracking changes data');
            return responseData.trackingChanges;
        } else if (responseData.data && responseData.data.trackingChanges) {
            console.log('Successfully received tracking changes data from nested structure');
            return responseData.data.trackingChanges;
        } else if (responseData.changes) {
            console.log('Successfully received tracking changes data in changes field');
            return responseData.changes;
        } else {
            throw new Error('No tracking changes data found in API response');
        }

    } catch (error) {
        console.error('Error handling tracking changes result:', error.message);
        throw new Error('Failed to process tracking changes result');
    }
} 