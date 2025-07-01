const fs = require('fs');
const path = require('path');

/**
 * Add Form Fields to PDF using PDF4Me API
 * Adds interactive form fields (text boxes, checkboxes) to PDF documents
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for adding form fields to PDF documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/AddFormField`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                    // Path to input PDF file
const OUTPUT_PDF_PATH = "add_form_fields_PDF_output.pdf"; // Output PDF file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the form field addition process
 * Handles file validation, form field addition, and result processing
 */
async function addFormFieldsToPdf() {
    console.log("Starting PDF Add Form Fields Process");
    console.log("This adds interactive form fields to PDF documents");
    console.log("Supports text boxes and checkboxes with custom positioning");
    console.log("-".repeat(60));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_PDF_PATH)) {
            throw new Error(`Input PDF file not found: ${INPUT_PDF_PATH}`);
        }

        console.log(`Processing: ${INPUT_PDF_PATH} → ${OUTPUT_PDF_PATH}`);

        // Configure form field parameters
        const formFieldConfig = {
            initialValue: "New input text",           // Initial value for the form field
            positionX: 300,                           // X position of the form field
            positionY: 300,                           // Y position of the form field
            fieldName: "Input Field Name",            // Name of the form field
            size: 4,                                  // Size of the form field
            pages: "1",                               // Page number where to add the field
            formFieldType: "TextBox"                  // Type of form field (TextBox/CheckBox)
        };

        console.log(`Form field type: ${formFieldConfig.formFieldType}`);
        console.log(`Field name: '${formFieldConfig.fieldName}'`);
        console.log(`Position: (${formFieldConfig.positionX}, ${formFieldConfig.positionY})`);
        console.log(`Page: ${formFieldConfig.pages}`);

        // Process the form field addition
        const result = await processFormFieldAddition(formFieldConfig);

        // Handle the result
        await handleFormFieldResult(result);

    } catch (error) {
        console.error("Form field addition failed:", error.message);
        process.exit(1);
    }
}

/**
 * Core form field addition logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processFormFieldAddition(formFieldConfig) {
    // Read and encode PDF file to base64
    console.log("Reading and encoding PDF file...");
    const pdfContent = fs.readFileSync(INPUT_PDF_PATH);
    const pdfBase64 = pdfContent.toString('base64');
    console.log(`PDF file read successfully: ${pdfContent.length} bytes`);

    // Prepare the form field addition payload
    const payload = {
        docContent: pdfBase64,                        // Base64 PDF content (Required)
        docName: "sample.pdf",                        // Source PDF file name with .pdf extension (Required)
        initialValue: formFieldConfig.initialValue,   // Initial value for form field (Required)
        positionX: formFieldConfig.positionX,         // X position of the form field (Required)
        positionY: formFieldConfig.positionY,         // Y position of the form field (Required)
        fieldName: formFieldConfig.fieldName,         // Name of the form field (Required)
        Size: formFieldConfig.size,                   // Size of the form field (Required)
        pages: formFieldConfig.pages,                 // Page indices as comma-separated values or ranges (Required)
        formFieldType: formFieldConfig.formFieldType, // Form field type - TextBox or CheckBox (Required)
        async: true                                   // Asynchronous processing
    };

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending PDF to PDF4Me API for adding form fields...");

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
        console.log("Form fields added successfully!");
        return await response.arrayBuffer();

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the form field addition result and saves the PDF file
 * Supports both binary PDF data and base64 encoded responses
 */
async function handleFormFieldResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations
        const buffer = Buffer.from(result);
        
        // Validate that we have a PDF (check for PDF header)
        if (buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF') {
            console.log("Response is a valid PDF file");
            fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
            console.log(`Form fields PDF saved successfully: ${OUTPUT_PDF_PATH}`);
            console.log(`Output file size: ${buffer.length} bytes`);
            console.log("Form fields have been added to the PDF document");
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
                console.log(`Form fields PDF saved to ${OUTPUT_PDF_PATH}`);
                console.log("Form fields have been added to the PDF document");
            } else {
                console.log("No PDF data found in the response.");
                console.log("Full response:", JSON.stringify(jsonResponse, null, 2));
            }

        } catch (jsonError) {
            console.log("Failed to parse JSON response, treating as binary data");
            // If JSON parsing fails, try to save as binary anyway
            if (buffer.length > 1000) {
                fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
                console.log(`Form fields PDF saved to ${OUTPUT_PDF_PATH} (as binary data)`);
                console.log("Form fields have been added to the PDF document");
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
            // Poll the location URL for completion
            const statusResponse = await fetch(locationUrl, {
                method: 'GET',
                headers: headers
            });

            console.log(`Poll response status: ${statusResponse.status}`);

            if (statusResponse.status === 200) {
                // Processing completed successfully
                console.log("Processing completed!");
                return await statusResponse.arrayBuffer();

            } else if (statusResponse.status === 202) {
                // Still processing, continue polling
                console.log("Still processing...");
                continue;

            } else {
                // Error during polling
                const errorText = await statusResponse.text();
                throw new Error(`Error during polling: ${statusResponse.status} - ${errorText}`);
            }

        } catch (error) {
            console.log(`Error polling status: ${error.message}`);
            
            // If this is the last attempt, throw the error
            if (attempt === MAX_RETRIES) {
                throw error;
            }
            
            // Otherwise, continue to next attempt
            continue;
        }
    }

    // If we get here, we've exhausted all retries
    throw new Error("Timeout: Processing did not complete after multiple retries");
}

/**
 * Utility function to validate PDF file format
 * Checks if the file has a valid PDF header
 */
function isValidPdf(buffer) {
    if (buffer.length < 4) return false;
    const header = buffer.toString('ascii', 0, 4);
    return header === '%PDF';
}

// Execute the main function when script is run directly
if (require.main === module) {
    addFormFieldsToPdf().catch(error => {
        console.error("Application error:", error.message);
        process.exit(1);
    });
}

module.exports = {
    addFormFieldsToPdf,
    processFormFieldAddition,
    handleFormFieldResult,
    pollForCompletion
}; 