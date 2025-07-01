const fs = require('fs');
const path = require('path');

/**
 * PDF Form Data Extractor using PDF4Me API
 * Extracts all form field data and values from PDF documents containing fillable forms
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for extracting form data from PDF documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ExtractPdfFormData`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                    // Path to input PDF file
const OUTPUT_JSON_PATH = "Extract_form_data_output.json"; // Output form data file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the PDF form data extraction process
 * Handles file validation, extraction, and result processing
 */
async function extractFormDataFromPdf() {
    console.log("Starting PDF Form Data Extraction Process...");
    console.log("This extracts all form field data and values from PDF documents");
    console.log("Supports text fields, checkboxes, radio buttons, dropdowns, and more");
    console.log("-".repeat(60));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_PDF_PATH)) {
            throw new Error(`Input PDF file not found: ${INPUT_PDF_PATH}`);
        }

        console.log(`Extracting form data from: ${INPUT_PDF_PATH} → ${OUTPUT_JSON_PATH}`);

        // Process the extraction
        const result = await processFormDataExtraction();

        // Handle the result
        await handleExtractionResult(result);

    } catch (error) {
        console.error("Extraction failed:", error.message);
        process.exit(1);
    }
}

/**
 * Core extraction logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processFormDataExtraction() {
    // Read and encode PDF file to base64
    console.log("Reading and encoding PDF file...");
    const pdfContent = fs.readFileSync(INPUT_PDF_PATH);
    const pdfBase64 = pdfContent.toString('base64');
    console.log(`PDF file successfully encoded to base64: ${pdfContent.length} bytes`);

    // Prepare the extraction payload
    const payload = {
        docName: "output.pdf",            // Source PDF file name with .pdf extension
        docContent: pdfBase64,            // Base64 encoded PDF document content
        async: true                       // Enable asynchronous processing
    };

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending form data extraction request to PDF4Me API...");

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
        console.log("Form data extraction completed immediately!");
        return await response.arrayBuffer();

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the extraction result and saves the form data as JSON
 * Supports both JSON form data and binary content responses
 */
async function handleExtractionResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for processing
        const buffer = Buffer.from(result);
        
        // Check if response is JSON (form data) or binary content
        const contentType = 'application/json'; // API typically returns JSON for form data
        
        if (contentType.includes('application/json')) {
            // Response contains JSON form data
            try {
                const formData = JSON.parse(buffer.toString());
                
                // Save form data as JSON
                fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(formData, null, 2), 'utf8');
                console.log(`Form data saved: ${OUTPUT_JSON_PATH}`);
                
                // Display extracted form data summary
                if (typeof formData === 'object') {
                    console.log("\nExtracted Form Data:");
                    if (formData.formFields) {
                        const fields = formData.formFields;
                        console.log(`Found ${fields.length} form fields:`);
                        for (let i = 0; i < Math.min(fields.length, 10); i++) {
                            const field = fields[i];
                            const fieldName = field.name || 'Unknown';
                            const fieldValue = field.value || 'Empty';
                            const fieldType = field.type || 'Unknown';
                            console.log(`  ${i + 1}. ${fieldName} (${fieldType}): ${fieldValue}`);
                        }
                        if (fields.length > 10) {
                            console.log(`  ... and ${fields.length - 10} more fields`);
                        }
                    } else {
                        // Display top-level data if no formFields structure
                        const entries = Object.entries(formData);
                        for (let i = 0; i < Math.min(entries.length, 5); i++) {
                            const [key, value] = entries[i];
                            console.log(`  ${key}: ${value}`);
                        }
                        if (entries.length > 5) {
                            console.log(`  ... and ${entries.length - 5} more entries`);
                        }
                    }
                }
                
            } catch (jsonError) {
                console.log("Failed to parse JSON response, treating as binary data");
                // Save raw response content as fallback
                const fallbackPath = OUTPUT_JSON_PATH.replace('.json', '_raw.bin');
                fs.writeFileSync(fallbackPath, buffer);
                console.log(`Raw response saved: ${fallbackPath}`);
            }
        } else {
            // Response is binary content
            const binaryPath = OUTPUT_JSON_PATH.replace('.json', '.bin');
            fs.writeFileSync(binaryPath, buffer);
            console.log(`Binary form data saved: ${binaryPath}`);
        }

    } catch (error) {
        throw new Error(`Error processing extracted form data: ${error.message}`);
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

            if (response.status === 200) {
                // Extraction completed successfully
                console.log("Form data extraction completed successfully!");
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

    throw new Error(`Timeout: Form data extraction did not complete after ${MAX_RETRIES} retries`);
}

// Main execution - Run the extraction when script is executed directly
if (require.main === module) {
    extractFormDataFromPdf().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = { extractFormDataFromPdf, processFormDataExtraction, handleExtractionResult }; 