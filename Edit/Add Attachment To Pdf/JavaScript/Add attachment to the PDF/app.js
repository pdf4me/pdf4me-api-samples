const fs = require('fs');
const path = require('path');

/**
 * Add file attachments to PDF documents using PDF4Me API
 * Process: Read PDF & Attachment → Encode to base64 → Send API request → Poll for completion → Save PDF with attachments
 * This action allows attaching files (like .txt, .doc, .jpg, etc.) to PDF documents for additional document management
 */

// API Configuration - PDF4Me service for adding file attachments to PDF documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/AddAttachmentToPdf`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                    // Path to the main PDF file
const ATTACHMENT_FILE_PATH = "sample.txt";              // Path to the attachment file
const OUTPUT_PDF_PATH = "Add_attachment_to_PDF_output.pdf"; // Output PDF file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the PDF attachment process
 * Handles file validation, attachment addition, and result processing
 */
async function addAttachmentToPdf() {
    console.log("Starting PDF Attachment Process...");
    console.log("This adds file attachments to PDF documents");
    console.log("Supports various file types: .txt, .doc, .jpg, .png, etc.");
    console.log("-".repeat(60));

    try {
        // Validate input files exist
        if (!fs.existsSync(INPUT_PDF_PATH)) {
            throw new Error(`PDF file not found: ${INPUT_PDF_PATH}`);
        }

        if (!fs.existsSync(ATTACHMENT_FILE_PATH)) {
            throw new Error(`Attachment file not found: ${ATTACHMENT_FILE_PATH}`);
        }

        console.log(`Adding attachment: ${ATTACHMENT_FILE_PATH} → ${INPUT_PDF_PATH}`);
        console.log(`Output: ${OUTPUT_PDF_PATH}`);

        // Process the attachment addition
        const result = await processAttachmentAddition();

        // Handle the result
        await handleAttachmentResult(result);

    } catch (error) {
        console.error("Attachment process failed:", error.message);
        process.exit(1);
    }
}

/**
 * Core attachment logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processAttachmentAddition() {
    // Read and encode PDF file to base64
    console.log("Reading and encoding PDF file...");
    const pdfContent = fs.readFileSync(INPUT_PDF_PATH);
    const pdfBase64 = pdfContent.toString('base64');
    console.log(`PDF file read successfully: ${pdfContent.length} bytes`);

    // Read and encode attachment file to base64
    console.log("Reading and encoding attachment file...");
    const attachmentContent = fs.readFileSync(ATTACHMENT_FILE_PATH);
    const attachmentBase64 = attachmentContent.toString('base64');
    console.log(`Attachment file read successfully: ${attachmentContent.length} bytes`);

    // Prepare the payload (data) to send to the API
    const payload = {
        docName: "output.pdf",                          // Output PDF file name
        docContent: pdfBase64,                          // Base64 encoded PDF document content
        attachments: [                                  // Array of attachments to add to the PDF
            {
                docName: path.basename(ATTACHMENT_FILE_PATH),  // Attachment file name with extension
                docContent: attachmentBase64            // Base64 encoded attachment content
            }
        ],
        async: true                                     // Enable asynchronous processing
    };

    // Set up HTTP headers for the API request
    const headers = {
        "Authorization": `Basic ${API_KEY}`,            // Authentication using provided API key
        "Content-Type": "application/json"              // Specify that we're sending JSON data
    };

    console.log("Sending attachment request to PDF4Me API...");

    // Make the API request to add attachments to the PDF
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });

    console.log(`Status code: ${response.status}`);

    // Handle different response scenarios based on status code
    if (response.status === 200) {
        // 200 - Success: attachment addition completed immediately
        console.log("✓ Success! Attachment addition completed!");
        return await response.arrayBuffer();

    } else if (response.status === 202) {
        // 202 - Accepted: API is processing the request asynchronously
        console.log("202 - Request accepted. Processing asynchronously...");

        // Get the polling URL from the Location header for checking status
        const locationUrl = response.headers.get('Location');
        if (!locationUrl) {
            throw new Error("No polling URL found in response");
        }

        return await pollForCompletion(locationUrl, headers);

    } else {
        // Handle API errors
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the attachment result and saves the PDF file
 * Supports both binary PDF data and base64 encoded responses
 */
async function handleAttachmentResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations
        const buffer = Buffer.from(result);

        // Validate that we have a PDF (check for PDF header)
        if (buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF') {
            console.log("Response is a valid PDF file");
            fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
            console.log(`File saved: ${OUTPUT_PDF_PATH}`);
            console.log("📎 To access the attachment, open the PDF in a PDF viewer and look for the attachment panel");
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
                console.log(`File saved: ${OUTPUT_PDF_PATH}`);
                console.log("📎 To access the attachment, open the PDF in a PDF viewer and look for the attachment panel");
            } else {
                console.log("No PDF data found in the response.");
                console.log("Full response:", JSON.stringify(jsonResponse, null, 2));
            }

        } catch (jsonError) {
            console.log("Failed to parse JSON response, treating as binary data");
            // If JSON parsing fails, try to save as binary anyway
            if (buffer.length > 1000) {
                fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
                console.log(`File saved: ${OUTPUT_PDF_PATH} (as binary data)`);
                console.log("📎 To access the attachment, open the PDF in a PDF viewer and look for the attachment panel");
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
                // 200 - Success: Processing completed
                console.log("✓ Success! Attachment addition completed!");
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

    throw new Error(`Timeout: Processing did not complete after ${MAX_RETRIES} retries`);
}

// Main execution - Run the attachment process when script is executed directly
if (require.main === module) {
    addAttachmentToPdf().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = { addAttachmentToPdf, processAttachmentAddition, handleAttachmentResult }; 