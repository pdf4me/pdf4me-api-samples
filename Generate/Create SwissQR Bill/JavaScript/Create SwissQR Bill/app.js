const fs = require('fs');
const path = require('path');

/**
 * Swiss QR Bill Creator using PDF4Me API
 * Creates Swiss QR Bills from PDF documents with payment details
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for creating Swiss QR Bills
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/CreateSwissQrBill`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                    // Path to input PDF file
const OUTPUT_PDF_PATH = "sample.swissqr.pdf";          // Output Swiss QR Bill PDF file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the Swiss QR Bill creation process
 * Handles file validation, QR bill creation, and result processing
 */
async function createSwissQrBill() {
    console.log("Starting Swiss QR Bill Creation Process");
    console.log("This creates Swiss QR Bills with payment details from PDF documents");
    console.log("QR code contains all necessary information for Swiss banking");
    console.log("-".repeat(60));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_PDF_PATH)) {
            throw new Error(`Input PDF file not found: ${INPUT_PDF_PATH}`);
        }

        console.log(`Creating Swiss QR Bill: ${INPUT_PDF_PATH} → ${OUTPUT_PDF_PATH}`);
        console.log("QR Bill Details:");
        console.log("  Creditor: Test AG, Test Strasse 1, 8000 Zurich");
        console.log("  Debtor: Test Debt AG, Test Deb Strasse 2, 8000 Zurich");
        console.log("  Amount: CHF 1000");
        console.log("  IBAN: CH0200700110003765824");
        console.log("  Language: English");

        // Process the Swiss QR Bill creation
        const result = await processSwissQrBillCreation();

        // Handle the result
        await handleCreationResult(result);

    } catch (error) {
        console.error("Swiss QR Bill creation failed:", error.message);
        process.exit(1);
    }
}

/**
 * Core Swiss QR Bill creation logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processSwissQrBillCreation() {
    // Read and encode PDF file to base64
    console.log("Reading and encoding PDF file...");
    const pdfContent = fs.readFileSync(INPUT_PDF_PATH);
    const pdfBase64 = pdfContent.toString('base64');
    console.log(`PDF file read successfully: ${pdfContent.length} bytes`);

    // Prepare the Swiss QR Bill payload with all required parameters
    const payload = {
        docContent: pdfBase64,                              // Base64 encoded PDF content (Required)
        docName: "test.pdf",                                // Document name (Required)
        iban: "CH0200700110003765824",                      // Swiss IBAN for the creditor (Required)
        crName: "Test AG",                                  // Creditor name (Required)
        crAddressType: "S",                                 // Creditor address type (S = Structured) (Required)
        crStreetOrAddressLine1: "Test Strasse",             // Creditor street (Required)
        crStreetOrAddressLine2: "1",                        // Creditor street number (Required)
        crPostalCode: "8000",                               // Creditor postal code (Required)
        crCity: "Zurich",                                   // Creditor city (Required)
        amount: "1000",                                     // Payment amount (Required)
        currency: "CHF",                                    // Currency (Swiss Franc) (Required)
        udName: "Test Debt AG",                             // Ultimate debtor name (Required)
        udAddressType: "S",                                 // Ultimate debtor address type (Required)
        udStreetOrAddressLine1: "Test Deb Strasse",         // Ultimate debtor street (Required)
        udStreetOrAddressLine2: "2",                        // Ultimate debtor street number (Required)
        udPostalCode: "8000",                               // Ultimate debtor postal code (Required)
        udCity: "Zurich",                                   // Ultimate debtor city (Required)
        referenceType: "NON",                               // Reference type (NON = No reference) (Required)
        languageType: "English",                            // Language for the QR bill (Required)
        seperatorLine: "LineWithScissor",                   // Separator line style (Required)
        async: true                                         // Enable asynchronous processing
    };

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending PDF to PDF4Me API for Swiss QR Bill creation...");

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
        console.log("Success! Swiss QR Bill created successfully!");
        return await response.arrayBuffer();

    } else if (response.status === 202) {
        // Asynchronous processing - poll for completion
        console.log("Request accepted. Processing asynchronously...");
        
        const locationUrl = response.headers.get('Location');
        if (!locationUrl) {
            throw new Error("No 'Location' header found in the response for polling");
        }

        return await pollForCompletion(locationUrl, headers);

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the creation result and saves the Swiss QR Bill PDF file
 * Supports both binary PDF data and base64 encoded responses
 */
async function handleCreationResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations
        const buffer = Buffer.from(result);
        
        // Validate that we have a PDF (check for PDF header)
        if (buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF') {
            console.log("Response is a valid PDF file");
            fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
            console.log(`Swiss QR Bill PDF saved successfully: ${OUTPUT_PDF_PATH}`);
            console.log(`Output file size: ${buffer.length} bytes`);
            console.log("Swiss QR Bill has been generated with all payment details");
            console.log("The QR code contains all necessary information for Swiss banking");
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
                console.log(`Swiss QR Bill PDF saved: ${OUTPUT_PDF_PATH}`);
                console.log(`Output file size: ${pdfBytes.length} bytes`);
                console.log("Swiss QR Bill has been generated with all payment details");
                console.log("The QR code contains all necessary information for Swiss banking");
            } else {
                console.log("No PDF data found in the response.");
                console.log("Full response:", JSON.stringify(jsonResponse, null, 2));
            }

        } catch (jsonError) {
            console.log("Failed to parse JSON response, treating as binary data");
            // If JSON parsing fails, try to save as binary anyway
            if (buffer.length > 1000) {
                fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
                console.log(`Swiss QR Bill PDF saved: ${OUTPUT_PDF_PATH} (as binary data)`);
                console.log(`Output file size: ${buffer.length} bytes`);
                console.log("Swiss QR Bill has been generated with all payment details");
                console.log("The QR code contains all necessary information for Swiss banking");
            } else {
                console.log("Warning: Response doesn't appear to be a valid PDF");
                console.log(`First 100 bytes: ${buffer.toString('hex', 0, 100)}`);
            }
        }

    } catch (error) {
        throw new Error(`Error saving Swiss QR Bill PDF: ${error.message}`);
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
        
        // Wait before polling (except for first attempt)
        if (attempt > 1) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }

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
 * Utility function to read and encode PDF file to base64
 * Validates file existence and handles encoding errors
 */
function readAndEncodePdf(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`PDF file not found: ${filePath}`);
    }

    try {
        const pdfContent = fs.readFileSync(filePath);
        const base64Content = pdfContent.toString('base64');
        console.log(`PDF file read successfully: ${pdfContent.length} bytes`);
        return base64Content;
    } catch (error) {
        throw new Error(`Error reading PDF file: ${error.message}`);
    }
}

// Execute the main function when script is run directly
if (require.main === module) {
    createSwissQrBill().catch(error => {
        console.error("Swiss QR Bill creation failed:", error.message);
        process.exit(1);
    });
}

module.exports = {
    createSwissQrBill,
    processSwissQrBillCreation,
    handleCreationResult,
    pollForCompletion,
    readAndEncodePdf
}; 