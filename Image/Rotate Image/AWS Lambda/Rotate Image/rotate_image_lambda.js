// =============================================================================
// AWS Lambda Handler for PDF4me Rotate Image                                         //
// =============================================================================

const axios = require('axios');
const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3();

// Configuration
const API_KEY = process.env.PDF4ME_API_KEY;
const API_URL = 'https://api.pdf4me.com/api/v2/RotateImage';
const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;

/**
 * AWS Lambda handler function
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} Lambda response
 */
exports.handler = async (event, context) => {
    console.log('=== Rotate Image Lambda Function ===');

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

            // For S3 events, we need to provide rotation configuration
            inputData = {
                imageName: key,
                imageData: s3Object.Body.toString('base64'),
                rotationAngle: process.env.ROTATION_ANGLE || 90, // Rotation angle in degrees (90, 180, 270)
                rotationDirection: process.env.ROTATION_DIRECTION || "Clockwise", // Clockwise, CounterClockwise
                backgroundColor: process.env.BACKGROUND_COLOR || "#FFFFFF", // Background color for transparent areas
                outputFormat: process.env.OUTPUT_FORMAT || "PNG", // JPEG, PNG, GIF, BMP, TIFF
                quality: process.env.QUALITY || 85, // 0-100 (for JPEG)
                maintainTransparency: process.env.MAINTAIN_TRANSPARENCY || true,
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
        if (!inputData.rotationAngle) {
            throw new Error('Missing rotationAngle in input data');
        }

        // Rotate image
        const result = await rotateImage(inputData);

        // Save result to S3 if output bucket is configured
        if (OUTPUT_BUCKET && result) {
            const outputKey = `rotated-image-${Date.now()}.${inputData.outputFormat?.toLowerCase() || 'png'}`;
            await s3.putObject({
                Bucket: OUTPUT_BUCKET,
                Key: outputKey,
                Body: Buffer.from(result, 'base64'),
                ContentType: getContentType(inputData.outputFormat)
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
                message: 'Image rotated successfully',
                rotationAngle: inputData.rotationAngle,
                rotationDirection: inputData.rotationDirection,
                outputLocation: OUTPUT_BUCKET ? `s3://${OUTPUT_BUCKET}/rotated-image-${Date.now()}.${inputData.outputFormat?.toLowerCase() || 'png'}` : null
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
 * Rotate image using PDF4me API
 * @param {Object} inputData - Input data containing image and rotation configuration
 * @returns {Promise<string>} Rotated image content as base64
 */
async function rotateImage(inputData) {
    try {
        console.log('Sending request to PDF4me API...');
        console.log(`Rotating image: ${inputData.imageName}`);
        console.log(`Rotation angle: ${inputData.rotationAngle} degrees`);
        console.log(`Rotation direction: ${inputData.rotationDirection}`);
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
            console.log('Image rotation completed immediately');
            return handleRotationResult(response.data);
        } else if (response.status === 202) {
            console.log('Image rotation started asynchronously, polling for completion...');
            const locationUrl = response.headers.location;
            if (!locationUrl) {
                throw new Error('No polling URL received from API');
            }

            return await pollForCompletion(locationUrl);
        } else {
            throw new Error(`API request failed with status ${response.status}: ${response.data}`);
        }

    } catch (error) {
        console.error('Error in rotateImage:', error.message);
        throw error;
    }
}

/**
 * Poll for completion of asynchronous image rotation operation
 * @param {string} locationUrl - Polling URL
 * @returns {Promise<string>} Rotated image content as base64
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
                console.log('Image rotation completed successfully');
                return handleRotationResult(response.data);
            } else if (response.status === 202) {
                console.log('Still processing, continuing to poll...');
                continue;
            } else {
                throw new Error(`Polling failed with status ${response.status}: ${response.data}`);
            }

        } catch (error) {
            console.error(`Error in polling attempt ${attempt}:`, error.message);
            if (attempt === maxAttempts) {
                throw new Error(`Image rotation timed out after ${maxAttempts} attempts`);
            }
        }
    }

    throw new Error(`Image rotation timed out after ${maxAttempts} polling attempts`);
}

/**
 * Handle the image rotation result from API response
 * @param {Object} responseData - API response data
 * @returns {string} Rotated image content as base64
 */
function handleRotationResult(responseData) {
    try {
        console.log('Processing image rotation result...');

        // Check if response contains image data
        if (responseData.imageData) {
            console.log('Successfully received rotated image data');
            return responseData.imageData;
        } else if (responseData.data && responseData.data.imageData) {
            console.log('Successfully received rotated image data from nested structure');
            return responseData.data.imageData;
        } else if (responseData.result) {
            console.log('Successfully received rotated image data in result field');
            return responseData.result;
        } else {
            throw new Error('No image data found in API response');
        }

    } catch (error) {
        console.error('Error handling image rotation result:', error.message);
        throw new Error('Failed to process image rotation result');
    }
}

/**
 * Get content type based on output format
 * @param {string} outputFormat - Output format (JPEG, PNG, GIF, etc.)
 * @returns {string} Content type
 */
function getContentType(outputFormat) {
    switch (outputFormat?.toUpperCase()) {
        case 'JPEG':
        case 'JPG':
            return 'image/jpeg';
        case 'PNG':
            return 'image/png';
        case 'GIF':
            return 'image/gif';
        case 'BMP':
            return 'image/bmp';
        case 'TIFF':
            return 'image/tiff';
        default:
            return 'image/png';
    }
} 