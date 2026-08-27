// =============================================================================
// AWS Lambda Handler for PDF4me Add Image Watermark To Image                      //
// =============================================================================

const axios = require('axios');
const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3();

// Configuration
const API_KEY = process.env.PDF4ME_API_KEY;
const API_URL = 'https://api.pdf4me.com/api/v2/AddImageWatermarkToImage';
const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;

/**
 * AWS Lambda handler function
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} Lambda response
 */
exports.handler = async (event, context) => {
    console.log('=== Add Image Watermark To Image Lambda Function ===');

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

            // For S3 events, we need to provide watermark configuration
            // This is a simplified example - in practice, you might want to
            // read configuration from another file or environment variables
            inputData = {
                imageName: key,
                imageData: s3Object.Body.toString('base64'),
                watermarkImageData: process.env.WATERMARK_IMAGE_DATA || "", // Base64 encoded watermark image
                watermarkImageName: process.env.WATERMARK_IMAGE_NAME || "watermark.png",
                watermarkPosition: process.env.WATERMARK_POSITION || "Center", // TopLeft, TopRight, BottomLeft, BottomRight, Center
                watermarkOpacity: process.env.WATERMARK_OPACITY || 50, // 0-100
                watermarkScale: process.env.WATERMARK_SCALE || 100, // Percentage
                isAsync: true
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
        if (!inputData.watermarkImageData) {
            throw new Error('Missing watermarkImageData in input data');
        }

        // Add image watermark to image
        const result = await addImageWatermarkToImage(inputData);

        // Save result to S3 if output bucket is configured
        if (OUTPUT_BUCKET && result) {
            const outputKey = `watermarked-image-${Date.now()}.png`;
            await s3.putObject({
                Bucket: OUTPUT_BUCKET,
                Key: outputKey,
                Body: Buffer.from(result, 'base64'),
                ContentType: 'image/png'
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
                message: 'Image watermark added successfully',
                outputLocation: OUTPUT_BUCKET ? `s3://${OUTPUT_BUCKET}/watermarked-image-${Date.now()}.png` : null
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
 * Add image watermark to image using PDF4me API
 * @param {Object} inputData - Input data containing image and watermark configuration
 * @returns {Promise<string>} Watermarked image content as base64
 */
async function addImageWatermarkToImage(inputData) {
    try {
        console.log('Sending request to PDF4me API...');
        console.log(`Adding image watermark to: ${inputData.imageName}`);
        console.log(`Watermark position: ${inputData.watermarkPosition}`);
        console.log(`Watermark opacity: ${inputData.watermarkOpacity}%`);

        const response = await axios.post(API_URL, inputData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${API_KEY}`
            },
            timeout: 30000
        });

        console.log(`API Response Status: ${response.status}`);

        if (response.status === 200) {
            console.log('Image watermark added immediately');
            return handleWatermarkResult(response.data);
        } else if (response.status === 202) {
            console.log('Image watermark operation started asynchronously, polling for completion...');
            const locationUrl = response.headers.location;
            if (!locationUrl) {
                throw new Error('No polling URL received from API');
            }

            return await pollForCompletion(locationUrl);
        } else {
            throw new Error(`API request failed with status ${response.status}: ${response.data}`);
        }

    } catch (error) {
        console.error('Error in addImageWatermarkToImage:', error.message);
        throw error;
    }
}

/**
 * Poll for completion of asynchronous image watermark operation
 * @param {string} locationUrl - Polling URL
 * @returns {Promise<string>} Watermarked image content as base64
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
                console.log('Image watermark operation completed successfully');
                return handleWatermarkResult(response.data);
            } else if (response.status === 202) {
                console.log('Still processing, continuing to poll...');
                continue;
            } else {
                throw new Error(`Polling failed with status ${response.status}: ${response.data}`);
            }

        } catch (error) {
            console.error(`Error in polling attempt ${attempt}:`, error.message);
            if (attempt === maxAttempts) {
                throw new Error(`Image watermark operation timed out after ${maxAttempts} attempts`);
            }
        }
    }

    throw new Error(`Image watermark operation timed out after ${maxAttempts} polling attempts`);
}

/**
 * Handle the image watermark result from API response
 * @param {Object} responseData - API response data
 * @returns {string} Watermarked image content as base64
 */
function handleWatermarkResult(responseData) {
    try {
        console.log('Processing image watermark result...');

        // Check if response contains image data
        if (responseData.imageData) {
            console.log('Successfully received watermarked image data');
            return responseData.imageData;
        } else if (responseData.data && responseData.data.imageData) {
            console.log('Successfully received watermarked image data from nested structure');
            return responseData.data.imageData;
        } else {
            throw new Error('No image data found in API response');
        }

    } catch (error) {
        console.error('Error handling image watermark result:', error.message);
        throw new Error('Failed to process image watermark result');
    }
} 