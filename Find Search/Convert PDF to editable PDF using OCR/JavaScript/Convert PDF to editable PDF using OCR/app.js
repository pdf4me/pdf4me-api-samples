const fs = require('fs');
const path = require('path');

// API Configuration - PDF4me service for converting PDF to editable PDF using OCR
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_URL = `${BASE_URL}api/v2/ConvertOcrPdf`;
const INPUT_FILE = 'sample.pdf'; // Path to the input PDF file
const OUTPUT_FILE = 'editable_PDF_output.pdf'; // Output PDF file name

// Main function to convert PDF to editable PDF using OCR (handles retry logic and orchestration)
async function convertPDFToEditableOCR() {
    const max_retries = 10; // Number of times to retry if it fails
    const retry_delay = 10; // Wait 10 seconds between retries
    
    try {
        console.log('Starting PDF to Editable PDF OCR Conversion Process');
        
        // Check if the input PDF file exists in the folder
        if (!fs.existsSync(INPUT_FILE)) {
            throw new Error(`Input file ${INPUT_FILE} not found`);
        }

        // Try multiple times in case of network errors or API issues
        for (let attempt = 1; attempt <= max_retries; attempt++) {
            try {
                console.log(`Attempt ${attempt}/${max_retries} - Converting PDF using OCR...`);
                
                // Process the PDF file for OCR conversion
                const response = await processOCRConversion();
                
                // Handle the API response (200 success or 202 async)
                return await handleAPIResponse(response, OUTPUT_FILE);
                
            } catch (error) {
                // If this attempt failed, log the error
                console.error(`Attempt ${attempt} failed: ${error.message}`);
                
                // If we've tried all attempts, give up
                if (attempt === max_retries) {
                    throw new Error(`All ${max_retries} attempts failed. Last error: ${error.message}`);
                }
                
                // Wait before trying again
                console.log(`Waiting ${retry_delay} seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, retry_delay * 1000));
            }
        }

    } catch (error) {
        // If everything failed, show the error
        console.error('Error converting PDF to editable PDF:', error.message);
        throw error;
    }
}

// Function to read and encode PDF file to base64
function readAndEncodePDF(filePath) {
    // Check if file exists before attempting to read
    if (!fs.existsSync(filePath)) {
        throw new Error(`PDF file not found at ${filePath}`);
    }
    
    try {
        // Read the PDF file in binary mode
        const pdfContent = fs.readFileSync(filePath);
        
        // Convert binary content to base64 string
        const base64Content = pdfContent.toString('base64');
        console.log(`PDF file read successfully: ${pdfContent.length} bytes`);
        
        return base64Content;
        
    } catch (error) {
        throw new Error(`Error reading PDF file: ${error.message}`);
    }
}

// Function to process PDF files and convert to editable PDF using OCR
async function processOCRConversion() {
    let pdfBase64; // Declare variable to store base64 content
    
    // Read and encode the PDF file
    try {
        pdfBase64 = readAndEncodePDF(INPUT_FILE);
    } catch (error) {
        throw new Error(`Error reading PDF file: ${error.message}`);
    }

    // Prepare the payload (data) to send to the API
    const payload = {
        docContent: pdfBase64,                        // Base64 encoded PDF document content (Required)
        docName: path.basename(INPUT_FILE),           // Source file name with proper extension (Required)
        qualityType: "Draft",                         // Quality type for OCR processing
                                               // "Draft" - Suitable for normal PDFs, consumes 1 API call per file
                                               // "High" - Suitable for PDFs from Images and scanned documents, consumes 2 API calls per page
        ocrWhenNeeded: "true",                        // OCR Only When Needed (Required)
                                               // "true" - Skip recognition if text is already searchable
                                               // "false" - Always perform OCR regardless of existing text
        language: "English",                          // Language (Optional)
                                               // Specify language of text in source file
                                               // Only use if output is not recognizable
                                               // Examples: "English", "Spanish", "French", "German", etc.
        outputFormat: "true",                         // Output Format (Required)
                                               // Must be in string format
                                               // "true" - Standard output format
        isAsync: true,                                // isAsync (Required)
                                               // Boolean format for asynchronous processing
                                               // True - Process asynchronously (recommended for large files)
                                               // False - Process synchronously
        mergeAllSheets: true                          // Merge All Sheets (Optional)
                                               // True - Merge all sheets if applicable
                                               // False - Keep sheets separate
    };

    // Set up HTTP headers for the API request
    const headers = {
        "Authorization": `Basic ${API_KEY}`,           // Authentication using provided API key
        "Content-Type": "application/json"            // Specify that we're sending JSON data
    };

    console.log("Sending PDF to PDF4me API for OCR conversion...");
    
    // Make the API request to convert PDF using OCR
    try {
        const response = await fetch(API_URL, {
            method: 'POST', // HTTP method to convert PDF
            headers: headers, // Authentication and content type headers
            body: JSON.stringify(payload) // Convert payload to JSON string
        });
        
        return response; // Return the API response for handling
        
    } catch (error) {
        throw new Error(`Error making API request: ${error.message}`);
    }
}

// Function to handle API responses (200 success or 202 async processing)
async function handleAPIResponse(response, outputPath) {
    // Handle the response from PDF4me
    if (response.status === 200) {
        // 200 - Success: OCR conversion completed immediately
        console.log("Success! PDF converted successfully!");
        
        // Get the response as array buffer first to check if it's binary PDF
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Check if the response is a PDF file (starts with %PDF)
        if (buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF') {
            console.log("Response is direct PDF binary content, saving directly...");
            
            try {
                // Save the PDF content directly (it's already binary)
                fs.writeFileSync(outputPath, buffer);
                console.log(`Editable PDF saved successfully: ${outputPath}`);
                console.log(`Output file size: ${buffer.length} bytes`);
                return outputPath;
                
            } catch (saveError) {
                throw new Error(`Error saving PDF file: ${saveError.message}`);
            }
        } else {
            // Try to parse as JSON or base64
            const responseText = buffer.toString('utf8');
            
            if (responseText.trim()) {
                try {
                    const jsonResponse = JSON.parse(responseText);
                    
                    if (jsonResponse.docContent) {
                        // Decode base64 content to binary
                        const decodedContent = Buffer.from(jsonResponse.docContent, 'base64');
                        
                        // Save the converted PDF file
                        fs.writeFileSync(outputPath, decodedContent);
                        console.log(`Editable PDF saved successfully: ${outputPath}`);
                        console.log(`Output file size: ${decodedContent.length} bytes`);
                        return outputPath;
                    } else {
                        console.log("No docContent found in JSON response");
                        console.log("Response preview:", responseText.substring(0, 200));
                        return false;
                    }
                } catch (jsonError) {
                    // Response is not JSON, try to decode as base64
                    console.log("Response is base64 content, decoding...");
                    
                    try {
                        // Try to decode the response as base64
                        const decodedContent = Buffer.from(responseText, 'base64');
                        
                        // Verify it's a PDF by checking the first few bytes
                        if (decodedContent.length > 4 && decodedContent.toString('ascii', 0, 4) === '%PDF') {
                            // Save the converted PDF file
                            fs.writeFileSync(outputPath, decodedContent);
                            console.log(`Editable PDF saved successfully: ${outputPath}`);
                            console.log(`Output file size: ${decodedContent.length} bytes`);
                            return outputPath;
                        } else {
                            console.log("Decoded content is not a valid PDF");
                            console.log("Response preview:", responseText.substring(0, 200));
                            return false;
                        }
                        
                    } catch (base64Error) {
                        console.log("Error decoding base64 content:", base64Error.message);
                        console.log("Response preview:", responseText.substring(0, 200));
                        return false;
                    }
                }
            } else {
                console.log("Warning: Empty response body");
                return false;
            }
        }
        
    } else if (response.status === 202) {
        // 202 - Accepted: API is processing the request asynchronously
        console.log("Request accepted. Processing asynchronously...");
        
        // Wait for processing to complete and get the result
        return await pollForCompletion(response, outputPath);
        
    } else {
        // Other status codes - Error
        const errorText = await response.text(); // Get error message
        throw new Error(`Error: ${response.status} - ${errorText}`);
    }
}

// Function to check if async processing is complete
async function pollForCompletion(response, outputPath) {
    const locationUrl = response.headers.get('Location'); // Get the URL to check status
    if (!locationUrl) {
        console.log("No polling URL available for async job");
        console.log("Check your PDF4me dashboard for the completed file");
        return false;
    }
    
    const max_retries = 10; // Check up to 10 times
    const retry_delay = 10; // Wait 10 seconds between checks
    
    // Poll the API until OCR conversion is complete
    for (let attempt = 0; attempt < max_retries; attempt++) {
        console.log(`Checking job status... (Attempt ${attempt + 1}/${max_retries})`);
        
        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, retry_delay * 1000));
        
        // Check if processing is complete
        try {
            const statusResponse = await fetch(locationUrl, {
                headers: {
                    'Authorization': `Basic ${API_KEY}` // Your API key
                }
            });
            
            if (statusResponse.status === 200) {
                // 200 - Success: Processing completed
                console.log("Processing completed!");
                
                // Get the response as array buffer first to check if it's binary PDF
                const arrayBuffer = await statusResponse.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                
                // Check if the response is a PDF file (starts with %PDF)
                if (buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF') {
                    console.log("Response is direct PDF binary content, saving directly...");
                    
                    try {
                        // Save the PDF content directly (it's already binary)
                        fs.writeFileSync(outputPath, buffer);
                        console.log(`Editable PDF saved successfully: ${outputPath}`);
                        console.log(`Output file size: ${buffer.length} bytes`);
                        return outputPath;
                        
                    } catch (saveError) {
                        throw new Error(`Error saving PDF file: ${saveError.message}`);
                    }
                } else {
                    // Try to parse as JSON or base64
                    const responseText = buffer.toString('utf8');
                    
                    if (responseText.trim()) {
                        try {
                            // First try to parse as JSON
                            const pollResult = JSON.parse(responseText);
                            
                            if (pollResult.docContent) {
                                // Decode base64 content to binary from JSON response
                                const decodedContent = Buffer.from(pollResult.docContent, 'base64');
                                
                                // Save the converted PDF file
                                fs.writeFileSync(outputPath, decodedContent);
                                console.log(`Editable PDF saved successfully: ${outputPath}`);
                                console.log(`Output file size: ${decodedContent.length} bytes`);
                                return outputPath;
                            } else {
                                console.log("No docContent found in JSON response");
                                console.log("Response preview:", responseText.substring(0, 200));
                                return false;
                            }
                            
                        } catch (jsonError) {
                            // Response is not JSON, try to decode as base64
                            console.log("Response is base64 content, decoding...");
                            
                            try {
                                // Try to decode the response as base64
                                const decodedContent = Buffer.from(responseText, 'base64');
                                
                                // Verify it's a PDF by checking the first few bytes
                                if (decodedContent.length > 4 && decodedContent.toString('ascii', 0, 4) === '%PDF') {
                                    // Save the converted PDF file
                                    fs.writeFileSync(outputPath, decodedContent);
                                    console.log(`Editable PDF saved successfully: ${outputPath}`);
                                    console.log(`Output file size: ${decodedContent.length} bytes`);
                                    return outputPath;
                                } else {
                                    console.log("Decoded content is not a valid PDF");
                                    console.log("Response preview:", responseText.substring(0, 200));
                                    return false;
                                }
                                
                            } catch (base64Error) {
                                console.log("Error decoding base64 content:", base64Error.message);
                                console.log("Response preview:", responseText.substring(0, 200));
                                return false;
                            }
                        }
                    } else {
                        console.log("Warning: Empty poll response body");
                        return false;
                    }
                }
                
            } else if (statusResponse.status === 202) {
                // Still processing, continue polling
                console.log('Still processing...');
                continue; // Go to next iteration
            } else {
                // Error occurred during processing
                const errorText = await statusResponse.text();
                throw new Error(`Error during processing: ${statusResponse.status} - ${errorText}`);
            }
            
        } catch (error) {
            console.error(`Error polling status: ${error.message}`);
            continue; // Try again on next iteration
        }
    }
    
    // If we've checked too many times, give up
    console.log("Timeout: Processing did not complete after multiple retries");
    return false;
}

// Main function to run the OCR conversion
async function main() {
    try {
        // Convert PDF to editable PDF using OCR
        const result = await convertPDFToEditableOCR();
        
        // Final summary
        if (result) {
            console.log("PDF OCR Conversion completed successfully!");
            console.log(`Input file: ${INPUT_FILE}`);
            console.log(`Output file: ${OUTPUT_FILE}`);
            console.log("Your PDF is now editable and searchable!");
        } else {
            console.log("Conversion initiated but may require manual checking");
            console.log("Check your PDF4me dashboard for async job completion");
        }
        
    } catch (error) {
        console.error(`Conversion failed: ${error.message}`);
        console.log("Please check your input file and API configuration");
        process.exit(1); // Exit with error code
    }
}

// Execute the main function when script is run directly
if (require.main === module) {
    main();
}

module.exports = {
    convertPDFToEditableOCR,
    readAndEncodePDF,
    processOCRConversion,
    handleAPIResponse,
    pollForCompletion
}; 