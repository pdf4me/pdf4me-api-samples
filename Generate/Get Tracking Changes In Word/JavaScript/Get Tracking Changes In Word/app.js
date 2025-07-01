const fs = require('fs');
const path = require('path');

/**
 * Get Tracking Changes from Word Document using PDF4Me API
 * Extracts all tracking changes, revisions, and comments from Word documents
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for getting tracking changes from Word documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/GetTrackingChangesInWord`;

// File paths configuration
const INPUT_WORD_PATH = "sample.docx";                                    // Path to input Word document file
const OUTPUT_JSON_PATH = "sample.tracking_changes.json";                  // Output JSON file name with tracking changes

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the tracking changes extraction process
 * Handles file validation, API request, and result processing
 */
async function getTrackingChangesInWord() {
    console.log("=== Getting Tracking Changes from Word Document ===");
    console.log("This extracts all tracking changes, revisions, and comments from Word documents");
    console.log("Returns detailed JSON with all change information");
    console.log("-".repeat(60));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_WORD_PATH)) {
            throw new Error(`Input Word document file not found: ${INPUT_WORD_PATH}`);
        }

        console.log(`Input Word file: ${INPUT_WORD_PATH}`);
        console.log(`Output JSON file: ${OUTPUT_JSON_PATH}`);
        console.log("Extracting tracking changes information...");

        // Process the tracking changes extraction
        const result = await processTrackingChangesExtraction();

        // Handle the result
        await handleTrackingChangesResult(result);

        console.log("Get tracking changes operation completed successfully!");
        console.log(`Input file: ${INPUT_WORD_PATH}`);
        console.log(`Tracking changes JSON: ${OUTPUT_JSON_PATH}`);
        console.log("All tracking changes have been extracted and saved as JSON");
        console.log("The JSON contains details about all revisions, comments, and changes");

    } catch (error) {
        console.error("Get tracking changes operation failed:", error.message);
        process.exit(1);
    }
}

/**
 * Core extraction logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processTrackingChangesExtraction() {
    // Read and encode Word document file to base64
    console.log("Reading and encoding Word document file...");
    const wordContent = fs.readFileSync(INPUT_WORD_PATH);
    const wordBase64 = wordContent.toString('base64');
    console.log(`Word document file read successfully: ${wordContent.length} bytes`);

    // Prepare the tracking changes extraction payload
    const payload = {
        docName: "output.docx",           // Output document name
        docContent: wordBase64,           // Base64 encoded Word document content
        async: true                       // Enable asynchronous processing for big files
    };

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending get tracking changes request...");

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
        console.log("Request accepted. Processing asynchronously...");
        
        const locationUrl = response.headers.get('Location');
        if (!locationUrl) {
            throw new Error("No 'Location' header found in the response for polling");
        }

        console.log(`Polling URL: ${locationUrl}`);
        return await pollForCompletion(locationUrl, headers);

    } else if (response.status === 200) {
        // Synchronous processing - immediate result
        console.log("Getting tracking changes completed immediately!");
        return await response.text();

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the tracking changes result and saves the JSON file
 * Processes the JSON response containing all tracking changes information
 */
async function handleTrackingChangesResult(result) {
    try {
        console.log("Getting tracking changes completed successfully!");
        
        // Save the tracking changes JSON to the output path
        fs.writeFileSync(OUTPUT_JSON_PATH, result, 'utf8');
        console.log(`Tracking changes JSON saved to: ${OUTPUT_JSON_PATH}`);
        
        // Optionally parse and display summary information
        try {
            const trackingData = JSON.parse(result);
            console.log("Tracking changes data structure:");
            console.log(`- Document contains tracking changes information`);
            console.log(`- JSON file size: ${result.length} characters`);
            
            // Display basic structure if available
            if (trackingData.revisions) {
                console.log(`- Number of revisions: ${trackingData.revisions.length || 'N/A'}`);
            }
            if (trackingData.comments) {
                console.log(`- Number of comments: ${trackingData.comments.length || 'N/A'}`);
            }
            if (trackingData.changes) {
                console.log(`- Number of changes: ${trackingData.changes.length || 'N/A'}`);
            }
            
        } catch (parseError) {
            console.log("Note: Could not parse JSON for summary display");
        }

    } catch (error) {
        throw new Error(`Error saving tracking changes JSON: ${error.message}`);
    }
}

/**
 * Polls the API for async completion with retry logic
 * Handles 202 (processing) and 200 (completed) status codes
 */
async function pollForCompletion(locationUrl, headers) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        console.log(`Polling attempt ${attempt}/${MAX_RETRIES}...`);
        
        // Wait before polling (except on first attempt)
        if (attempt > 1) {
            console.log(`Waiting ${RETRY_DELAY/1000} seconds before next attempt...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }

        try {
            const response = await fetch(locationUrl, {
                method: 'GET',
                headers: headers
            });

            if (response.status === 200) {
                // Tracking changes extraction completed successfully
                console.log("Getting tracking changes completed successfully!");
                return await response.text();

            } else if (response.status === 202) {
                // Still processing, continue polling
                console.log("Still processing, waiting...");
                continue;

            } else {
                // Error occurred during processing
                const errorText = await response.text();
                throw new Error(`Unexpected error during polling: ${response.status}, Response: ${errorText}`);
            }

        } catch (error) {
            if (attempt === MAX_RETRIES) {
                throw new Error(`Polling failed after ${MAX_RETRIES} attempts: ${error.message}`);
            }
            console.log(`Polling attempt ${attempt} failed: ${error.message}`);
        }
    }

    throw new Error(`Timeout: Getting tracking changes did not complete after ${MAX_RETRIES} retries`);
}

// Main execution - Run the tracking changes extraction when script is executed directly
if (require.main === module) {
    getTrackingChangesInWord().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = { getTrackingChangesInWord, processTrackingChangesExtraction, handleTrackingChangesResult }; 