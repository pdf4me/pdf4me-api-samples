const fs = require('fs');
const path = require('path');

/**
 * PDF Form Filler using PDF4Me API
 * Fills PDF form fields with provided data
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for filling PDF forms
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/FillPdfForm`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                    // Path to the PDF file with form fields
const OUTPUT_PDF_PATH = "fill_PDF_form_output.pdf";     // Output PDF file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the PDF form filling process
 * Handles file validation, form filling, and result processing
 */
async function fillPdfForm() {
    console.log("Starting PDF Form Filling Process");
    console.log("This fills PDF form fields with provided data");
    console.log("-".repeat(60));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_PDF_PATH)) {
            throw new Error(`Input PDF file not found: ${INPUT_PDF_PATH}`);
        }

        console.log(`Processing: ${INPUT_PDF_PATH} → ${OUTPUT_PDF_PATH}`);

        // Configure form field data to fill
        const formData = {
            "firstname": "John",                    // First name field value
            "lastname": "Adams",                    // Last name field value
            "gender": "Male",                       // Gender field value
        };

        console.log("Form data to fill:");
        for (const [fieldName, fieldValue] of Object.entries(formData)) {
            console.log(`  ${fieldName}: ${fieldValue}`);
        }

        // Process the form filling
        const result = await processPdfFormFilling(formData);

        // Handle the result
        await handleFormFillingResult(result);

    } catch (error) {
        console.error("Form filling failed:", error.message);
        process.exit(1);
    }
}

/**
 * Core form filling logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processPdfFormFilling(formData) {
    // Read and encode PDF file to base64
    console.log("Reading and encoding PDF file...");
    const pdfContent = fs.readFileSync(INPUT_PDF_PATH);
    const pdfBase64 = pdfContent.toString('base64');
    console.log(`PDF file read successfully: ${pdfContent.length} bytes`);

    // Create form fields array from form data
    const inputFormData = [];
    for (const [fieldName, fieldValue] of Object.entries(formData)) {
        inputFormData.push({
            "fieldName": fieldName,
            "fieldValue": fieldValue
        });
    }

    // Prepare the form filling payload with all required parameters
    const payload = {
        templateDocName: path.basename(INPUT_PDF_PATH),  // Template document name (Required)
        templateDocContent: pdfBase64,                   // Base64 PDF content (Required)
        dataArray: JSON.stringify(formData),             // JSON data array with form field values (Required)
        outputType: "pdf",                               // Output type - must be pdf (Required)
        inputDataType: "json",                           // Input data type - json format (Required)
        metaData: "",                                    // Additional metadata (Optional)
        metaDataJson: "",                                // Additional JSON metadata (Optional)
        InputFormData: inputFormData,                    // Array of form field objects (Required)
        async: true                                      // Asynchronous processing
    };

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending PDF to PDF4Me API for filling form fields...");

    // Make the initial API request
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });

    console.log(`Status code: ${response.status}`);

    // Handle different response scenarios
    if (response.status === 200) {
        // Synchronous processing - immediate result
        console.log("Success! PDF form filled successfully!");
        return await response.arrayBuffer();

    } else if (response.status === 202) {
        // Asynchronous processing - poll for completion
        console.log("Request accepted. Processing asynchronously...");
        
        const locationUrl = response.headers.get('Location');
        if (!locationUrl) {
            throw new Error("No 'Location' header found in the response for polling");
        }

        console.log(`Location URL: ${locationUrl}`);
        return await pollForCompletion(locationUrl, headers);

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the form filling result and saves the PDF file
 * Supports both binary PDF data and base64 encoded responses
 */
async function handleFormFillingResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations
        const buffer = Buffer.from(result);
        
        // Validate that we have a PDF (check for PDF header)
        if (buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF') {
            console.log("Response is a valid PDF file");
            fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
            console.log(`Filled PDF form saved successfully: ${OUTPUT_PDF_PATH}`);
            console.log(`Output file size: ${buffer.length} bytes`);
            console.log("PDF form fields have been filled successfully");
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
                console.log(`Filled PDF form saved successfully: ${OUTPUT_PDF_PATH}`);
                console.log(`Output file size: ${pdfBytes.length} bytes`);
                console.log("PDF form fields have been filled successfully");
            } else {
                console.log("No PDF data found in the response.");
                console.log("Full response:", JSON.stringify(jsonResponse, null, 2));
            }

        } catch (jsonError) {
            console.log("Failed to parse JSON response, treating as binary data");
            // If JSON parsing fails, try to save as binary anyway
            if (buffer.length > 1000) {
                fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
                console.log(`Filled PDF form saved to ${OUTPUT_PDF_PATH} (as binary data)`);
                console.log(`Output file size: ${buffer.length} bytes`);
                console.log("PDF form fields have been filled successfully");
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
        
        // Wait before polling
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

        try {
            // Poll the location URL for completion
            const statusResponse = await fetch(locationUrl, {
                method: 'GET',
                headers: headers
            });

            console.log(`Poll response status: ${statusResponse.status}`);

            if (statusResponse.status === 200) {
                console.log("Processing completed!");
                return await statusResponse.arrayBuffer();

            } else if (statusResponse.status === 202) {
                console.log("Still processing...");
                continue;

            } else {
                const errorText = await statusResponse.text();
                throw new Error(`Error during polling: ${statusResponse.status} - ${errorText}`);
            }

        } catch (error) {
            console.log(`Error polling status: ${error.message}`);
            continue;
        }
    }

    throw new Error("Timeout: Processing did not complete after multiple retries");
}

/**
 * Execute the main function when script is run directly
 */
if (require.main === module) {
    fillPdfForm().catch(error => {
        console.error("PDF form filling failed:", error.message);
        process.exit(1);
    });
}

module.exports = {
    fillPdfForm,
    processPdfFormFilling,
    handleFormFillingResult,
    pollForCompletion
}; 