const fs = require('fs');
const path = require('path');

/**
 * PDF to PDF/A Converter using PDF4Me API
 * Converts regular PDF files to PDF/A format for long-term archival
 * PDF/A is an ISO standard for long-term preservation of electronic documents
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for converting PDF to PDF/A format
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/PdfA`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                    // Path to input PDF file
const OUTPUT_PDFA_PATH = "PDF_to_PDF_A_output.pdf";     // Output PDF/A file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the PDF to PDF/A conversion process
 * Handles file validation, conversion, and result processing
 */
async function createPdfA() {
    console.log("Starting PDF to PDF/A Conversion Process...");
    console.log("PDF/A is an ISO standard for long-term archival of electronic documents");
    console.log("It ensures documents can be reproduced reliably over time");
    console.log("-".repeat(70));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_PDF_PATH)) {
            throw new Error(`Input PDF file not found: ${INPUT_PDF_PATH}`);
        }

        console.log(`Converting: ${INPUT_PDF_PATH} → ${OUTPUT_PDFA_PATH}`);

        // Process the conversion
        const result = await processPdfToPdfAConversion();

        // Handle the result
        await handleConversionResult(result);

    } catch (error) {
        console.error("Conversion failed:", error.message);
        process.exit(1);
    }
}

/**
 * Core conversion logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processPdfToPdfAConversion() {
    // Read and encode PDF file to base64
    console.log("Reading and encoding PDF file...");
    const pdfContent = fs.readFileSync(INPUT_PDF_PATH);
    const pdfBase64 = pdfContent.toString('base64');
    console.log("PDF file successfully encoded to base64");

    // Prepare the conversion payload with PDF/A compliance settings
    const payload = {
        docContent: pdfBase64,        // Base64 encoded PDF document content
        docName: "output",            // Name for the output file
        compliance: "PdfA1b",         // PDF/A compliance level (PdfA1b = Level B basic conformance)
        allowUpgrade: true,           // Allow upgrading to higher compliance if needed
        allowDowngrade: true,         // Allow downgrading to lower compliance if necessary
        async: true                   // Enable asynchronous processing
    };

    // Available PDF/A compliance options:
    // - "PdfA1b": PDF/A-1b (Level B basic conformance) - Most common
    // - "PdfA1a": PDF/A-1a (Level A accessible conformance) - Includes accessibility features
    // - "PdfA2b": PDF/A-2b (Part 2 basic compliance) - Supports newer PDF features
    // - "PdfA2u": PDF/A-2u (Part 2 with Unicode mapping)
    // - "PdfA2a": PDF/A-2a (Part 2 accessible compliance)
    // - "PdfA3b": PDF/A-3b (Part 3 basic - allows file embedding)
    // - "PdfA3u": PDF/A-3u (Part 3 with Unicode mapping)
    // - "PdfA3a": PDF/A-3a (Part 3 accessible compliance)

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending request to PDF4Me API...");
    console.log(`PDF/A Compliance Level: ${payload.compliance}`);

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
        console.log("PDF/A conversion completed immediately!");
        return await response.arrayBuffer();

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the conversion result and saves the PDF/A file
 * Supports both binary PDF data and base64 encoded responses
 */
async function handleConversionResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations
        const buffer = Buffer.from(result);
        
        // Validate that we have a PDF (check for PDF header)
        if (buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF') {
            console.log("Response is a valid PDF file");
            fs.writeFileSync(OUTPUT_PDFA_PATH, buffer);
            console.log(`PDF/A file saved successfully to: ${OUTPUT_PDFA_PATH}`);
            console.log("File is now compliant with PDF/A archival standards");
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
                fs.writeFileSync(OUTPUT_PDFA_PATH, pdfBytes);
                console.log(`PDF/A file saved to ${OUTPUT_PDFA_PATH}`);
                console.log("File is now compliant with PDF/A archival standards");
            } else {
                console.log("No PDF data found in the response.");
                console.log("Full response:", JSON.stringify(jsonResponse, null, 2));
            }

        } catch (jsonError) {
            console.log("Failed to parse JSON response, treating as binary data");
            // If JSON parsing fails, try to save as binary anyway
            if (buffer.length > 1000) {
                fs.writeFileSync(OUTPUT_PDFA_PATH, buffer);
                console.log(`PDF/A file saved to ${OUTPUT_PDFA_PATH} (as binary data)`);
                console.log("File is now compliant with PDF/A archival standards");
            } else {
                console.log("Warning: Response doesn't appear to be a valid PDF");
                console.log(`First 100 bytes: ${buffer.toString('hex', 0, 100)}`);
            }
        }

    } catch (error) {
        throw new Error(`Error saving PDF/A: ${error.message}`);
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
                // Conversion completed successfully
                console.log("PDF/A conversion completed successfully!");
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

    throw new Error(`Timeout: PDF/A conversion did not complete after ${MAX_RETRIES} retries`);
}

// Main execution - Run the conversion when script is executed directly
if (require.main === module) {
    createPdfA().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = { createPdfA, processPdfToPdfAConversion, handleConversionResult }; 