const fs = require('fs');
const path = require('path');

/**
 * PDF Flattener using PDF4Me API
 * Flattens PDF documents by converting interactive elements (forms, annotations, layers) into static content
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for flattening PDF documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/FlattenPdf`;

// File paths configuration
const INPUT_PDF_PATH = "unflattened-sample.pdf";  // Path to input PDF with interactive elements
const OUTPUT_PDF_PATH = "Flatten_PDF_output.pdf"; // Output flattened PDF file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the PDF flattening process
 * Handles file validation, flattening, and result processing
 */
async function flattenPdf() {
    console.log("Starting PDF Flattening Process...");
    console.log("This converts all interactive PDF elements into static, non-editable content");
    console.log("Use cases: Final documents, preventing edits, archival purposes");
    console.log("-".repeat(70));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_PDF_PATH)) {
            throw new Error(`Input PDF file not found: ${INPUT_PDF_PATH}`);
        }

        console.log(`Flattening: ${INPUT_PDF_PATH} → ${OUTPUT_PDF_PATH}`);
        console.log("Converting interactive elements to static content...");

        // Process the flattening
        const result = await processPdfFlattening();

        // Handle the result
        await handleFlatteningResult(result);

    } catch (error) {
        console.error("Flattening failed:", error.message);
        process.exit(1);
    }
}

/**
 * Core flattening logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processPdfFlattening() {
    // Read and encode PDF file to base64
    console.log("Reading and encoding PDF file...");
    const pdfContent = fs.readFileSync(INPUT_PDF_PATH);
    const pdfBase64 = pdfContent.toString('base64');
    console.log("PDF file successfully encoded to base64");

    // Prepare the flattening payload
    const payload = {
        docContent: pdfBase64,           // Base64 encoded PDF document content
        docName: "Flatten_output.pdf",   // Name for the output file
        async: true                      // Enable asynchronous processing
    };

    // What PDF flattening does:
    // - Form fields → Static text (no longer editable)
    // - Annotations → Permanent marks (comments become part of document)
    // - Layers → Single merged layer (all layers combined)
    // - Digital signatures → Visual representation only (signatures become images)
    // - Interactive elements → Static content (buttons, links become non-functional)

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending request to PDF4Me API...");

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
        console.log("PDF flattening completed immediately!");
        return await response.arrayBuffer();

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the flattening result and saves the flattened PDF file
 * Supports both binary PDF data and base64 encoded responses
 */
async function handleFlatteningResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations
        const buffer = Buffer.from(result);
        
        // Validate that we have a PDF (check for PDF header)
        if (buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF') {
            console.log("Response is a valid PDF file");
            fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
            console.log(`Flattened PDF saved successfully to: ${OUTPUT_PDF_PATH}`);
            console.log("All interactive elements have been converted to static content");
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
                console.log(`Flattened PDF saved to ${OUTPUT_PDF_PATH}`);
                console.log("All interactive elements have been converted to static content");
            } else {
                console.log("No PDF data found in the response.");
                console.log("Full response:", JSON.stringify(jsonResponse, null, 2));
            }

        } catch (jsonError) {
            console.log("Failed to parse JSON response, treating as binary data");
            // If JSON parsing fails, try to save as binary anyway
            if (buffer.length > 1000) {
                fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
                console.log(`Flattened PDF saved to ${OUTPUT_PDF_PATH} (as binary data)`);
                console.log("All interactive elements have been converted to static content");
            } else {
                console.log("Warning: Response doesn't appear to be a valid PDF");
                console.log(`First 100 bytes: ${buffer.toString('hex', 0, 100)}`);
            }
        }

    } catch (error) {
        throw new Error(`Error saving flattened PDF: ${error.message}`);
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
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

        // Check the flattening status by calling the polling URL
        const response = await fetch(locationUrl, {
            method: 'GET',
            headers: headers
        });

        if (response.status === 200) {
            // Flattening completed successfully
            console.log("PDF flattening completed successfully!");
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
    }

    // If we reach here, polling timed out
    throw new Error("Timeout: PDF flattening did not complete after multiple retries.");
}

/**
 * Utility function to create a delay (used for polling)
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main execution - Run the flattening when script is executed directly
if (require.main === module) {
    flattenPdf().catch(error => {
        console.error("Unexpected error:", error);
        process.exit(1);
    });
}

module.exports = { flattenPdf }; 