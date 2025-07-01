const fs = require('fs');
const path = require('path');

/**
 * Word to PDF Form Converter using PDF4Me API
 * Converts Word documents to PDF forms with fillable fields
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for converting Word documents to PDF forms
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ConvertWordToPdfForm`;

// File paths configuration
const INPUT_WORD_PATH = "sample.docx";              // Path to input Word document
const OUTPUT_PDF_PATH = "Word_to_PDF_Form_output.pdf"; // Output PDF form file name

// Retry configuration for async processing
const MAX_RETRIES = 10;  // Maximum number of polling attempts before timeout
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the Word to PDF Form conversion process
 * Handles file validation, conversion, and result processing
 */
async function convertWordToPdfForm() {
    console.log("Starting Word to PDF Form Conversion Process...");
    console.log("This converts Word documents into PDF forms with fillable fields");
    console.log("Perfect for creating interactive forms, surveys, and data collection documents");
    console.log("The process preserves document structure and converts form fields to PDF format");
    console.log("Supports various Word document formats including .docx and .doc files");
    console.log("-".repeat(80));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_WORD_PATH)) {
            console.log(`Error: Input Word file not found at ${INPUT_WORD_PATH}`);
            return;
        }

        // Process the conversion
        const result = await processWordToPdfFormConversion();

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
async function processWordToPdfFormConversion() {
    // Read and encode Word file to base64
    console.log("Reading and encoding Word file...");
    const wordContent = fs.readFileSync(INPUT_WORD_PATH);
    const wordBase64 = wordContent.toString('base64');
    console.log("Word file successfully encoded to base64");
    console.log(`Converting: ${INPUT_WORD_PATH} → ${OUTPUT_PDF_PATH}`);

    // Prepare the conversion payload
    const payload = {
        docContent: wordBase64,    // Base64 encoded Word document content
        docName: "output.pdf",     // Name for the output PDF file
        async: true                // Enable asynchronous processing
    };

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending Word to PDF Form conversion request to PDF4Me API...");
    console.log("Transforming Word document into interactive PDF form...");

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
        console.log("Word to PDF Form conversion completed immediately!");
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
 * Handles the conversion result and saves the PDF form file
 * Supports both binary PDF data and base64 encoded responses
 */
async function handleConversionResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations
        const buffer = Buffer.from(result);
        
        // Validate that we have a PDF file
        if (buffer.length > 1000 && buffer.toString('ascii', 0, 4) === '%PDF') {
            fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
            console.log(`PDF form saved successfully to: ${OUTPUT_PDF_PATH}`);
            console.log("Word document has been converted to interactive PDF form");
            console.log("The PDF form contains fillable fields that can be used for data collection");
            console.log(`File size: ${buffer.length} bytes`);
        } else {
            console.log("Warning: Response doesn't appear to be a valid PDF");
            console.log(`Response size: ${buffer.length} bytes`);
            console.log("First 200 bytes of response:");
            console.log(buffer.toString('utf8', 0, 200));
        }

    } catch (error) {
        throw new Error(`Error saving PDF form: ${error.message}`);
    }
}

/**
 * Polls the API for async completion with retry logic
 * Handles 202 (processing) and 200 (completed) status codes
 */
async function pollForCompletion(locationUrl, headers) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        console.log(`Waiting for conversion result... (Attempt ${attempt}/${MAX_RETRIES})`);
        console.log("Processing Word document and creating PDF form...");
        
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
                console.log("Word to PDF Form conversion completed successfully!");
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
    console.log("Timeout: Word to PDF Form conversion did not complete after multiple retries.");
    console.log("The conversion may be taking longer due to document complexity or server load.");
    console.log("Please check if the Word file is valid and accessible, then try again later.");
    throw new Error("Conversion timeout after maximum retries");
}

// Main execution - Run the conversion when script is executed directly
if (require.main === module) {
    convertWordToPdfForm().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = {
    convertWordToPdfForm,
    processWordToPdfFormConversion,
    handleConversionResult,
    pollForCompletion
}; 