// =============================================================================
// AWS Lambda Handler for PDF4me Fill a PDF Form                                 //
// =============================================================================

const axios = require('axios');
const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3();

// Configuration
const API_KEY = process.env.PDF4ME_API_KEY;
const API_URL = 'https://api.pdf4me.com/api/v2/FillPdfForm';
const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;

/**
 * AWS Lambda handler function
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} Lambda response
 */
exports.handler = async (event, context) => {
    console.log('=== Fill a PDF Form Lambda Function ===');
    
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
            
            // For S3 events, we need to provide form data
            // This is a simplified example - in practice, you might want to
            // read configuration from another file or environment variables
            inputData = {
                templateDocName: key,
                templateDocContent: s3Object.Body.toString('base64'),
                dataArray: JSON.stringify({
                    "text_field_1": "Sample text value",
                    "checkbox_field_1": true,
                    "dropdown_field_1": "Option 1"
                }),
                outputType: "pdf",
                inputDataType: "json",
                metaData: "",
                metaDataJson: "",
                InputFormData: [
                    {
                        fieldName: "text_field_1",
                        fieldValue: "Sample text value"
                    },
                    {
                        fieldName: "checkbox_field_1",
                        fieldValue: true
                    },
                    {
                        fieldName: "dropdown_field_1",
                        fieldValue: "Option 1"
                    }
                ],
                isAsync: true
            };
        } else {
            // Direct invocation
            console.log('Processing direct invocation');
            inputData = event;
        }
        
        // Validate input
        if (!inputData.templateDocContent) {
            throw new Error('Missing templateDocContent in input data');
        }
        if (!inputData.dataArray) {
            throw new Error('Missing dataArray in input data');
        }
        if (!inputData.InputFormData || !Array.isArray(inputData.InputFormData)) {
            throw new Error('Missing or invalid InputFormData array in input data');
        }
        
        // Fill PDF form
        const result = await fillPdfForm(inputData);
        
        // Save result to S3 if output bucket is configured
        if (OUTPUT_BUCKET && result) {
            const outputKey = `filled-pdf-form-${Date.now()}.pdf`;
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
                message: 'PDF form filled successfully',
                outputLocation: OUTPUT_BUCKET ? `s3://${OUTPUT_BUCKET}/filled-pdf-form-${Date.now()}.pdf` : null
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
 * Fill PDF form using PDF4me API
 * @param {Object} inputData - Input data containing document content and form data
 * @returns {Promise<string>} Filled PDF content as base64
 */
async function fillPdfForm(inputData) {
    try {
        console.log('Sending request to PDF4me API...');
        console.log(`Filling form with ${inputData.InputFormData.length} fields`);
        
        const response = await axios.post(API_URL, inputData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${API_KEY}`
            },
            timeout: 30000
        });
        
        console.log(`API Response Status: ${response.status}`);
        
        if (response.status === 200) {
            console.log('Form filling completed immediately');
            return handleFormFillingResult(response.data);
        } else if (response.status === 202) {
            console.log('Form filling started asynchronously, polling for completion...');
            const locationUrl = response.headers.location;
            if (!locationUrl) {
                throw new Error('No polling URL received from API');
            }
            
            return await pollForCompletion(locationUrl);
        } else {
            throw new Error(`API request failed with status ${response.status}: ${response.data}`);
        }
        
    } catch (error) {
        console.error('Error in fillPdfForm:', error.message);
        throw error;
    }
}

/**
 * Poll for completion of asynchronous form filling
 * @param {string} locationUrl - Polling URL
 * @returns {Promise<string>} Filled PDF content as base64
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
                console.log('Form filling completed successfully');
                return handleFormFillingResult(response.data);
            } else if (response.status === 202) {
                console.log('Still processing, continuing to poll...');
                continue;
            } else {
                throw new Error(`Polling failed with status ${response.status}: ${response.data}`);
            }
            
        } catch (error) {
            console.error(`Error in polling attempt ${attempt}:`, error.message);
            if (attempt === maxAttempts) {
                throw new Error(`Form filling timed out after ${maxAttempts} attempts`);
            }
        }
    }
    
    throw new Error(`Form filling timed out after ${maxAttempts} polling attempts`);
}

/**
 * Handle the form filling result from API response
 * @param {Object} responseData - API response data
 * @returns {string} Filled PDF content as base64
 */
function handleFormFillingResult(responseData) {
    try {
        console.log('Processing form filling result...');
        
        // Check if response contains PDF data
        if (responseData.docData) {
            console.log('Successfully received filled PDF form');
            return responseData.docData;
        } else if (responseData.data && responseData.data.docData) {
            console.log('Successfully received filled PDF form from nested structure');
            return responseData.data.docData;
        } else {
            throw new Error('No PDF data found in API response');
        }
        
    } catch (error) {
        console.error('Error handling form filling result:', error.message);
        throw new Error('Failed to process form filling result');
    }
} 