// =============================================================================
// AWS Lambda Handler for PDF4me Generate Document Single                          //
// =============================================================================

const axios = require('axios');
const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3();

// Configuration
const API_KEY = process.env.PDF4ME_API_KEY;
const API_URL = 'https://api.pdf4me.com/api/v2/GenerateDocumentSingle';
const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;

/**
 * AWS Lambda handler function
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} Lambda response
 */
exports.handler = async (event, context) => {
    console.log('=== Generate Document Single Lambda Function ===');

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
            // This is a simplified example - in practice, you might want to
            // read configuration from another file or environment variables
            inputData = {
                templateFileType: process.env.TEMPLATE_FILE_TYPE || "html",
                templateFileName: key,
                templateFileData: s3Object.Body.toString('base64'),
                documentDataType: process.env.DOCUMENT_DATA_TYPE || "text",
                outputType: process.env.OUTPUT_TYPE || "html",
                documentDataText: process.env.DOCUMENT_DATA_TEXT || JSON.stringify({
                    "invoice_number": "INV-001",
                    "customer_name": "John Doe",
                    "amount": "$100.00",
                    "date": "2024-01-15"
                }),
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

        // Generate single document
        const result = await generateDocumentSingle(inputData);

        // Save result to S3 if output bucket is configured
        if (OUTPUT_BUCKET && result) {
            const outputKey = `generated-document-${Date.now()}.${inputData.outputType || 'html'}`;
            await s3.putObject({
                Bucket: OUTPUT_BUCKET,
                Key: outputKey,
                Body: Buffer.from(result, 'base64'),
                ContentType: getContentType(inputData.outputType)
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
                message: 'Document generated successfully',
                outputLocation: OUTPUT_BUCKET ? `s3://${OUTPUT_BUCKET}/generated-document-${Date.now()}.${inputData.outputType || 'html'}` : null
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
 * Generate single document using PDF4me API
 * @param {Object} inputData - Input data containing template and data
 * @returns {Promise<string>} Generated document content as base64
 */
async function generateDocumentSingle(inputData) {
    try {
        console.log('Sending request to PDF4me API...');
        console.log(`Generating document with template: ${inputData.templateFileName}`);
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
            console.log('Document generation completed immediately');
            return handleDocumentGenerationResult(response.data);
        } else if (response.status === 202) {
            console.log('Document generation started asynchronously, polling for completion...');
            const locationUrl = response.headers.location;
            if (!locationUrl) {
                throw new Error('No polling URL received from API');
            }

            return await pollForCompletion(locationUrl);
        } else {
            throw new Error(`API request failed with status ${response.status}: ${response.data}`);
        }

    } catch (error) {
        console.error('Error in generateDocumentSingle:', error.message);
        throw error;
    }
}

/**
 * Poll for completion of asynchronous document generation
 * @param {string} locationUrl - Polling URL
 * @returns {Promise<string>} Generated document content as base64
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
                console.log('Document generation completed successfully');
                return handleDocumentGenerationResult(response.data);
            } else if (response.status === 202) {
                console.log('Still processing, continuing to poll...');
                continue;
            } else {
                throw new Error(`Polling failed with status ${response.status}: ${response.data}`);
            }

        } catch (error) {
            console.error(`Error in polling attempt ${attempt}:`, error.message);
            if (attempt === maxAttempts) {
                throw new Error(`Document generation timed out after ${maxAttempts} attempts`);
            }
        }
    }

    throw new Error(`Document generation timed out after ${maxAttempts} polling attempts`);
}

/**
 * Handle the document generation result from API response
 * @param {Object} responseData - API response data
 * @returns {string} Generated document content as base64
 */
function handleDocumentGenerationResult(responseData) {
    try {
        console.log('Processing document generation result...');

        // Check if response contains document data
        if (responseData.docData) {
            console.log('Successfully received generated document data');
            return responseData.docData;
        } else if (responseData.data && responseData.data.docData) {
            console.log('Successfully received generated document data from nested structure');
            return responseData.data.docData;
        } else {
            throw new Error('No document data found in API response');
        }

    } catch (error) {
        console.error('Error handling document generation result:', error.message);
        throw new Error('Failed to process document generation result');
    }
}

/**
 * Get content type based on output type
 * @param {string} outputType - Output type (html, pdf, docx, etc.)
 * @returns {string} Content type
 */
function getContentType(outputType) {
    switch (outputType?.toLowerCase()) {
        case 'pdf':
            return 'application/pdf';
        case 'docx':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'xlsx':
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        case 'html':
        default:
            return 'text/html';
    }
} 