const fs = require('fs');
const path = require('path');

/**
 * Get PDF Metadata using PDF4Me API
 * Extracts comprehensive metadata from PDF documents
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for extracting PDF metadata
const API_KEY = "Please get the key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/GetPdfMetadata`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                               // Input PDF file to extract metadata from
const OUTPUT_JSON_PATH = "sample.metadata.json";                   // Output JSON metadata file name

// Processing configuration
const MAX_RETRIES = 10;                                            // Maximum number of polling retries
const RETRY_DELAY = 10;                                            // Delay between retries in seconds

/**
 * Main function to extract PDF metadata
 */
async function main() {
    console.log("=== Extracting PDF Metadata ===");
    
    try {
        const result = await extractPdfMetadata(INPUT_PDF_PATH);
        
        if (result) {
            console.log(`\n🎉 PDF metadata extraction completed successfully!`);
            console.log(`📁 Output file: ${result}`);
            
            // Get file stats for additional info
            const stats = fs.statSync(result);
            console.log(`📊 File size: ${stats.size.toLocaleString()} bytes`);
            
            // Display a preview of the metadata
            try {
                const metadata = JSON.parse(fs.readFileSync(result, 'utf8'));
                console.log(`📄 Document title: ${metadata.title || 'N/A'}`);
                console.log(`📊 Page count: ${metadata.pageCount || 'N/A'}`);
                console.log(`📏 Page dimensions: ${metadata.pageWidthInMM || 'N/A'}mm x ${metadata.pageHeightInMM || 'N/A'}mm`);
                console.log(`🔒 Encrypted: ${metadata.isEncrypted ? 'Yes' : 'No'}`);
                console.log(`✍️ Signed: ${metadata.isSigned ? 'Yes' : 'No'}`);
            } catch (parseError) {
                console.log("📄 Metadata preview not available");
            }
        } else {
            console.log("❌ PDF metadata extraction failed.");
        }
    } catch (error) {
        console.error("❌ Error in main:", error.message);
        process.exit(1);
    }
}

/**
 * Extracts PDF metadata using PDF4Me service
 * @param {string} inputPdfPath - Path to the input PDF file
 * @returns {Promise<string|null>} - Path to the metadata JSON file, or null if failed
 */
async function extractPdfMetadata(inputPdfPath) {
    try {
        // Check if input PDF file exists
        if (!fs.existsSync(inputPdfPath)) {
            console.log(`❌ PDF file not found: ${inputPdfPath}`);
            return null;
        }
        console.log("✅ Input PDF file found");

        // Read and encode PDF file
        const pdfBytes = fs.readFileSync(inputPdfPath);
        const pdfBase64 = pdfBytes.toString('base64');
        console.log("✅ PDF file encoded to base64");

        // Prepare API request payload
        const payload = {
            docContent: pdfBase64,                                 // Base64 encoded PDF content
            docName: "output.pdf",                                 // Output document name
            async: true                                            // For big files and too many calls async is recommended to reduce the server load
        };

        console.log("✅ API request prepared with metadata extraction parameters");
        
        // Execute the metadata extraction operation
        return await executeMetadataExtraction(payload, OUTPUT_JSON_PATH);
        
    } catch (error) {
        console.error("❌ Error in extractPdfMetadata:", error.message);
        return null;
    }
}

/**
 * Executes the PDF metadata extraction operation
 * @param {Object} payload - API request payload
 * @param {string} outputJsonPath - Path where to save the metadata JSON
 * @returns {Promise<string|null>} - Path to the metadata JSON file, or null if failed
 */
async function executeMetadataExtraction(payload, outputJsonPath) {
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
            
            const resultJson = await response.text();
            fs.writeFileSync(outputJsonPath, resultJson);
            console.log(`✅ Metadata JSON saved to: ${outputJsonPath}`);
            console.log("✅ PDF metadata extraction completed successfully");
            
            return outputJsonPath;
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
                    
                    const resultJson = await pollResponse.text();
                    fs.writeFileSync(outputJsonPath, resultJson);
                    console.log(`✅ Metadata JSON saved to: ${outputJsonPath}`);
                    console.log("✅ PDF metadata extraction completed successfully");
                    
                    return outputJsonPath;
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
            console.log("❌ Timeout: PDF metadata extraction did not complete after multiple retries.");
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
        console.error("❌ Error in executeMetadataExtraction:", error.message);
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

module.exports = { extractPdfMetadata, executeMetadataExtraction }; 