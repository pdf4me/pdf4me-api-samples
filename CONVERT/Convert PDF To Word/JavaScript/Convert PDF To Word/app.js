const fs = require('fs');
const path = require('path');

/**
 * PDF to Word Converter using PDF4Me API
 * Converts PDF files to Word documents (.docx) with formatting preserved
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for converting PDF documents to Word documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ConvertPdfToWord`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";              // Path to input PDF file
const OUTPUT_WORD_PATH = "PDF_to_Word_output.docx"; // Output Word file name

// Retry configuration for async processing
const MAX_RETRIES = 10;  // Maximum number of polling attempts before timeout
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the PDF to Word conversion process
 * Handles file validation, conversion, and result processing
 */
async function convertPdfToWord() {
    console.log("Starting PDF to Word Conversion Process...");
    console.log("This transforms PDF content into editable Word document format");
    console.log("Perfect for converting contracts, reports, and documents back to editable format");
    console.log("The process handles both text-based and scanned PDFs using OCR technology");
    console.log("Preserves formatting, fonts, paragraphs, and document structure");
    console.log("-".repeat(80));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_PDF_PATH)) {
            console.log(`Error: Input PDF file not found at ${INPUT_PDF_PATH}`);
            return;
        }

        // Process the conversion
        const result = await processPdfToWordConversion();

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
async function processPdfToWordConversion() {
    // Read and encode PDF file to base64
    console.log("Reading and encoding PDF file...");
    const pdfContent = fs.readFileSync(INPUT_PDF_PATH);
    const pdfBase64 = pdfContent.toString('base64');
    console.log("PDF file successfully encoded to base64");
    console.log(`Converting: ${INPUT_PDF_PATH} → ${OUTPUT_WORD_PATH}`);

    // Prepare the conversion payload
    const payload = {
        docContent: pdfBase64,           // Base64 encoded PDF document content
        docName: "test.pdf",             // Name for the output file
        qualityType: "Draft",            // Quality setting: Draft (faster) or Quality (better accuracy)
        language: "English",             // OCR language for text recognition in images/scanned PDFs
        mergeAllSheets: true,            // Combine multiple pages into single document flow
        outputFormat: true,              // Preserve original formatting when possible
        ocrWhenNeeded: true,             // Use OCR (Optical Character Recognition) for scanned PDFs
        async: true                      // Enable asynchronous processing
    };

    // Additional payload options you can customize:
    // - "qualityType": "Quality" for better accuracy (slower)
    // - "language": "German", "French", "Spanish" for other languages
    // - "mergeAllSheets": false to keep pages separate
    // - "ocrWhenNeeded": false to skip OCR processing

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending PDF to Word conversion request to PDF4Me API...");
    console.log("Transforming PDF content into editable Word document format...");

    // Make the initial API request
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });

    // Handle different response scenarios
    if (response.status === 202) {
        // Asynchronous processing - poll for completion
        console.log("Request accepted. PDF4Me is processing the conversion asynchronously...");
        
        const locationUrl = response.headers.get('Location');
        if (!locationUrl) {
            console.log("No 'Location' header found in the response.");
            console.log("Cannot proceed without polling URL for checking conversion status.");
            return;
        }

        console.log(`Polling URL: ${locationUrl}`);
        return await pollForCompletion(locationUrl, headers);

    } else if (response.status === 200) {
        // Synchronous processing - immediate result
        console.log("PDF to Word conversion completed immediately!");
        return await response.arrayBuffer();

    } else {
        // Error response
        console.log(`Initial request failed with status code: ${response.status}`);
        const errorText = await response.text();
        console.log("Response details:", errorText);
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the conversion result and saves the Word file
 * Supports both binary Word data and base64 encoded responses
 */
async function handleConversionResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations
        const buffer = Buffer.from(result);
        
        // Validate that we have a Word document
        if (buffer.length > 1000) {  // Word files are typically larger than 1KB
            fs.writeFileSync(OUTPUT_WORD_PATH, buffer);
            console.log(`Word document saved successfully to: ${OUTPUT_WORD_PATH}`);
            console.log("PDF content has been transformed into editable Word document format");
            console.log("You can now open the file in Microsoft Word, LibreOffice Writer, or Google Docs");
        } else {
            console.log("Warning: Response seems too small to be a valid Word document");
            console.log(`Response size: ${buffer.length} bytes`);
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
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        console.log(`Waiting for conversion result... (Attempt ${attempt}/${MAX_RETRIES})`);
        console.log("Processing PDF content and creating editable Word document...");
        
        // Wait before polling (except on first attempt)
        if (attempt > 1) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }

        try {
            const response = await fetch(locationUrl, {
                method: 'GET',
                headers: headers
            });

            // Display current status for debugging and user feedback
            console.log(`Response status code: ${response.status}`);

            if (response.status === 200) {
                // Conversion completed successfully
                console.log("PDF to Word conversion completed successfully!");
                return await response.arrayBuffer();

            } else if (response.status === 202) {
                // Still processing, continue polling
                console.log("Conversion still in progress...");
                continue;

            } else {
                // Error occurred during processing
                console.log(`Unexpected error during conversion: ${response.status}`);
                const errorText = await response.text();
                console.log("Error details:", errorText);
                throw new Error(`Unexpected error during conversion: ${response.status}, Error details: ${errorText}`);
            }

        } catch (error) {
            if (attempt === MAX_RETRIES) {
                throw new Error(`Polling failed after ${MAX_RETRIES} attempts: ${error.message}`);
            }
            console.log(`Polling attempt ${attempt} failed: ${error.message}`);
        }
    }

    // If we reach here, polling timed out
    console.log("Timeout: PDF to Word conversion did not complete after multiple retries.");
    console.log("The conversion may be taking longer due to PDF complexity or server load.");
    console.log("Please check if the PDF file is valid and try again later.");
    throw new Error(`Timeout: PDF to Word conversion did not complete after ${MAX_RETRIES} retries. The conversion may be taking longer due to PDF complexity or server load.`);
}

// Main execution - Run the conversion when script is executed directly
if (require.main === module) {
    convertPdfToWord().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = { convertPdfToWord, processPdfToWordConversion, handleConversionResult }; 