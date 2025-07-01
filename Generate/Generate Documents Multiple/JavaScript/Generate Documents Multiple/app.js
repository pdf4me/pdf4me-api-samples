const fs = require('fs');
const path = require('path');

/**
 * Generate Documents Multiple using PDF4Me API
 * Generates multiple documents by combining template files with JSON data
 * Supports Word, HTML, and PDF templates with various output formats
 * Handles both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for generating multiple documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/GenerateDocumentMultiple`;

// File paths configuration
const TEMPLATE_FILE_PATH = "sample.docx";        // Path to the template file
const JSON_DATA_PATH = "sample.json";            // Path to the JSON data file
const OUTPUT_PATH = "Generate_Documents_Multiple_output.docx"; // Output file name

// Output type configuration (pdf, docx, html, excel)
const OUTPUT_TYPE = "docx";

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the document generation process
 * Handles file validation, generation, and result processing
 */
async function generateDocumentsMultiple() {
    console.log("Starting Generate Documents Multiple Process...");
    console.log("This generates documents by combining templates with JSON data");
    console.log("Supports Word, HTML, and PDF templates with various output formats");
    console.log("-".repeat(60));

    try {
        // Validate input files exist
        if (!fs.existsSync(TEMPLATE_FILE_PATH)) {
            throw new Error(`Template file not found: ${TEMPLATE_FILE_PATH}`);
        }
        if (!fs.existsSync(JSON_DATA_PATH)) {
            throw new Error(`JSON data file not found: ${JSON_DATA_PATH}`);
        }

        console.log(`Template file: ${TEMPLATE_FILE_PATH}`);
        console.log(`JSON data file: ${JSON_DATA_PATH}`);
        console.log(`Output file: ${OUTPUT_PATH}`);
        console.log(`Output type: ${OUTPUT_TYPE}`);

        // Process the document generation
        const result = await processDocumentGeneration();

        // Handle the result
        await handleGenerationResult(result);

    } catch (error) {
        console.error("Document generation failed:", error.message);
        process.exit(1);
    }
}

/**
 * Core generation logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processDocumentGeneration() {
    // Read and encode template file to base64
    console.log("Reading and encoding template file...");
    const templateContent = fs.readFileSync(TEMPLATE_FILE_PATH);
    const templateBase64 = templateContent.toString('base64');
    console.log("Template file successfully encoded to base64");

    // Read JSON data file
    console.log("Reading JSON data file...");
    const jsonData = fs.readFileSync(JSON_DATA_PATH, 'utf8');
    console.log("JSON data file successfully read");

    // Determine template file type based on extension
    const templateFileType = getTemplateFileType(TEMPLATE_FILE_PATH);

    // Prepare the generation payload with all available options
    const payload = {
        templateFileType: templateFileType,           // Type of template (Docx/HTML/PDF)
        templateFileName: path.basename(TEMPLATE_FILE_PATH), // Template file name
        templateFileData: templateBase64,             // Base64 encoded template content
        documentDataType: "Json",                     // Type of data (Json/XML)
        outputType: getOutputType(OUTPUT_TYPE),       // Output format (PDF/Docx/Excel/HTML)
        documentDataText: jsonData,                   // JSON data as text
        metaDataJson: "{}"                            // Additional metadata for fields in JSON format
    };

    // Additional payload options you can customize:
    // - "documentDataFile": dataFileBase64,          // Alternative to documentDataText
    // - "metaDataJson": '{"customField": "value"}',  // Template field metadata

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending request to PDF4Me API...");
    console.log(`Template type: ${payload.templateFileType}`);
    console.log(`Output type: ${payload.outputType}`);

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
        console.log("Document generation completed immediately!");
        return await response.arrayBuffer();

    } else {
        // Error response
        const errorText = await response.text();
        throw new Error(`API request failed. Status: ${response.status}, Response: ${errorText}`);
    }
}

/**
 * Handles the generation result and saves the document file
 * Supports both binary document data and base64 encoded responses
 */
async function handleGenerationResult(result) {
    try {
        // Convert ArrayBuffer to Buffer for file operations
        const buffer = Buffer.from(result);
        
        // Check if response is JSON (contains document data in structured format)
        try {
            const jsonResponse = JSON.parse(buffer.toString());
            console.log("Processing JSON response...");
            
            // PDF4Me API returns document data in outputDocuments[0].streamFile
            if (jsonResponse.outputDocuments && jsonResponse.outputDocuments.length > 0) {
                const firstDoc = jsonResponse.outputDocuments[0];
                if (firstDoc.streamFile) {
                    // Extract base64 encoded document data and convert to bytes
                    const base64Data = firstDoc.streamFile;
                    const resultBytes = Buffer.from(base64Data, 'base64');
                    console.log("Extracted document data from 'outputDocuments[0].streamFile'");
                    
                    // Validate document signature based on output type
                    validateDocumentSignature(resultBytes, OUTPUT_TYPE);
                    
                    // Save the generated document
                    fs.writeFileSync(OUTPUT_PATH, resultBytes);
                    console.log(`Document saved successfully to: ${OUTPUT_PATH}`);
                    console.log("Document generation completed successfully!");
                    return;
                } else {
                    throw new Error("'streamFile' property not found in outputDocuments[0]");
                }
            } else {
                throw new Error("'outputDocuments' array not found or empty");
            }
            
        } catch (jsonError) {
            console.log("Processing as binary response...");
            
            // Validate document signature based on output type
            validateDocumentSignature(buffer, OUTPUT_TYPE);
            
            // Save the generated document
            fs.writeFileSync(OUTPUT_PATH, buffer);
            console.log(`Document saved successfully to: ${OUTPUT_PATH}`);
            console.log("Document generation completed successfully!");
        }

    } catch (error) {
        throw new Error(`Error saving document: ${error.message}`);
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
        
        // Wait before polling to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

        // Create polling request to check if document generation is complete
        const pollResponse = await fetch(locationUrl, {
            method: 'GET',
            headers: headers
        });

        // Handle successful completion of document generation
        if (pollResponse.status === 200) {
            console.log("Document generation completed successfully!");
            return await pollResponse.arrayBuffer();
        }
        
        // Continue polling if document is still being processed
        else if (pollResponse.status === 202) {
            console.log("Still processing, waiting...");
            continue;
        }
        
        // Handle polling errors
        else {
            const errorText = await pollResponse.text();
            throw new Error(`Polling error: ${pollResponse.status}, Response: ${errorText}`);
        }
    }

    // Timeout if generation doesn't complete within retry limit
    throw new Error("Timeout: Document generation did not complete after multiple retries.");
}

/**
 * Determines the template file type based on file extension
 * Maps to the correct API enum values: Docx, HTML, PDF
 */
function getTemplateFileType(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    
    switch (extension) {
        case '.docx':
        case '.doc':
            return 'Docx';  // API expects 'Docx' not 'Word'
        case '.html':
        case '.htm':
            return 'HTML';
        case '.pdf':
            return 'PDF';
        default:
            throw new Error(`Unsupported template file type: ${extension}`);
    }
}

/**
 * Converts output type string to API format
 * Maps to the correct API enum values: PDF, Docx, Excel, HTML
 */
function getOutputType(outputType) {
    const typeMap = {
        'pdf': 'PDF',
        'docx': 'Docx',  // API expects 'Docx' not 'Word'
        'html': 'HTML',
        'excel': 'Excel'
    };
    
    const apiType = typeMap[outputType.toLowerCase()];
    if (!apiType) {
        throw new Error(`Unsupported output type: ${outputType}`);
    }
    
    return apiType;
}

/**
 * Validates document signature based on output type
 */
function validateDocumentSignature(buffer, outputType) {
    if (buffer.length === 0) {
        throw new Error("Generated document is empty");
    }

    const outputTypeLower = outputType.toLowerCase();
    
    if (outputTypeLower === 'docx') {
        // DOCX files start with PK (ZIP file signature)
        if (buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4B) {
            console.log("Valid DOCX file signature detected");
        } else {
            console.log("Warning: Result doesn't appear to be a valid DOCX file");
        }
    } else if (outputTypeLower === 'pdf') {
        // PDF files start with %PDF
        if (buffer.length >= 4 && buffer.toString('ascii', 0, 4) === '%PDF') {
            console.log("Valid PDF file signature detected");
        } else {
            console.log("Warning: Result doesn't appear to be a valid PDF file");
        }
    } else if (outputTypeLower === 'html') {
        // HTML files typically start with <!DOCTYPE or <html
        const start = buffer.toString('utf8', 0, 20).toLowerCase();
        if (start.includes('<!doctype') || start.includes('<html')) {
            console.log("Valid HTML file signature detected");
        } else {
            console.log("Warning: Result doesn't appear to be a valid HTML file");
        }
    }
    
    console.log(`Final document size: ${buffer.length} bytes`);
}

// Execute the main function
generateDocumentsMultiple().catch(error => {
    console.error("Unexpected error:", error.message);
    process.exit(1);
}); 