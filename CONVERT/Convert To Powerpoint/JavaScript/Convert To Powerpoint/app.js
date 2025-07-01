const fs = require('fs');
const path = require('path');

/**
 * PDF to PowerPoint Converter using PDF4Me API
 * Converts PDF documents to PowerPoint presentations with editable slides
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for converting PDF documents to PowerPoint presentations
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ConvertPdfToPowerPoint`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                    // Path to input PDF file
const OUTPUT_PPT_PATH = "PDF_to_Powerpoint_output.pptx"; // Output PowerPoint file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the PDF to PowerPoint conversion process
 * Handles file validation, conversion, and result processing
 */
async function convertPdfToPowerpoint() {
    console.log("Starting PDF to PowerPoint Conversion Process...");
    console.log("This transforms PDF pages into editable PowerPoint presentation slides");
    console.log("Perfect for converting reports, documents, and presentations back to editable format");
    console.log("The process handles both text-based and scanned PDFs using OCR technology");
    console.log("-".repeat(85));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_PDF_PATH)) {
            throw new Error(`Input PDF file not found: ${INPUT_PDF_PATH}`);
        }

        console.log(`Converting: ${INPUT_PDF_PATH} → ${OUTPUT_PPT_PATH}`);

        // Process the conversion
        const result = await processPdfToPowerpointConversion();

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
async function processPdfToPowerpointConversion() {
    // Read and encode PDF file to base64
    console.log("Reading and encoding PDF file...");
    const pdfContent = fs.readFileSync(INPUT_PDF_PATH);
    const pdfBase64 = pdfContent.toString('base64');
    console.log("PDF file successfully encoded to base64");

    // Prepare the conversion payload with all available options
    const payload = {
        docContent: pdfBase64,        // Base64 encoded PDF document content
        docName: "output.pdf",        // Name of the source PDF file for reference
        qualityType: "Draft",         // Quality setting: Draft (faster) or Quality (better accuracy)
        language: "English",          // OCR language for text recognition in images/scanned PDFs
        ocrWhenNeeded: true,          // Use OCR (Optical Character Recognition) for scanned PDFs
        outputFormat: true,           // Preserve original formatting when possible
        mergeAllSheets: true,         // Combine content appropriately for presentation format
        async: true                   // Enable asynchronous processing
    };

    // About PDF to PowerPoint conversion features:
    // - qualityType "Draft": Faster conversion, good for simple PDFs with clear content
    // - qualityType "Quality": Slower but more accurate, better for complex layouts
    // - ocrWhenNeeded: Essential for scanned PDFs or PDFs with image-based text
    // - language: Improves OCR accuracy for non-English text recognition
    // - outputFormat: Tries to maintain original fonts, colors, and layout structure
    // - mergeAllSheets: Organizes multiple PDF pages into coherent slide sequence

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending PDF to PowerPoint conversion request to PDF4Me API...");
    console.log("Transforming PDF pages into editable presentation slides...");
    console.log(`Quality setting: ${payload.qualityType}`);
    console.log(`OCR enabled: ${payload.ocrWhenNeeded}`);

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
        console.log("Request accepted. PDF4Me is processing the conversion asynchronously...");
        
        const locationUrl = response.headers.get('Location');
        if (!locationUrl) {
            throw new Error("No 'Location' header found in the response for polling");
        }

        console.log(`Location URL for polling: ${locationUrl}`);
        return await pollForCompletion(locationUrl, headers);

    } else if (response.status === 200) {
        // Synchronous processing - immediate result
        console.log("PDF to PowerPoint conversion completed immediately!");
        return await response.arrayBuffer();

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the conversion result and saves the PowerPoint file
 * Supports both binary PowerPoint data and base64 encoded responses
 */
async function handleConversionResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations
        const buffer = Buffer.from(result);
        
        // Validate that we have a PowerPoint file (check for PowerPoint file signatures)
        const isPowerPointFile = validatePowerPointFile(buffer);
        
        if (isPowerPointFile) {
            console.log("Response is a valid PowerPoint file");
            fs.writeFileSync(OUTPUT_PPT_PATH, buffer);
            console.log(`PowerPoint file saved successfully to: ${OUTPUT_PPT_PATH}`);
            console.log("PDF content has been transformed into editable presentation slides");
            console.log("You can now open the file in Microsoft PowerPoint, LibreOffice Impress, or Google Slides");
            return;
        }

        // Try to parse as JSON if not a direct PowerPoint file
        try {
            const jsonResponse = JSON.parse(buffer.toString());
            console.log("Successfully parsed JSON response");
            
            // Look for PowerPoint data in different possible JSON locations
            let pptBase64 = null;
            if (jsonResponse.document && jsonResponse.document.docData) {
                pptBase64 = jsonResponse.document.docData;  // Common location 1
            } else if (jsonResponse.docData) {
                pptBase64 = jsonResponse.docData;           // Common location 2
            } else if (jsonResponse.data) {
                pptBase64 = jsonResponse.data;              // Alternative location
            }

            if (pptBase64) {
                // Decode base64 PowerPoint data and save to file
                const pptBytes = Buffer.from(pptBase64, 'base64');
                if (validatePowerPointFile(pptBytes)) {
                    fs.writeFileSync(OUTPUT_PPT_PATH, pptBytes);
                    console.log(`PowerPoint saved to ${OUTPUT_PPT_PATH}`);
                    console.log("PDF content has been transformed into editable presentation slides");
                } else {
                    console.log("Warning: Decoded data doesn't appear to be a valid PowerPoint file");
                }
            } else {
                console.log("No PowerPoint data found in the response.");
                console.log("Full response:", JSON.stringify(jsonResponse, null, 2));
            }

        } catch (jsonError) {
            console.log("Failed to parse JSON response, treating as binary data");
            // If JSON parsing fails, try to save as binary anyway
            if (buffer.length > 1000) {
                fs.writeFileSync(OUTPUT_PPT_PATH, buffer);
                console.log(`PowerPoint saved to ${OUTPUT_PPT_PATH} (as binary data)`);
                console.log("PDF content has been transformed into editable presentation slides");
            } else {
                console.log("Warning: Response doesn't appear to be a valid PowerPoint file");
                console.log(`First 100 bytes: ${buffer.toString('hex', 0, 100)}`);
            }
        }

    } catch (error) {
        throw new Error(`Error saving PowerPoint: ${error.message}`);
    }
}

/**
 * Validates if the buffer contains a PowerPoint file by checking file signatures
 * Supports both .pptx (ZIP-based) and .ppt (OLE-based) formats
 */
function validatePowerPointFile(buffer) {
    if (buffer.length < 4) return false;
    
    // Check for .pptx format (ZIP-based - starts with PK\x03\x04)
    if (buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) {
        return true;
    }
    
    // Check for .ppt format (OLE-based - starts with D0 CF 11 E0)
    if (buffer[0] === 0xD0 && buffer[1] === 0xCF && buffer[2] === 0x11 && buffer[3] === 0xE0) {
        return true;
    }
    
    return false;
}

/**
 * Polls the API for async completion with retry logic
 * Handles 202 (processing) and 200 (completed) status codes
 */
async function pollForCompletion(locationUrl, headers) {
    console.log(`Polling URL: ${locationUrl}`);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        console.log(`Waiting for conversion result... (Attempt ${attempt}/${MAX_RETRIES})`);
        console.log("Processing PDF content and creating PowerPoint slides...");
        
        // Wait before polling (except on first attempt)
        if (attempt > 1) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }

        try {
            const response = await fetch(locationUrl, {
                method: 'GET',
                headers: headers
            });

            console.log(`Response status code: ${response.status}`);

            if (response.status === 200) {
                // Conversion completed successfully
                console.log("PDF to PowerPoint conversion completed successfully!");
                return await response.arrayBuffer();

            } else if (response.status === 202) {
                // Still processing, continue polling
                console.log("Conversion still in progress...");
                continue;

            } else {
                // Error occurred during processing
                const errorText = await response.text();
                throw new Error(`Unexpected error during conversion: ${response.status}, Response: ${errorText}`);
            }

        } catch (error) {
            if (attempt === MAX_RETRIES) {
                throw new Error(`Polling failed after ${MAX_RETRIES} attempts: ${error.message}`);
            }
            console.log(`Request failed during polling: ${error.message}`);
            console.log("Network error occurred, retrying...");
        }
    }

    throw new Error(`Timeout: PDF to PowerPoint conversion did not complete after ${MAX_RETRIES} retries. The conversion may be taking longer due to PDF complexity or server load.`);
}

// Main execution - Run the conversion when script is executed directly
if (require.main === module) {
    convertPdfToPowerpoint().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = { convertPdfToPowerpoint, processPdfToPowerpointConversion, handleConversionResult }; 