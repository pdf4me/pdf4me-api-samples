// =============================================================================
// AWS Lambda Handler for PDF4me Generate Documents Multiple                       //
// =============================================================================

const axios = require('axios');
const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3();

// Configuration
const API_KEY = process.env.PDF4ME_API_KEY;
const API_URL = 'https://api.pdf4me.com/api/v2/GenerateDocumentMultiple';
const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;

/**
 * AWS Lambda handler function
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} Lambda response
 */
exports.handler = async (event, context) => {
    console.log('=== Generate Documents Multiple Lambda Function ===');

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

            // For S3 events, we need to provide template and data configuration
            inputData = {
                templateFileType: process.env.TEMPLATE_FILE_TYPE || "Docx",
                templateFileName: key,
                templateFileData: s3Object.Body.toString('base64'),
                documentDataType: process.env.DOCUMENT_DATA_TYPE || "Json",
                outputType: process.env.OUTPUT_TYPE || "Docx",
                documentDataText: process.env.DOCUMENT_DATA_TEXT || JSON.stringify([
                    {
                        "name": "John Doe",
                        "email": "john@example.com",
                        "amount": "$100.00"
                    },
                    {
                        "name": "Jane Smith",
                        "email": "jane@example.com",
                        "amount": "$200.00"
                    }
                ]),
                isAsync: true
            };
        } else {
            // Direct invocation
            console.log('Processing direct invocation');
            inputData = event;
        }

        // Validate input
        if (!inputData.templateFileData) {
            throw new Error('Missing templateFileData in input data');
        }
        if (!inputData.templateFileName) {
            throw new Error('Missing templateFileName in input data');
        }
        if (!inputData.documentDataText) {
            throw new Error('Missing documentDataText in input data');
        }

        // Generate multiple documents
        const result = await generateDocumentsMultiple(inputData);

        // Save result to S3 if output bucket is configured
        if (OUTPUT_BUCKET && result) {
            const outputKey = `generated-documents-${Date.now()}.zip`;
            await s3.putObject({
                Bucket: OUTPUT_BUCKET,
                Key: outputKey,
                Body: Buffer.from(result, 'base64'),
                ContentType: 'application/zip'
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
                message: 'Multiple documents generated successfully',
                outputLocation: OUTPUT_BUCKET ? `s3://${OUTPUT_BUCKET}/generated-documents-${Date.now()}.zip` : null
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
 * Generate multiple documents using PDF4me API
 * @param {Object} inputData - Input data containing template and data
 * @returns {Promise<string>} Generated documents archive as base64
 */
async function generateDocumentsMultiple(inputData) {
    try {
        console.log('Sending request to PDF4me API...');
        console.log(`Generating multiple documents with template: ${inputData.templateFileName}`);
        console.log(`Output type: ${inputData.outputType}`);

        const response = await axios.post(API_URL, inputData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${API_KEY}`
            },
            timeout: 30000
        });

        console.log(`API Response Status: ${response.status}`);

        if (response.status === 200) {
            console.log('Multiple documents generation completed immediately');
            return handleDocumentsGenerationResult(response.data);
        } else if (response.status === 202) {
            console.log('Multiple documents generation started asynchronously, polling for completion...');
            const locationUrl = response.headers.location;
            if (!locationUrl) {
                throw new Error('No polling URL received from API');
            }

            return await pollForCompletion(locationUrl);
        } else {
            throw new Error(`API request failed with status ${response.status}: ${response.data}`);
        }

    } catch (error) {
        console.error('Error in generateDocumentsMultiple:', error.message);
        throw error;
    }
}

/**
 * Poll for completion of asynchronous multiple documents generation
 * @param {string} locationUrl - Polling URL
 * @returns {Promise<string>} Generated documents archive as base64
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
                console.log('Multiple documents generation completed successfully');
                return handleDocumentsGenerationResult(response.data);
            } else if (response.status === 202) {
                console.log('Still processing, continuing to poll...');
                continue;
            } else {
                throw new Error(`Polling failed with status ${response.status}: ${response.data}`);
            }

        } catch (error) {
            console.error(`Error in polling attempt ${attempt}:`, error.message);
            if (attempt === maxAttempts) {
                throw new Error(`Multiple documents generation timed out after ${maxAttempts} attempts`);
            }
        }
    }

    throw new Error(`Multiple documents generation timed out after ${maxAttempts} polling attempts`);
}

/**
 * Handle the multiple documents generation result from API response
 * @param {Object} responseData - API response data
 * @returns {string} Generated documents archive as base64
 */
function handleDocumentsGenerationResult(responseData) {
    try {
        console.log('Processing multiple documents generation result...');

        // Check if response contains documents archive data
        if (responseData.docData) {
            console.log('Successfully received generated documents archive data');
            return responseData.docData;
        } else if (responseData.data && responseData.data.docData) {
            console.log('Successfully received generated documents archive data from nested structure');
            return responseData.data.docData;
        } else {
            throw new Error('No documents archive data found in API response');
        }

    } catch (error) {
        console.error('Error handling multiple documents generation result:', error.message);
        throw new Error('Failed to process multiple documents generation result');
    }
} 