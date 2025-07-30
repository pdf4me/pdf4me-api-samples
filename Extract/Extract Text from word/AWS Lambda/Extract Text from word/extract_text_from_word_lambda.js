// =============================================================================
// AWS Lambda Handler for PDF4me Extract Text from Word                          //
// =============================================================================

const axios = require('axios');
const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3();

// Configuration
const API_KEY = process.env.PDF4ME_API_KEY;
const API_URL = 'https://api.pdf4me.com/api/v2/ExtractTextFromWord';
const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;

/**
 * AWS Lambda handler function
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} Lambda response
 */
exports.handler = async (event, context) => {
    console.log('=== Extract Text from Word Lambda Function ===');
    
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
                docContent: s3Object.Body.toString('base64'),
                docName: key,
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
        
        // Extract text from Word document
        const result = await extractTextFromWord(inputData);
        
        // Save result to S3 if output bucket is configured
        if (OUTPUT_BUCKET && result) {
            const outputKey = `extracted-text-${Date.now()}.txt`;
            await s3.putObject({
                Bucket: OUTPUT_BUCKET,
                Key: outputKey,
                Body: result,
                ContentType: 'text/plain'
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
                message: 'Text extraction completed successfully',
                result: result,
                outputLocation: OUTPUT_BUCKET ? `s3://${OUTPUT_BUCKET}/extracted-text-${Date.now()}.txt` : null
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
 * Extract text from Word document using PDF4me API
 * @param {Object} inputData - Input data containing document content
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromWord(inputData) {
    try {
        console.log('Sending request to PDF4me API...');
        
        const response = await axios.post(API_URL, inputData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${API_KEY}`
            },
            timeout: 30000
        });
        
        console.log(`API Response Status: ${response.status}`);
        
        if (response.status === 200) {
            console.log('Text extraction completed immediately');
            return handleExtractionResult(response.data);
        } else if (response.status === 202) {
            console.log('Text extraction started asynchronously, polling for completion...');
            const locationUrl = response.headers.location;
            if (!locationUrl) {
                throw new Error('No polling URL received from API');
            }
            
            return await pollForCompletion(locationUrl);
        } else {
            throw new Error(`API request failed with status ${response.status}: ${response.data}`);
        }
        
    } catch (error) {
        console.error('Error in extractTextFromWord:', error.message);
        throw error;
    }
}

/**
 * Poll for completion of asynchronous text extraction
 * @param {string} locationUrl - Polling URL
 * @returns {Promise<string>} Extracted text
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
                console.log('Text extraction completed successfully');
                return handleExtractionResult(response.data);
            } else if (response.status === 202) {
                console.log('Still processing, continuing to poll...');
                continue;
            } else {
                throw new Error(`Polling failed with status ${response.status}: ${response.data}`);
            }
            
        } catch (error) {
            console.error(`Error in polling attempt ${attempt}:`, error.message);
            if (attempt === maxAttempts) {
                throw new Error(`Text extraction timed out after ${maxAttempts} attempts`);
            }
        }
    }
    
    throw new Error(`Text extraction timed out after ${maxAttempts} polling attempts`);
}

/**
 * Handle the extraction result from API response
 * @param {Object} responseData - API response data
 * @returns {string} Extracted text
 */
function handleExtractionResult(responseData) {
    try {
        console.log('Processing extraction result...');
        
        // Check if response contains extracted text
        if (responseData.extractedText) {
            console.log(`Successfully extracted ${responseData.extractedText.length} characters of text`);
            return responseData.extractedText;
        } else if (responseData.text) {
            console.log(`Successfully extracted ${responseData.text.length} characters of text`);
            return responseData.text;
        } else if (responseData.data && responseData.data.extractedText) {
            console.log(`Successfully extracted ${responseData.data.extractedText.length} characters of text`);
            return responseData.data.extractedText;
        } else {
            // Try to extract from JSON response
            const responseString = JSON.stringify(responseData);
            console.log('No direct text field found, returning full response');
            return responseString;
        }
        
    } catch (error) {
        console.error('Error handling extraction result:', error.message);
        throw new Error('Failed to process extraction result');
    }
} 