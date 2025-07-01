const fs = require('fs');
const path = require('path');

/**
 * PDF Signer using PDF4Me API
 * Adds signature images to PDF documents with control over position, size, and appearance
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for adding signatures to PDF documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/SignPdf`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";           // Path to the main PDF file
const SIGNATURE_IMAGE_PATH = "dev.jpg";        // Path to the signature image file
const OUTPUT_PDF_PATH = "Add_sign_to_PDF_output.pdf"; // Output PDF file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the PDF signing process
 * Handles file validation, signing, and result processing
 */
async function signPdf() {
    console.log("Starting PDF Signing Process...");
    console.log("This adds signature images to PDF documents");
    console.log("Controls position, size, opacity, and appearance");
    console.log("-".repeat(60));

    try {
        // Validate input files exist
        if (!fs.existsSync(INPUT_PDF_PATH)) {
            throw new Error(`Input PDF file not found: ${INPUT_PDF_PATH}`);
        }

        if (!fs.existsSync(SIGNATURE_IMAGE_PATH)) {
            throw new Error(`Signature image file not found: ${SIGNATURE_IMAGE_PATH}`);
        }

        console.log(`Signing: ${INPUT_PDF_PATH} with ${SIGNATURE_IMAGE_PATH} → ${OUTPUT_PDF_PATH}`);

        // Process the signing
        const result = await processPdfSigning();

        // Handle the result
        await handleSigningResult(result);

    } catch (error) {
        console.error("Signing failed:", error.message);
        process.exit(1);
    }
}

/**
 * Core signing logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processPdfSigning() {
    // Read and encode PDF file to base64
    console.log("Reading and encoding PDF file...");
    const pdfContent = fs.readFileSync(INPUT_PDF_PATH);
    const pdfBase64 = pdfContent.toString('base64');
    console.log(`PDF file read successfully: ${pdfContent.length} bytes`);

    // Read and encode signature image file to base64
    console.log("Reading and encoding signature image...");
    const signatureContent = fs.readFileSync(SIGNATURE_IMAGE_PATH);
    const signatureBase64 = signatureContent.toString('base64');
    console.log(`Signature image read successfully: ${signatureContent.length} bytes`);

    // Prepare the signing payload with all available options
    const payload = {
        docContent: pdfBase64,                        // Base64 encoded PDF document content
        docName: "output.pdf",                        // Output PDF file name
        imageFile: signatureBase64,                   // Base64 encoded signature image content
        imageName: path.basename(SIGNATURE_IMAGE_PATH), // Signature image file name with extension
        pages: "1-3",                                 // Page options: "1", "1,3,5", "2-5", "1,3,7-10", "2-"
        alignX: "right",                              // Horizontal alignment: "Left", "Center", "Right"
        alignY: "bottom",                             // Vertical alignment: "Top", "Middle", "Bottom"
        widthInMM: "50",                              // Signature width in millimeters (10-200)
        heightInMM: "25",                             // Signature height in millimeters (10-200)
        widthInPx: "142",                             // Signature width in pixels (20-600)
        heightInPx: "71",                             // Signature height in pixels (20-600)
        marginXInMM: "20",                            // Horizontal margin in millimeters (0-100)
        marginYInMM: "20",                            // Vertical margin in millimeters (0-100)
        marginXInPx: "57",                            // Horizontal margin in pixels (0-300)
        marginYInPx: "57",                            // Vertical margin in pixels (0-300)
        opacity: "100",                               // Opacity (0-100): 0=invisible, 100=fully opaque
        showOnlyInPrint: true,                        // Show signature in view and print (true/false)
        isBackground: false,                          // Place signature in background/foreground (true/false)
        async: true                                   // Enable asynchronous processing
    };

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending signature request to PDF4Me API...");
    console.log(`Signature position: ${payload.alignX} ${payload.alignY}`);
    console.log(`Signature size: ${payload.widthInMM}mm x ${payload.heightInMM}mm`);

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
        console.log("PDF signing completed immediately!");
        return await response.arrayBuffer();

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the signing result and saves the signed PDF file
 * Supports both binary PDF data and base64 encoded responses
 */
async function handleSigningResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations
        const buffer = Buffer.from(result);
        
        // Validate that we have a PDF (check for PDF header)
        if (buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF') {
            console.log("Response is a valid PDF file");
            fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
            console.log(`Signed PDF saved successfully to: ${OUTPUT_PDF_PATH}`);
            console.log("Signature has been added to the PDF document");
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
                console.log(`Signed PDF saved to ${OUTPUT_PDF_PATH}`);
                console.log("Signature has been added to the PDF document");
            } else {
                console.log("No PDF data found in the response.");
                console.log("Full response:", JSON.stringify(jsonResponse, null, 2));
            }

        } catch (jsonError) {
            console.log("Failed to parse JSON response, treating as binary data");
            // If JSON parsing fails, try to save as binary anyway
            if (buffer.length > 1000) {
                fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
                console.log(`Signed PDF saved to ${OUTPUT_PDF_PATH} (as binary data)`);
                console.log("Signature has been added to the PDF document");
            } else {
                console.log("Warning: Response doesn't appear to be a valid PDF");
                console.log(`First 100 bytes: ${buffer.toString('hex', 0, 100)}`);
            }
        }

    } catch (error) {
        throw new Error(`Error saving signed PDF: ${error.message}`);
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
            const response = await fetch(locationUrl, {
                method: 'GET',
                headers: headers
            });

            if (response.status === 200) {
                // Success - processing completed
                console.log("PDF signing completed!");
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

    throw new Error("Processing did not complete within the expected time");
}

// Run the function when script is executed directly
if (require.main === module) {
    console.log("Adding signature to PDF...");
    signPdf();
}

module.exports = { signPdf }; 