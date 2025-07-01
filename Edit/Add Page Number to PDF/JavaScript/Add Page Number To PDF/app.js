const fs = require('fs');
const path = require('path');

// API Configuration - PDF4me service for adding page numbers to PDF documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_URL = `${BASE_URL}api/v2/AddPageNumber`;
const INPUT_PDF_FILE = 'sample.pdf'; // Path to the main PDF file
const OUTPUT_FILE = 'Add_page_number_to_PDF_output.pdf'; // Output PDF file name

// Main function to add page numbers to PDF (handles retry logic and orchestration)
async function addPageNumberToPDF() {
    const max_retries = 10; // Number of times to retry if it fails
    const retry_delay = 10; // Wait 10 seconds between retries
    
    try {
        console.log('Starting page number addition to PDF...');
        
        // Check if the input PDF file exists in the folder
        if (!fs.existsSync(INPUT_PDF_FILE)) {
            throw new Error(`PDF file ${INPUT_PDF_FILE} not found`);
        }

        // Try multiple times in case of network errors or API issues
        for (let attempt = 1; attempt <= max_retries; attempt++) {
            try {
                console.log(`Attempt ${attempt}/${max_retries} - Adding page numbers to PDF...`);
                
                // Process the PDF file to add page numbers
                const response = await processPageNumberAddition();
                
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
        console.error('Error adding page numbers to PDF:', error.message);
        throw error; // Re-throw the error so the program knows it failed
    }
}

// Function to process PDF files and add page numbers
async function processPageNumberAddition() {
    let pdfBase64; // Declare variable to store PDF base64 content
    
    // Read the PDF file and convert it to base64 encoding
    try {
        const pdfContent = fs.readFileSync(INPUT_PDF_FILE);
        pdfBase64 = pdfContent.toString('base64'); // Convert to base64 (text format)
        console.log(`PDF file read successfully: ${pdfContent.length} bytes`);
    } catch (error) {
        throw new Error(`Error reading PDF file: ${error.message}`);
    }

    // Prepare the payload (data) to send to the API
    const payload = {
        docContent: pdfBase64,                        // Base64 encoded PDF document content
        docName: "output.pdf",                        // Output PDF file name
        pageNumberFormat: "Page 0 of 1",              // Format options: "Page {0}", "{0} of {1}", "Page {0} of {1}", "- {0} -", "[{0}/{1}]", "({0})", "{0}"
        alignX: "right",                              // Horizontal alignment: "left", "center", "right"
        alignY: "bottom",                             // Vertical alignment: "top", "middle", "bottom"
        marginXinMM: 10,                              // Horizontal margin from edge in millimeters (0-100)
        marginYinMM: 10,                              // Vertical margin from edge in millimeters (0-100)
        fontSize: 12,                                 // Font size for page numbers (8-72)
        isBold: true,                                 // Make page numbers bold (true/false)
        isItalic: false,                              // Make page numbers italic (true/false)
        skipFirstPage: false,                         // Skip numbering on first page (true/false)
        async: true                                   // Enable asynchronous processing
    };

    // Set up HTTP headers for the API request
    const headers = {
        "Authorization": `Basic ${API_KEY}`,           // Authentication using provided API key
        "Content-Type": "application/json"            // Specify that we're sending JSON data
    };

    console.log("Sending page number request to PDF4me API...");
    
    // Make the API request to add page numbers to the PDF
    try {
        const response = await fetch(API_URL, {
            method: 'POST', // HTTP method to add page numbers
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
        // 200 - Success: page number addition completed immediately
        console.log("✓ Success! Page number addition completed!");
        
        // Save the PDF with page numbers
        const buffer = await response.arrayBuffer(); // Get the PDF as binary data
        fs.writeFileSync(outputPath, Buffer.from(buffer)); // Save the PDF with page numbers to disk
        console.log(`File saved: ${outputPath}`);
        return outputPath; // Return the output file name
        
    } else if (response.status === 202) {
        // 202 - Accepted: API is processing the request asynchronously
        console.log("202 - Request accepted. Processing asynchronously...");
        
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
        throw new Error('No polling URL received'); // Error if no URL provided
    }
    
    const max_retries = 10; // Check up to 10 times
    const retry_delay = 10; // Wait 10 seconds between checks
    
    // Poll the API until page number addition is complete
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
                console.log("✓ Success! Page number addition completed!");
                
                // Save the PDF with page numbers
                const buffer = await statusResponse.arrayBuffer(); // Get the PDF data
                fs.writeFileSync(outputPath, Buffer.from(buffer)); // Save to disk
                console.log(`File saved: ${outputPath}`);
                return outputPath; // Return the file path
                
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
    throw new Error('Timeout: Processing did not complete after multiple retries');
}

// Main function to run the page number addition
async function main() {
    try {
        // Start the page number addition process
        await addPageNumberToPDF();
        
    } catch (error) {
        // If anything goes wrong, show the error and exit
        console.error('Page number addition failed:', error.message);
        process.exit(1); // Exit with error code (1 means failure)
    }
}

// Run the application if this file is executed directly (not imported)
if (require.main === module) {
    main(); // Start the main function
} 