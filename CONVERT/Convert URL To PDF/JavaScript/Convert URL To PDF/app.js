const fs = require('fs');
const path = require('path');

/**
 * URL to PDF Converter using PDF4Me API
 * Converts web URLs to PDF documents with styling and formatting preserved
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for converting web URLs to PDF documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ConvertUrlToPdf`;

// Configuration
const TARGET_URL = "https://en.wikipedia.org/wiki/Microsoft_Power_Automate";  // Web page URL to convert
const OUTPUT_PDF_PATH = "URL_to_PDF_output.pdf";  // Output PDF file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the URL to PDF conversion process
 * Handles URL validation, conversion, and result processing
 */
async function convertUrlToPdf() {
    console.log("Starting URL to PDF Conversion Process...");
    console.log("This converts web pages into PDF documents while preserving layout and styling");
    console.log("Perfect for archiving web content, creating offline documentation, or generating reports");
    console.log("The process captures CSS styles, images, and maintains the original web page appearance");
    console.log("Supports various page formats, margins, and scaling options for optimal PDF output");
    console.log("-".repeat(90));

    try {
        console.log(`Converting web page: ${TARGET_URL}`);
        console.log(`Output file: ${OUTPUT_PDF_PATH}`);
        console.log("Capturing web page with all styling and layout...");

        // Process the conversion
        const result = await processUrlToPdfConversion();

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
async function processUrlToPdfConversion() {
    // Prepare the conversion payload with all available options
    const payload = {
        webUrl: TARGET_URL,              // Web URL of the page to be converted to PDF
        authType: "NoAuth",              // Authentication type for URL website (NoAuth, Basic, etc.)
        username: "",                    // Username if authentication is required (empty for NoAuth)
        password: "",                    // Password if authentication is required (empty for NoAuth)
        docContent: "",                  // Base64 PDF content (empty for URL conversion)
        docName: OUTPUT_PDF_PATH,        // Output PDF file name with extension
        layout: "portrait",              // Page orientation: "portrait" or "landscape"
        format: "A4",                    // Page format: A0-A8, Tabloid, Legal, Statement, Executive
        scale: 1.0,                      // Scale factor for the web page (decimal format, e.g., 0.8 = 80%)
        topMargin: "20px",               // Top margin of PDF (string format with px unit)
        leftMargin: "20px",              // Left margin of PDF (string format with px unit)
        rightMargin: "20px",             // Right margin of PDF (string format with px unit)
        bottomMargin: "20px",            // Bottom margin of PDF (string format with px unit)
        printBackground: true,           // Include background colors and images (boolean)
        displayHeaderFooter: false,      // Show header and footer in PDF (boolean)
        async: true                      // Enable asynchronous processing
    };

    // About URL to PDF conversion features:
    // - Captures complete web pages including CSS styles, images, and JavaScript elements
    // - Maintains original layout and formatting as closely as possible
    // - Supports various page formats and orientations for different use cases
    // - Can handle both static HTML content and dynamic web pages
    // - Preserves interactive elements like clickable links in the PDF
    // - Customizable margins and scaling for optimal PDF layout
    // - Background printing option for complete visual fidelity

    // Set up HTTP headers for the API request
    const headers = {
        "Content-Type": "application/json",   // We're sending JSON data to the API
        "Authorization": `Basic ${API_KEY}`   // Authentication using Basic auth with API key
    };

    console.log("Sending URL to PDF conversion request to PDF4Me API...");
    console.log(`Page format: ${payload.format} ${payload.layout}`);

    // Make the initial API request
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });

    console.log(`Initial response status code: ${response.status}`);
    console.log(`Response content length: ${response.headers.get('content-length') || 'unknown'} bytes`);

    // Handle different response scenarios based on status code
    if (response.status === 200) {
        // Direct response - conversion completed immediately
        console.log("URL to PDF conversion completed immediately!");
        
        // Check if response is a binary PDF file
        const contentType = response.headers.get('Content-Type', '');
        console.log(`Response Content-Type: ${contentType}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Validate that the response is a PDF file
        if (buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF' || 
            contentType.toLowerCase().includes('pdf') || 
            buffer.length > 1000) {
            
            return buffer;
        } else {
            console.log("Warning: Response doesn't appear to be a valid PDF");
            console.log(`Content-Type: ${contentType}`);
            console.log(`Response size: ${buffer.length} bytes`);
            console.log(`First 200 bytes of response: ${buffer.toString('hex', 0, 200)}`);
            throw new Error("Invalid PDF response received");
        }
        
    } else if (response.status === 202) {
        // 202 means "Accepted" - API is processing the conversion asynchronously
        console.log("Request accepted. PDF4Me is processing the web page conversion asynchronously...");
        
        // Get the polling URL from the Location header
        const locationUrl = response.headers.get('Location');
        console.log(`Location header for polling: ${locationUrl}`);
        
        // Verify that we received a polling URL for checking conversion status
        if (!locationUrl) {
            throw new Error("No 'Location' header found in the response. Cannot proceed without polling URL for checking conversion status.");
        }

        return await pollForCompletion(locationUrl, headers);
        
    } else {
        // Error in initial request
        const errorText = await response.text();
        throw new Error(`Initial request failed with status code: ${response.status}. Response details: ${errorText}`);
    }
}

/**
 * Handles the conversion result and saves the PDF file
 * Supports both binary PDF data and base64 encoded responses
 */
async function handleConversionResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations if needed
        const buffer = Buffer.isBuffer(result) ? result : Buffer.from(result);
        
        // Validate that we have a PDF (check for PDF header)
        if (buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF') {
            console.log("Response is a valid PDF file");
            fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
            console.log(`PDF saved successfully to: ${OUTPUT_PDF_PATH}`);
            console.log("Web page has been converted to PDF format");
            console.log("The PDF preserves the original web page layout, styling, and content");
            console.log(`File size: ${buffer.length} bytes`);
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
                console.log("Web page has been converted to PDF format");
                console.log("The PDF preserves the original web page layout, styling, and content");
                console.log(`File size: ${pdfBytes.length} bytes`);
            } else {
                console.log("No PDF data found in the response.");
                console.log("Full response:", JSON.stringify(jsonResponse, null, 2));
                throw new Error("No PDF data found in JSON response");
            }

        } catch (jsonError) {
            console.log("Failed to parse JSON response, treating as binary data");
            // If JSON parsing fails, try to save as binary anyway
            if (buffer.length > 1000) {
                fs.writeFileSync(OUTPUT_PDF_PATH, buffer);
                console.log(`PDF saved to ${OUTPUT_PDF_PATH} (as binary data)`);
                console.log("Web page has been converted to PDF format");
                console.log("The PDF preserves the original web page layout, styling, and content");
                console.log(`File size: ${buffer.length} bytes`);
            } else {
                console.log("Warning: Response doesn't appear to be a valid PDF");
                console.log(`First 100 bytes: ${buffer.toString('hex', 0, 100)}`);
                throw new Error("Invalid PDF response received");
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
        console.log(`Waiting for conversion result... (Attempt ${attempt}/${MAX_RETRIES})`);
        console.log("Processing web page content and generating PDF...");
        
        // Wait before polling (except on first attempt)
        if (attempt > 1) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }

        try {
            const pollResponse = await fetch(locationUrl, {
                method: 'GET',
                headers: headers
            });
            
            // Display current status for debugging and user feedback
            console.log(`Poll status code: ${pollResponse.status}`);
            
            if (pollResponse.status === 200) {
                // Conversion completed successfully - validate and save the PDF
                console.log("URL to PDF conversion completed successfully!");
                
                // Check the content type to ensure we received a PDF
                const contentType = pollResponse.headers.get("Content-Type", "");
                console.log(`Response Content-Type: ${contentType}`);
                
                const arrayBuffer = await pollResponse.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                
                // Validate that the response is a PDF file
                if (buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF' || 
                    contentType.toLowerCase().includes('pdf') || 
                    buffer.length > 1000) {
                    
                    return buffer;
                } else {
                    console.log("Warning: Response doesn't appear to be a valid PDF");
                    console.log(`Content-Type: ${contentType}`);
                    console.log(`Response size: ${buffer.length} bytes`);
                    console.log(`First 200 bytes of response: ${buffer.toString('hex', 0, 200)}`);
                    throw new Error("Invalid PDF response received during polling");
                }
                
            } else if (pollResponse.status === 202) {
                // Still processing, continue polling
                console.log("Web page conversion still in progress...");
                continue;
            } else {
                // Error occurred during processing
                const errorText = await pollResponse.text();
                throw new Error(`Unexpected error during conversion: ${pollResponse.status}. Error details: ${errorText}`);
            }
                
        } catch (error) {
            // Handle network or request errors during polling
            console.log(`Request failed during polling: ${error.message}`);
            if (attempt < MAX_RETRIES) {
                console.log("Network error occurred, retrying...");
                continue;
            } else {
                throw new Error(`Max retries reached due to network errors. Giving up. Last error: ${error.message}`);
            }
        }
    }

    // If we reach here, polling timed out
    throw new Error(`Timeout: URL to PDF conversion did not complete after ${MAX_RETRIES} retries. The conversion may be taking longer due to web page complexity or server load. Please check if the URL is valid and accessible, then try again later.`);
}

// Main execution - Run the conversion when script is executed directly
if (require.main === module) {
    convertUrlToPdf().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = { convertUrlToPdf, processUrlToPdfConversion, handleConversionResult }; 