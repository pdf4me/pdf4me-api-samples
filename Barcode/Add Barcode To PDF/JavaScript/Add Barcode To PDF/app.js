const fs = require('fs');
const path = require('path');

// API Configuration - PDF4me service for adding barcodes to PDF documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_URL = `${BASE_URL}api/v2/addbarcode`;
const INPUT_FILE = 'sample.pdf'; // Path to the main PDF file
const OUTPUT_FILE = 'Add_barcode_to_PDF_output.pdf'; // Output PDF file name

// Main function to add barcode to PDF (handles retry logic and orchestration)
async function addBarcodeToPDF() {
    const max_retries = 10; // Number of times to retry if it fails
    const retry_delay = 10; // Wait 10 seconds between retries
    
    try {
        console.log('Starting barcode addition to PDF...');
        
        // Check if the input PDF file exists in the folder
        if (!fs.existsSync(INPUT_FILE)) {
            throw new Error(`Input file ${INPUT_FILE} not found`);
        }

        // Try multiple times in case of network errors or API issues
        for (let attempt = 1; attempt <= max_retries; attempt++) {
            try {
                console.log(`Attempt ${attempt}/${max_retries} - Adding barcode to PDF...`);
                
                // Process the PDF file to add barcode
                const response = await processBarcodeAddition();
                
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
        console.error('Error adding barcode to PDF:', error.message);
        throw error; // Re-throw the error so the program knows it failed
    }
}

// Function to process PDF files and add barcode
async function processBarcodeAddition() {
    let pdfBase64; // Declare variable to store base64 content
    
    // Read the PDF file and convert it to base64 encoding
    try {
        const pdfContent = fs.readFileSync(INPUT_FILE);
        pdfBase64 = pdfContent.toString('base64'); // Convert to base64 (text format)
        console.log(`PDF file read successfully: ${pdfContent.length} bytes`);
    } catch (error) {
        throw new Error(`Error reading PDF file: ${error.message}`);
    }

    // Prepare the payload (data) to send to the API
    const payload = {
        docContent: pdfBase64,                        // Base64 encoded PDF document content
        docName: "output.pdf",                        // Output PDF file name
        text: "PDF4me Barcode Sample",                // Text to encode in barcode
        barcodeType: "qrCode",                        // Barcode types: qrCode, code128, dataMatrix, aztec, hanXin, pdf417, etc.
        pages: "1-3",                                 // Page options: "", "1", "1,3,5", "2-5", "1,3,7-10", "2-" (empty = all pages)
        alignX: "Right",                              // Horizontal alignment: "Left", "Center", "Right"
        alignY: "Bottom",                             // Vertical alignment: "Top", "Middle", "Bottom"
        heightInMM: "40",                             // Height in millimeters (string, "0" for auto-detect)
        widthInMM: "40",                              // Width in millimeters (string, "0" for auto-detect)
        marginXInMM: "20",                            // Horizontal margin in millimeters (string)
        marginYInMM: "20",                            // Vertical margin in millimeters (string)
        heightInPt: "113",                            // Height in points (string, "0" for auto-detect)
        widthInPt: "113",                             // Width in points (string, "0" for auto-detect)
        marginXInPt: "57",                            // Horizontal margin in points (string)
        marginYInPt: "57",                            // Vertical margin in points (string)
        opacity: 100,                                 // Opacity (0-100): 0=transparent, 100=opaque
        displayText: "below",                         // Text display: "above", "below"
        hideText: false,                              // Hide barcode text (true/false)
        showOnlyInPrint: false,                       // Show only in print (true/false)
        isTextAbove: false,                           // Text position above barcode (true/false)
        async: true                                   // Enable asynchronous processing
    };

    // Set up HTTP headers for the API request
    const headers = {
        "Authorization": `Basic ${API_KEY}`,           // Authentication using provided API key
        "Content-Type": "application/json"            // Specify that we're sending JSON data
    };

    console.log("Sending barcode addition request to PDF4me API...");
    
    // Make the API request to add barcode to the PDF
    try {
        const response = await fetch(API_URL, {
            method: 'POST', // HTTP method to add barcode
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
        // 200 - Success: barcode addition completed immediately
        console.log("✓ Success! Barcode addition completed!");
        
        // Save the PDF with barcode
        const buffer = await response.arrayBuffer(); // Get the optimized PDF as binary data
        fs.writeFileSync(outputPath, Buffer.from(buffer)); // Save the PDF with barcode to disk
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
    
    // Poll the API until barcode addition is complete
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
                console.log("✓ Success! Barcode addition completed!");
                
                // Save the PDF with barcode
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

// Main function to run the barcode addition
async function main() {
    try {
        // Start the barcode addition process
        await addBarcodeToPDF();
        
    } catch (error) {
        // If anything goes wrong, show the error and exit
        console.error('Barcode addition failed:', error.message);
        process.exit(1); // Exit with error code (1 means failure)
    }
}

// Run the application if this file is executed directly (not imported)
if (require.main === module) {
    main(); // Start the main function
} 