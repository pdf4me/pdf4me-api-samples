const fs = require('fs');
const path = require('path');

/**
 * PDF Linearizer using PDF4Me API
 * Linearizes PDF documents for web viewing with faster loading and progressive display
 * Optimizes documents for online viewing with improved performance
 */

// API Configuration - PDF4Me service for linearizing PDF documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/LinearizePdf`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";              // Path to input PDF file
const OUTPUT_PDF_PATH = "Linearize_PDF_output.pdf"; // Output linearized PDF file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the PDF linearization process
 * Handles file validation, linearization, and result processing
 */
async function linearizePdf() {
    console.log("Starting PDF Linearization Process...");
    console.log("This optimizes PDF documents for web viewing with faster loading");
    console.log("Linearized PDFs display progressively as they download");
    console.log("Perfect for web applications and online document viewing");
    console.log("-".repeat(65));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_PDF_PATH)) {
            throw new Error(`Input PDF file not found: ${INPUT_PDF_PATH}`);
        }

        console.log(`Linearizing: ${INPUT_PDF_PATH} → ${OUTPUT_PDF_PATH}`);

        // Process the linearization
        const result = await processPdfLinearization();

        // Handle the result
        await handleLinearizationResult(result);

    } catch (error) {
        console.error("Linearization failed:", error.message);
        process.exit(1);
    }
}

/**
 * Core linearization logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processPdfLinearization() {
    // Read and encode PDF file to base64
    console.log("Reading and encoding PDF file...");
    const pdfContent = fs.readFileSync(INPUT_PDF_PATH);
    const pdfBase64 = pdfContent.toString('base64');
    console.log("PDF file successfully encoded to base64");

    // Prepare the linearization payload with optimization settings
    const payload = {
        docContent: pdfBase64,        // Base64 encoded PDF document content
        docName: "output.pdf",        // Name for the output file
        optimizeProfile: "web",       // Optimization profile for web viewing
        async: true                   // Enable asynchronous processing
    };

    // Available optimization profiles:
    // - "web": Optimized for web viewing (fast loading, progressive display)
    // - "Max": Maximum compression (smallest file size, slower processing)
    // - "Print": Optimized for printing (correct fonts, colors, resolution)
    // - "Default": Standard optimization balance
    // - "WebMax": Maximum web optimization (best for online viewing)
    // - "PrintMax": Maximum print optimization (best quality for printing)
    // - "PrintGray": Print optimized with grayscale conversion
    // - "Compress": General compression without specific optimization
    // - "CompressMax": Maximum compression with aggressive size reduction

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending request to PDF4Me API...");
    console.log(`Optimization profile: ${payload.optimizeProfile}`);
    console.log("Optimizing PDF for web viewing and faster loading...");

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
        console.log("PDF linearization completed immediately!");
        return await response.arrayBuffer();

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the linearization result and saves the optimized PDF file
 * Supports both binary PDF data and base64 encoded responses
 */
async function handleLinearizationResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations
        const buffer = Buffer.from(result);
        
        // Validate that we have a PDF (check for PDF header)
        if (buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF') {
            console.log("Response is a valid PDF file");
            fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
            console.log(`Linearized PDF saved successfully to: ${OUTPUT_PDF_PATH}`);
            console.log("PDF is now optimized for web viewing and faster loading");
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
                console.log(`Linearized PDF saved to ${OUTPUT_PDF_PATH}`);
                console.log("PDF is now optimized for web viewing and faster loading");
            } else {
                console.log("No PDF data found in the response.");
                console.log("Full response:", JSON.stringify(jsonResponse, null, 2));
            }

        } catch (jsonError) {
            console.log("Failed to parse JSON response, treating as binary data");
            // If JSON parsing fails, try to save as binary anyway
            if (buffer.length > 1000) {
                fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
                console.log(`Linearized PDF saved to ${OUTPUT_PDF_PATH} (as binary data)`);
                console.log("PDF is now optimized for web viewing and faster loading");
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
                // Linearization completed successfully
                console.log("PDF linearization completed successfully!");
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

    throw new Error(`Timeout: PDF linearization did not complete after ${MAX_RETRIES} retries`);
}

// Main execution - Run the linearization when script is executed directly
if (require.main === module) {
    linearizePdf().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = { linearizePdf, processPdfLinearization, handleLinearizationResult }; 