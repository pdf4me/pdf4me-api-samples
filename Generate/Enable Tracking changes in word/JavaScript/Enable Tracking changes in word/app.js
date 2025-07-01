const fs = require('fs');
const path = require('path');

/**
 * Word Tracking Changes Enabler using PDF4Me API
 * Enables tracking changes functionality in Word documents
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for enabling tracking changes in Word documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/EnableTrackingChangesInWord`;

// File paths configuration
const INPUT_WORD_PATH = "sample.docx";                    // Path to input Word document file
const OUTPUT_WORD_PATH = "sample_tracking_output.docx";   // Output Word document file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the Word tracking changes enabling process
 * Handles file validation, processing, and result handling
 */
async function enableTrackingChangesInWord() {
    console.log("Starting Word Tracking Changes Enabling Process...");
    console.log("This enables tracking changes functionality in Word documents");
    console.log("Allows users to see modifications, additions, and deletions");
    console.log("-".repeat(60));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_WORD_PATH)) {
            throw new Error(`Input Word document file not found: ${INPUT_WORD_PATH}`);
        }

        console.log(`Processing: ${INPUT_WORD_PATH} → ${OUTPUT_WORD_PATH}`);

        // Process the tracking changes enabling
        const result = await processTrackingChangesEnabling();

        // Handle the result
        await handleProcessingResult(result);

    } catch (error) {
        console.error("Processing failed:", error.message);
        process.exit(1);
    }
}

/**
 * Core processing logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processTrackingChangesEnabling() {
    // Read and encode Word document file to base64
    console.log("Reading and encoding Word document file...");
    const wordContent = fs.readFileSync(INPUT_WORD_PATH);
    const wordBase64 = wordContent.toString('base64');
    console.log("Word document file successfully encoded to base64");

    // Prepare the tracking changes enabling payload
    const payload = {
        docContent: wordBase64,           // Base64 encoded Word document content
        docName: "output.docx",           // Name for the output file
        async: true                       // Enable asynchronous processing for better performance
    };

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending request to PDF4Me API...");
    console.log("Enabling tracking changes in Word document...");

    // Make the initial API request
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });

    console.log(`Status code: ${response.status}`);

    // Handle different response scenarios
    if (response.status === 202) {
        // Asynchronous processing - poll for completion
        console.log("Request accepted. PDF4Me is processing asynchronously...");
        
        const locationUrl = response.headers.get('Location');
        if (!locationUrl) {
            throw new Error("No 'Location' header found in the response for polling");
        }

        return await pollForCompletion(locationUrl, headers);

    } else if (response.status === 200) {
        // Synchronous processing - immediate result
        console.log("Word tracking changes enabling completed immediately!");
        return await response.arrayBuffer();

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the processing result and saves the Word document file
 * Supports both binary Word data and base64 encoded responses
 */
async function handleProcessingResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations
        const buffer = Buffer.from(result);
        
        // Validate that we have a Word document (check for Word file signature)
        if (buffer.length > 4) {
            const signature = buffer.toString('hex', 0, 4).toUpperCase();
            if (signature.startsWith('504B0304') || signature.startsWith('504B0506') || signature.startsWith('504B0708')) {
                console.log("Response is a valid Word document file");
                fs.writeFileSync(OUTPUT_WORD_PATH, buffer);
                console.log(`Word document saved successfully to: ${OUTPUT_WORD_PATH}`);
                console.log("Tracking changes have been enabled in the Word document");
                return;
            }
        }

        // Try to parse as JSON if not a direct Word document
        try {
            const jsonResponse = JSON.parse(buffer.toString());
            console.log("Successfully parsed JSON response");
            
            // Look for Word document data in different possible JSON locations
            let wordBase64 = null;
            if (jsonResponse.document && jsonResponse.document.docData) {
                wordBase64 = jsonResponse.document.docData;  // Common location 1
            } else if (jsonResponse.docData) {
                wordBase64 = jsonResponse.docData;           // Common location 2
            } else if (jsonResponse.data) {
                wordBase64 = jsonResponse.data;              // Alternative location
            }

            if (wordBase64) {
                // Decode base64 Word document data and save to file
                const wordBytes = Buffer.from(wordBase64, 'base64');
                fs.writeFileSync(OUTPUT_WORD_PATH, wordBytes);
                console.log(`Word document saved to ${OUTPUT_WORD_PATH}`);
                console.log("Tracking changes have been enabled in the Word document");
            } else {
                console.log("No Word document data found in the response.");
                console.log("Full response:", JSON.stringify(jsonResponse, null, 2));
            }

        } catch (jsonError) {
            console.log("Failed to parse JSON response, treating as binary data");
            // If JSON parsing fails, try to save as binary anyway
            if (buffer.length > 1000) {
                fs.writeFileSync(OUTPUT_WORD_PATH, buffer);
                console.log(`Word document saved to ${OUTPUT_WORD_PATH} (as binary data)`);
                console.log("Tracking changes have been enabled in the Word document");
            } else {
                console.log("Warning: Response doesn't appear to be a valid Word document");
                console.log(`First 100 bytes: ${buffer.toString('hex', 0, 100)}`);
            }
        }

    } catch (error) {
        throw new Error(`Error saving Word document: ${error.message}`);
    }
}

/**
 * Polls the API for async completion with retry logic
 * Handles 202 (processing) and 200 (completed) status codes
 */
async function pollForCompletion(locationUrl, headers) {
    console.log(`Polling URL: ${locationUrl}`);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        console.log(`Waiting for result... (Attempt ${attempt}/${MAX_RETRIES})`);
        
        // Wait before polling
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

        try {
            const pollResponse = await fetch(locationUrl, {
                method: 'GET',
                headers: headers
            });

            console.log(`Poll status: ${pollResponse.status}`);

            if (pollResponse.status === 200) {
                // Processing completed successfully
                console.log("Word tracking changes enabling completed successfully!");
                return await pollResponse.arrayBuffer();

            } else if (pollResponse.status === 202) {
                // Still processing, continue polling
                console.log("Still processing, waiting...");
                continue;

            } else {
                // Error in polling
                const errorText = await pollResponse.text();
                throw new Error(`Polling error. Status: ${pollResponse.status}, Response: ${errorText}`);
            }

        } catch (error) {
            console.log(`Poll attempt ${attempt} failed: ${error.message}`);
            
            if (attempt === MAX_RETRIES) {
                throw new Error(`Polling failed after ${MAX_RETRIES} attempts: ${error.message}`);
            }
        }
    }

    throw new Error(`Timeout: Word tracking changes enabling did not complete after ${MAX_RETRIES} attempts`);
}

/**
 * Entry point - run the main function
 */
if (require.main === module) {
    enableTrackingChangesInWord()
        .then(() => {
            console.log("Word tracking changes enabling process completed successfully!");
        })
        .catch((error) => {
            console.error("Process failed:", error.message);
            process.exit(1);
        });
}

module.exports = {
    enableTrackingChangesInWord,
    processTrackingChangesEnabling,
    handleProcessingResult,
    pollForCompletion
}; 