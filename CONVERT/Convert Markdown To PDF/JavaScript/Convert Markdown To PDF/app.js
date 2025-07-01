const fs = require('fs');
const path = require('path');

/**
 * Markdown to PDF Converter using PDF4Me API
 * Converts Markdown files to PDF documents with preserved formatting
 * Supports headers, lists, code blocks, links, tables, and text styling
 */

// API Configuration - PDF4Me service for converting Markdown to PDF documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ConvertMdToPdf`;

// File paths configuration
const INPUT_MD_PATH = "sample.md";                      // Path to input Markdown file (.md extension)
const OUTPUT_PDF_PATH = "Markdown_to_PDF_output.pdf";   // Output PDF file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the Markdown to PDF conversion process
 * Handles file validation, conversion, and result processing
 */
async function convertMarkdownToPdf() {
    console.log("Starting Markdown to PDF Conversion Process...");
    console.log("This converts Markdown documents into formatted PDF files");
    console.log("Preserves headers, lists, code blocks, links, and text formatting");
    console.log("Perfect for documentation, README files, and technical writing");
    console.log("-".repeat(70));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_MD_PATH)) {
            throw new Error(`Input Markdown file not found: ${INPUT_MD_PATH}`);
        }

        console.log(`Converting: ${INPUT_MD_PATH} → ${OUTPUT_PDF_PATH}`);
        console.log("Converting Markdown formatting to PDF layout...");

        // Process the conversion
        const result = await processMarkdownToPdfConversion();

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
async function processMarkdownToPdfConversion() {
    // Read and encode Markdown file to base64
    console.log("Reading and encoding Markdown file...");
    const mdContent = fs.readFileSync(INPUT_MD_PATH);
    const mdBase64 = mdContent.toString('base64');
    console.log("Markdown file successfully encoded to base64");

    // Prepare the conversion payload with all available options
    const payload = {
        docContent: mdBase64,        // Base64 encoded Markdown document content
        docName: "sample.md",        // Name of the source Markdown file with extension
        mdFilePath: "",              // Path to .md file inside ZIP (empty for single file)
        async: true                  // Enable asynchronous processing
    };

    // About Markdown formatting preserved in PDF:
    // - Headers (# ## ###) → PDF heading styles with different sizes
    // - **Bold** and *italic* text → PDF formatted text
    // - Lists (- or 1.) → PDF bulleted and numbered lists
    // - [Links](url) → PDF clickable links
    // - `code` and ```code blocks``` → PDF monospace formatted code
    // - Tables → PDF formatted tables
    // - Images → Embedded images in PDF
    // - Line breaks and paragraphs → PDF spacing and layout

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
        console.log("Markdown to PDF conversion completed immediately!");
        return await response.arrayBuffer();

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the conversion result and saves the PDF file
 * Supports both binary PDF data and base64 encoded responses
 */
async function handleConversionResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations
        const buffer = Buffer.from(result);
        
        // Validate that we have a PDF (check for PDF header)
        if (buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF') {
            console.log("Response is a valid PDF file");
            fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
            console.log(`PDF saved successfully to: ${OUTPUT_PDF_PATH}`);
            console.log("Markdown formatting has been converted to PDF layout");
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
                console.log("Markdown formatting has been converted to PDF layout");
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
                console.log("Markdown formatting has been converted to PDF layout");
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
                // Conversion completed successfully
                console.log("Markdown to PDF conversion completed successfully!");
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

    throw new Error(`Timeout: Markdown to PDF conversion did not complete after ${MAX_RETRIES} retries`);
}

// Main execution - Run the conversion when script is executed directly
if (require.main === module) {
    convertMarkdownToPdf().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = { convertMarkdownToPdf, processMarkdownToPdfConversion, handleConversionResult }; 