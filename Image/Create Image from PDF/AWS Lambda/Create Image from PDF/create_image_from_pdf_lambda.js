// =============================================================================
// AWS Lambda Handler for PDF4me Create Image from PDF                              //
// =============================================================================

const axios = require('axios');
const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3();

// Configuration
const API_KEY = process.env.PDF4ME_API_KEY;
const API_URL = 'https://api.pdf4me.com/api/v2/CreateImageFromPdf';
const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;

/**
 * AWS Lambda handler function
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} Lambda response
 */
exports.handler = async (event, context) => {
    console.log('=== Create Image from PDF Lambda Function ===');

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

            // For S3 events, we need to provide image creation configuration
            inputData = {
                docName: key,
                docContent: s3Object.Body.toString('base64'),
                imageFormat: process.env.IMAGE_FORMAT || "PNG", // JPEG, PNG, GIF, BMP, TIFF
                resolution: process.env.RESOLUTION || 150, // DPI
                pageNumber: process.env.PAGE_NUMBER || 1, // Page to convert (1-based)
                quality: process.env.QUALITY || 85, // 0-100 (for JPEG)
                width: process.env.WIDTH || null, // Optional width in pixels
                height: process.env.HEIGHT || null, // Optional height in pixels
                maintainAspectRatio: process.env.MAINTAIN_ASPECT_RATIO || true,
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
        if (!inputData.docName) {
            throw new Error('Missing docName in input data');
        }

        // Create image from PDF
        const result = await createImageFromPdf(inputData);

        // Save result to S3 if output bucket is configured
        if (OUTPUT_BUCKET && result) {
            const outputKey = `pdf-to-image-${Date.now()}.${inputData.imageFormat?.toLowerCase() || 'png'}`;
            await s3.putObject({
                Bucket: OUTPUT_BUCKET,
                Key: outputKey,
                Body: Buffer.from(result, 'base64'),
                ContentType: getContentType(inputData.imageFormat)
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
                message: 'Image created from PDF successfully',
                outputLocation: OUTPUT_BUCKET ? `s3://${OUTPUT_BUCKET}/pdf-to-image-${Date.now()}.${inputData.imageFormat?.toLowerCase() || 'png'}` : null
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
 * Create image from PDF using PDF4me API
 * @param {Object} inputData - Input data containing PDF and image creation configuration
 * @returns {Promise<string>} Created image content as base64
 */
async function createImageFromPdf(inputData) {
    try {
        console.log('Sending request to PDF4me API...');
        console.log(`Creating image from PDF: ${inputData.docName}`);
        console.log(`Image format: ${inputData.imageFormat}`);
        console.log(`Resolution: ${inputData.resolution} DPI`);
        console.log(`Page number: ${inputData.pageNumber}`);

        const response = await axios.post(API_URL, inputData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${API_KEY}`
            },
            timeout: 30000
        });

        console.log(`API Response Status: ${response.status}`);

        if (response.status === 200) {
            console.log('Image creation completed immediately');
            return handleImageCreationResult(response.data);
        } else if (response.status === 202) {
            console.log('Image creation started asynchronously, polling for completion...');
            const locationUrl = response.headers.location;
            if (!locationUrl) {
                throw new Error('No polling URL received from API');
            }

            return await pollForCompletion(locationUrl);
        } else {
            throw new Error(`API request failed with status ${response.status}: ${response.data}`);
        }

    } catch (error) {
        console.error('Error in createImageFromPdf:', error.message);
        throw error;
    }
}

/**
 * Poll for completion of asynchronous image creation operation
 * @param {string} locationUrl - Polling URL
 * @returns {Promise<string>} Created image content as base64
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
                console.log('Image creation completed successfully');
                return handleImageCreationResult(response.data);
            } else if (response.status === 202) {
                console.log('Still processing, continuing to poll...');
                continue;
            } else {
                throw new Error(`Polling failed with status ${response.status}: ${response.data}`);
            }

        } catch (error) {
            console.error(`Error in polling attempt ${attempt}:`, error.message);
            if (attempt === maxAttempts) {
                throw new Error(`Image creation timed out after ${maxAttempts} attempts`);
            }
        }
    }

    throw new Error(`Image creation timed out after ${maxAttempts} polling attempts`);
}

/**
 * Handle the image creation result from API response
 * @param {Object} responseData - API response data
 * @returns {string} Created image content as base64
 */
function handleImageCreationResult(responseData) {
    try {
        console.log('Processing image creation result...');

        // Check if response contains image data
        if (responseData.imageData) {
            console.log('Successfully received created image data');
            return responseData.imageData;
        } else if (responseData.data && responseData.data.imageData) {
            console.log('Successfully received created image data from nested structure');
            return responseData.data.imageData;
        } else {
            throw new Error('No image data found in API response');
        }

    } catch (error) {
        console.error('Error handling image creation result:', error.message);
        throw new Error('Failed to process image creation result');
    }
}

/**
 * Get content type based on image format
 * @param {string} imageFormat - Image format (JPEG, PNG, GIF, etc.)
 * @returns {string} Content type
 */
function getContentType(imageFormat) {
    switch (imageFormat?.toUpperCase()) {
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