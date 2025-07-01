const fs = require('fs');
const path = require('path');

/**
 * Extract Table from PDF using PDF4Me API
 * Extracts table structures and data from PDF documents
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for extracting tables from PDF documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/ExtractTableFromPdf`;

// File paths configuration
const INPUT_PDF_PATH = "sample.pdf";                    // Path to the main PDF file
const OUTPUT_FOLDER = "Extract_table_outputs";          // Output folder for extracted tables

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the table extraction process
 * Handles file validation, extraction, and result processing
 */
async function extractTableFromPdf() {
    console.log("Starting Table Extraction Process...");
    console.log("This extracts table structures and data from PDF documents");
    console.log("-".repeat(60));

    try {
        // Validate input file exists
        if (!fs.existsSync(INPUT_PDF_PATH)) {
            throw new Error(`Input PDF file not found: ${INPUT_PDF_PATH}`);
        }

        // Create output folder if it doesn't exist
        if (!fs.existsSync(OUTPUT_FOLDER)) {
            fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
            console.log(`Created output folder: ${OUTPUT_FOLDER}`);
        }

        console.log(`Extracting tables from: ${INPUT_PDF_PATH}`);

        // Process the table extraction
        const result = await processTableExtraction();

        // Handle the result
        await handleExtractionResult(result);

    } catch (error) {
        console.error("Table extraction failed:", error.message);
        process.exit(1);
    }
}

/**
 * Core extraction logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processTableExtraction() {
    // Read and encode PDF file to base64
    console.log("Reading and encoding PDF file...");
    const pdfContent = fs.readFileSync(INPUT_PDF_PATH);
    const pdfBase64 = pdfContent.toString('base64');
    console.log(`PDF file read successfully: ${pdfContent.length} bytes`);

    // Prepare the extraction payload
    const payload = {
        docName: "output.pdf",            // Name of the input PDF file
        docContent: pdfBase64,            // Base64 encoded PDF document content
        async: true                       // Enable asynchronous processing
    };

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending table extraction request to PDF4Me API...");

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
        console.log("Table extraction completed immediately!");
        
        // Check if response is JSON by examining content type
        const contentType = response.headers.get('Content-Type') || '';
        if (contentType.includes('application/json')) {
            console.log("JSON response detected");
            return await response.json();
        } else {
            console.log("Binary response detected");
            return await response.arrayBuffer();
        }

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the extraction result and saves the table data
 * Supports both JSON objects and binary data
 */
async function handleExtractionResult(result) {
    try {
        if (typeof result === 'object' && !Buffer.isBuffer(result)) {
            // Result is already a JSON object
            await handleJsonTableData(result);
        } else {
            // Result is binary data (ArrayBuffer or Buffer)
            const buffer = Buffer.isBuffer(result) ? result : Buffer.from(result);
            
            // Try to parse as JSON first, fall back to binary if needed
            try {
                await handleJsonTableData(buffer);
            } catch (jsonError) {
                console.log("JSON parsing failed, attempting binary format handling");
                await handleBinaryTableData(buffer);
            }
        }

    } catch (error) {
        throw new Error(`Error processing extracted table data: ${error.message}`);
    }
}

/**
 * Handles JSON table data response
 * Saves complete table data and individual tables in multiple formats
 */
async function handleJsonTableData(data) {
    try {
        // Parse JSON if it's a buffer, otherwise use the data directly
        const tableData = Buffer.isBuffer(data) ? JSON.parse(data.toString()) : data;
        
        // Save complete table data as JSON
        const metadataPath = path.join(OUTPUT_FOLDER, "extracted_tables.json");
        fs.writeFileSync(metadataPath, JSON.stringify(tableData, null, 2));
        console.log(`Table metadata saved: ${metadataPath}`);
        
        // Process and save individual tables
        if (tableData.tables && Array.isArray(tableData.tables)) {
            const tables = tableData.tables;
            console.log(`Found ${tables.length} tables`);
            
            for (let i = 0; i < tables.length; i++) {
                const table = tables[i];
                try {
                    // Save each table as separate JSON file
                    const tablePath = path.join(OUTPUT_FOLDER, `table_${i + 1}.json`);
                    fs.writeFileSync(tablePath, JSON.stringify(table, null, 2));
                    console.log(`Table ${i + 1} saved: ${tablePath}`);
                    
                    // Convert table to CSV if possible
                    if (table.rows && Array.isArray(table.rows)) {
                        const csvPath = path.join(OUTPUT_FOLDER, `table_${i + 1}.csv`);
                        saveTableAsCsv(table.rows, csvPath);
                    } else if (Array.isArray(table)) {
                        const csvPath = path.join(OUTPUT_FOLDER, `table_${i + 1}.csv`);
                        saveTableAsCsv(table, csvPath);
                    }
                    
                } catch (error) {
                    console.log(`Error saving table ${i + 1}: ${error.message}`);
                }
            }
        } else if (Array.isArray(tableData)) {
            // Handle single table response
            const csvPath = path.join(OUTPUT_FOLDER, 'extracted_table.csv');
            saveTableAsCsv(tableData, csvPath);
            console.log(`Single table saved: ${csvPath}`);
        } else {
            console.log("No tables found in response");
        }
        
        // Display table summary
        displayTableSummary(tableData);
        
    } catch (error) {
        // Re-throw the error so the calling function can handle it
        throw new Error(`JSON parsing failed: ${error.message}`);
    }
}

/**
 * Handles binary table data response (Excel, CSV, etc.)
 * Also attempts to convert binary data to readable format when possible
 */
async function handleBinaryTableData(buffer) {
    try {
        // First, try to convert binary data to text and parse as JSON
        const textContent = buffer.toString('utf8');
        if (textContent.trim().startsWith('{') || textContent.trim().startsWith('[')) {
            try {
                const jsonData = JSON.parse(textContent);
                const jsonPath = path.join(OUTPUT_FOLDER, "extracted_tables.json");
                fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
                console.log(`Table data converted to JSON: ${jsonPath}`);
                displayTableSummary(jsonData);
                return;
            } catch (jsonError) {
                console.log("Binary content is not valid JSON");
            }
        }
        
        // If not JSON, try to save as CSV if it looks like text data
        if (textContent.includes(',') || textContent.includes('\t')) {
            const csvPath = path.join(OUTPUT_FOLDER, "extracted_tables.csv");
            fs.writeFileSync(csvPath, textContent, 'utf8');
            console.log(`Table data saved as CSV: ${csvPath}`);
            return;
        }
        
        // Fallback: save as binary with appropriate extension
        const outputExtension = determineFileExtension(buffer);
        const outputFile = path.join(OUTPUT_FOLDER, `extracted_tables${outputExtension}`);
        fs.writeFileSync(outputFile, buffer);
        console.log(`Table data saved as binary: ${outputFile}`);
        console.log("Note: Binary format detected. Consider checking if the API response format is correct.");
        
    } catch (error) {
        console.log(`Error processing binary data: ${error.message}`);
        // Save raw data as fallback
        const fallbackPath = path.join(OUTPUT_FOLDER, "raw_table_response.bin");
        fs.writeFileSync(fallbackPath, buffer);
        console.log(`Raw response saved: ${fallbackPath}`);
    }
}

/**
 * Convert table data to CSV format and save
 */
function saveTableAsCsv(tableRows, csvPath) {
    try {
        if (!tableRows || !Array.isArray(tableRows) || tableRows.length === 0) {
            console.log("No table rows to save as CSV");
            return;
        }

        let csvContent = '';
        
        if (Array.isArray(tableRows[0])) {
            // Table is array of arrays (rows with cells)
            for (const row of tableRows) {
                const csvRow = row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
                csvContent += csvRow + '\n';
            }
        } else if (typeof tableRows[0] === 'object') {
            // Table is array of objects
            const fieldnames = Object.keys(tableRows[0]);
            csvContent += fieldnames.map(field => `"${field}"`).join(',') + '\n';
            
            for (const row of tableRows) {
                const csvRow = fieldnames.map(field => `"${String(row[field] || '').replace(/"/g, '""')}"`).join(',');
                csvContent += csvRow + '\n';
            }
        }
        
        fs.writeFileSync(csvPath, csvContent, 'utf8');
        console.log(`CSV table saved: ${csvPath}`);
        
    } catch (error) {
        console.log(`Error saving CSV: ${error.message}`);
    }
}

/**
 * Determine file extension based on content type or content analysis
 */
function determineFileExtension(buffer) {
    // Check for common file signatures
    const header = buffer.toString('hex', 0, 8).toUpperCase();
    
    if (header.startsWith('504B0304') || header.startsWith('504B0506') || header.startsWith('504B0708')) {
        return '.xlsx'; // Excel file signature
    } else if (buffer.toString('ascii', 0, 3) === 'ID3' || buffer.toString('ascii', 0, 4) === 'RIFF') {
        return '.csv'; // Likely CSV or text format
    } else {
        return '.bin'; // Unknown binary format
    }
}

/**
 * Display summary of extracted tables
 */
function displayTableSummary(tableData) {
    console.log("\n--- Table Extraction Summary ---");
    
    if (!tableData) {
        console.log("No table data received");
        return;
    }
    
    let tableCount = 0;
    let totalRows = 0;
    
    if (tableData.tables && Array.isArray(tableData.tables)) {
        const tables = tableData.tables;
        tableCount = tables.length;
        
        for (let i = 0; i < tables.length; i++) {
            const table = tables[i];
            let rows = 0;
            
            if (table.rows && Array.isArray(table.rows)) {
                rows = table.rows.length;
            } else if (Array.isArray(table)) {
                rows = table.length;
            }
            
            totalRows += rows;
            console.log(`  Table ${i + 1}: ${rows} rows`);
        }
    } else if (Array.isArray(tableData)) {
        tableCount = 1;
        totalRows = tableData.length;
        console.log(`  Single table: ${totalRows} rows`);
    }
    
    console.log(`Total tables extracted: ${tableCount}`);
    console.log(`Total rows: ${totalRows}`);
    
    if (tableCount > 0) {
        console.log("Table extraction completed successfully!");
    } else {
        console.log("No tables were found in the PDF");
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
                // Extraction completed successfully
                console.log("Table extraction completed successfully!");
                
                // Check if response is JSON by examining content type
                const contentType = response.headers.get('Content-Type') || '';
                if (contentType.includes('application/json')) {
                    console.log("JSON response detected");
                    return await response.json();
                } else {
                    console.log("Binary response detected");
                    return await response.arrayBuffer();
                }

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

    throw new Error(`Timeout: Table extraction did not complete after ${MAX_RETRIES} retries`);
}

// Main execution - Run the extraction when script is executed directly
if (require.main === module) {
    extractTableFromPdf().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = { extractTableFromPdf, processTableExtraction, handleExtractionResult }; 