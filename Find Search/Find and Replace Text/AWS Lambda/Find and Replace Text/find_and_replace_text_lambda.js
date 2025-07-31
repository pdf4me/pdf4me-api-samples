// =============================================================================
// AWS Lambda Handler for PDF4me Find and Replace Text                            //
// =============================================================================

const axios = require('axios');
const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3();

// Configuration
const API_KEY = process.env.PDF4ME_API_KEY;
const API_URL = 'https://api.pdf4me.com/api/v2/FindAndReplace';
const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;

/**
 * AWS Lambda handler function
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} Lambda response
 */
exports.handler = async (event, context) => {
    console.log('=== Find and Replace Text Lambda Function ===');
    
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
            
            // For S3 events, we need to provide find/replace configuration
            // This is a simplified example - in practice, you might want to
            // read configuration from another file or environment variables
            inputData = {
                docContent: s3Object.Body.toString('base64'),
                docName: key,
                oldText: process.env.FIND_TEXT || 'old text',
                newText: process.env.REPLACE_TEXT || 'new text',
                pageSequence: process.env.PAGE_SEQUENCE || 'all',
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
        if (!inputData.oldText) {
            throw new Error('Missing oldText in input data');
        }
        if (!inputData.newText) {
            throw new Error('Missing newText in input data');
        }
        
        // Find and replace text in PDF
        const result = await findAndReplaceText(inputData);
        
        // Save result to S3 if output bucket is configured
        if (OUTPUT_BUCKET && result) {
            const outputKey = `find-replace-result-${Date.now()}.pdf`;
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
                message: 'Find and replace text completed successfully',
                outputLocation: OUTPUT_BUCKET ? `s3://${OUTPUT_BUCKET}/find-replace-result-${Date.now()}.pdf` : null
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
 * Find and replace text in PDF using PDF4me API
 * @param {Object} inputData - Input data containing document content and find/replace parameters
 * @returns {Promise<string>} Modified PDF content as base64
 */
async function findAndReplaceText(inputData) {
    try {
        console.log('Sending request to PDF4me API...');
        console.log(`Finding: "${inputData.oldText}" and replacing with: "${inputData.newText}"`);
        
        const response = await axios.post(API_URL, inputData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${API_KEY}`
            },
            timeout: 30000
        });
        
        console.log(`API Response Status: ${response.status}`);
        
        if (response.status === 200) {
            console.log('Find and replace completed immediately');
            return handleFindReplaceResult(response.data);
        } else if (response.status === 202) {
            console.log('Find and replace started asynchronously, polling for completion...');
            const locationUrl = response.headers.location;
            if (!locationUrl) {
                throw new Error('No polling URL received from API');
            }
            
            return await pollForCompletion(locationUrl);
        } else {
            throw new Error(`API request failed with status ${response.status}: ${response.data}`);
        }
        
    } catch (error) {
        console.error('Error in findAndReplaceText:', error.message);
        throw error;
    }
}

/**
 * Poll for completion of asynchronous find and replace operation
 * @param {string} locationUrl - Polling URL
 * @returns {Promise<string>} Modified PDF content as base64
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
                console.log('Find and replace completed successfully');
                return handleFindReplaceResult(response.data);
            } else if (response.status === 202) {
                console.log('Still processing, continuing to poll...');
                continue;
            } else {
                throw new Error(`Polling failed with status ${response.status}: ${response.data}`);
            }
            
        } catch (error) {
            console.error(`Error in polling attempt ${attempt}:`, error.message);
            if (attempt === maxAttempts) {
                throw new Error(`Find and replace timed out after ${maxAttempts} attempts`);
            }
        }
    }
    
    throw new Error(`Find and replace timed out after ${maxAttempts} polling attempts`);
}

/**
 * Handle the find and replace result from API response
 * @param {Object} responseData - API response data
 * @returns {string} Modified PDF content as base64
 */
function handleFindReplaceResult(responseData) {
    try {
        console.log('Processing find and replace result...');
        
        // Check if response contains PDF data
        if (responseData.docData) {
            console.log('Successfully received modified PDF data');
            return responseData.docData;
        } else if (responseData.data && responseData.data.docData) {
            console.log('Successfully received modified PDF data from nested structure');
            return responseData.data.docData;
        } else {
            throw new Error('No PDF data found in API response');
        }
        
    } catch (error) {
        console.error('Error handling find and replace result:', error.message);
        throw new Error('Failed to process find and replace result');
    }
} 