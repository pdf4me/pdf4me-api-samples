const fs = require('fs');
const path = require('path');

/**
 * Document Parser using PDF4Me API
 * Parses documents using template-based parsing to extract structured data
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for parsing documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ParseDocument`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                    // Path to input PDF file
const OUTPUT_PATH = "parsed_document.txt";              // Output text file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the document parsing process
 * Handles file validation, parsing, and result processing
 */
async function parseDocument() {
    console.log("Starting Document Parsing Process...");
    console.log("This extracts structured data from documents using AI-powered parsing");
    console.log("Supports invoices, receipts, forms, and other document types");
    console.log("-".repeat(60));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_PDF_PATH)) {
            throw new Error(`Input PDF file not found: ${INPUT_PDF_PATH}`);
        }

        console.log(`Parsing: ${INPUT_PDF_PATH} → ${OUTPUT_PATH}`);

        // Process the parsing
        const result = await processDocumentParsing();

        // Handle the result
        await handleParsingResult(result);

    } catch (error) {
        console.error("Parsing failed:", error.message);
        process.exit(1);
    }
}

/**
 * Core parsing logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processDocumentParsing() {
    // Read and encode PDF file to base64
    console.log("Reading and encoding PDF file...");
    const pdfContent = fs.readFileSync(INPUT_PDF_PATH);
    const pdfBase64 = pdfContent.toString('base64');
    console.log(`PDF file read successfully: ${pdfContent.length} bytes`);

    // Prepare the parsing payload
    const payload = {
        docContent: pdfBase64,           // Base64 encoded PDF document content
        docName: "output.pdf",           // Name for the output file
        async: true                      // Enable asynchronous processing
    };

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending document parsing request to PDF4Me API...");

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
        console.log("Document parsing completed immediately!");
        return await response.json();

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the parsing result and saves the extracted data
 * Processes JSON response with structured document data
 */
async function handleParsingResult(result) {
    try {
        console.log("Document parsing completed successfully!");
        
        // Save parsing results to text file
        const timestamp = new Date().toLocaleString();
        let outputContent = "Document Parsing Results\n";
        outputContent += "========================\n";
        outputContent += `Parsed on: ${timestamp}\n\n`;
        
        // Extract key fields from the response
        if (result.documentType) {
            outputContent += `Document Type: ${result.documentType}\n`;
        }
        if (result.pageCount) {
            outputContent += `Page Count: ${result.pageCount}\n`;
        }
        
        outputContent += "\nFull Response:\n";
        outputContent += JSON.stringify(result, null, 2);
        
        // Write results to file
        fs.writeFileSync(OUTPUT_PATH, outputContent, 'utf8');
        console.log(`Parsing results saved: ${OUTPUT_PATH}`);
        
        // Display basic parsing information
        console.log("\nParsing Results:");
        for (const [key, value] of Object.entries(result)) {
            if (key !== 'docContent' && key !== 'docData') { // Skip large base64 fields
                console.log(`  ${key}: ${value}`);
            }
        }
        
        console.log("Document has been successfully parsed and data extracted");

    } catch (error) {
        throw new Error(`Error saving parsing results: ${error.message}`);
    }
}

/**
 * Polls the API for async completion with retry logic
 * Handles 202 (processing) and 200 (completed) status codes
 */
async function pollForCompletion(locationUrl, headers) {
    console.log(`Polling URL: ${locationUrl}`);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        console.log(`Checking status... (Attempt ${attempt}/${MAX_RETRIES})`);
        
        // Wait before polling (except on first attempt)
        if (attempt > 1) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }

        try {
            const response = await fetch(locationUrl, {
                method: 'GET',
                headers: headers
            });

            console.log(`Polling status code: ${response.status}`);

            if (response.status === 200) {
                // Parsing completed successfully
                console.log("Document parsing completed successfully!");
                return await response.json();

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

    throw new Error(`Timeout: Document parsing did not complete after ${MAX_RETRIES} retries`);
}

// Main execution - Run the parsing when script is executed directly
if (require.main === module) {
    parseDocument().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = { parseDocument, processDocumentParsing, handleParsingResult }; 