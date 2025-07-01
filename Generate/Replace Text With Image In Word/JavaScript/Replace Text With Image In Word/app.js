const fs = require('fs');
const path = require('path');

/**
 * Replace Text With Image In Word using PDF4Me API
 * Replaces specified text in Word documents with images
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for replacing text with image in Word documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ReplaceTextWithImageInWord`;

// File paths configuration
const INPUT_WORD_PATH = "sample.docx";                    // Path to input Word document file
const INPUT_IMAGE_PATH = "sample.png";                    // Path to input image file
const OUTPUT_WORD_PATH = "Replace_text_with_image_output.docx"; // Output Word document file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the text replacement process
 * Handles file validation, replacement, and result processing
 */
async function replaceTextWithImageInWord() {
    console.log("Starting Text Replacement with Image in Word Document Process...");
    console.log("This replaces specified text in Word documents with images");
    console.log("Supports various image formats and precise text targeting");
    console.log("-".repeat(60));

    try {
        // Validate input files exist
        if (!fs.existsSync(INPUT_WORD_PATH)) {
            throw new Error(`Input Word file not found: ${INPUT_WORD_PATH}`);
        }
        if (!fs.existsSync(INPUT_IMAGE_PATH)) {
            throw new Error(`Input image file not found: ${INPUT_IMAGE_PATH}`);
        }

        console.log(`Processing: ${INPUT_WORD_PATH} + ${INPUT_IMAGE_PATH} → ${OUTPUT_WORD_PATH}`);

        // Process the text replacement
        const result = await processTextReplacement();

        // Handle the result
        await handleReplacementResult(result);

    } catch (error) {
        console.error("Text replacement failed:", error.message);
        process.exit(1);
    }
}

/**
 * Core replacement logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processTextReplacement() {
    // Read and encode Word document file to base64
    console.log("Reading and encoding Word document file...");
    const wordContent = fs.readFileSync(INPUT_WORD_PATH);
    const wordBase64 = wordContent.toString('base64');
    console.log("Word document successfully encoded to base64");

    // Read and encode image file to base64
    console.log("Reading and encoding image file...");
    const imageContent = fs.readFileSync(INPUT_IMAGE_PATH);
    const imageBase64 = imageContent.toString('base64');
    console.log("Image file successfully encoded to base64");

    // Prepare the replacement payload with all available options
    const payload = {
        docName: "output.docx",                    // Output document name
        docContent: wordBase64,                    // Base64 encoded Word document content
        ImageFileName: "sample.png",               // Image file name
        ImageFileContent: imageBase64,             // Base64 encoded image content
        IsFirstPageSkip: false,                    // Whether to skip the first page
        PageNumbers: "1",                          // Page numbers to process (comma-separated)
        SearchText: "SIGN_HERE",                   // Text to search and replace
        async: true                                // Enable asynchronous processing
    };

    // Additional payload options you can customize:
    // - "PageNumbers": "1,2,3" for multiple pages
    // - "IsFirstPageSkip": true to skip first page
    // - "SearchText": "YOUR_TEXT_HERE" for different text to replace

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending request to PDF4Me API...");
    console.log(`Searching for text: "${payload.SearchText}"`);
    console.log(`Processing pages: ${payload.PageNumbers}`);

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
        console.log("Text replacement with image completed immediately!");
        return await response.arrayBuffer();

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the replacement result and saves the modified Word document
 * Supports both binary Word data and base64 encoded responses
 */
async function handleReplacementResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations
        const buffer = Buffer.from(result);
        
        // Validate that we have a Word document (check for Word document signatures)
        const isWordDocument = buffer.length > 4 && (
            buffer.toString('ascii', 0, 4) === 'PK\x03\x04' || // ZIP signature (DOCX)
            buffer.toString('ascii', 0, 4) === '\xD0\xCF\x11\xE0' // Compound File signature (DOC)
        );

        if (isWordDocument) {
            console.log("Response is a valid Word document");
            fs.writeFileSync(OUTPUT_WORD_PATH, buffer);
            console.log(`Word document saved successfully to: ${OUTPUT_WORD_PATH}`);
            console.log("Text has been successfully replaced with the image");
            return;
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
                console.log("Text has been successfully replaced with the image");
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
                console.log("Text has been successfully replaced with the image");
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
        
        // Wait before polling (except on first attempt)
        if (attempt > 1) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }

        try {
            const response = await fetch(locationUrl, {
                method: 'GET',
                headers: headers
            });

            if (response.status === 200) {
                // Replacement completed successfully
                console.log("Text replacement with image completed successfully!");
                return await response.arrayBuffer();

            } else if (response.status === 202) {
                // Still processing, continue polling
                console.log("Still processing...");
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

    throw new Error(`Timeout: Text replacement did not complete after ${MAX_RETRIES} retries`);
}

// Main execution - Run the replacement when script is executed directly
if (require.main === module) {
    replaceTextWithImageInWord().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = { replaceTextWithImageInWord, processTextReplacement, handleReplacementResult }; 