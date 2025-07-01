const fs = require('fs');
const path = require('path');

// API Configuration - PDF4me service for classifying documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys/";
const BASE_URL = "https://api.pdf4me.com/";
const API_URL = `${BASE_URL}api/v2/ClassifyDocument`;
const INPUT_FILE = 'sample.pdf'; // Path to the main PDF file
const OUTPUT_FILE = 'Classify_document_output.json'; // Output classification results file name

// Main function to classify document (handles retry logic and orchestration)
async function classifyDocument() {
    const max_retries = 10; // Number of times to retry if it fails
    const retry_delay = 10; // Wait 10 seconds between retries
    
    try {
        console.log('Classifying document...');
        
        // Check if the input PDF file exists before proceeding
        if (!fs.existsSync(INPUT_FILE)) {
            throw new Error(`PDF file not found at ${INPUT_FILE}`);
        }
        
        // Try multiple times in case of network errors or API issues
        for (let attempt = 1; attempt <= max_retries; attempt++) {
            try {
                console.log(`Attempt ${attempt}/${max_retries} - Classifying document...`);
                
                // Process the document classification request
                const response = await processDocumentClassification();
                
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
                await new Promise(resolve => setTimeout(resolve, retry_delay * 1000)); // Wait 10 seconds
            }
        }

    } catch (error) {
        // If everything failed, show the error
        console.error('Error classifying document:', error.message);
        throw error; // Re-throw the error so the program knows it failed
    }
}

// Function to process document classification request
async function processDocumentClassification() {
    // Read the PDF file and convert it to base64 encoding
    let pdfBase64;
    try {
        const pdfContent = fs.readFileSync(INPUT_FILE);
        pdfBase64 = pdfContent.toString('base64');
        console.log(`PDF file read successfully: ${pdfContent.length} bytes`);
    } catch (error) {
        throw new Error(`Error reading PDF file: ${error.message}`);
    }

    // Prepare the payload (data) to send to the API
    const payload = {
        docContent: pdfBase64,                            // Base64 encoded PDF document content
        docName: "output.pdf",                            // Source PDF file name with .pdf extension
        async: true                                       // Enable asynchronous processing
    };

    // Set up HTTP headers for the API request
    const headers = {
        "Authorization": `Basic ${API_KEY}`,              // Authentication using provided API key
        "Content-Type": "application/json"               // Specify that we're sending JSON data
    };

    console.log("Sending document classification request to PDF4me API...");
    
    // Make the API request to classify the document
    try {
        const response = await fetch(API_URL, {
            method: 'POST', // HTTP method to classify document
            headers: headers, // Authentication and content type headers
            body: JSON.stringify(payload) // Convert payload to JSON string
        });
        
        console.log(`Response status: ${response.status}`);
        
        if (response.status === 200) {
            const responseData = await response.json();
            return {
                status: response.status,
                headers: response.headers,
                data: responseData
            };
        } else if (response.status === 202) {
            return {
                status: response.status,
                headers: response.headers
            };
        } else {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        
    } catch (error) {
        throw new Error(`Error making API request: ${error.message}`);
    }
}

// Function to handle API responses (200 success or 202 async processing)
async function handleAPIResponse(response, outputPath) {
    if (response.status === 200) {
        // 200 - Success: document classification completed immediately
        console.log("✓ Success! Document classification completed!");
        
        // Parse and save the classification results
        try {
            const classificationData = response.data;
            fs.writeFileSync(outputPath, JSON.stringify(classificationData, null, 2), 'utf8');
            console.log(`Classification results saved: ${outputPath}`);
            
            // Display basic classification information
            if (typeof classificationData === 'object') {
                console.log("\nClassification Results:");
                for (const [key, value] of Object.entries(classificationData)) {
                    console.log(`  ${key}: ${value}`);
                }
            }
            return outputPath; // Return the output file name
            
        } catch (error) {
            console.error(`Error processing classification results: ${error.message}`);
            // Save raw response content as fallback
            fs.writeFileSync(outputPath, JSON.stringify(response.data, null, 2));
            console.log(`Raw response saved: ${outputPath}`);
            return outputPath;
        }
        
    } else if (response.status === 202) {
        // 202 - Accepted: API is processing the request asynchronously
        console.log("202 - Request accepted. Processing asynchronously...");
        
        // Wait for processing to complete and get the result
        return await pollForCompletion(response, outputPath);
        
    } else {
        // Other status codes - Error
        const errorText = response.data ? JSON.stringify(response.data) : 'No error details';
        console.log(`Error response: ${errorText}`);
        throw new Error(`Error: ${response.status} - ${errorText}`);
    }
}

// Function to check if async processing is complete
async function pollForCompletion(response, outputPath) {
    const locationUrl = response.headers.get('Location'); // Get the URL to check status
    if (!locationUrl) {
        throw new Error('No polling URL received'); // Error if no URL provided
    }
    
    const max_retries = 20; // Check up to 20 times for classification processing
    const retry_delay = 15; // Wait 15 seconds between checks for classification processing
    
    // Poll the API until document classification is complete
    for (let attempt = 0; attempt < max_retries; attempt++) {
        console.log(`Checking status... (Attempt ${attempt + 1}/${max_retries})`);
        
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
                console.log("✓ Success! Document classification completed!");
                
                // Parse and save the classification results
                try {
                    const classificationData = await statusResponse.json();
                    fs.writeFileSync(outputPath, JSON.stringify(classificationData, null, 2), 'utf8');
                    console.log(`Classification results saved: ${outputPath}`);
                    
                    // Display basic classification information
                    if (typeof classificationData === 'object') {
                        console.log("\nClassification Results:");
                        for (const [key, value] of Object.entries(classificationData)) {
                            console.log(`  ${key}: ${value}`);
                        }
                    }
                    return outputPath; // Return the file path
                    
                } catch (error) {
                    console.error(`Error processing classification results: ${error.message}`);
                    // Save raw response content as fallback
                    const rawContent = await statusResponse.text();
                    fs.writeFileSync(outputPath, rawContent);
                    console.log(`Raw response saved: ${outputPath}`);
                    return outputPath;
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
    throw new Error('Timeout: Document classification did not complete after multiple retries');
}

// Main function to run the document classification
async function main() {
    try {
        // Start the document classification process
        await classifyDocument();
        
    } catch (error) {
        // If anything goes wrong, show the error and exit
        console.error('Document classification failed:', error.message);
        process.exit(1); // Exit with error code (1 means failure)
    }
}

// Run the application if this file is executed directly (not imported)
if (require.main === module) {
    main(); // Start the main function
} 