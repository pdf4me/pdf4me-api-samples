const fs = require('fs');
const path = require('path');

/**
 * Visio to PDF Converter using PDF4Me API
 * Converts Visio files (.vsdx, .vsd, .vsdm) to PDF documents
 * Supports both synchronous and asynchronous processing with retry logic
 * Can also convert to JPG, PNG, and TIFF formats
 */

// API Configuration - PDF4Me service for converting Visio files
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ConvertVisio?schemaVal=PDF`;

// File paths configuration
const INPUT_VISIO_PATH = "E-Commerce.vsdx";           // Path to input Visio file (.vsdx, .vsd, .vsdm)
const OUTPUT_PDF_PATH = "VISIO_to_PDF_output.pdf";    // Output PDF file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the Visio to PDF conversion process
 * Handles file validation, conversion, and result processing
 */
async function convertVisioToPdf() {
    console.log("Starting Visio to PDF Conversion Process...");
    console.log("This converts Visio diagrams into PDF documents");
    console.log("Supports .vsdx, .vsd, and .vsdm file formats");
    console.log("-".repeat(60));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_VISIO_PATH)) {
            throw new Error(`Input Visio file not found: ${INPUT_VISIO_PATH}`);
        }

        console.log(`Converting: ${INPUT_VISIO_PATH} → ${OUTPUT_PDF_PATH}`);

        // Process the conversion
        const result = await processVisioToPdfConversion();

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
async function processVisioToPdfConversion() {
    // Read and encode Visio file to base64
    console.log("Reading and encoding Visio file...");
    const visioContent = fs.readFileSync(INPUT_VISIO_PATH);
    const visioBase64 = visioContent.toString('base64');
    console.log("Visio file successfully encoded to base64");

    // Prepare the conversion payload with all available options
    const payload = {
        docContent: visioBase64,          // Base64 encoded Visio document content
        docName: "output",                // Name for the output file
        OutputFormat: "PDF",              // Desired output format (PDF/JPG/PNG/TIFF)
        IsPdfCompliant: true,             // Make PDF compliant with standards
        PageIndex: 0,                     // Start from first page (0-indexed)
        PageCount: 5,                     // Number of pages to convert
        IncludeHiddenPages: true,         // Include hidden pages in conversion
        SaveForegroundPage: true,         // Save foreground elements
        SaveToolBar: true,                // Include toolbar in conversion
        AutoFit: true,                    // Auto-fit content to page
        async: true                       // Enable asynchronous processing
    };

    // Alternative payload examples for other output formats:
    
    // For JPG Output - Image format with quality settings
    // const payload = {
    //     docContent: visioBase64,
    //     docName: "output",
    //     OutputFormat: "JPG",               // JPEG image format
    //     PageIndex: 0,
    //     PageCount: 5,
    //     JpegQuality: 80,                   // Image quality (0-100, higher = better quality)
    //     ImageBrightness: 1.0,              // Brightness adjustment (1.0 = normal)
    //     ImageContrast: 1.0,                // Contrast adjustment (1.0 = normal)
    //     ImageColorMode: "RGB",             // Color mode: RGB or Grayscale
    //     CompositingQuality: "HighQuality", // Quality of image compositing
    //     InterpolationMode: "High",         // Image scaling quality
    //     PixelOffsetMode: "HighQuality",    // Pixel rendering quality
    //     Resolution: 300,                   // DPI resolution (300 = high quality)
    //     Scale: 1.0,                        // Scaling factor (1.0 = original size)
    //     SmoothingMode: "HighQuality",      // Anti-aliasing quality
    //     AutoFit: true,
    //     async: true
    // };

    // For PNG Output - Lossless image format with transparency support
    // const payload = {
    //     docContent: visioBase64,
    //     docName: "output",
    //     OutputFormat: "PNG",               // PNG image format (supports transparency)
    //     PageIndex: 0,
    //     PageCount: 5,
    //     ImageBrightness: 1.0,
    //     ImageContrast: 1.0,
    //     ImageColorMode: "RGBA",            // RGBA (with alpha/transparency) or RGB
    //     CompositingQuality: "HighQuality",
    //     InterpolationMode: "High",
    //     PixelOffsetMode: "HighQuality",
    //     Resolution: 300,
    //     Scale: 1.0,
    //     SmoothingMode: "HighQuality",
    //     AutoFit: true,
    //     async: true
    // };

    // For TIFF Output - High-quality format often used for archival/printing
    // const payload = {
    //     docContent: visioBase64,
    //     docName: "output",
    //     OutputFormat: "TIFF",              // TIFF image format
    //     PageIndex: 0,
    //     PageCount: 5,
    //     ImageBrightness: 1.0,
    //     ImageContrast: 1.0,
    //     ImageColorMode: "Grayscale",       // Grayscale or RGB
    //     TiffCompression: "LZW",            // Compression: LZW, None, or CCITT4
    //     Resolution: 300,
    //     Scale: 1.0,
    //     SmoothingMode: "HighQuality",
    //     AutoFit: true,
    //     async: true
    // };

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending request to PDF4Me API...");
    console.log(`Output format: ${payload.OutputFormat}`);

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
        console.log("Visio to PDF conversion completed immediately!");
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
            console.log("Visio diagram has been converted to PDF format");
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
                console.log("Visio diagram has been converted to PDF format");
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
                console.log("Visio diagram has been converted to PDF format");
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
                console.log("Visio to PDF conversion completed successfully!");
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

    throw new Error(`Timeout: Visio to PDF conversion did not complete after ${MAX_RETRIES} retries`);
}

// Main execution - Run the conversion when script is executed directly
if (require.main === module) {
    convertVisioToPdf().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = { convertVisioToPdf, processVisioToPdfConversion, handleConversionResult }; 