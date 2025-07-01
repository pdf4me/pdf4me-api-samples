const fs = require('fs');
const path = require('path');

/**
 * Find and Replace Text in PDF using PDF4Me API
 * Searches for specific text in PDF documents and replaces it with new text
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for finding and replacing text in PDF documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/FindAndReplace`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                    // Path to input PDF file
const OUTPUT_PDF_PATH = "find_and_replace_PDF_output.pdf"; // Output PDF file name

// Find and replace configuration
const OLD_TEXT = "This is some";                       // Text to be searched and replaced
const NEW_TEXT = "Here is few";                        // Text to replace with
const PAGE_SEQUENCE = "1";                             // Page indices (all pages if not specified)

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the find and replace process
 * Handles file validation, text replacement, and result processing
 */
async function findAndReplaceText() {
    console.log("Starting PDF Find and Replace Text Process");
    console.log("This searches for specific text in PDF documents and replaces it");
    console.log("-".repeat(60));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_PDF_PATH)) {
            throw new Error(`Input PDF file not found: ${INPUT_PDF_PATH}`);
        }

        console.log(`Processing: ${INPUT_PDF_PATH} → ${OUTPUT_PDF_PATH}`);
        console.log(`Search text: '${OLD_TEXT}'`);
        console.log(`Replace with: '${NEW_TEXT}'`);
        console.log(`Page sequence: ${PAGE_SEQUENCE}`);

        // Process the find and replace operation
        const result = await processFindAndReplace();

        // Handle the result
        await handleFindAndReplaceResult(result);

    } catch (error) {
        console.error("Find and Replace operation failed:", error.message);
        process.exit(1);
    }
}

/**
 * Core find and replace logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processFindAndReplace() {
    // Read and encode PDF file to base64
    console.log("Reading and encoding PDF file...");
    const pdfContent = fs.readFileSync(INPUT_PDF_PATH);
    const pdfBase64 = pdfContent.toString('base64');
    console.log(`PDF file successfully encoded: ${pdfContent.length} bytes`);

    // Prepare the find and replace payload
    const payload = {
        docContent: pdfBase64,           // Base64 encoded PDF document content
        docName: path.basename(INPUT_PDF_PATH), // Source PDF file name with .pdf extension
        oldText: OLD_TEXT,               // Text to be searched and replaced
        newText: NEW_TEXT,               // Text to replace with
        pageSequence: PAGE_SEQUENCE,     // Page indices as comma-separated values or ranges
        async: true                      // Enable asynchronous processing
    };

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending PDF to PDF4Me API for find and replace operation...");

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
        console.log("Find and replace operation completed immediately!");
        return await response.arrayBuffer();

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the find and replace result and saves the PDF file
 * Supports both binary PDF data and base64 encoded responses
 */
async function handleFindAndReplaceResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations
        const buffer = Buffer.from(result);
        
        // Validate that we have a PDF (check for PDF header)
        if (buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF') {
            console.log("Response is a valid PDF file");
            fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
            console.log(`PDF saved successfully to: ${OUTPUT_PDF_PATH}`);
            console.log(`Output file size: ${buffer.length} bytes`);
            console.log(`Text '${OLD_TEXT}' replaced with '${NEW_TEXT}'`);
            return;
        }

        // Try to parse as JSON if not a direct PDF
        try {
            const jsonResponse = JSON.parse(buffer.toString());
            console.log("Successfully parsed JSON response");
            
            // Look for PDF data in different possible JSON locations
            let pdfBase64 = null;
            if (jsonResponse.document && jsonResponse.document.docData) {
                pdfBase64 = jsonResponse.document.docData;  // Common location 1
            } else if (jsonResponse.docData) {
                pdfBase64 = jsonResponse.docData;           // Common location 2
            } else if (jsonResponse.data) {
                pdfBase64 = jsonResponse.data;              // Alternative location
            }

            if (pdfBase64) {
                // Decode base64 PDF data and save to file
                const pdfBytes = Buffer.from(pdfBase64, 'base64');
                fs.writeFileSync(OUTPUT_PDF_PATH, pdfBytes);
                console.log(`PDF saved to ${OUTPUT_PDF_PATH}`);
                console.log(`Output file size: ${pdfBytes.length} bytes`);
                console.log(`Text '${OLD_TEXT}' replaced with '${NEW_TEXT}'`);
            } else {
                console.log("No PDF data found in the response.");
                console.log("Full response:", JSON.stringify(jsonResponse, null, 2));
            }

        } catch (jsonError) {
            console.log("Failed to parse JSON response, treating as binary data");
            // If JSON parsing fails, try to save as binary anyway
            if (buffer.length > 1000) {
                fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
                console.log(`PDF saved to ${OUTPUT_PDF_PATH} (as binary data)`);
                console.log(`Output file size: ${buffer.length} bytes`);
                console.log(`Text '${OLD_TEXT}' replaced with '${NEW_TEXT}'`);
            } else {
                console.log("Warning: Response doesn't appear to be a valid PDF");
                console.log(`First 100 bytes: ${buffer.toString('hex', 0, 100)}`);
            }
        }

    } catch (error) {
        throw new Error(`Error saving PDF: ${error.message}`);
    }
}

/**
 * Polls the API for async completion with retry logic
 * Handles 202 (processing) and 200 (completed) status codes
 */
async function pollForCompletion(locationUrl, headers) {
    console.log(`Polling URL: ${locationUrl}`);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        console.log(`Checking job status... (Attempt ${attempt}/${MAX_RETRIES})`);
        
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
                // Processing completed successfully
                console.log("Find and replace operation completed successfully!");
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

    throw new Error(`Timeout: Find and replace operation did not complete after ${MAX_RETRIES} retries`);
}

// Main execution - Run the find and replace operation when script is executed directly
if (require.main === module) {
    findAndReplaceText().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = { findAndReplaceText, processFindAndReplace, handleFindAndReplaceResult }; 