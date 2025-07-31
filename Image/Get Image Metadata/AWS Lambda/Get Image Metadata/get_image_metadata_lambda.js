// =============================================================================
// AWS Lambda Handler for PDF4me Get Image Metadata                                   //
// =============================================================================

const axios = require('axios');
const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3();

// Configuration
const API_KEY = process.env.PDF4ME_API_KEY;
const API_URL = 'https://api.pdf4me.com/api/v2/GetImageMetadata';
const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;

/**
 * AWS Lambda handler function
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} Lambda response
 */
exports.handler = async (event, context) => {
    console.log('=== Get Image Metadata Lambda Function ===');

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

            // For S3 events, we need to provide metadata extraction configuration
            inputData = {
                imageName: key,
                imageData: s3Object.Body.toString('base64'),
                includeExif: process.env.INCLUDE_EXIF || true, // Include EXIF data
                includeIptc: process.env.INCLUDE_IPTC || true, // Include IPTC data
                includeXmp: process.env.INCLUDE_XMP || true, // Include XMP data
                includeIcc: process.env.INCLUDE_ICC || true, // Include ICC profile data
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

        // Get image metadata
        const result = await getImageMetadata(inputData);

        // Save result to S3 if output bucket is configured
        if (OUTPUT_BUCKET && result) {
            const outputKey = `image-metadata-${Date.now()}.json`;
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
                message: 'Image metadata retrieved successfully',
                metadata: result,
                outputLocation: OUTPUT_BUCKET ? `s3://${OUTPUT_BUCKET}/image-metadata-${Date.now()}.json` : null
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
 * Get image metadata using PDF4me API
 * @param {Object} inputData - Input data containing image and metadata extraction configuration
 * @returns {Promise<Object>} Image metadata
 */
async function getImageMetadata(inputData) {
    try {
        console.log('Sending request to PDF4me API...');
        console.log(`Getting metadata for image: ${inputData.imageName}`);
        console.log(`Include EXIF: ${inputData.includeExif}`);
        console.log(`Include IPTC: ${inputData.includeIptc}`);
        console.log(`Include XMP: ${inputData.includeXmp}`);

        const response = await axios.post(API_URL, inputData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${API_KEY}`
            },
            timeout: 30000
        });

        console.log(`API Response Status: ${response.status}`);

        if (response.status === 200) {
            console.log('Image metadata retrieval completed immediately');
            return handleMetadataResult(response.data);
        } else if (response.status === 202) {
            console.log('Image metadata retrieval started asynchronously, polling for completion...');
            const locationUrl = response.headers.location;
            if (!locationUrl) {
                throw new Error('No polling URL received from API');
            }

            return await pollForCompletion(locationUrl);
        } else {
            throw new Error(`API request failed with status ${response.status}: ${response.data}`);
        }

    } catch (error) {
        console.error('Error in getImageMetadata:', error.message);
        throw error;
    }
}

/**
 * Poll for completion of asynchronous image metadata retrieval operation
 * @param {string} locationUrl - Polling URL
 * @returns {Promise<Object>} Image metadata
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
                console.log('Image metadata retrieval completed successfully');
                return handleMetadataResult(response.data);
            } else if (response.status === 202) {
                console.log('Still processing, continuing to poll...');
                continue;
            } else {
                throw new Error(`Polling failed with status ${response.status}: ${response.data}`);
            }

        } catch (error) {
            console.error(`Error in polling attempt ${attempt}:`, error.message);
            if (attempt === maxAttempts) {
                throw new Error(`Image metadata retrieval timed out after ${maxAttempts} attempts`);
            }
        }
    }

    throw new Error(`Image metadata retrieval timed out after ${maxAttempts} polling attempts`);
}

/**
 * Handle the image metadata result from API response
 * @param {Object} responseData - API response data
 * @returns {Object} Image metadata
 */
function handleMetadataResult(responseData) {
    try {
        console.log('Processing image metadata result...');

        // Check if response contains metadata
        if (responseData.metadata) {
            console.log('Successfully received image metadata');
            return responseData.metadata;
        } else if (responseData.data && responseData.data.metadata) {
            console.log('Successfully received image metadata from nested structure');
            return responseData.data.metadata;
        } else if (responseData.imageMetadata) {
            console.log('Successfully received image metadata in imageMetadata field');
            return responseData.imageMetadata;
        } else {
            throw new Error('No metadata found in API response');
        }

    } catch (error) {
        console.error('Error handling image metadata result:', error.message);
        throw new Error('Failed to process image metadata result');
    }
} 