// =============================================================================
// AWS Lambda Handler for PDF4me Parse Document                                   //
// =============================================================================

const axios = require('axios');
const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3();

// Configuration
const API_KEY = process.env.PDF4ME_API_KEY;
const API_URL = 'https://api.pdf4me.com/api/v2/ParseDocument';
const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;

/**
 * AWS Lambda handler function
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} Lambda response
 */
exports.handler = async (event, context) => {
    console.log('=== Parse Document Lambda Function ===');
    
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
        
        // Parse document
        const result = await parseDocument(inputData);
        
        // Save result to S3 if output bucket is configured
        if (OUTPUT_BUCKET && result) {
            const outputKey = `parsed-document-${Date.now()}.json`;
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
                message: 'Document parsing completed successfully',
                result: result,
                outputLocation: OUTPUT_BUCKET ? `s3://${OUTPUT_BUCKET}/parsed-document-${Date.now()}.json` : null
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
 * Parse document using PDF4me API
 * @param {Object} inputData - Input data containing document content
 * @returns {Promise<Object>} Parsed document data
 */
async function parseDocument(inputData) {
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
            console.log('Document parsing completed immediately');
            return handleParsingResult(response.data);
        } else if (response.status === 202) {
            console.log('Document parsing started asynchronously, polling for completion...');
            const locationUrl = response.headers.location;
            if (!locationUrl) {
                throw new Error('No polling URL received from API');
            }
            
            return await pollForCompletion(locationUrl);
        } else {
            throw new Error(`API request failed with status ${response.status}: ${response.data}`);
        }
        
    } catch (error) {
        console.error('Error in parseDocument:', error.message);
        throw error;
    }
}

/**
 * Poll for completion of asynchronous document parsing
 * @param {string} locationUrl - Polling URL
 * @returns {Promise<Object>} Parsed document data
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
                console.log('Document parsing completed successfully');
                return handleParsingResult(response.data);
            } else if (response.status === 202) {
                console.log('Still processing, continuing to poll...');
                continue;
            } else {
                throw new Error(`Polling failed with status ${response.status}: ${response.data}`);
            }
            
        } catch (error) {
            console.error(`Error in polling attempt ${attempt}:`, error.message);
            if (attempt === maxAttempts) {
                throw new Error(`Document parsing timed out after ${maxAttempts} attempts`);
            }
        }
    }
    
    throw new Error(`Document parsing timed out after ${maxAttempts} polling attempts`);
}

/**
 * Handle the parsing result from API response
 * @param {Object} responseData - API response data
 * @returns {Object} Parsed document data
 */
function handleParsingResult(responseData) {
    try {
        console.log('Processing parsing result...');
        
        // Extract relevant information from the response
        const result = {
            documentType: responseData.documentType || 'Unknown',
            pageCount: responseData.pageCount || 0,
            confidence: responseData.confidence || 0,
            templateId: responseData.templateId || null,
            parsedData: responseData.parsedData || {},
            metadata: responseData.metadata || {},
            timestamp: new Date().toISOString()
        };
        
        // Add any additional fields from the response
        if (responseData.fields) {
            result.fields = responseData.fields;
        }
        
        if (responseData.tables) {
            result.tables = responseData.tables;
        }
        
        if (responseData.text) {
            result.extractedText = responseData.text;
        }
        
        console.log(`Successfully parsed document of type: ${result.documentType}`);
        console.log(`Page count: ${result.pageCount}, Confidence: ${result.confidence}`);
        
        return result;
        
    } catch (error) {
        console.error('Error handling parsing result:', error.message);
        throw new Error('Failed to process parsing result');
    }
} 