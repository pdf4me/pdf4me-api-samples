const fs = require('fs');
const path = require('path');

/**
 * HTML to PDF Converter using PDF4Me API
 * Converts HTML files to PDF documents with styling and formatting preserved
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for converting HTML to PDF documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ConvertHtmlToPdf`;

// File paths configuration
const INPUT_HTML_PATH = "sample.html";           // Path to input HTML file
const OUTPUT_PDF_PATH = "HTML_to_PDF_output.pdf"; // Output PDF file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the HTML to PDF conversion process
 * Handles file validation, conversion, and result processing
 */
async function convertHtmlToPdf() {
    console.log("Starting HTML to PDF Conversion Process...");
    console.log("This converts HTML web content into PDF documents");
    console.log("Preserves styling, layout, images, and formatting");
    console.log("-".repeat(60));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_HTML_PATH)) {
            throw new Error(`Input HTML file not found: ${INPUT_HTML_PATH}`);
        }

        console.log(`Converting: ${INPUT_HTML_PATH} → ${OUTPUT_PDF_PATH}`);

        // Process the conversion
        const result = await processHtmlToPdfConversion();

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
async function processHtmlToPdfConversion() {
    // Read and encode HTML file to base64
    console.log("Reading and encoding HTML file...");
    const htmlContent = fs.readFileSync(INPUT_HTML_PATH);
    const htmlBase64 = htmlContent.toString('base64');
    console.log("HTML file successfully encoded to base64");

    // Prepare the conversion payload with all available options
    const payload = {
        docContent: htmlBase64,           // Base64 encoded HTML document content
        docName: "output.pdf",            // Name for the output file
        indexFilePath: INPUT_HTML_PATH,   // Path to the source HTML file (required by API)
        layout: "Portrait",               // Page orientation: Portrait or Landscape
        format: "A4",                     // Page size: A4, Letter, A5, A6, etc.
        scale: 0.8,                       // Scaling factor for content (0.1 to 2.0)
        topMargin: "40px",                // Top margin spacing
        bottomMargin: "40px",             // Bottom margin spacing
        leftMargin: "40px",               // Left margin spacing
        rightMargin: "40px",              // Right margin spacing
        printBackground: true,            // Include background colors and images
        displayHeaderFooter: true,        // Show header and footer in PDF
        async: true                       // Enable asynchronous processing
    };

    // Additional payload options you can customize:
    // - "layout": "Landscape" for horizontal orientation
    // - "format": "Letter", "A5", "A6" for different page sizes
    // - "scale": 1.0 for original size, 0.5 for half size, 2.0 for double size
    // - "printBackground": false to exclude backgrounds
    // - "displayHeaderFooter": false to hide headers/footers

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending request to PDF4Me API...");
    console.log(`Page format: ${payload.format} ${payload.layout}`);

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
        console.log("HTML to PDF conversion completed immediately!");
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
            console.log("HTML content has been converted to PDF format");
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
                console.log("HTML content has been converted to PDF format");
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
                console.log("HTML content has been converted to PDF format");
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
                console.log("HTML to PDF conversion completed successfully!");
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

    throw new Error(`Timeout: HTML to PDF conversion did not complete after ${MAX_RETRIES} retries`);
}

// Main execution - Run the conversion when script is executed directly
if (require.main === module) {
    convertHtmlToPdf().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = { convertHtmlToPdf, processHtmlToPdfConversion, handleConversionResult }; 