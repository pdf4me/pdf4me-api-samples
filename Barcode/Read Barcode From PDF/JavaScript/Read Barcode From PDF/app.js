const fs = require('fs');
const path = require('path');

// API Configuration - PDF4me service for reading barcodes from PDF documents
const API_KEY = "get the API key from https://dev.pdf4me.com/dashboard/#/api-keys";
const BASE_URL = "https://api.pdf4me.com/";
const API_URL = `${BASE_URL}api/v2/ReadBarcodes`;
const INPUT_FILE = 'sample.pdf'; // Path to the main PDF file
const OUTPUT_FILE = 'Read_barcode_output.json'; // Output file for barcode data

// Main function to read barcodes from PDF (handles retry logic and orchestration)
async function readBarcodeFromPDF() {
    const max_retries = 10; // Number of times to retry if it fails
    const retry_delay = 10; // Wait 10 seconds between retries
    
    try {
        console.log('Reading barcodes from PDF...');
        
        // Check if the input PDF file exists in the folder
        if (!fs.existsSync(INPUT_FILE)) {
            throw new Error(`Input file ${INPUT_FILE} not found`);
        }

        // Try multiple times in case of network errors or API issues
        for (let attempt = 1; attempt <= max_retries; attempt++) {
            try {
                console.log(`Attempt ${attempt}/${max_retries} - Reading barcodes from PDF...`);
                
                // Process the PDF file to read barcodes
                const response = await processBarcodeReading();
                
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
        console.error('Error reading barcodes from PDF:', error.message);
        throw error; // Re-throw the error so the program knows it failed
    }
}

// Function to process PDF files and read barcodes
async function processBarcodeReading() {
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
        barcodeType: ["all"],                         // Barcode types: ["all"], ["qrCode"], ["dataMatrix"], ["code128"], etc.
        pages: "all",                                 // Page options: "all", "1", "1,3,5", "2-5", "1,3,7-10", "2-"
        async: true                                   // Enable asynchronous processing
    };

    // Set up HTTP headers for the API request
    const headers = {
        "Authorization": `Basic ${API_KEY}`,           // Authentication using provided API key
        "Content-Type": "application/json"            // Specify that we're sending JSON data
    };

    console.log("Sending barcode reading request to PDF4me API...");
    
    // Make the API request to read barcodes from the PDF
    try {
        const response = await fetch(API_URL, {
            method: 'POST', // HTTP method to read barcodes
            headers: headers, // Authentication and content type headers
            body: JSON.stringify(payload) // Convert payload to JSON string
        });
        
        console.log(`Response status: ${response.status}`);
        
        if (response.status === 200) {
            const buffer = await response.arrayBuffer();
            console.log(`Buffer size: ${buffer.byteLength} bytes`);
            
            return {
                status: response.status,
                headers: response.headers,
                buffer: Buffer.from(buffer)
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
        // 200 - Success: barcode reading completed immediately
        console.log("✓ Success! Barcode reading completed!");
        
        // Parse and save the barcode data
        try {
            const responseText = response.buffer.toString('utf8');
            let barcodeData;
            
            // Try to parse as JSON, fallback to text
            try {
                barcodeData = JSON.parse(responseText);
            } catch (e) {
                barcodeData = responseText;
            }
            
            // Save the barcode data to JSON file
            if (typeof barcodeData === 'object') {
                fs.writeFileSync(outputPath, JSON.stringify(barcodeData, null, 2), 'utf8');
            } else {
                fs.writeFileSync(outputPath, String(barcodeData), 'utf8');
            }
            
            console.log(`Barcode data saved: ${outputPath}`);
            
            // Display found barcodes
            if (barcodeData && typeof barcodeData === 'object' && barcodeData.barcodes) {
                console.log(`Found ${barcodeData.barcodes.length} barcode(s):`);
                barcodeData.barcodes.forEach((barcode, index) => {
                    console.log(`  ${index + 1}. Type: ${barcode.type || 'Unknown'}, Text: ${barcode.text || 'No text'}`);
                });
            } else {
                console.log("Barcode data:", barcodeData);
            }
            
        } catch (error) {
            console.error(`Error processing barcode data: ${error.message}`);
            // Save raw response as fallback
            fs.writeFileSync(outputPath, response.buffer);
            console.log(`Raw response saved: ${outputPath}`);
        }
        
        return outputPath; // Return the output file name
        
    } else if (response.status === 202) {
        // 202 - Accepted: API is processing the request asynchronously
        console.log("202 - Request accepted. Processing asynchronously...");
        
        // Wait for processing to complete and get the result
        return await pollForCompletion(response, outputPath);
        
    } else {
        // Other status codes - Error
        const errorText = response.buffer ? response.buffer.toString() : 'No error details';
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
    
    const max_retries = 10; // Check up to 10 times
    const retry_delay = 10; // Wait 10 seconds between checks
    
    // Poll the API until barcode reading is complete
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
                console.log("✓ Success! Barcode reading completed!");
                
                // Parse and save the barcode data
                try {
                    const buffer = await statusResponse.arrayBuffer();
                    console.log(`Async buffer size: ${buffer.byteLength} bytes`);
                    
                    const responseText = Buffer.from(buffer).toString('utf8');
                    let barcodeData;
                    
                    // Try to parse as JSON, fallback to text
                    try {
                        barcodeData = JSON.parse(responseText);
                    } catch (e) {
                        barcodeData = responseText;
                    }
                    
                    // Save the barcode data to JSON file
                    if (typeof barcodeData === 'object') {
                        fs.writeFileSync(outputPath, JSON.stringify(barcodeData, null, 2), 'utf8');
                    } else {
                        fs.writeFileSync(outputPath, String(barcodeData), 'utf8');
                    }
                    
                    console.log(`Barcode data saved: ${outputPath}`);
                    
                    // Display found barcodes
                    if (barcodeData && typeof barcodeData === 'object' && barcodeData.barcodes) {
                        console.log(`Found ${barcodeData.barcodes.length} barcode(s):`);
                        barcodeData.barcodes.forEach((barcode, index) => {
                            console.log(`  ${index + 1}. Type: ${barcode.type || 'Unknown'}, Text: ${barcode.text || 'No text'}`);
                        });
                    } else {
                        console.log("Barcode data:", barcodeData);
                    }
                    
                } catch (error) {
                    console.error(`Error processing barcode data: ${error.message}`);
                    // Save raw response as fallback
                    const buffer = await statusResponse.arrayBuffer();
                    fs.writeFileSync(outputPath, Buffer.from(buffer));
                    console.log(`Raw response saved: ${outputPath}`);
                }
                
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

// Main function to run the barcode reading
async function main() {
    try {
        // Start the barcode reading process
        await readBarcodeFromPDF();
        
    } catch (error) {
        // If anything goes wrong, show the error and exit
        console.error('Barcode reading failed:', error.message);
        process.exit(1); // Exit with error code (1 means failure)
    }
}

// Run the application if this file is executed directly (not imported)
if (require.main === module) {
    main(); // Start the main function
} 