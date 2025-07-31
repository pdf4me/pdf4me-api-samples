// =============================================================================
// AWS Lambda Handler for PDF4me Replace Text with Image                            //
// =============================================================================

const axios = require('axios');
const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3();

// Configuration
const API_KEY = process.env.PDF4ME_API_KEY;
const API_URL = 'https://api.pdf4me.com/api/v2/ReplaceTextWithImage';
const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;

/**
 * AWS Lambda handler function
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} Lambda response
 */
exports.handler = async (event, context) => {
    console.log('=== Replace Text with Image Lambda Function ===');

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

            // For S3 events, we need to provide text replacement configuration
            inputData = {
                imageName: key,
                imageData: s3Object.Body.toString('base64'),
                textToReplace: process.env.TEXT_TO_REPLACE || "{{LOGO}}", // Text to replace
                replacementImageData: process.env.REPLACEMENT_IMAGE_DATA || "", // Base64 encoded replacement image
                replacementImageName: process.env.REPLACEMENT_IMAGE_NAME || "logo.png",
                replacementImageWidth: process.env.REPLACEMENT_IMAGE_WIDTH || 100, // Width in pixels
                replacementImageHeight: process.env.REPLACEMENT_IMAGE_HEIGHT || 50, // Height in pixels
                maintainAspectRatio: process.env.MAINTAIN_ASPECT_RATIO || true, // Maintain aspect ratio
                outputFormat: process.env.OUTPUT_FORMAT || "PNG", // JPEG, PNG, GIF, BMP, TIFF
                quality: process.env.QUALITY || 85, // 0-100 (for JPEG)
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
        if (!inputData.textToReplace) {
            throw new Error('Missing textToReplace in input data');
        }
        if (!inputData.replacementImageData) {
            throw new Error('Missing replacementImageData in input data');
        }

        // Replace text with image
        const result = await replaceTextWithImage(inputData);

        // Save result to S3 if output bucket is configured
        if (OUTPUT_BUCKET && result) {
            const outputKey = `text-replaced-with-image-${Date.now()}.${inputData.outputFormat?.toLowerCase() || 'png'}`;
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
                message: 'Text replaced with image successfully',
                outputLocation: OUTPUT_BUCKET ? `s3://${OUTPUT_BUCKET}/text-replaced-with-image-${Date.now()}.${inputData.outputFormat?.toLowerCase() || 'png'}` : null
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
 * Replace text with image using PDF4me API
 * @param {Object} inputData - Input data containing image and text replacement configuration
 * @returns {Promise<string>} Image content as base64 with text replaced
 */
async function replaceTextWithImage(inputData) {
    try {
        console.log('Sending request to PDF4me API...');
        console.log(`Replacing text in image: ${inputData.imageName}`);
        console.log(`Text to replace: ${inputData.textToReplace}`);
        console.log(`Replacement image: ${inputData.replacementImageName}`);
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
            console.log('Text replacement completed immediately');
            return handleTextReplacementResult(response.data);
        } else if (response.status === 202) {
            console.log('Text replacement started asynchronously, polling for completion...');
            const locationUrl = response.headers.location;
            if (!locationUrl) {
                throw new Error('No polling URL received from API');
            }

            return await pollForCompletion(locationUrl);
        } else {
            throw new Error(`API request failed with status ${response.status}: ${response.data}`);
        }

    } catch (error) {
        console.error('Error in replaceTextWithImage:', error.message);
        throw error;
    }
}

/**
 * Poll for completion of asynchronous text replacement operation
 * @param {string} locationUrl - Polling URL
 * @returns {Promise<string>} Image content as base64 with text replaced
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
                console.log('Text replacement completed successfully');
                return handleTextReplacementResult(response.data);
            } else if (response.status === 202) {
                console.log('Still processing, continuing to poll...');
                continue;
            } else {
                throw new Error(`Polling failed with status ${response.status}: ${response.data}`);
            }

        } catch (error) {
            console.error(`Error in polling attempt ${attempt}:`, error.message);
            if (attempt === maxAttempts) {
                throw new Error(`Text replacement timed out after ${maxAttempts} attempts`);
            }
        }
    }

    throw new Error(`Text replacement timed out after ${maxAttempts} polling attempts`);
}

/**
 * Handle the text replacement result from API response
 * @param {Object} responseData - API response data
 * @returns {string} Image content as base64 with text replaced
 */
function handleTextReplacementResult(responseData) {
    try {
        console.log('Processing text replacement result...');

        // Check if response contains image data
        if (responseData.imageData) {
            console.log('Successfully received image data with text replaced');
            return responseData.imageData;
        } else if (responseData.data && responseData.data.imageData) {
            console.log('Successfully received image data from nested structure');
            return responseData.data.imageData;
        } else if (responseData.result) {
            console.log('Successfully received image data in result field');
            return responseData.result;
        } else {
            throw new Error('No image data found in API response');
        }

    } catch (error) {
        console.error('Error handling text replacement result:', error.message);
        throw new Error('Failed to process text replacement result');
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