const fs = require('fs');
const path = require('path');

/**
 * JSON to Excel Converter using PDF4Me API
 * Converts JSON files to Excel spreadsheets with configurable formatting options
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for converting JSON to Excel documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ConvertJsonToExcel`;

// File paths configuration
const INPUT_JSON_PATH = "row.json";                    // Path to input JSON file
const OUTPUT_EXCEL_PATH = "JSON_to_EXCEL_output.xlsx"; // Output Excel file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the JSON to Excel conversion process
 * Handles file validation, conversion, and result processing
 */
async function convertJsonToExcel() {
    console.log("Starting JSON to Excel Conversion Process...");
    console.log("This converts JSON data into Excel spreadsheets");
    console.log("Supports custom formatting, headers, and data types");
    console.log("-".repeat(60));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_JSON_PATH)) {
            throw new Error(`Input JSON file not found: ${INPUT_JSON_PATH}`);
        }

        console.log(`Converting: ${INPUT_JSON_PATH} → ${OUTPUT_EXCEL_PATH}`);

        // Process the conversion
        const result = await processJsonToExcelConversion();

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
async function processJsonToExcelConversion() {
    // Read and encode JSON file to base64
    console.log("Reading and encoding JSON file...");
    const jsonContent = fs.readFileSync(INPUT_JSON_PATH, 'utf8');
    const jsonBase64 = Buffer.from(jsonContent, 'utf8').toString('base64');
    console.log("JSON file successfully encoded to base64");

    // Prepare the conversion payload with all available options
    const payload = {
        docContent: jsonBase64,           // Base64 encoded JSON document content
        docName: "output",                // Name for the output file
        worksheetName: "Sheet1",          // Name of the Excel worksheet
        isTitleWrapText: true,            // Enable text wrapping for headers
        isTitleBold: true,                // Make headers bold
        convertNumberAndDate: false,      // Don't auto-convert data types
        numberFormat: "11",               // Number formatting style
        dateFormat: "01/01/2025",         // Date format template
        ignoreNullValues: false,          // Include null/empty values
        firstRow: 1,                      // Starting row position
        firstColumn: 1,                   // Starting column position
        async: true                       // Enable asynchronous processing
    };

    // Additional payload options you can customize:
    // - "worksheetName": "MyData" for custom sheet name
    // - "isTitleWrapText": false to disable text wrapping
    // - "isTitleBold": false to disable bold headers
    // - "convertNumberAndDate": true to auto-detect data types
    // - "numberFormat": "0", "0.00", "0%" for different number formats
    // - "dateFormat": "MM/DD/YYYY", "DD-MM-YYYY" for different date formats
    // - "ignoreNullValues": true to skip empty cells
    // - "firstRow": 2, "firstColumn": 2 to start at different positions

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending request to PDF4Me API...");
    console.log(`Worksheet: ${payload.worksheetName}, Starting at: Row ${payload.firstRow}, Column ${payload.firstColumn}`);

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
        console.log("JSON to Excel conversion completed immediately!");
        return await response.arrayBuffer();

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the conversion result and saves the Excel file
 * Supports both binary Excel data and base64 encoded responses
 */
async function handleConversionResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations
        const buffer = Buffer.from(result);
        
        // Validate that we have a reasonable file size (Excel files are typically > 1KB)
        if (buffer.length < 1000) {
            console.log("Warning: Response seems too small for a valid Excel file");
            console.log(`File size: ${buffer.length} bytes`);
        }

        // Check for Excel file signature (XLSX files start with PK)
        if (buffer.length > 2 && buffer.toString('ascii', 0, 2) === 'PK') {
            console.log("Response is a valid Excel file (XLSX format)");
            fs.writeFileSync(OUTPUT_EXCEL_PATH, buffer);
            console.log(`Excel file saved successfully to: ${OUTPUT_EXCEL_PATH}`);
            console.log("JSON data has been converted to Excel format");
            return;
        }

        // Try to parse as JSON if not a direct Excel file
        try {
            const jsonResponse = JSON.parse(buffer.toString());
            console.log("Successfully parsed JSON response");
            
            // Look for Excel data in different possible JSON locations
            let excelBase64 = null;
            if (jsonResponse.document && jsonResponse.document.docData) {
                excelBase64 = jsonResponse.document.docData;  // Common location 1
            } else if (jsonResponse.docData) {
                excelBase64 = jsonResponse.docData;           // Common location 2
            } else if (jsonResponse.data) {
                excelBase64 = jsonResponse.data;              // Alternative location
            }

            if (excelBase64) {
                // Decode base64 Excel data and save to file
                const excelBytes = Buffer.from(excelBase64, 'base64');
                fs.writeFileSync(OUTPUT_EXCEL_PATH, excelBytes);
                console.log(`Excel file saved to ${OUTPUT_EXCEL_PATH}`);
                console.log("JSON data has been converted to Excel format");
            } else {
                console.log("No Excel data found in the response.");
                console.log("Full response:", JSON.stringify(jsonResponse, null, 2));
            }

        } catch (jsonError) {
            console.log("Failed to parse JSON response, treating as binary data");
            // If JSON parsing fails, try to save as binary anyway
            if (buffer.length > 1000) {
                fs.writeFileSync(OUTPUT_EXCEL_PATH, buffer);
                console.log(`Excel file saved to ${OUTPUT_EXCEL_PATH} (as binary data)`);
                console.log("JSON data has been converted to Excel format");
            } else {
                console.log("Warning: Response doesn't appear to be a valid Excel file");
                console.log(`First 100 bytes: ${buffer.toString('hex', 0, 100)}`);
            }
        }

    } catch (error) {
        throw new Error(`Error saving Excel file: ${error.message}`);
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
                console.log("JSON to Excel conversion completed successfully!");
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

    throw new Error(`Timeout: JSON to Excel conversion did not complete after ${MAX_RETRIES} retries`);
}

// Main execution - Run the conversion when script is executed directly
if (require.main === module) {
    convertJsonToExcel().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = { convertJsonToExcel, processJsonToExcelConversion, handleConversionResult }; 