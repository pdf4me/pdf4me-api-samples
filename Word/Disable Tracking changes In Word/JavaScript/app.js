const fs = require('fs');
const path = require('path');

/**
 * Word Document Tracking Changes Disable using PDF4Me API
 * Disables tracking changes in Word documents by removing all tracked changes, comments, and revision marks
 * Supports both synchronous and asynchronous processing with retry logic
 */

// API Configuration - PDF4Me service for disabling tracking changes in Word documents
const API_KEY = "Please get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_ENDPOINT = `${BASE_URL}api/v2/DisableTrackingChangesInWord`;

// File paths configuration
const DOCX_FILE_PATH = "sample.docx";                    // Path to input Word document file
const OUTPUT_PATH = "sample.tracking_disabled.docx";     // Output Word document file name

// Retry configuration for async processing
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds in milliseconds

/**
 * Main function that orchestrates the Word document tracking changes disable process
 * Handles file validation, processing, and result processing
 */
async function disableTrackingChangesInWord() {
    console.log("Starting Word Document Tracking Changes Disable Process");
    console.log("=== Disabling Tracking Changes in Word Document ===");
    console.log("This removes all tracked changes, comments, and revision marks");
    console.log("-".repeat(60));

    try {
        // Validate input file exists
        if (!fs.existsSync(DOCX_FILE_PATH)) {
            throw new Error(`Word document file not found: ${DOCX_FILE_PATH}`);
        }

        console.log(`Processing: ${DOCX_FILE_PATH} → ${OUTPUT_PATH}`);

        // Process the tracking changes disable
        const result = await processTrackingChangesDisable();

        // Handle the result
        await handleProcessingResult(result);

    } catch (error) {
        console.error("Processing failed:", error.message);
        process.exit(1);
    }
}

/**
 * Read Word document file and convert it to base64 encoding
 * Process: Check file existence → Read binary content → Encode to base64
 */
function readAndEncodeDocx(filePath) {
    // Check if file exists before attempting to read
    if (!fs.existsSync(filePath)) {
        console.log(`Error: Word document file not found at ${filePath}`);
        throw new Error(`Word document file not found: ${filePath}`);
    }
    
    try {
        // Read the Word document file in binary mode
        const docxContent = fs.readFileSync(filePath);
        
        // Convert binary content to base64 string
        const base64Content = docxContent.toString('base64');
        console.log(`Word document file read successfully: ${docxContent.length} bytes`);
        
        return base64Content;
    
    } catch (error) {
        console.log(`Error reading Word document file: ${error}`);
        throw error;
    }
}

/**
 * Core processing logic - handles the API request and response processing
 * Supports both synchronous (200) and asynchronous (202) responses
 */
async function processTrackingChangesDisable() {
    // Read and encode Word document file to base64
    console.log("Reading and encoding Word document file...");
    const base64Content = readAndEncodeDocx(DOCX_FILE_PATH);
    console.log("Word document file successfully encoded to base64");

    // Prepare the processing payload with all required parameters
    const payload = {
        docName: "output.docx",        // Output document name (Required)
        docContent: base64Content,     // Base64 encoded Word document content (Required)
        async: true                    // Asynchronous processing as requested
    };

    // Set up HTTP headers for authentication and content type
    const headers = {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    };

    console.log("Sending Word document to PDF4Me API for disabling tracking changes...");

    try {
        // Make the initial API request
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        console.log(`Response Status Code: ${response.status} (${response.statusText})`);
        console.log("Response Headers:");
        for (const [headerName, headerValue] of response.headers.entries()) {
            console.log(`  ${headerName}: ${headerValue}`);
        }

        // Handle different response status codes
        if (response.status === 200) {
            console.log("Success! Tracking changes disabled in Word document successfully!");
            
            // API returns binary Word document content directly for 200 response
            return { binaryContent: await response.arrayBuffer(), status: "success" };

        } else if (response.status === 202) {
            console.log("Request accepted. Processing asynchronously...");
            
            // Get the polling URL from the Location header for checking status
            const locationUrl = response.headers.get('Location');
            console.log(`Location URL: ${locationUrl || 'NOT FOUND'}`);
            
            // Check if response has content before parsing JSON
            const responseText = await response.text();
            if (responseText.trim()) {
                try {
                    const jsonResponse = JSON.parse(responseText);
                    return { ...jsonResponse, location: locationUrl, status: "processing" };
                } catch (jsonError) {
                    console.log(`Response Body (202): ${responseText}`);
                    return { jobId: null, location: locationUrl, status: "processing", rawResponse: responseText };
                }
            } else {
                console.log("Empty response body for async request");
                return { jobId: null, location: locationUrl, status: "processing", rawResponse: "" };
            }

        } else {
            console.log(`Error: ${response.status} - ${await response.text()}`);
            throw new Error(`API request failed. Status: ${response.status}`);
        }

    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.log("Error: Request timeout. The API took too long to respond.");
        } else {
            console.log(`API Request Error: ${error}`);
        }
        throw error;
    }
}

/**
 * Handles the processing result and saves the processed Word document file
 * Supports both binary Word document data and base64 encoded responses
 */
async function handleProcessingResult(result) {
    try {
        // Handle synchronous response (status 200) - Following Python logic
        if (result.binaryContent && result.status === "success") {
            console.log("Processing binary Word document response directly...");
            
            // Save the binary Word document content directly
            const buffer = Buffer.from(result.binaryContent);
            fs.writeFileSync(OUTPUT_PATH, buffer);
            
            console.log(`Processed Word document saved successfully: ${OUTPUT_PATH}`);
            console.log(`Output file size: ${buffer.length} bytes`);
            console.log("Word document tracking changes have been disabled");
            console.log("The processed document no longer shows tracked changes");
            return;
        }

        // Handle asynchronous response (status 202)
        if (result.jobId || result.requestId || result.location) {
            console.log("Handling asynchronous processing...");
            
            // Get job/request ID or location URL for polling
            const jobId = result.jobId || result.requestId;
            const locationUrl = result.location;
            
            if (jobId) {
                console.log(`Job ID: ${jobId}`);
            }
            if (locationUrl) {
                console.log(`Polling URL: ${locationUrl}`);
            }
            
            // If we have a location URL, implement polling
            if (locationUrl) {
                // Prepare headers for polling requests
                const headers = {
                    "Authorization": `Basic ${API_KEY}`,
                    "Content-Type": "application/json"
                };
                
                // Implement retry logic for async processing
                for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                    console.log(`Checking job status... (Attempt ${attempt}/${MAX_RETRIES})`);
                    
                    // Wait before polling (except on first attempt)
                    if (attempt > 1) {
                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                    }
                    
                    try {
                        // Poll the location URL for completion
                        const statusResponse = await fetch(locationUrl, {
                            method: 'GET',
                            headers: headers
                        });
                        
                        console.log(`Poll response status: ${statusResponse.status} (${statusResponse.statusText})`);
                        
                        if (statusResponse.status === 200) {
                            console.log("Processing completed!");
                            
                            // Save the binary Word document content directly from polling response
                            const buffer = Buffer.from(await statusResponse.arrayBuffer());
                            fs.writeFileSync(OUTPUT_PATH, buffer);
                            
                            console.log(`Processed Word document saved successfully: ${OUTPUT_PATH}`);
                            console.log(`Output file size: ${buffer.length} bytes`);
                            console.log("Word document tracking changes have been disabled");
                            console.log("The processed document no longer shows tracked changes");
                            return;
                            
                        } else if (statusResponse.status === 202) {
                            console.log("Still processing...");
                            continue;
                        } else {
                            console.log(`Error during polling: ${statusResponse.status} - ${await statusResponse.text()}`);
                            throw new Error(`Unexpected error during polling: ${statusResponse.status}`);
                        }
                        
                    } catch (error) {
                        if (attempt === MAX_RETRIES) {
                            throw new Error(`Polling failed after ${MAX_RETRIES} attempts: ${error.message}`);
                        }
                        console.log(`Polling attempt ${attempt} failed: ${error.message}`);
                    }
                }
                
                console.log("Timeout: Processing did not complete after multiple retries");
                console.log("Check your PDF4me dashboard for async job completion");
                
            } else {
                console.log("No polling URL available for async job");
                console.log("Check your PDF4me dashboard for the completed file");
            }
        } else {
            console.log("Error: Invalid API response format");
            console.log("Check your PDF4me dashboard for async job completion");
        }

    } catch (error) {
        throw new Error(`Error saving processed Word document: ${error.message}`);
    }
}

// Main execution - Run the processing when script is executed directly
if (require.main === module) {
    disableTrackingChangesInWord().catch(error => {
        console.error("Fatal error:", error.message);
        process.exit(1);
    });
}

module.exports = { disableTrackingChangesInWord, processTrackingChangesDisable, handleProcessingResult }; 