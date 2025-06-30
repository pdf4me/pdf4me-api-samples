const fs = require('fs');
const path = require('path');

/**
 * Split PDF by Barcode using PDF4Me API
 * Splits PDF files by Swiss QR barcode or other barcode types
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for splitting PDFs by barcode
const API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/SplitPdfByBarcode_old`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                               // Input PDF file to split
const OUTPUT_DIR = "swiss_qr_split_output";                        // Output directory for split files
const OUTPUT_FILENAME = "swiss_qr_split_result.zip";               // Output archive filename

// Processing configuration
const MAX_RETRIES = 10;                                            // Maximum number of polling retries
const RETRY_DELAY = 10;                                            // Delay between retries in seconds

// Barcode splitting parameters
const BARCODE_STRING = "hello";                                    // Barcode string to search for
const BARCODE_FILTER = "startsWith";                               // Filter type for barcode matching
const BARCODE_TYPE = "qrcode";                                     // Type of barcode
const SPLIT_BARCODE_PAGE = "before";                               // Where to split relative to barcode
const COMBINE_PAGES_WITH_SAME_CONSECUTIVE_BARCODES = true;         // Whether to combine pages with same consecutive barcodes
const PDF_RENDER_DPI = "1";                                        // DPI for PDF rendering

/**
 * Main function to split PDF by barcode
 */
async function main() {
    console.log("=== Splitting PDF by QR Code Barcode ===");
    
    try {
        const result = await splitPdfByBarcode(
            BARCODE_STRING,
            BARCODE_FILTER,
            BARCODE_TYPE,
            SPLIT_BARCODE_PAGE,
            COMBINE_PAGES_WITH_SAME_CONSECUTIVE_BARCODES,
            PDF_RENDER_DPI
        );
        
        if (result) {
            console.log(`\n🎉 PDF splitting completed successfully!`);
            console.log(`📁 Output file: ${result}`);
            
            // Get file stats for additional info
            const stats = fs.statSync(result);
            console.log(`📊 File size: ${stats.size.toLocaleString()} bytes`);
        } else {
            console.log("❌ PDF splitting failed.");
        }
    } catch (error) {
        console.error("❌ Error in main:", error.message);
        process.exit(1);
    }
}

/**
 * Splits PDF by barcode using PDF4Me service
 * @param {string} barcodeString - Barcode string to search for
 * @param {string} barcodeFilter - Filter type for barcode matching
 * @param {string} barcodeType - Type of barcode
 * @param {string} splitBarcodePage - Where to split relative to barcode
 * @param {boolean} combinePagesWithSameConsecutiveBarcodes - Whether to combine pages with same consecutive barcodes
 * @param {string} pdfRenderDpi - DPI for PDF rendering
 * @returns {Promise<string|null>} - Path to the split PDF files archive, or null if failed
 */
async function splitPdfByBarcode(
    barcodeString,
    barcodeFilter = "startsWith",
    barcodeType = "qrcode",
    splitBarcodePage = "before",
    combinePagesWithSameConsecutiveBarcodes = true,
    pdfRenderDpi = "1"
) {
    try {
        // Check if input PDF file exists
        if (!fs.existsSync(INPUT_PDF_PATH)) {
            console.log(`❌ PDF file not found: ${INPUT_PDF_PATH}`);
            return null;
        }
        console.log("✅ Input PDF file found");

        // Read and encode PDF file
        const pdfBytes = fs.readFileSync(INPUT_PDF_PATH);
        const pdfBase64 = pdfBytes.toString('base64');
        console.log("✅ PDF file encoded to base64");

        // Prepare API request payload
        const payload = {
            docContent: pdfBase64,                                 // Base64 encoded PDF content
            docName: "output.pdf",                                 // Output document name
            barcodeString: barcodeString,                          // Barcode string to search for
            barcodeFilter: barcodeFilter,                          // Filter type for barcode matching
            barcodeType: barcodeType,                              // Type of barcode
            splitBarcodePage: splitBarcodePage,                    // Where to split relative to barcode
            combinePagesWithSameConsecutiveBarcodes: combinePagesWithSameConsecutiveBarcodes,  // Combine pages with same consecutive barcodes
            pdfRenderDpi: pdfRenderDpi,                            // DPI for PDF rendering
            async: true                                            // For big files and too many calls async is recommended to reduce the server load
        };

        console.log("✅ API request prepared with barcode splitting parameters");
        
        // Execute the barcode splitting operation
        return await executeBarcodeSplit(payload);
        
    } catch (error) {
        console.error("❌ Error in splitPdfByBarcode:", error.message);
        return null;
    }
}

/**
 * Executes the PDF splitting by barcode operation
 * @param {Object} payload - API request payload
 * @returns {Promise<string|null>} - Path to the split PDF files archive, or null if failed
 */
async function executeBarcodeSplit(payload) {
    try {
        // Prepare HTTP request
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${API_KEY}`
            },
            body: JSON.stringify(payload)
        };

        // Send initial request
        const response = await fetch(API_ENDPOINT, requestOptions);
        
        // Handle immediate success response (200 OK)
        if (response.status === 200) {
            console.log("✅ Immediate success response (200 OK)");
            
            const resultBytes = await response.arrayBuffer();
            const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILENAME);
            
            // Ensure output directory exists
            if (!fs.existsSync(OUTPUT_DIR)) {
                fs.mkdirSync(OUTPUT_DIR, { recursive: true });
            }
            
            fs.writeFileSync(outputPath, Buffer.from(resultBytes));
            console.log(`✅ Split PDF archive saved to: ${outputPath}`);
            console.log("✅ PDF splitting completed successfully");
            
            return outputPath;
        }
        
        // Handle asynchronous processing response (202 Accepted)
        else if (response.status === 202) {
            console.log("⏳ Asynchronous processing started (202 Accepted)");
            
            // Extract polling URL from response headers
            const locationUrl = response.headers.get('Location');
            if (!locationUrl) {
                console.log("❌ No 'Location' header found in the response.");
                return null;
            }

            console.log(`🔄 Polling URL: ${locationUrl}`);
            
            // Poll for completion with retry logic
            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                console.log(`⏳ Polling attempt ${attempt + 1}/${MAX_RETRIES}...`);
                
                // Wait before polling
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * 1000));
                
                // Create polling request
                const pollOptions = {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${API_KEY}`
                    }
                };

                const pollResponse = await fetch(locationUrl, pollOptions);

                // Handle successful completion
                if (pollResponse.status === 200) {
                    console.log("✅ Polling successful (200 OK)");
                    
                    const resultBytes = await pollResponse.arrayBuffer();
                    const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILENAME);
                    
                    // Ensure output directory exists
                    if (!fs.existsSync(OUTPUT_DIR)) {
                        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
                    }
                    
                    fs.writeFileSync(outputPath, Buffer.from(resultBytes));
                    console.log(`✅ Split PDF archive saved to: ${outputPath}`);
                    console.log("✅ PDF splitting completed successfully");
                    
                    return outputPath;
                }
                
                // Continue polling if still processing
                else if (pollResponse.status === 202) {
                    console.log("⏳ Still processing, continuing to poll...");
                    continue;
                }
                
                // Handle polling errors
                else {
                    console.log(`❌ Polling error: ${pollResponse.status}`);
                    const errorText = await pollResponse.text();
                    console.log(`❌ Error details: ${errorText}`);
                    return null;
                }
            }
            
            // Timeout if processing doesn't complete within retry limit
            console.log("❌ Timeout: PDF splitting did not complete after multiple retries.");
            return null;
        }
        
        // Handle other error responses
        else {
            console.log(`❌ Initial request failed: ${response.status}`);
            const errorText = await response.text();
            console.log(`❌ Error details: ${errorText}`);
            return null;
        }
        
    } catch (error) {
        console.error("❌ Error in executeBarcodeSplit:", error.message);
        return null;
    }
}

// Run the main function if this file is executed directly
if (require.main === module) {
    main().catch(error => {
        console.error("❌ Unhandled error:", error);
        process.exit(1);
    });
}

module.exports = { splitPdfByBarcode, executeBarcodeSplit }; 