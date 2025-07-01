const fs = require('fs');
const path = require('path');

/**
 * Add Margin to PDF using PDF4Me API
 * Adds custom margins to PDF documents and changes page size accordingly
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for adding margins to PDF documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/AddMargin`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                    // Path to the main PDF file
const OUTPUT_PDF_PATH = "Add_margin_to_PDF_output.pdf"; // Output PDF file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the PDF margin addition process
 * Handles file validation, margin addition, and result processing
 */
async function addMarginToPdf() {
    console.log("Starting PDF Margin Addition Process...");
    console.log("This adds custom margins to PDF documents");
    console.log("Changes page size to accommodate the new margins");
    console.log("-".repeat(60));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_PDF_PATH)) {
            throw new Error(`Input PDF file not found: ${INPUT_PDF_PATH}`);
        }

        console.log(`Processing: ${INPUT_PDF_PATH} → ${OUTPUT_PDF_PATH}`);

        // Process the margin addition
        const result = await processMarginAddition();

        // Handle the result
        await handleMarginResult(result);

    } catch (error) {
        console.error("Margin addition failed:", error.message);
        process.exit(1);
    }
}

/**
 * Core margin addition logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processMarginAddition() {
    // Read and encode PDF file to base64
    console.log("Reading and encoding PDF file...");
    const pdfContent = fs.readFileSync(INPUT_PDF_PATH);
    const pdfBase64 = pdfContent.toString('base64');
    console.log(`PDF file read successfully: ${pdfContent.length} bytes`);

    // Prepare the margin addition payload
    const payload = {
        docContent: pdfBase64,           // Base64 encoded PDF document content
        docName: "output.pdf",           // Output PDF file name
        marginLeft: 20,                  // Left margin in millimeters (0-100)
        marginRight: 20,                 // Right margin in millimeters (0-100)
        marginTop: 25,                   // Top margin in millimeters (0-100)
        marginBottom: 25,                // Bottom margin in millimeters (0-100)
        async: true                      // Enable asynchronous processing
    };

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending margin addition request to PDF4Me API...");
    console.log(`Margins: Left=${payload.marginLeft}mm, Right=${payload.marginRight}mm, Top=${payload.marginTop}mm, Bottom=${payload.marginBottom}mm`);

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
        console.log("Margin addition completed immediately!");
        return await response.arrayBuffer();

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the margin addition result and saves the PDF file
 * Supports both binary PDF data and base64 encoded responses
 */
async function handleMarginResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations
        const buffer = Buffer.from(result);
        
        // Validate that we have a PDF (check for PDF header)
        if (buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF') {
            console.log("Response is a valid PDF file");
            fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
            console.log(`PDF saved successfully to: ${OUTPUT_PDF_PATH}`);
            console.log("Margins have been successfully added to the PDF");
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
                console.log("Margins have been successfully added to the PDF");
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
                console.log("Margins have been successfully added to the PDF");
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
        
        // Wait before polling
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

        try {
            // Check the processing status
            const response = await fetch(locationUrl, {
                method: 'GET',
                headers: headers
            });

            if (response.status === 200) {
                // Success - processing completed
                console.log("Margin addition completed!");
                return await response.arrayBuffer();
                
            } else if (response.status === 202) {
                // Still processing, continue polling
                console.log("Still processing...");
                continue;
                
            } else {
                // Error occurred during processing
                const errorText = await response.text();
                throw new Error(`Error during processing: ${response.status} - ${errorText}`);
            }

        } catch (error) {
            console.log(`Polling attempt ${attempt} failed: ${error.message}`);
            
            if (attempt === MAX_RETRIES) {
                throw new Error(`Processing did not complete after ${MAX_RETRIES} attempts`);
            }
        }
    }

    throw new Error("Timeout: Processing did not complete after multiple retries");
}

/**
 * Utility function to validate PDF file
 */
function validatePdfFile(filePath) {
    try {
        const content = fs.readFileSync(filePath);
        // Check for PDF header
        return content.length > 4 && content.toString('ascii', 0, 4) === '%PDF';
    } catch (error) {
        return false;
    }
}

// Run the function when script is executed directly
if (require.main === module) {
    addMarginToPdf().catch(error => {
        console.error("Application error:", error.message);
        process.exit(1);
    });
}

module.exports = { addMarginToPdf, processMarginAddition, handleMarginResult }; 